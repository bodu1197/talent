-- ========================================
-- 라이프 스타일 카테고리 삭제
-- ========================================

-- 1단계: 라이프 스타일 카테고리 확인
SELECT
  c1.name as "1단계",
  c2.name as "2단계",
  c2.slug as "2단계_slug",
  COUNT(c3.id) as "3단계_개수"
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.id
LEFT JOIN categories c3 ON c3.parent_id = c2.id
WHERE c1.slug LIKE '%life%' OR c1.name LIKE '%라이프%'
GROUP BY c1.id, c1.name, c2.id, c2.name, c2.slug
ORDER BY c1.name, c2.name;

-- 2단계: 라이프 스타일 카테고리를 사용하는 service_categories 연결 삭제
DELETE FROM service_categories
WHERE category_id IN (
  -- 라이프 스타일의 모든 하위 카테고리 slug
  SELECT c2.slug FROM categories c1
  JOIN categories c2 ON c2.parent_id = c1.id
  WHERE c1.slug LIKE '%life%' OR c1.name LIKE '%라이프%'

  UNION

  SELECT c3.slug FROM categories c1
  JOIN categories c2 ON c2.parent_id = c1.id
  JOIN categories c3 ON c3.parent_id = c2.id
  WHERE c1.slug LIKE '%life%' OR c1.name LIKE '%라이프%'

  UNION

  -- 라이프 스타일 자체
  SELECT slug FROM categories
  WHERE slug LIKE '%life%' OR name LIKE '%라이프%'
);

-- 3단계: 3단계 카테고리 삭제
DELETE FROM categories c3
USING categories c2, categories c1
WHERE c3.parent_id = c2.id
  AND c2.parent_id = c1.id
  AND (c1.slug LIKE '%life%' OR c1.name LIKE '%라이프%');

-- 4단계: 2단계 카테고리 삭제
DELETE FROM categories c2
USING categories c1
WHERE c2.parent_id = c1.id
  AND (c1.slug LIKE '%life%' OR c1.name LIKE '%라이프%');

-- 5단계: 1단계 카테고리 삭제
DELETE FROM categories
WHERE slug LIKE '%life%' OR name LIKE '%라이프%';

-- 6단계: 확인
SELECT
  COUNT(*) as "남은_라이프_카테고리"
FROM categories
WHERE slug LIKE '%life%' OR name LIKE '%라이프%';
