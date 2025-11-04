-- ============================================
-- 생활 서비스 카테고리 재구성 SQL
-- 중복 제거 및 필수 서비스 중심으로 재구성
-- ============================================

-- 1. 기존 생활 서비스 카테고리 모두 삭제
DELETE FROM categories
WHERE id = 'life-service'
   OR parent_id = 'life-service'
   OR parent_id IN (
     SELECT id FROM categories WHERE parent_id = 'life-service'
   );

-- 2. 1차 카테고리: 생활 서비스
INSERT INTO categories (id, name, slug, icon, service_count, popularity_score, description, parent_id, level, is_ai, created_at, updated_at)
VALUES (
  'life-service',
  '생활 서비스',
  'life-service',
  'home',
  16,
  88,
  '일상 생활 편의 서비스',
  NULL,
  1,
  false,
  NOW(),
  NOW()
);

-- ============================================
-- 3. 2차 카테고리 (4개)
-- ============================================

-- 3-1. 전문 청소
INSERT INTO categories (id, name, slug, parent_id, level, is_ai, created_at, updated_at)
VALUES (
  'professional-cleaning',
  '전문 청소',
  'professional-cleaning',
  'life-service',
  2,
  false,
  NOW(),
  NOW()
);

-- 3-2. 가사/돌봄 도우미
INSERT INTO categories (id, name, slug, parent_id, level, is_ai, created_at, updated_at)
VALUES (
  'home-helper',
  '가사/돌봄 도우미',
  'home-helper',
  'life-service',
  2,
  false,
  NOW(),
  NOW()
);

-- 3-3. 집수리
INSERT INTO categories (id, name, slug, parent_id, level, is_ai, created_at, updated_at)
VALUES (
  'home-repair',
  '집수리',
  'home-repair',
  'life-service',
  2,
  false,
  NOW(),
  NOW()
);

-- 3-4. 이사
INSERT INTO categories (id, name, slug, parent_id, level, is_ai, created_at, updated_at)
VALUES (
  'moving-service',
  '이사',
  'moving-service',
  'life-service',
  2,
  false,
  NOW(),
  NOW()
);

-- ============================================
-- 4. 3차 카테고리 (16개)
-- ============================================

-- 4-1. 전문 청소 하위 (3개)
INSERT INTO categories (id, name, slug, parent_id, level, is_popular, is_ai, created_at, updated_at)
VALUES
  ('deep-cleaning', '입주/이사 청소', 'deep-cleaning', 'professional-cleaning', 3, true, false, NOW(), NOW()),
  ('office-cleaning', '사무실/상가 청소', 'office-cleaning', 'professional-cleaning', 3, false, false, NOW(), NOW()),
  ('aircon-cleaning', '에어컨 세척', 'aircon-cleaning', 'professional-cleaning', 3, true, false, NOW(), NOW());

-- 4-2. 가사/돌봄 도우미 하위 (4개)
INSERT INTO categories (id, name, slug, parent_id, level, is_popular, is_ai, created_at, updated_at)
VALUES
  ('housekeeping', '가사도우미 (청소/빨래/요리)', 'housekeeping', 'home-helper', 3, true, false, NOW(), NOW()),
  ('babysitter', '아이 돌봄/베이비시터', 'babysitter', 'home-helper', 3, true, false, NOW(), NOW()),
  ('senior-care', '어르신 간병/케어', 'senior-care', 'home-helper', 3, true, false, NOW(), NOW()),
  ('pet-sitting', '반려동물 돌봄/산책', 'pet-sitting', 'home-helper', 3, true, false, NOW(), NOW());

-- 4-3. 집수리 하위 (5개)
INSERT INTO categories (id, name, slug, parent_id, level, is_popular, is_ai, created_at, updated_at)
VALUES
  ('wallpaper-flooring', '도배/장판/타일', 'wallpaper-flooring', 'home-repair', 3, true, false, NOW(), NOW()),
  ('plumbing', '수도/배관 수리', 'plumbing', 'home-repair', 3, false, false, NOW(), NOW()),
  ('screen-repair', '방충망 교체/수리', 'screen-repair', 'home-repair', 3, false, false, NOW(), NOW()),
  ('kitchen-bathroom', '싱크대/욕실 수리', 'kitchen-bathroom', 'home-repair', 3, false, false, NOW(), NOW()),
  ('interior-remodeling', '인테리어/리모델링', 'interior-remodeling', 'home-repair', 3, false, false, NOW(), NOW());

-- 4-4. 이사 하위 (4개)
INSERT INTO categories (id, name, slug, parent_id, level, is_popular, is_ai, created_at, updated_at)
VALUES
  ('moving-full', '포장이사', 'moving-full', 'moving-service', 3, true, false, NOW(), NOW()),
  ('moving-half', '반포장이사', 'moving-half', 'moving-service', 3, true, false, NOW(), NOW()),
  ('small-moving', '소형/원룸 이사', 'small-moving', 'moving-service', 3, false, false, NOW(), NOW()),
  ('disposal-service', '폐기물/대형쓰레기 처리', 'disposal-service', 'moving-service', 3, false, false, NOW(), NOW());

-- ============================================
-- 5. 완료 메시지
-- ============================================
-- 총 21개 레코드 삽입 (1차 1개, 2차 4개, 3차 16개)
-- 중복 제거 및 필수 서비스 중심 재구성 완료
