-- 배달 서비스의 ID 찾기
-- SELECT id FROM categories WHERE name = '배달 서비스';
-- 결과: delivery-service

-- 장보기 카테고리 추가
INSERT INTO categories (
  name,
  slug,
  parent_id,
  level,
  icon,
  service_count,
  description,
  is_ai,
  is_featured,
  is_active
) VALUES (
  '장보기',
  'grocery-shopping',
  'delivery-service',
  3,
  'shopping-cart',
  0,
  '장보기 및 식료품 구매 대행',
  false,
  false,
  true
);

-- 확인
SELECT
  c1.name as "1단계",
  c2.name as "2단계",
  c3.name as "3단계"
FROM categories c3
LEFT JOIN categories c2 ON c3.parent_id = c2.id
LEFT JOIN categories c1 ON c2.parent_id = c1.id
WHERE c1.slug = 'errands'
ORDER BY c2.name, c3.name;
