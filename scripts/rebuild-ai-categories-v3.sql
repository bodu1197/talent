-- ========================================
-- AI 서비스 카테고리 재구성 (v3 - 컬럼 순서 수정)
-- ========================================

-- 1단계: AI 카테고리를 사용하는 service_categories 연결 삭제
DELETE FROM service_categories
WHERE category_id IN (
  -- AI 서비스의 모든 하위 카테고리 slug
  SELECT c2.slug FROM categories c1
  JOIN categories c2 ON c2.parent_id = c1.id
  WHERE c1.slug = 'ai-services'

  UNION

  SELECT c3.slug FROM categories c1
  JOIN categories c2 ON c2.parent_id = c1.id
  JOIN categories c3 ON c3.parent_id = c2.id
  WHERE c1.slug = 'ai-services'
);

-- 2단계: 기존 AI 서비스 하위 카테고리 삭제

-- 3단계 카테고리 삭제
DELETE FROM categories c3
USING categories c2, categories c1
WHERE c3.parent_id = c2.id
  AND c2.parent_id = c1.id
  AND c1.slug = 'ai-services';

-- 2단계 카테고리 삭제
DELETE FROM categories c2
USING categories c1
WHERE c2.parent_id = c1.id
  AND c1.slug = 'ai-services';

-- ========================================
-- 3단계: 새로운 AI 서비스 카테고리 생성
-- ========================================

-- 1. AI 디자인
WITH ai_services AS (
  SELECT id FROM categories WHERE slug = 'ai-services'
),
ai_design AS (
  INSERT INTO categories (name, slug, icon, description, parent_id, level, is_ai, is_active, display_order)
  SELECT 'AI 디자인', 'ai-design', 'palette', 'AI 기반 디자인 서비스', id, 2, true, true, 1
  FROM ai_services
  RETURNING id
)
INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order)
SELECT
  v.name,
  v.slug,
  v.description,
  ai_design.id,
  v.level,
  v.is_ai,
  v.is_active,
  v.display_order
FROM (VALUES
  ('AI 실사·모델', 'ai-realistic-model', 'AI로 생성한 실사 이미지 및 모델', 3, true, true, 1),
  ('AI 일러스트', 'ai-illustration', 'AI로 생성한 일러스트 및 그림', 3, true, true, 2),
  ('AI 광고소재 디자인', 'ai-ad-material-design', 'AI 기반 광고 소재 디자인', 3, true, true, 3)
) AS v(name, slug, description, level, is_ai, is_active, display_order)
CROSS JOIN ai_design;

-- 2. AI 영상·사진·음향
WITH ai_services AS (
  SELECT id FROM categories WHERE slug = 'ai-services'
),
ai_video AS (
  INSERT INTO categories (name, slug, icon, description, parent_id, level, is_ai, is_active, display_order)
  SELECT 'AI 영상·사진·음향', 'ai-video-photo-audio', 'video', 'AI 기반 영상/사진/음향 제작', id, 2, true, true, 2
  FROM ai_services
  RETURNING id
)
INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order)
SELECT
  v.name,
  v.slug,
  v.description,
  ai_video.id,
  v.level,
  v.is_ai,
  v.is_active,
  v.display_order
FROM (VALUES
  ('AI 광고 영상', 'ai-ad-video', 'AI로 제작한 광고 영상', 3, true, true, 1),
  ('AI 제품 사진', 'ai-product-photo', 'AI로 생성한 제품 사진', 3, true, true, 2),
  ('AI 더빙·내레이션', 'ai-dubbing-narration', 'AI 음성 더빙 및 내레이션', 3, true, true, 3)
) AS v(name, slug, description, level, is_ai, is_active, display_order)
CROSS JOIN ai_video;

-- 3. AI 개발·자동화
WITH ai_services AS (
  SELECT id FROM categories WHERE slug = 'ai-services'
),
ai_dev AS (
  INSERT INTO categories (name, slug, icon, description, parent_id, level, is_ai, is_active, display_order)
  SELECT 'AI 개발·자동화', 'ai-development-automation', 'cog', 'AI 시스템 개발 및 자동화', id, 2, true, true, 3
  FROM ai_services
  RETURNING id
)
INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order)
SELECT
  v.name,
  v.slug,
  v.description,
  ai_dev.id,
  v.level,
  v.is_ai,
  v.is_active,
  v.display_order
