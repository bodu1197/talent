-- 보안 경고 수정: 모든 함수에 search_path 설정 추가

-- 1. approve_service_revision 함수 재생성
CREATE OR REPLACE FUNCTION approve_service_revision(revision_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_revision RECORD;
    v_category_ids UUID[];
BEGIN
    -- 수정본 정보 조회
    SELECT * INTO v_revision
    FROM public.service_revisions
    WHERE id = revision_id_param;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Revision not found';
    END IF;

    -- 메인 서비스 업데이트
    UPDATE public.services
    SET
        title = v_revision.title,
        description = v_revision.description,
        thumbnail_url = v_revision.thumbnail_url,
        price = v_revision.price,
        updated_at = now()
    WHERE id = v_revision.service_id;

    -- 기존 카테고리 삭제
    DELETE FROM public.service_categories
    WHERE service_id = v_revision.service_id;

    -- 새 카테고리 추가
    INSERT INTO public.service_categories (service_id, category_id)
    SELECT v_revision.service_id, category_id
    FROM public.service_revision_categories
    WHERE revision_id = revision_id_param;

    -- 기존 패키지 삭제
    DELETE FROM public.service_packages
    WHERE service_id = v_revision.service_id;

    -- 새 패키지 추가
    INSERT INTO public.service_packages (service_id, package_type, price, delivery_days, revision_count, features)
    SELECT v_revision.service_id, package_type, price, delivery_days, revision_count, features
    FROM public.service_revision_packages
    WHERE revision_id = revision_id_param;

    -- 수정본 상태 업데이트
    UPDATE public.service_revisions
    SET
        status = 'approved',
        reviewed_at = now(),
        reviewed_by = auth.uid()
    WHERE id = revision_id_param;
END;
$$;

-- 2. increment_service_view_count 함수 재생성
CREATE OR REPLACE FUNCTION increment_service_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.services
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = NEW.service_id;

    RETURN NEW;
END;
$$;

-- 3. is_buyer 함수 재생성
CREATE OR REPLACE FUNCTION is_buyer(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.buyers
        WHERE user_id = user_id_param
    );
END;
$$;

-- 4. is_seller 함수 재생성
CREATE OR REPLACE FUNCTION is_seller(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.sellers
        WHERE user_id = user_id_param
    );
END;
$$;

-- 5. is_verified_seller 함수 재생성
CREATE OR REPLACE FUNCTION is_verified_seller(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.sellers
        WHERE user_id = user_id_param
        AND is_verified = true
    );
END;
$$;

-- 6. update_updated_at_column 함수 재생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;
