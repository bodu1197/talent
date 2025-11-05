-- ========================================
-- 전체 카테고리 중요도 기반 재정렬
-- ========================================

-- 현재 카테고리 순서 확인
SELECT name, slug, display_order
FROM categories
WHERE parent_id IS NULL
ORDER BY display_order, name;

-- 1단계 카테고리 display_order 업데이트 (중요도 순)
UPDATE categories SET display_order = 1 WHERE slug = 'ai-services';           -- AI 서비스 (최신 트렌드)
UPDATE categories SET display_order = 2 WHERE slug = 'it-programming';        -- IT/프로그래밍 (높은 수요)
UPDATE categories SET display_order = 3 WHERE slug = 'design';                -- 디자인 (높은 수요)
UPDATE categories SET display_order = 4 WHERE slug = 'video-photo';           -- 영상/사진 (인기)
UPDATE categories SET display_order = 5 WHERE slug = 'marketing';             -- 마케팅 (비즈니스 필수)
UPDATE categories SET display_order = 6 WHERE slug = 'writing';               -- 문서/글쓰기 (수요 많음)
UPDATE categories SET display_order = 7 WHERE slug = 'translation';           -- 번역/통역 (전문 분야)
UPDATE categories SET display_order = 8 WHERE slug = 'music-audio';           -- 음악/오디오 (크리에이티브)
UPDATE categories SET display_order = 9 WHERE slug = 'business';              -- 비즈니스 (기업 대상)
UPDATE categories SET display_order = 10 WHERE slug = 'tax-legal-labor';      -- 세무/법무/노무 (전문 서비스)
UPDATE categories SET display_order = 11 WHERE slug = 'counseling-coaching';  -- 상담/코칭 (개인 성장)
UPDATE categories SET display_order = 12 WHERE slug = 'career-admission';     -- 취업/입시 (교육)
UPDATE categories SET display_order = 13 WHERE slug = 'job-skills';           -- 직무역량 (업무 스킬)
UPDATE categories SET display_order = 14 WHERE slug = 'life-service';         -- 생활 서비스 (일상)
UPDATE categories SET display_order = 15 WHERE slug = 'errands';              -- 심부름 (편의)
UPDATE categories SET display_order = 16 WHERE slug = 'custom-order';         -- 주문제작 (맞춤)
UPDATE categories SET display_order = 17 WHERE slug = 'ebook-template';       -- 전자책/템플릿 (디지털 상품)
UPDATE categories SET display_order = 18 WHERE slug = 'hobby-handmade';       -- 취미/핸드메이드 (취미)
UPDATE categories SET display_order = 19 WHERE slug = 'beauty-fashion';       -- 뷰티/패션 (라이프스타일)
UPDATE categories SET display_order = 20 WHERE slug = 'event';                -- 이벤트 (행사)
UPDATE categories SET display_order = 21 WHERE slug = 'fortune-tarot';        -- 운세/타로 (특수)

-- 업데이트 후 확인
SELECT
  display_order as "순서",
  name as "카테고리명",
  slug,
  is_active as "활성화"
FROM categories
WHERE parent_id IS NULL
ORDER BY display_order;

-- 총 개수 확인
SELECT COUNT(*) as "1단계_카테고리_총개수"
FROM categories
WHERE parent_id IS NULL;
