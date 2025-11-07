-- get_recent_category_visits 함수 - category_id를 TEXT로 반환

DROP FUNCTION IF EXISTS public.get_recent_category_visits(uuid, integer);

CREATE FUNCTION public.get_recent_category_visits(
  p_user_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  category_id TEXT,
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
    1 as visit_count
  FROM category_visits cv
  JOIN categories c ON c.slug = cv.category_id
  WHERE cv.user_id = p_user_id
  ORDER BY cv.visited_at DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.get_recent_category_visits IS 'Gets recent category visits for a user with visit count';

-- 테스트
SELECT * FROM get_recent_category_visits(auth.uid(), 3);
