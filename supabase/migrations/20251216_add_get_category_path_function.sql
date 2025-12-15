-- get_category_path RPC 함수 생성
-- 카테고리 경로 조회 (breadcrumb용) - 재귀 CTE로 한 번에 조회
-- 2025-12-16

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
) AS $$
WITH RECURSIVE category_path AS (
  -- 시작: 현재 카테고리
  SELECT c.id, c.name, c.slug, c.icon, c.description, c.parent_id, 
         c.level, c.service_count, c.is_ai, c.is_active, 1 AS depth
  FROM categories c
  WHERE c.id = p_category_id
  
  UNION ALL
  
  -- 재귀: 부모 카테고리
  SELECT c.id, c.name, c.slug, c.icon, c.description, c.parent_id,
         c.level, c.service_count, c.is_ai, c.is_active, cp.depth + 1
  FROM categories c
  INNER JOIN category_path cp ON c.id = cp.parent_id
)
SELECT cp.id, cp.name, cp.slug, cp.icon, cp.description, cp.parent_id,
       cp.level, cp.service_count, cp.is_ai, cp.is_active
FROM category_path cp
ORDER BY cp.depth DESC;  -- 루트부터 현재까지 순서
$$ LANGUAGE sql STABLE;

-- 함수 권한 설정
GRANT EXECUTE ON FUNCTION get_category_path(UUID) TO anon, authenticated;
