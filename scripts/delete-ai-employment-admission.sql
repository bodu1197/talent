-- AI 취업·입시 카테고리 삭제
-- 주의: 3단계 → 2단계 순서로 삭제해야 함 (참조 무결성)

-- 1. 3단계 카테고리 삭제
DELETE FROM categories
WHERE slug = 'ai-employment-admission-consulting';

-- 2. 2단계 카테고리 삭제
DELETE FROM categories
WHERE slug = 'ai-employment-admission';

-- 확인: AI 서비스 하위 카테고리 목록 (취업·입시가 사라졌는지 확인)
SELECT
  c2.name as "2단계 카테고리",
  c2.slug,
  COUNT(c3.id) as "3단계 개수"
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.id
LEFT JOIN categories c3 ON c3.parent_id = c2.id
WHERE c1.slug = 'ai-services'
  AND c2.is_active = true
GROUP BY c2.id, c2.name, c2.slug, c2.display_order
ORDER BY c2.display_order, c2.name;
