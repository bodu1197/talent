-- 카테고리 경로 조회 함수 (재귀 CTE로 최적화)
-- N+1 쿼리 문제 해결: 여러 번의 쿼리 대신 한 번의 쿼리로 전체 경로 조회

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
  ORDER BY cp.level ASC;  -- 1차 -> 2차 -> 3차 순서로 정렬
END;
$$;

-- 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION get_category_path(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_category_path(UUID) TO anon;
