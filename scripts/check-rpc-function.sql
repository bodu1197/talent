-- ========================================
-- RPC 함수 get_recent_category_visits 확인
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- 1. RPC 함수가 존재하는지 확인
SELECT
  proname AS function_name,
  pg_get_functiondef(oid) AS function_definition
FROM pg_proc
WHERE proname = 'get_recent_category_visits';

-- 2. 만약 함수가 없다면, 함수를 다시 생성
-- (이미 있으면 이 부분은 실행 안 됨)
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
    MAX(cv.visited_at) AS last_visited,
    COUNT(*)::BIGINT AS visit_count
  FROM category_visits cv
  WHERE cv.user_id = p_user_id
    AND cv.visited_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY cv.category_id, cv.category_name, cv.category_slug
  ORDER BY visit_count DESC, last_visited DESC
  LIMIT p_limit;
END;
$$;

-- 3. RPC 함수 권한 설정
GRANT EXECUTE ON FUNCTION get_recent_category_visits TO authenticated;

-- 4. 테스트 (현재 로그인한 사용자의 데이터로)
SELECT * FROM get_recent_category_visits(auth.uid(), 30, 10);
