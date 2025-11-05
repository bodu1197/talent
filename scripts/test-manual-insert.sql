-- ========================================
-- 수동 INSERT 테스트
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- 1. 현재 사용자 확인
SELECT auth.uid() as my_user_id;

-- 2. 수동으로 방문 기록 추가 테스트
INSERT INTO category_visits (
  user_id,
  category_id,
  category_name,
  category_slug,
  visited_at
) VALUES (
  auth.uid(),
  'test-category-id',
  '테스트 카테고리',
  'test-category',
  NOW()
);

-- 3. 확인
SELECT * FROM category_visits WHERE user_id = auth.uid();

-- 4. 테스트 데이터 삭제
DELETE FROM category_visits WHERE category_id = 'test-category-id';
