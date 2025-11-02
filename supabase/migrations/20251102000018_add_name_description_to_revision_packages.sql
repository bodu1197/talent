-- service_revision_packages 테이블에 name, description 컬럼 추가

ALTER TABLE public.service_revision_packages
ADD COLUMN IF NOT EXISTS name VARCHAR(100),
ADD COLUMN IF NOT EXISTS description TEXT;

-- approve_service_revision 함수 수정: name, description 포함

CREATE OR REPLACE FUNCTION approve_service_revision(revision_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

    -- 새 패키지 추가 (name, description, features 포함)
    INSERT INTO public.service_packages (service_id, package_type, name, description, price, delivery_days, revision_count, features)
    SELECT
        v_revision.service_id,
        package_type,
        COALESCE(name,
            CASE package_type
                WHEN 'basic' THEN '베이직'
                WHEN 'standard' THEN '스탠다드'
                WHEN 'premium' THEN '프리미엄'
            END
        ) as name,
        COALESCE(description, '') as description,
        price,
        delivery_days,
        revision_count,
        -- JSONB를 TEXT[]로 변환
        ARRAY(SELECT jsonb_array_elements_text(features))
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
