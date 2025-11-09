-- 패키지 시스템 완전 제거 - 단일 가격 시스템으로 전환

-- 1. service_packages 테이블 완전 삭제
DROP TABLE IF EXISTS public.service_packages CASCADE;

-- 2. service_revision_packages 테이블 완전 삭제
DROP TABLE IF EXISTS public.service_revision_packages CASCADE;

-- 3. orders 테이블에서 package_type 컬럼 제거
ALTER TABLE public.orders
DROP COLUMN IF EXISTS package_type;

-- 4. approve_service_revision 함수 수정 (패키지 관련 로직 제거)
CREATE OR REPLACE FUNCTION approve_service_revision(revision_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_revision RECORD;
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
        delivery_days = v_revision.delivery_days,
        revision_count = v_revision.revision_count,
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

    -- 수정본 상태 업데이트
    UPDATE public.service_revisions
    SET
        status = 'approved',
        reviewed_at = now(),
        reviewed_by = auth.uid()
    WHERE id = revision_id_param;
END;
$$;
