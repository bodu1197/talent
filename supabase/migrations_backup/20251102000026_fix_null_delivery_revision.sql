-- 기존 service_revisions 테이블의 null 값을 기본값으로 업데이트
UPDATE public.service_revisions
SET
    delivery_days = COALESCE(delivery_days, 7),
    revision_count = COALESCE(revision_count, 0)
WHERE delivery_days IS NULL OR revision_count IS NULL;

-- approve_service_revision 함수 수정: null 값 처리
CREATE OR REPLACE FUNCTION approve_service_revision(revision_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_revision RECORD;
BEGIN
    -- 수정본 조회
    SELECT * INTO v_revision
    FROM public.service_revisions
    WHERE id = revision_id_param;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Revision not found';
    END IF;

    -- 메인 서비스 업데이트 (COALESCE로 null 값 처리)
    UPDATE public.services
    SET
        title = v_revision.title,
        description = v_revision.description,
        thumbnail_url = v_revision.thumbnail_url,
        price = v_revision.price,
        delivery_days = COALESCE(v_revision.delivery_days, 7),
        revision_count = COALESCE(v_revision.revision_count, 0),
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
