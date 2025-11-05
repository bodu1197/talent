-- ========================================
-- RPC 함수 수정: 방문 횟수 → 최근 방문 순 정렬
-- Supabase SQL Editor에서 실행하세요
-- ========================================

CREATE OR REPLACE FUNCTION get_recent_category_visits(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  category_id TEXT,
  category_name TEXT,
  category_slug TEXT,
  last_visited TIMESTAMPTZ,
  visit_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cv.category_id::TEXT,
    cv.category_name,
    cv.category_slug,
    MAX(cv.visited_at) as last_visited,
    COUNT(*)::BIGINT as visit_count
  FROM category_visits cv
  WHERE cv.user_id = p_user_id
    AND cv.visited_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY cv.category_id, cv.category_name, cv.category_slug
  ORDER BY visit_count DESC, last_visited DESC  -- 방문 횟수 우선, 그 다음 최근 방문
  LIMIT p_limit;
END;
$$;

-- 확인
SELECT * FROM get_recent_category_visits(auth.uid(), 30, 3);
