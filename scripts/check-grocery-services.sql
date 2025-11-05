-- ========================================
-- 장보기 카테고리의 서비스 확인
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- 1. 장보기 카테고리 정보
SELECT id, name, slug, parent_id, level
FROM categories
WHERE slug = 'grocery-shopping';

-- 2. 장보기 카테고리에 연결된 서비스 개수
SELECT COUNT(DISTINCT sc.service_id) as service_count
FROM categories c
LEFT JOIN service_categories sc ON sc.category_id = c.id
LEFT JOIN services s ON s.id = sc.service_id AND s.status = 'active'
WHERE c.slug = 'grocery-shopping';

-- 3. 장보기 카테고리의 실제 active 서비스 목록
SELECT s.id, s.title, s.status
FROM categories c
JOIN service_categories sc ON sc.category_id = c.id
JOIN services s ON s.id = sc.service_id
WHERE c.slug = 'grocery-shopping'
  AND s.status = 'active'
ORDER BY s.created_at DESC;

-- 4. 모든 방문한 카테고리의 서비스 개수
SELECT
  c.name,
  c.slug,
  COUNT(DISTINCT sc.service_id) as total_services,
  COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_services
FROM category_visits cv
JOIN categories c ON c.slug = cv.category_slug
LEFT JOIN service_categories sc ON sc.category_id = c.id
LEFT JOIN services s ON s.id = sc.service_id
WHERE cv.user_id = auth.uid()
GROUP BY c.name, c.slug
ORDER BY active_services DESC;
