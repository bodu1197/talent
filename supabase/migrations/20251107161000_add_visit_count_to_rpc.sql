-- get_recent_category_visits 함수에 visit_count 추가

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS public.get_recent_category_visits(uuid, integer);

CREATE FUNCTION public.get_recent_category_visits(
  p_user_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  category_id UUID,
  category_name TEXT,
  category_slug TEXT,
  visited_at TIMESTAMPTZ,
  visit_count INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.slug,
    cv.visited_at,
    1 as visit_count  -- 방문 횟수 (현재는 1로 고정, 나중에 집계 가능)
  FROM category_visits cv
  JOIN categories c ON c.id = cv.category_id
  WHERE cv.user_id = p_user_id
  ORDER BY cv.visited_at DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.get_recent_category_visits IS 'Gets recent category visits for a user with visit count';
