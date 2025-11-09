-- 패키지 타입 시스템 제거 - 단일 패키지로 통합

-- 1. service_packages 테이블에서 package_type 제약조건 제거 및 컬럼 삭제
ALTER TABLE public.service_packages
DROP CONSTRAINT IF EXISTS service_packages_package_type_check;

ALTER TABLE public.service_packages
DROP CONSTRAINT IF EXISTS service_packages_service_id_package_type_key;

-- package_type 컬럼 삭제 (데이터 보존을 위해 먼저 백업)
-- 기존 패키지들 중 basic만 남기고 나머지 삭제
DELETE FROM public.service_packages
WHERE package_type != 'basic';

-- package_type 컬럼 삭제
ALTER TABLE public.service_packages
DROP COLUMN IF EXISTS package_type;

-- service_id당 하나의 패키지만 허용하도록 UNIQUE 제약조건 추가
ALTER TABLE public.service_packages
ADD CONSTRAINT service_packages_service_id_key UNIQUE (service_id);


-- 2. service_revision_packages 테이블도 동일하게 수정
ALTER TABLE public.service_revision_packages
DROP CONSTRAINT IF EXISTS service_revision_packages_package_type_check;

ALTER TABLE public.service_revision_packages
DROP CONSTRAINT IF EXISTS service_revision_packages_revision_id_package_type_key;

-- 기존 revision 패키지들 중 basic만 남기고 나머지 삭제
DELETE FROM public.service_revision_packages
WHERE package_type != 'basic';

-- package_type 컬럼 삭제
ALTER TABLE public.service_revision_packages
DROP COLUMN IF EXISTS package_type;

-- revision_id당 하나의 패키지만 허용
ALTER TABLE public.service_revision_packages
ADD CONSTRAINT service_revision_packages_revision_id_key UNIQUE (revision_id);


-- 3. approve_service_revision 함수 수정
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

    -- 새 패키지 추가 (단일 패키지)
    INSERT INTO public.service_packages (service_id, name, description, price, delivery_days, revision_count, features)
    SELECT
        v_revision.service_id,
        COALESCE(name, '기본 패키지') as name,
        COALESCE(description, '') as description,
        price,
        delivery_days,
        revision_count,
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(features, '[]'::jsonb)))
    FROM public.service_revision_packages
    WHERE revision_id = revision_id_param
    LIMIT 1;  -- 하나만 가져옴

    -- 수정본 상태 업데이트
    UPDATE public.service_revisions
    SET
        status = 'approved',
        reviewed_at = now(),
        reviewed_by = auth.uid()
    WHERE id = revision_id_param;
END;
$$;
