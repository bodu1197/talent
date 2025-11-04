-- 심부름 카테고리 아이콘을 running에서 motorcycle로 변경
UPDATE categories
SET icon = 'motorcycle'
WHERE slug = 'errands';

-- 확인
SELECT id, name, slug, icon, level
FROM categories
WHERE slug = 'errands';
