-- ========================================
-- 2차 카테고리 중요도 기반 재정렬
-- ========================================

-- IT/프로그래밍
UPDATE categories SET display_order = 1 WHERE slug = 'ai-it';
UPDATE categories SET display_order = 2 WHERE slug = 'web-creation';
UPDATE categories SET display_order = 3 WHERE slug = 'mobile';
UPDATE categories SET display_order = 4 WHERE slug = 'program';
UPDATE categories SET display_order = 5 WHERE slug = 'data';
UPDATE categories SET display_order = 6 WHERE slug = 'web-builder';
UPDATE categories SET display_order = 7 WHERE slug = 'job-position';
UPDATE categories SET display_order = 8 WHERE slug = 'web-maintenance';
UPDATE categories SET display_order = 9 WHERE slug = 'security-quality';
UPDATE categories SET display_order = 10 WHERE slug = 'trend-tech';
UPDATE categories SET display_order = 11 WHERE slug = 'it-etc';

-- 디자인
UPDATE categories SET display_order = 1 WHERE slug = 'logo-branding';
UPDATE categories SET display_order = 2 WHERE slug = 'marketing-design';
UPDATE categories SET display_order = 3 WHERE slug = 'web-mobile-design';
UPDATE categories SET display_order = 4 WHERE slug = 'character-illustration';
UPDATE categories SET display_order = 5 WHERE slug = 'graphic-design';
UPDATE categories SET display_order = 6 WHERE slug = 'package-cover';
UPDATE categories SET display_order = 7 WHERE slug = '3d-design';
UPDATE categories SET display_order = 8 WHERE slug = 'industrial-product-design';
UPDATE categories SET display_order = 9 WHERE slug = 'calligraphy-font';
UPDATE categories SET display_order = 10 WHERE slug = 'fashion-textile';
UPDATE categories SET display_order = 11 WHERE slug = 'space-architecture';
UPDATE categories SET display_order = 12 WHERE slug = 'game-web3';
UPDATE categories SET display_order = 13 WHERE slug = 'design-etc';

-- 마케팅
UPDATE categories SET display_order = 1 WHERE slug = 'performance-ads';
UPDATE categories SET display_order = 2 WHERE slug = 'seo-optimization';
UPDATE categories SET display_order = 3 WHERE slug = 'map-marketing';
UPDATE categories SET display_order = 4 WHERE slug = 'channel-activation';
UPDATE categories SET display_order = 5 WHERE slug = 'ai-marketing';
UPDATE categories SET display_order = 6 WHERE slug = 'viral-sponsorship';
UPDATE categories SET display_order = 7 WHERE slug = 'analysis-strategy';
UPDATE categories SET display_order = 8 WHERE slug = 'industry-purpose';
UPDATE categories SET display_order = 9 WHERE slug = 'global-marketing';
UPDATE categories SET display_order = 10 WHERE slug = 'marketing-etc';

-- 문서/글쓰기
UPDATE categories SET display_order = 1 WHERE slug = 'business-copy';
UPDATE categories SET display_order = 2 WHERE slug = 'content-writing';
UPDATE categories SET display_order = 3 WHERE slug = 'ai-writing';
UPDATE categories SET display_order = 4 WHERE slug = 'proofreading-revision';
UPDATE categories SET display_order = 5 WHERE slug = 'academic-documents';
UPDATE categories SET display_order = 6 WHERE slug = 'creative-writing';
UPDATE categories SET display_order = 7 WHERE slug = 'thesis-research';
UPDATE categories SET display_order = 8 WHERE slug = 'typing-editing';
UPDATE categories SET display_order = 9 WHERE slug = 'writing-etc';

-- 번역/통역
UPDATE categories SET display_order = 1 WHERE slug = 'document-translation';
UPDATE categories SET display_order = 2 WHERE slug = 'media-translation';
UPDATE categories SET display_order = 3 WHERE slug = 'interpretation';
UPDATE categories SET display_order = 4 WHERE slug = 'professional-translation';

