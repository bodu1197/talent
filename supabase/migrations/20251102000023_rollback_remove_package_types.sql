-- 패키지 타입 시스템 제거를 롤백 - 원상복구

-- 1. service_packages 테이블에 package_type 컬럼 다시 추가
ALTER TABLE public.service_packages
ADD COLUMN IF NOT EXISTS package_type VARCHAR(20);

-- 기존 데이터에 'basic' 기본값 설정
UPDATE public.service_packages
SET package_type = 'basic'
WHERE package_type IS NULL;

-- NOT NULL 제약조건 추가
ALTER TABLE public.service_packages
ALTER COLUMN package_type SET NOT NULL;

-- CHECK 제약조건 다시 추가
ALTER TABLE public.service_packages
ADD CONSTRAINT service_packages_package_type_check
CHECK (package_type IN ('basic', 'standard', 'premium'));

-- service_id당 하나의 패키지만 허용하는 제약조건 제거
ALTER TABLE public.service_packages
DROP CONSTRAINT IF EXISTS service_packages_service_id_key;

-- service_id + package_type 조합의 UNIQUE 제약조건 다시 추가
ALTER TABLE public.service_packages
ADD CONSTRAINT service_packages_service_id_package_type_key
UNIQUE (service_id, package_type);


-- 2. service_revision_packages 테이블도 동일하게 복원
ALTER TABLE public.service_revision_packages
ADD COLUMN IF NOT EXISTS package_type VARCHAR(20);

-- 기존 데이터에 'basic' 기본값 설정
UPDATE public.service_revision_packages
SET package_type = 'basic'
WHERE package_type IS NULL;

-- NOT NULL 제약조건 추가
ALTER TABLE public.service_revision_packages
ALTER COLUMN package_type SET NOT NULL;

-- CHECK 제약조건 다시 추가
ALTER TABLE public.service_revision_packages
ADD CONSTRAINT service_revision_packages_package_type_check
CHECK (package_type IN ('basic', 'standard', 'premium'));

-- revision_id당 하나의 패키지만 허용하는 제약조건 제거
ALTER TABLE public.service_revision_packages
DROP CONSTRAINT IF EXISTS service_revision_packages_revision_id_key;

-- revision_id + package_type 조합의 UNIQUE 제약조건 다시 추가
ALTER TABLE public.service_revision_packages
ADD CONSTRAINT service_revision_packages_revision_id_package_type_key
UNIQUE (revision_id, package_type);


-- 3. approve_service_revision 함수를 이전 버전으로 복원
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

    -- 새 패키지 추가 (package_type 포함)
    INSERT INTO public.service_packages (service_id, package_type, name, description, price, delivery_days, revision_count, features)
    SELECT
        v_revision.service_id,
        CASE
            WHEN LOWER(TRIM(package_type::TEXT)) = 'basic' THEN 'basic'
            WHEN LOWER(TRIM(package_type::TEXT)) = 'standard' THEN 'standard'
            WHEN LOWER(TRIM(package_type::TEXT)) = 'premium' THEN 'premium'
            ELSE NULL
        END::VARCHAR(20) as package_type,
        COALESCE(name,
            CASE LOWER(TRIM(package_type::TEXT))
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
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(features, '[]'::jsonb)))
    FROM public.service_revision_packages
    WHERE revision_id = revision_id_param
    AND LOWER(TRIM(package_type::TEXT)) IN ('basic', 'standard', 'premium');

    -- 수정본 상태 업데이트
    UPDATE public.service_revisions
    SET
        status = 'approved',
        reviewed_at = now(),
        reviewed_by = auth.uid()
    WHERE id = revision_id_param;
END;
$$;
