-- categories 테이블에 is_ai 컬럼 추가
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS is_ai BOOLEAN DEFAULT FALSE;

-- AI 서비스 카테고리와 모든 하위 카테고리를 is_ai = true로 설정
-- 1차 카테고리: ai-services
-- 2차 카테고리: ai-services의 직계 자식들
-- 3차 카테고리: 2차 카테고리의 직계 자식들

UPDATE categories
SET is_ai = TRUE
WHERE id IN (
  -- 1차: ai-services
  SELECT id FROM categories WHERE slug = 'ai-services'

  UNION

  -- 2차: ai-services의 직계 자식
  SELECT id FROM categories
  WHERE parent_id = (SELECT id FROM categories WHERE slug = 'ai-services')

  UNION

  -- 3차: 2차 카테고리의 직계 자식
  SELECT c.id FROM categories c
  WHERE c.parent_id IN (
    SELECT id FROM categories
    WHERE parent_id = (SELECT id FROM categories WHERE slug = 'ai-services')
  )
);
