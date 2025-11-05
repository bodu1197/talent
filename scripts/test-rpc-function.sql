-- ========================================
-- RPC 함수 테스트 및 category_visits 테이블 확인
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- 1. 본인의 최근 방문 기록 확인 (원본 데이터)
SELECT
  category_id,
  category_name,
  category_slug,
  visited_at,
  COUNT(*) OVER (PARTITION BY category_id) as total_visits_for_this_category
FROM category_visits
WHERE user_id = auth.uid()
  AND visited_at >= NOW() - INTERVAL '30 days'
ORDER BY visited_at DESC
LIMIT 50;

-- 2. 카테고리별 그룹화 (중복 확인)
SELECT
  category_id,
  category_name,
  category_slug,
  COUNT(*) as visit_count,
  MAX(visited_at) as last_visited
FROM category_visits
WHERE user_id = auth.uid()
  AND visited_at >= NOW() - INTERVAL '30 days'
GROUP BY category_id, category_name, category_slug
ORDER BY MAX(visited_at) DESC;

-- 3. RPC 함수 테스트
SELECT * FROM get_recent_category_visits(
  auth.uid(),
  30,
  10
);

-- 4. 같은 category_id에 다른 이름/슬러그가 있는지 확인
SELECT
  category_id,
  COUNT(DISTINCT category_name) as name_count,
  COUNT(DISTINCT category_slug) as slug_count,
  STRING_AGG(DISTINCT category_name, ', ') as all_names,
  STRING_AGG(DISTINCT category_slug, ', ') as all_slugs
FROM category_visits
WHERE user_id = auth.uid()
  AND visited_at >= NOW() - INTERVAL '30 days'
GROUP BY category_id
HAVING COUNT(DISTINCT category_name) > 1 OR COUNT(DISTINCT category_slug) > 1;
