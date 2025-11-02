-- approve_service_revision 함수 수정: package_type constraint 오류 해결

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

    -- 새 패키지 추가 (package_type을 명시적으로 캐스팅)
    INSERT INTO public.service_packages (service_id, package_type, name, description, price, delivery_days, revision_count, features)
    SELECT
        v_revision.service_id,
        package_type::VARCHAR(20),  -- 명시적 캐스팅
        COALESCE(name,
            CASE package_type
                WHEN 'basic' THEN '베이직'
                WHEN 'standard' THEN '스탠다드'
                WHEN 'premium' THEN '프리미엄'
                ELSE '패키지'
            END
        ) as name,
        COALESCE(description, '') as description,
        price,
        delivery_days,
        revision_count,
        -- JSONB를 TEXT[]로 변환
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(features, '[]'::jsonb)))
    FROM public.service_revision_packages
    WHERE revision_id = revision_id_param
    AND package_type IN ('basic', 'standard', 'premium');  -- 유효한 타입만 필터링

    -- 수정본 상태 업데이트
    UPDATE public.service_revisions
    SET
        status = 'approved',
        reviewed_at = now(),
        reviewed_by = auth.uid()
    WHERE id = revision_id_param;
END;
$$;
