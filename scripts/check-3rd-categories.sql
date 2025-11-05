-- 3차 카테고리 전체 확인 (2차 카테고리별 그룹)
SELECT
  c1.name as "1차_카테고리",
  c2.name as "2차_카테고리",
  c2.slug as "2차_slug",
  c3.name as "3차_카테고리",
  c3.slug as "3차_slug",
  c3.display_order as "순서"
FROM categories c1
JOIN categories c2 ON c2.parent_id = c1.id
JOIN categories c3 ON c3.parent_id = c2.id
WHERE c3.level = 3
ORDER BY c1.display_order, c2.display_order, c3.display_order, c3.name;

-- 3차 카테고리 개수 확인
SELECT
  c1.name as "1차",
  c2.name as "2차",
  COUNT(c3.id) as "3차_개수"
FROM categories c1
JOIN categories c2 ON c2.parent_id = c1.id
LEFT JOIN categories c3 ON c3.parent_id = c2.id AND c3.level = 3
WHERE c1.parent_id IS NULL
GROUP BY c1.name, c1.display_order, c2.name, c2.display_order
ORDER BY c1.display_order, c2.display_order;
