-- ============================================
-- 생활 서비스 카테고리 완전 복구 (1/2/3단계)
-- ============================================

-- 1. 생활 서비스 1단계 카테고리 생성
INSERT INTO categories (name, slug, icon, description, level, is_ai, is_active, display_order)
VALUES ('생활 서비스', 'life-service', 'home', '일상 생활 편의 서비스', 1, false, true, 14)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- 2. 생활 서비스의 2단계 카테고리 생성 (4개)
WITH life_service AS (
  SELECT id FROM categories WHERE slug = 'life-service'
)
INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order)
SELECT
  v.name,
  v.slug,
  v.description,
  life_service.id,
  v.level,
  v.is_ai,
  v.is_active,
  v.display_order
FROM (VALUES
  ('전문 청소', 'professional-cleaning', '입주청소, 사무실청소 등', 2, false, true, 1),
  ('가사/돌봄 도우미', 'home-helper', '가사도우미, 아이돌봄 등', 2, false, true, 2),
  ('집수리', 'home-repair', '도배, 수도, 인테리어 등', 2, false, true, 3),
  ('이사', 'moving-service', '포장이사, 반포장이사 등', 2, false, true, 4)
) AS v(name, slug, description, level, is_ai, is_active, display_order)
CROSS JOIN life_service
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id;

-- 3. 전문 청소의 3단계 카테고리 (3개)
WITH prof_cleaning AS (
  SELECT id FROM categories WHERE slug = 'professional-cleaning'
)
INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order)
SELECT
  v.name,
  v.slug,
  v.description,
  prof_cleaning.id,
  v.level,
  v.is_ai,
  v.is_active,
  v.display_order
FROM (VALUES
  ('입주/이사 청소', 'deep-cleaning', '입주/이사 시 전문 청소', 3, false, true, 1),
  ('사무실/상가 청소', 'office-cleaning', '사무실 및 상가 청소', 3, false, true, 2),
  ('에어컨 세척', 'aircon-cleaning', '에어컨 전문 세척', 3, false, true, 3)
) AS v(name, slug, description, level, is_ai, is_active, display_order)
CROSS JOIN prof_cleaning
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id;

-- 4. 가사/돌봄 도우미의 3단계 카테고리 (4개)
WITH home_helper AS (
  SELECT id FROM categories WHERE slug = 'home-helper'
)
INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order)
SELECT
  v.name,
  v.slug,
  v.description,
  home_helper.id,
  v.level,
  v.is_ai,
  v.is_active,
  v.display_order
FROM (VALUES
  ('가사도우미 (청소/빨래/요리)', 'housekeeping', '일상 가사 도우미', 3, false, true, 1),
  ('아이 돌봄/베이비시터', 'babysitter', '아이 돌봄 서비스', 3, false, true, 2),
  ('어르신 간병/케어', 'senior-care', '어르신 간병 서비스', 3, false, true, 3),
  ('반려동물 돌봄/산책', 'pet-sitting', '반려동물 돌봄', 3, false, true, 4)
) AS v(name, slug, description, level, is_ai, is_active, display_order)
CROSS JOIN home_helper
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id;

-- 5. 집수리의 3단계 카테고리 (5개)
WITH home_repair AS (
  SELECT id FROM categories WHERE slug = 'home-repair'
)
INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order)
SELECT
  v.name,
  v.slug,
  v.description,
  home_repair.id,
  v.level,
  v.is_ai,
  v.is_active,
  v.display_order
FROM (VALUES
  ('도배/장판/타일', 'wallpaper-flooring', '도배, 장판, 타일 시공', 3, false, true, 1),
  ('수도/배관 수리', 'plumbing', '수도 및 배관 수리', 3, false, true, 2),
  ('방충망 교체/수리', 'screen-repair', '방충망 교체 및 수리', 3, false, true, 3),
  ('싱크대/욕실 수리', 'kitchen-bathroom', '싱크대 및 욕실 수리', 3, false, true, 4),
  ('인테리어/리모델링', 'interior-remodeling', '인테리어 및 리모델링', 3, false, true, 5)
) AS v(name, slug, description, level, is_ai, is_active, display_order)
CROSS JOIN home_repair
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id;

-- 6. 이사의 3단계 카테고리 (4개)
WITH moving_service AS (
  SELECT id FROM categories WHERE slug = 'moving-service'
)
INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order)
SELECT
  v.name,
  v.slug,
  v.description,
  moving_service.id,
  v.level,
  v.is_ai,
  v.is_active,
  v.display_order
FROM (VALUES
  ('포장이사', 'moving-full', '전문 포장이사', 3, false, true, 1),
  ('반포장이사', 'moving-half', '반포장 이사', 3, false, true, 2),
  ('소형/원룸 이사', 'small-moving', '소형 및 원룸 이사', 3, false, true, 3),
  ('폐기물/대형쓰레기 처리', 'disposal-service', '폐기물 및 대형쓰레기 처리', 3, false, true, 4)
) AS v(name, slug, description, level, is_ai, is_active, display_order)
CROSS JOIN moving_service
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id;

-- 7. 확인
SELECT
  c1.name as "1단계",
  c2.name as "2단계",
  c3.name as "3단계",
  c3.slug as "3단계_slug"
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.id
LEFT JOIN categories c3 ON c3.parent_id = c2.id
WHERE c1.slug = 'life-service'
ORDER BY c2.display_order, c3.display_order;

-- 총 개수 확인
SELECT
  '1단계' as "레벨",
  COUNT(*) as "개수"
FROM categories
WHERE slug = 'life-service'
UNION ALL
SELECT
  '2단계' as "레벨",
  COUNT(*) as "개수"
FROM categories
WHERE parent_id = (SELECT id FROM categories WHERE slug = 'life-service')
UNION ALL
SELECT
  '3단계' as "레벨",
  COUNT(*) as "개수"
FROM categories c3
WHERE parent_id IN (
  SELECT id FROM categories WHERE parent_id = (SELECT id FROM categories WHERE slug = 'life-service')
);
