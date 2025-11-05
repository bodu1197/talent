-- ========================================
-- 현재 방문 기록 확인
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- 1. 본인의 user_id 확인
SELECT auth.uid() as my_user_id;

-- 2. 최근 방문 기록 확인
SELECT
  category_id,
  category_name,
  category_slug,
  visited_at
FROM category_visits
WHERE user_id = auth.uid()
ORDER BY visited_at DESC
LIMIT 10;

-- 3. RPC 함수 테스트
SELECT * FROM get_recent_category_visits(auth.uid(), 30, 10);

-- 4. 특정 카테고리의 서비스 확인 (첫 번째 방문 카테고리)
-- 위 결과에서 category_slug를 복사해서 아래 'YOUR_SLUG_HERE'를 대체하세요
SELECT
  c.id as category_uuid,
  c.name,
  c.slug,
  COUNT(sc.service_id) as service_count
FROM categories c
LEFT JOIN service_categories sc ON sc.category_id = c.id
WHERE c.slug = 'YOUR_SLUG_HERE'
GROUP BY c.id, c.name, c.slug;
