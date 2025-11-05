-- ========================================
-- 방문한 카테고리의 서비스 확인
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- 방문한 카테고리 목록과 각 카테고리의 서비스 개수 확인
SELECT
  cv.category_name,
  cv.category_slug,
  cv.category_id,
  c.id as uuid,
  c.parent_id,
  COUNT(DISTINCT sc.service_id) as service_count
FROM category_visits cv
LEFT JOIN categories c ON c.slug = cv.category_slug
LEFT JOIN service_categories sc ON sc.category_id = c.id
WHERE cv.user_id = auth.uid()
GROUP BY cv.category_name, cv.category_slug, cv.category_id, c.id, c.parent_id
ORDER BY cv.visited_at DESC;

-- 각 카테고리에 연결된 실제 서비스 확인
SELECT
  cv.category_name,
  COUNT(DISTINCT s.id) as active_service_count
FROM category_visits cv
LEFT JOIN categories c ON c.slug = cv.category_slug
LEFT JOIN service_categories sc ON sc.category_id = c.id
LEFT JOIN services s ON s.id = sc.service_id AND s.status = 'active'
WHERE cv.user_id = auth.uid()
GROUP BY cv.category_name
ORDER BY active_service_count DESC;
