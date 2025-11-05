-- ========================================
-- category_visits 테이블 데이터 정리
-- 잘못된 category_id (UUID 대신 slug 사용) 수정
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- 1. 현재 categories 테이블에서 올바른 매핑 확인
SELECT
  id as "실제 UUID",
  slug as "슬러그",
  name as "이름"
FROM categories
WHERE slug IN (
  'life-service',
  'errands',
  'ai-services',
  'it-programming',
  'design',
  'counseling-coaching',
  'music-audio',
  'video-photo'
)
ORDER BY name;

-- 2. category_visits에서 slug를 category_id로 사용한 레코드 찾기
SELECT
  cv.id,
  cv.category_id,
  cv.category_name,
  cv.category_slug,
  c.id as "실제_UUID"
FROM category_visits cv
LEFT JOIN categories c ON cv.category_id = c.slug
WHERE cv.user_id = auth.uid()
  AND c.id IS NOT NULL  -- slug와 매치되는 경우
  AND cv.category_id != c.id  -- category_id가 실제 UUID가 아닌 경우
ORDER BY cv.visited_at DESC;

-- 3. 수정: slug를 category_id로 사용한 레코드를 실제 UUID로 업데이트
UPDATE category_visits cv
SET category_id = c.id
FROM categories c
WHERE cv.category_id = c.slug  -- category_id에 slug가 들어간 경우
  AND cv.category_id != c.id   -- 이미 UUID가 아닌 경우만
  AND c.id IS NOT NULL;

-- 4. 확인: 업데이트 후 중복 체크
SELECT
  category_id,
  category_name,
  category_slug,
  COUNT(*) as visit_count,
  MAX(visited_at) as last_visited
FROM category_visits
WHERE user_id = auth.uid()
  AND visited_at >= NOW() - INTERVAL '30 days'
GROUP BY category_id, category_name, category_slug
ORDER BY MAX(visited_at) DESC;

-- 5. RPC 함수 테스트 (수정 후)
SELECT * FROM get_recent_category_visits(
  auth.uid(),
  30,
  10
);