-- 영상/사진
UPDATE categories SET display_order = 1 WHERE slug = 'video';
UPDATE categories SET display_order = 2 WHERE slug = 'photography';
UPDATE categories SET display_order = 3 WHERE slug = 'computer-graphics';
UPDATE categories SET display_order = 4 WHERE slug = 'animation';
UPDATE categories SET display_order = 5 WHERE slug = 'ai-content';
UPDATE categories SET display_order = 6 WHERE slug = 'audio';
UPDATE categories SET display_order = 7 WHERE slug = 'entertainer';
UPDATE categories SET display_order = 8 WHERE slug = 'video-photo-etc';

-- 음악/오디오
UPDATE categories SET display_order = 1 WHERE slug = 'music-production';
UPDATE categories SET display_order = 2 WHERE slug = 'audio-production';
UPDATE categories SET display_order = 3 WHERE slug = 'voice-narration';

-- 비즈니스
UPDATE categories SET display_order = 1 WHERE slug = 'consulting';
UPDATE categories SET display_order = 2 WHERE slug = 'business-plan';
UPDATE categories SET display_order = 3 WHERE slug = 'industry-startup';
UPDATE categories SET display_order = 4 WHERE slug = 'startup-consulting';
UPDATE categories SET display_order = 5 WHERE slug = 'corporate-consulting';
UPDATE categories SET display_order = 6 WHERE slug = 'finance-accounting';
UPDATE categories SET display_order = 7 WHERE slug = 'legal-services';
UPDATE categories SET display_order = 8 WHERE slug = 'business-support';
UPDATE categories SET display_order = 9 WHERE slug = 'business-materials';
UPDATE categories SET display_order = 10 WHERE slug = 'business-etc';

-- 세무/법무/노무
UPDATE categories SET display_order = 1 WHERE slug = 'tax-accounting';
UPDATE categories SET display_order = 2 WHERE slug = 'legal-service';
UPDATE categories SET display_order = 3 WHERE slug = 'labor-service';
UPDATE categories SET display_order = 4 WHERE slug = 'intellectual-property';
UPDATE categories SET display_order = 5 WHERE slug = 'tax-legal-labor-etc';

-- 심부름
UPDATE categories SET display_order = 1 WHERE slug = 'delivery-service';

-- 뷰티/패션
UPDATE categories SET display_order = 1 WHERE slug = 'beauty-services';
UPDATE categories SET display_order = 2 WHERE slug = 'fashion-styling';

-- 상담/코칭
UPDATE categories SET display_order = 1 WHERE slug = 'psychological-counseling';

-- 운세/타로
UPDATE categories SET display_order = 1 WHERE slug = 'fortune-telling';
UPDATE categories SET display_order = 2 WHERE slug = 'tarot-reading';

-- 이벤트
UPDATE categories SET display_order = 1 WHERE slug = 'event-planning';
UPDATE categories SET display_order = 2 WHERE slug = 'event-services';

-- 전자책/템플릿
UPDATE categories SET display_order = 1 WHERE slug = 'ebook';
UPDATE categories SET display_order = 2 WHERE slug = 'templates';

-- 주문제작
UPDATE categories SET display_order = 1 WHERE slug = 'print-promotional';
UPDATE categories SET display_order = 2 WHERE slug = 'custom-goods';
UPDATE categories SET display_order = 3 WHERE slug = 'printing-materials';
UPDATE categories SET display_order = 4 WHERE slug = 'custom-order-etc';

-- 직무역량
UPDATE categories SET display_order = 1 WHERE slug = 'office-skills';
UPDATE categories SET display_order = 2 WHERE slug = 'business-skills';

-- 취미/핸드메이드
UPDATE categories SET display_order = 1 WHERE slug = 'handmade-craft';
UPDATE categories SET display_order = 2 WHERE slug = 'gaming';
UPDATE categories SET display_order = 3 WHERE slug = 'gift-items';

-- 취업/입시
UPDATE categories SET display_order = 1 WHERE slug = 'job-preparation';
UPDATE categories SET display_order = 2 WHERE slug = 'admission-prep';

-- 확인
SELECT
  c1.name as "1차_카테고리",
  c2.name as "2차_카테고리",
  c2.slug as "2차_slug",
  c2.display_order as "순서"
FROM categories c1
JOIN categories c2 ON c2.parent_id = c1.id
WHERE c2.level = 2
ORDER BY c1.display_order, c2.display_order;

-- 업데이트된 개수 확인
SELECT
  '업데이트된 2차 카테고리 개수' as "결과",
  COUNT(*) as "개수"
FROM categories
WHERE level = 2;
