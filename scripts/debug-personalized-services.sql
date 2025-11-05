-- ========================================
-- 개인화 서비스 디버깅
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- 1. 본인의 최근 방문 기록 확인
SELECT
  id,
  category_id,
  category_name,
  category_slug,
  visited_at,
  visited_date
FROM category_visits
WHERE user_id = auth.uid()
ORDER BY visited_at DESC
LIMIT 20;

-- 2. RPC 함수 테스트
SELECT * FROM get_recent_category_visits(auth.uid(), 30, 10);

-- 3. 특정 카테고리의 서비스 확인 (예: 첫 번째 방문 카테고리)
-- 위에서 나온 category_id를 복사해서 아래에 붙여넣기
-- SELECT
--   sc.service_id,
--   s.title,
--   s.status
-- FROM service_categories sc
-- JOIN services s ON s.id = sc.service_id
-- WHERE sc.category_id = 'YOUR_CATEGORY_ID_HERE'
-- AND s.status = 'active'
-- LIMIT 10;

-- 4. 카테고리 정보 확인
SELECT
  c.id,
  c.name,
  c.slug,
  c.level,
  c.parent_id
FROM categories c
WHERE c.id IN (
  SELECT DISTINCT category_id::uuid
  FROM category_visits
  WHERE user_id = auth.uid()
);
