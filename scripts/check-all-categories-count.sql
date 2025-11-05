-- 전체 카테고리 확인 (1단계만)
SELECT
  id,
  name,
  slug,
  level,
  is_active,
  display_order
FROM categories
WHERE level = 1 OR parent_id IS NULL
ORDER BY display_order, name;

-- 총 개수
SELECT
  COUNT(*) as "1단계_카테고리_총개수"
FROM categories
WHERE level = 1 OR parent_id IS NULL;
