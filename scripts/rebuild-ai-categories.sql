-- ========================================
-- AI 서비스 카테고리 재구성
-- 기존 구조 삭제 후 새로운 구조로 재생성
-- ========================================

-- 1단계: 기존 AI 서비스 하위 카테고리 모두 삭제
-- (3단계 → 2단계 순서로 삭제해야 함)

-- 3단계 카테고리 삭제 (AI 서비스의 손자)
DELETE FROM categories
WHERE parent_id IN (
  SELECT id FROM categories
  WHERE parent_id IN (
    SELECT id FROM categories WHERE slug = 'ai-services'
  )
);

-- 2단계 카테고리 삭제 (AI 서비스의 자식)
DELETE FROM categories
WHERE parent_id IN (
  SELECT id FROM categories WHERE slug = 'ai-services'
);

-- ========================================
-- 2단계: 새로운 AI 서비스 카테고리 생성
-- ========================================

-- AI 서비스 ID 조회용 변수
DO $$
DECLARE
  ai_services_id UUID;
  ai_design_id UUID;
  ai_video_photo_audio_id UUID;
  ai_dev_automation_id UUID;
  ai_marketing_writing_id UUID;
  ai_prompt_id UUID;
  ai_util_monetization_id UUID;
BEGIN
  -- AI 서비스 ID 가져오기
  SELECT id INTO ai_services_id FROM categories WHERE slug = 'ai-services';

  -- 1. AI 디자인
  INSERT INTO categories (name, slug, icon, description, parent_id, level, is_ai, is_active, display_order)
  VALUES ('AI 디자인', 'ai-design', 'palette', 'AI 기반 디자인 서비스', ai_services_id, 2, true, true, 1)
  RETURNING id INTO ai_design_id;

  INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order) VALUES
    ('AI 실사·모델', 'ai-realistic-model', 'AI로 생성한 실사 이미지 및 모델', ai_design_id, 3, true, true, 1),
    ('AI 일러스트', 'ai-illustration', 'AI로 생성한 일러스트 및 그림', ai_design_id, 3, true, true, 2),
    ('AI 광고소재 디자인', 'ai-ad-material-design', 'AI 기반 광고 소재 디자인', ai_design_id, 3, true, true, 3);

  -- 2. AI 영상·사진·음향
  INSERT INTO categories (name, slug, icon, description, parent_id, level, is_ai, is_active, display_order)
  VALUES ('AI 영상·사진·음향', 'ai-video-photo-audio', 'video', 'AI 기반 영상/사진/음향 제작', ai_services_id, 2, true, true, 2)
  RETURNING id INTO ai_video_photo_audio_id;

  INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order) VALUES
    ('AI 광고 영상', 'ai-ad-video', 'AI로 제작한 광고 영상', ai_video_photo_audio_id, 3, true, true, 1),
    ('AI 제품 사진', 'ai-product-photo', 'AI로 생성한 제품 사진', ai_video_photo_audio_id, 3, true, true, 2),
    ('AI 더빙·내레이션', 'ai-dubbing-narration', 'AI 음성 더빙 및 내레이션', ai_video_photo_audio_id, 3, true, true, 3);

  -- 3. AI 개발·자동화
  INSERT INTO categories (name, slug, icon, description, parent_id, level, is_ai, is_active, display_order)
  VALUES ('AI 개발·자동화', 'ai-development-automation', 'cog', 'AI 시스템 개발 및 자동화', ai_services_id, 2, true, true, 3)
  RETURNING id INTO ai_dev_automation_id;

  INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order) VALUES
    ('AI 시스템 서비스', 'ai-system-service', 'AI 기반 시스템 개발 및 구축', ai_dev_automation_id, 3, true, true, 1),
    ('AI 자동화 프로그램', 'ai-automation-program', 'AI 업무 자동화 프로그램', ai_dev_automation_id, 3, true, true, 2),
    ('AI 모델링 최적화', 'ai-modeling-optimization', 'AI 모델 최적화 및 튜닝', ai_dev_automation_id, 3, true, true, 3);

  -- 4. AI 마케팅·글작성
  INSERT INTO categories (name, slug, icon, description, parent_id, level, is_ai, is_active, display_order)
  VALUES ('AI 마케팅·글작성', 'ai-marketing-writing', 'pen', 'AI 기반 마케팅 및 콘텐츠 작성', ai_services_id, 2, true, true, 4)
  RETURNING id INTO ai_marketing_writing_id;

  INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order) VALUES
    ('AI 마케팅 콘텐츠', 'ai-marketing-content', 'AI로 제작한 마케팅 콘텐츠', ai_marketing_writing_id, 3, true, true, 1),
    ('AI SEO·GEO', 'ai-seo-geo', 'AI 기반 SEO 및 검색 최적화', ai_marketing_writing_id, 3, true, true, 2),
    ('AI 콘텐츠 생성', 'ai-content-generation', 'AI 기반 콘텐츠 자동 생성', ai_marketing_writing_id, 3, true, true, 3);

  -- 5. AI 프롬프트
  INSERT INTO categories (name, slug, icon, description, parent_id, level, is_ai, is_active, display_order)
  VALUES ('AI 프롬프트', 'ai-prompt', 'terminal', 'AI 프롬프트 제작 및 판매', ai_services_id, 2, true, true, 5)
  RETURNING id INTO ai_prompt_id;

  INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order) VALUES
    ('디자인 프롬프트', 'design-prompt', '디자인 생성용 프롬프트', ai_prompt_id, 3, true, true, 1),
    ('음악/영상 프롬프트', 'music-video-prompt', '음악 및 영상 생성용 프롬프트', ai_prompt_id, 3, true, true, 2),
    ('콘텐츠 프롬프트', 'content-prompt', '콘텐츠 생성용 프롬프트', ai_prompt_id, 3, true, true, 3);

  -- 6. AI 활용·수익화
  INSERT INTO categories (name, slug, icon, description, parent_id, level, is_ai, is_active, display_order)
  VALUES ('AI 활용·수익화', 'ai-utilization-monetization', 'dollar-sign', 'AI 활용 교육 및 수익화', ai_services_id, 2, true, true, 6)
  RETURNING id INTO ai_util_monetization_id;

  INSERT INTO categories (name, slug, description, parent_id, level, is_ai, is_active, display_order) VALUES
    ('AI 수익화', 'ai-monetization', 'AI 활용 수익화 전략 및 실행', ai_util_monetization_id, 3, true, true, 1),
    ('AI 컨설팅·자문', 'ai-consulting-advisory', 'AI 도입 및 활용 컨설팅', ai_util_monetization_id, 3, true, true, 2),
    ('AI 교육', 'ai-education-new', 'AI 도구 및 활용법 교육', ai_util_monetization_id, 3, true, true, 3);

END $$;

-- ========================================
-- 3단계: 확인
-- ========================================

-- AI 서비스 전체 구조 확인
SELECT
  c1.name as "1단계",
  c2.name as "2단계",
  c2.slug as "2단계 slug",
  c2.display_order as "순서",
  COUNT(c3.id) as "3단계 개수"
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.id AND c2.is_active = true
LEFT JOIN categories c3 ON c3.parent_id = c2.id AND c3.is_active = true
WHERE c1.slug = 'ai-services'
GROUP BY c1.name, c2.id, c2.name, c2.slug, c2.display_order
ORDER BY c2.display_order, c2.name;
