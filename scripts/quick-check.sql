-- ========================================
-- 빠른 확인
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- 1. 방문 기록이 있나요?
SELECT COUNT(*) as visit_count
FROM category_visits
WHERE user_id = auth.uid();

-- 2. 방문 기록 상세
SELECT
  category_name,
  category_slug,
  visited_at
FROM category_visits
WHERE user_id = auth.uid()
ORDER BY visited_at DESC
LIMIT 5;

-- 3. RPC 함수가 작동하나요?
SELECT
  category_name,
  category_slug,
  visit_count
FROM get_recent_category_visits(auth.uid(), 30, 10);
