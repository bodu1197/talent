-- 중복된 생활 서비스 카테고리 확인
SELECT id, name, slug, created_at
FROM categories
WHERE slug IN ('life-service', 'lifestyle-service')
ORDER BY created_at;

-- lifestyle-service (새로 만든 것) 삭제
-- 1. 하위 카테고리의 service_categories 연결 삭제
DELETE FROM service_categories
WHERE category_id IN (
  SELECT slug FROM categories
  WHERE parent_id IN (
    SELECT id FROM categories WHERE slug = 'lifestyle-service'
  )
);

-- 2. 2단계 하위 카테고리 삭제
DELETE FROM categories
WHERE parent_id = (SELECT id FROM categories WHERE slug = 'lifestyle-service');

-- 3. 1단계 카테고리 삭제
DELETE FROM categories
WHERE slug = 'lifestyle-service';

-- 확인
SELECT COUNT(*) as "남은_생활서비스_개수"
FROM categories
WHERE slug IN ('life-service', 'lifestyle-service');

-- life-service가 정상적으로 복구되었는지 확인
SELECT
  c1.name as "1단계",
  c2.name as "2단계",
  c2.display_order as "순서",
  COUNT(c3.id) as "3단계_개수"
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.id
LEFT JOIN categories c3 ON c3.parent_id = c2.id
WHERE c1.slug = 'life-service'
GROUP BY c1.name, c2.name, c2.display_order
ORDER BY c2.display_order;
