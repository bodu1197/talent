-- ========================================
-- category_visits 테이블 구조 확인
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- 1. category_visits 테이블의 컬럼 타입 확인
SELECT
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'category_visits'
ORDER BY ordinal_position;

-- 2. categories 테이블의 id 타입 확인
SELECT
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'categories'
AND column_name = 'id';

-- 3. service_categories 테이블의 category_id 타입 확인
SELECT
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'service_categories'
AND column_name = 'category_id';

-- 4. 실제 데이터 샘플 확인
SELECT
  category_id,
  pg_typeof(category_id) as category_id_type,
  category_name
FROM category_visits
WHERE user_id = auth.uid()
LIMIT 5;
