-- ========================================
-- 최근 방문 카테고리 조회 RPC 함수 (중복 제거)
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
    cv.category_id,
    cv.category_name,
    cv.category_slug,
    MAX(cv.visited_at) as last_visited,
    COUNT(*)::BIGINT as visit_count
  FROM category_visits cv
  WHERE cv.user_id = p_user_id
    AND cv.visited_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY cv.category_id, cv.category_name, cv.category_slug
  ORDER BY MAX(cv.visited_at) DESC
  LIMIT p_limit;
END;
$$;

-- 함수 권한 설정
GRANT EXECUTE ON FUNCTION get_recent_category_visits TO authenticated;

-- 테스트 쿼리 (본인의 user_id로 테스트)
-- SELECT * FROM get_recent_category_visits('your-user-id-here'::UUID, 30, 10);
