-- ========================================
-- 1차 카테고리 중요도 기반 재정렬
-- Supabase SQL Editor에서 실행하세요
-- ========================================

UPDATE categories SET display_order = 1 WHERE slug = 'ai-services';           -- AI 서비스
UPDATE categories SET display_order = 2 WHERE slug = 'it-programming';        -- IT/프로그래밍
UPDATE categories SET display_order = 3 WHERE slug = 'design';                -- 디자인
UPDATE categories SET display_order = 4 WHERE slug = 'marketing';             -- 마케팅
UPDATE categories SET display_order = 5 WHERE slug = 'life-service';          -- 생활 서비스
UPDATE categories SET display_order = 6 WHERE slug = 'errands';               -- 심부름
UPDATE categories SET display_order = 7 WHERE slug = 'video-photo';           -- 영상/사진
UPDATE categories SET display_order = 8 WHERE slug = 'writing';               -- 문서/글쓰기
UPDATE categories SET display_order = 9 WHERE slug = 'translation';           -- 번역/통역
UPDATE categories SET display_order = 10 WHERE slug = 'music-audio';          -- 음악/오디오
UPDATE categories SET display_order = 11 WHERE slug = 'business';             -- 비즈니스
UPDATE categories SET display_order = 12 WHERE slug = 'tax-legal-labor';      -- 세무/법무/노무
UPDATE categories SET display_order = 13 WHERE slug = 'counseling-coaching';  -- 상담/코칭
UPDATE categories SET display_order = 14 WHERE slug = 'career-admission';     -- 취업/입시
UPDATE categories SET display_order = 15 WHERE slug = 'job-skills';           -- 직무역량
UPDATE categories SET display_order = 16 WHERE slug = 'custom-order';         -- 주문제작
UPDATE categories SET display_order = 17 WHERE slug = 'ebook-template';       -- 전자책/템플릿
UPDATE categories SET display_order = 18 WHERE slug = 'hobby-handmade';       -- 취미/핸드메이드
UPDATE categories SET display_order = 19 WHERE slug = 'beauty-fashion';       -- 뷰티/패션
UPDATE categories SET display_order = 20 WHERE slug = 'event';                -- 이벤트
UPDATE categories SET display_order = 21 WHERE slug = 'fortune-tarot';        -- 운세/타로

-- 확인
SELECT
  display_order as "순서",
  name as "카테고리명",
  slug
FROM categories
WHERE parent_id IS NULL
ORDER BY display_order;