FROM (VALUES
  ('AI 시스템 서비스', 'ai-system-service', 'AI 기반 시스템 개발 및 구축', 3, true, true, 1),
  ('AI 자동화 프로그램', 'ai-automation-program', 'AI 업무 자동화 프로그램', 3, true, true, 2),
  ('AI 모델링 최적화', 'ai-modeling-optimization', 'AI 모델 최적화 및 튜닝', 3, true, true, 3)
) AS v(name, slug, description, level, is_ai, is_active, display_order)
CROSS JOIN ai_dev;

-- 4. AI 마케팅·글작성
WITH ai_services AS (
  SELECT id FROM categories WHERE slug = 'ai-services'
),
ai_marketing AS (
  INSERT INTO categories (name, slug, icon, description, parent_id, level, is_ai, is_active, display_order)
  SELECT 'AI 마케팅·글작성', 'ai-marketing-writing', 'pen', 'AI 기반 마케팅 및 콘텐츠 작성', id, 2, true, true, 4
  FROM ai_services
  RETURNING id
)
INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order)
SELECT
  v.name,
  v.slug,
  v.description,
  ai_marketing.id,
  v.level,
  v.is_ai,
  v.is_active,
  v.display_order
FROM (VALUES
  ('AI 마케팅 콘텐츠', 'ai-marketing-content', 'AI로 제작한 마케팅 콘텐츠', 3, true, true, 1),
  ('AI SEO·GEO', 'ai-seo-geo', 'AI 기반 SEO 및 검색 최적화', 3, true, true, 2),
  ('AI 콘텐츠 생성', 'ai-content-generation', 'AI 기반 콘텐츠 자동 생성', 3, true, true, 3)
) AS v(name, slug, description, level, is_ai, is_active, display_order)
CROSS JOIN ai_marketing;

-- 5. AI 프롬프트
WITH ai_services AS (
  SELECT id FROM categories WHERE slug = 'ai-services'
),
ai_prompt AS (
  INSERT INTO categories (name, slug, icon, description, parent_id, level, is_ai, is_active, display_order)
  SELECT 'AI 프롬프트', 'ai-prompt-new', 'terminal', 'AI 프롬프트 제작 및 판매', id, 2, true, true, 5
  FROM ai_services
  RETURNING id
)
INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order)
SELECT
  v.name,
  v.slug,
  v.description,
  ai_prompt.id,
  v.level,
  v.is_ai,
  v.is_active,
  v.display_order
FROM (VALUES
  ('디자인 프롬프트', 'design-prompt', '디자인 생성용 프롬프트', 3, true, true, 1),
  ('음악/영상 프롬프트', 'music-video-prompt', '음악 및 영상 생성용 프롬프트', 3, true, true, 2),
  ('콘텐츠 프롬프트', 'content-prompt', '콘텐츠 생성용 프롬프트', 3, true, true, 3)
) AS v(name, slug, description, level, is_ai, is_active, display_order)
CROSS JOIN ai_prompt;

-- 6. AI 활용·수익화
WITH ai_services AS (
  SELECT id FROM categories WHERE slug = 'ai-services'
),
ai_util AS (
  INSERT INTO categories (name, slug, icon, description, parent_id, level, is_ai, is_active, display_order)
  SELECT 'AI 활용·수익화', 'ai-utilization-monetization', 'dollar-sign', 'AI 활용 교육 및 수익화', id, 2, true, true, 6
  FROM ai_services
  RETURNING id
)
INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order)
SELECT
  v.name,
  v.slug,
  v.description,
  ai_util.id,
  v.level,
  v.is_ai,
  v.is_active,
  v.display_order
FROM (VALUES
  ('AI 수익화', 'ai-monetization', 'AI 활용 수익화 전략 및 실행', 3, true, true, 1),
  ('AI 컨설팅·자문', 'ai-consulting-advisory', 'AI 도입 및 활용 컨설팅', 3, true, true, 2),
  ('AI 교육', 'ai-education-new', 'AI 도구 및 활용법 교육', 3, true, true, 3)
) AS v(name, slug, description, level, is_ai, is_active, display_order)
CROSS JOIN ai_util;

-- ========================================
-- 4단계: 확인
-- ========================================

-- AI 서비스 전체 구조 확인
SELECT
  c1.name as "1단계",
  c2.name as "2단계",
  c2.slug as "2단계_slug",
  c2.display_order as "순서",
  COUNT(c3.id) as "3단계_개수"
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.id AND c2.is_active = true
LEFT JOIN categories c3 ON c3.parent_id = c2.id AND c3.is_active = true
WHERE c1.slug = 'ai-services'
GROUP BY c1.name, c2.id, c2.name, c2.slug, c2.display_order
ORDER BY c2.display_order;
