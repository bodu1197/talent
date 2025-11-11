-- Fix get_category_path function to have SET search_path
-- This resolves the function_search_path_mutable warning

DROP FUNCTION IF EXISTS get_category_path(UUID);

CREATE OR REPLACE FUNCTION get_category_path(p_category_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  icon TEXT,
  description TEXT,
  parent_id UUID,
  level INTEGER,
  service_count INTEGER,
  is_ai BOOLEAN,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE category_path AS (
    -- Base case: 현재 카테고리
    SELECT
      c.id,
      c.name,
      c.slug,
      c.icon,
      c.description,
      c.parent_id,
      c.level,
      c.service_count,
      c.is_ai,
      c.is_active,
      1 as depth
    FROM categories c
    WHERE c.id = p_category_id

    UNION ALL

    -- Recursive case: 부모 카테고리들
    SELECT
      c.id,
      c.name,
      c.slug,
      c.icon,
      c.description,
      c.parent_id,
      c.level,
      c.service_count,
      c.is_ai,
      c.is_active,
      cp.depth + 1
    FROM categories c
    INNER JOIN category_path cp ON c.id = cp.parent_id
  )
  SELECT
    cp.id,
    cp.name,
    cp.slug,
    cp.icon,
    cp.description,
    cp.parent_id,
    cp.level,
    cp.service_count,
    cp.is_ai,
    cp.is_active
  FROM category_path cp
  ORDER BY cp.level ASC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_category_path(UUID) TO authenticated, anon;

-- Add comment
COMMENT ON FUNCTION get_category_path IS 'Get category path from child to root. SECURITY DEFINER with search_path set for security.';
