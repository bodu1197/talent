-- ========================================
-- 카테고리 ID를 Slug에서 UUID로 마이그레이션
-- ========================================
--
-- 이 스크립트는 다음을 수행합니다:
-- 1. 임시 매핑 테이블 생성
-- 2. 모든 slug 형식 카테고리 ID를 새 UUID로 매핑
-- 3. 외래키 참조 테이블들 업데이트
-- 4. categories 테이블의 ID 업데이트
--
-- ⚠️ 주의: 이 마이그레이션은 트랜잭션 내에서 실행되어야 합니다
-- ========================================

BEGIN;

-- Step 1: 임시 매핑 테이블 생성
CREATE TEMP TABLE category_id_mapping (
  old_id TEXT PRIMARY KEY,
  new_id UUID NOT NULL UNIQUE,
  name TEXT,
  level INTEGER
);

-- Step 2: slug 형식의 모든 카테고리에 대해 새 UUID 생성 및 매핑
INSERT INTO category_id_mapping (old_id, new_id, name, level)
SELECT
  id as old_id,
  gen_random_uuid() as new_id,
  name,
  level
FROM categories
WHERE id NOT LIKE '%-%-%-%-%'  -- UUID 형식이 아닌 것들만
ORDER BY level NULLS LAST, display_order;

-- Step 3: 진행 상황 출력
DO $$
DECLARE
  mapping_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO mapping_count FROM category_id_mapping;
  RAISE NOTICE '매핑 생성 완료: % 개의 카테고리', mapping_count;
END $$;

-- Step 4: 외래키 제약 조건 확인 및 일시적으로 비활성화
-- (PostgreSQL은 트랜잭션 내에서 외래키 체크를 지연시킬 수 있음)
SET CONSTRAINTS ALL DEFERRED;

-- Step 5: service_categories 테이블 업데이트
UPDATE service_categories
SET category_id = m.new_id::text
FROM category_id_mapping m
WHERE service_categories.category_id = m.old_id;

RAISE NOTICE 'service_categories 업데이트 완료';

-- Step 6: advertising_impressions 테이블 업데이트
UPDATE advertising_impressions
SET category_id = m.new_id::text
FROM category_id_mapping m
WHERE advertising_impressions.category_id = m.old_id;

RAISE NOTICE 'advertising_impressions 업데이트 완료';

-- Step 7: categories 테이블의 parent_id 업데이트
UPDATE categories
SET parent_id = m.new_id::text
FROM category_id_mapping m
WHERE categories.parent_id = m.old_id;

RAISE NOTICE 'categories.parent_id 업데이트 완료';

-- Step 8: categories 테이블의 id를 새 UUID로 업데이트
-- (가장 중요한 단계: level 순서대로 업데이트해야 참조 무결성 유지)

-- Level NULL 먼저
UPDATE categories c
SET id = m.new_id::text
FROM category_id_mapping m
WHERE c.id = m.old_id
  AND c.level IS NULL;

RAISE NOTICE 'Level NULL 카테고리 ID 업데이트 완료';

-- Level 1
UPDATE categories c
SET id = m.new_id::text
FROM category_id_mapping m
WHERE c.id = m.old_id
  AND c.level = 1;

RAISE NOTICE 'Level 1 카테고리 ID 업데이트 완료';

-- Level 2
UPDATE categories c
SET id = m.new_id::text
FROM category_id_mapping m
WHERE c.id = m.old_id
  AND c.level = 2;

RAISE NOTICE 'Level 2 카테고리 ID 업데이트 완료';

-- Level 3
UPDATE categories c
SET id = m.new_id::text
FROM category_id_mapping m
WHERE c.id = m.old_id
  AND c.level = 3;

RAISE NOTICE 'Level 3 카테고리 ID 업데이트 완료';

-- Step 9: 검증
DO $$
DECLARE
  slug_count INTEGER;
  uuid_count INTEGER;
  total_count INTEGER;
BEGIN
  -- Slug 형식 ID 개수
  SELECT COUNT(*) INTO slug_count
  FROM categories
  WHERE id NOT LIKE '%-%-%-%-%';

  -- UUID 형식 ID 개수
  SELECT COUNT(*) INTO uuid_count
  FROM categories
  WHERE id LIKE '%-%-%-%-%';

  -- 전체 개수
  SELECT COUNT(*) INTO total_count FROM categories;

  RAISE NOTICE '=== 마이그레이션 검증 ===';
  RAISE NOTICE '전체 카테고리: %', total_count;
  RAISE NOTICE 'UUID 형식: %', uuid_count;
  RAISE NOTICE 'Slug 형식 (남은 것): %', slug_count;

  IF slug_count > 0 THEN
    RAISE WARNING '⚠️  아직 % 개의 slug 형식 ID가 남아있습니다!', slug_count;
  ELSE
    RAISE NOTICE '✅ 모든 카테고리 ID가 UUID로 변환되었습니다!';
  END IF;
END $$;

-- Step 10: 매핑 테이블 내용 출력 (로깅용)
DO $$
DECLARE
  rec RECORD;
  counter INTEGER := 0;
BEGIN
  RAISE NOTICE '=== ID 매핑 샘플 (처음 10개) ===';
  FOR rec IN
    SELECT old_id, new_id, name, level
    FROM category_id_mapping
    ORDER BY level NULLS LAST, name
    LIMIT 10
  LOOP
    counter := counter + 1;
    RAISE NOTICE '% | Level % | % | % → %',
      counter,
      COALESCE(rec.level::text, 'NULL'),
      rec.name,
      rec.old_id,
      rec.new_id;
  END LOOP;
END $$;

-- ⚠️ 커밋은 수동으로 수행
-- COMMIT 전에 검증 결과를 확인하세요!
COMMIT;

RAISE NOTICE '=== 마이그레이션 완료 ===';
RAISE NOTICE '커밋되었습니다. 애플리케이션을 테스트하세요.';
