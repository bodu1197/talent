-- ============================================
-- 생활 서비스 카테고리 재구성 SQL (최종 버전)
-- Supabase SQL Editor에서 이 파일을 실행하세요
-- ============================================

-- 1. 기존 생활 서비스 관련 카테고리 삭제
-- 3차 카테고리 삭제
DELETE FROM categories
WHERE parent_id IN (
  SELECT id FROM categories
  WHERE parent_id IN (SELECT id FROM categories WHERE slug = 'life-service')
);

-- 2차 카테고리 삭제
DELETE FROM categories
WHERE parent_id IN (SELECT id FROM categories WHERE slug = 'life-service');

-- 1차 카테고리 삭제
DELETE FROM categories WHERE slug = 'life-service';

-- 2. 새로운 카테고리 생성

-- 2-1. 1차 카테고리: 생활 서비스
INSERT INTO categories (name, slug, icon, service_count, description, parent_id, level, is_ai_category, is_featured, is_active)
VALUES (
  '생활 서비스',
  'life-service',
  'home',
  16,
  '일상 생활 편의 서비스',
  NULL,
  1,
  false,
  true,
  true
);

-- 2-2. 2차 카테고리 (4개)
WITH life_service AS (
  SELECT id FROM categories WHERE slug = 'life-service'
)
INSERT INTO categories (name, slug, parent_id, level, is_ai_category, is_active)
SELECT * FROM (VALUES
  ('전문 청소', 'professional-cleaning', (SELECT id FROM life_service), 2, false, true),
  ('가사/돌봄 도우미', 'home-helper', (SELECT id FROM life_service), 2, false, true),
  ('집수리', 'home-repair', (SELECT id FROM life_service), 2, false, true),
  ('이사', 'moving-service', (SELECT id FROM life_service), 2, false, true)
) AS t(name, slug, parent_id, level, is_ai_category, is_active);

-- 2-3. 3차 카테고리 (16개)

-- 전문 청소 하위 (3개)
WITH prof_cleaning AS (
  SELECT id FROM categories WHERE slug = 'professional-cleaning'
)
INSERT INTO categories (name, slug, parent_id, level, is_ai_category, is_featured, is_active)
SELECT * FROM (VALUES
  ('입주/이사 청소', 'deep-cleaning', (SELECT id FROM prof_cleaning), 3, false, true, true),
  ('사무실/상가 청소', 'office-cleaning', (SELECT id FROM prof_cleaning), 3, false, false, true),
  ('에어컨 세척', 'aircon-cleaning', (SELECT id FROM prof_cleaning), 3, false, true, true)
) AS t(name, slug, parent_id, level, is_ai_category, is_featured, is_active);

-- 가사/돌봄 도우미 하위 (4개)
WITH home_helper AS (
  SELECT id FROM categories WHERE slug = 'home-helper'
)
INSERT INTO categories (name, slug, parent_id, level, is_ai_category, is_featured, is_active)
SELECT * FROM (VALUES
  ('가사도우미 (청소/빨래/요리)', 'housekeeping', (SELECT id FROM home_helper), 3, false, true, true),
  ('아이 돌봄/베이비시터', 'babysitter', (SELECT id FROM home_helper), 3, false, true, true),
  ('어르신 간병/케어', 'senior-care', (SELECT id FROM home_helper), 3, false, true, true),
  ('반려동물 돌봄/산책', 'pet-sitting', (SELECT id FROM home_helper), 3, false, true, true)
) AS t(name, slug, parent_id, level, is_ai_category, is_featured, is_active);

-- 집수리 하위 (5개)
WITH home_repair AS (
  SELECT id FROM categories WHERE slug = 'home-repair'
)
INSERT INTO categories (name, slug, parent_id, level, is_ai_category, is_featured, is_active)
SELECT * FROM (VALUES
  ('도배/장판/타일', 'wallpaper-flooring', (SELECT id FROM home_repair), 3, false, true, true),
  ('수도/배관 수리', 'plumbing', (SELECT id FROM home_repair), 3, false, false, true),
  ('방충망 교체/수리', 'screen-repair', (SELECT id FROM home_repair), 3, false, false, true),
  ('싱크대/욕실 수리', 'kitchen-bathroom', (SELECT id FROM home_repair), 3, false, false, true),
  ('인테리어/리모델링', 'interior-remodeling', (SELECT id FROM home_repair), 3, false, false, true)
) AS t(name, slug, parent_id, level, is_ai_category, is_featured, is_active);

-- 이사 하위 (4개)
WITH moving_service AS (
  SELECT id FROM categories WHERE slug = 'moving-service'
)
INSERT INTO categories (name, slug, parent_id, level, is_ai_category, is_featured, is_active)
SELECT * FROM (VALUES
  ('포장이사', 'moving-full', (SELECT id FROM moving_service), 3, false, true, true),
  ('반포장이사', 'moving-half', (SELECT id FROM moving_service), 3, false, true, true),
  ('소형/원룸 이사', 'small-moving', (SELECT id FROM moving_service), 3, false, false, true),
  ('폐기물/대형쓰레기 처리', 'disposal-service', (SELECT id FROM moving_service), 3, false, false, true)
) AS t(name, slug, parent_id, level, is_ai_category, is_featured, is_active);

-- 완료!
-- 총 21개 레코드 생성: 1차(1개) + 2차(4개) + 3차(16개)
