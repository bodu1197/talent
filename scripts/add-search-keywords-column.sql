-- ========================================
-- services 테이블에 search_keywords 컬럼 추가
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- 1. search_keywords 컬럼 추가 (TEXT 타입, NULL 허용)
ALTER TABLE services
ADD COLUMN IF NOT EXISTS search_keywords TEXT;

-- 2. 컬럼에 대한 코멘트 추가
COMMENT ON COLUMN services.search_keywords IS '검색 키워드 (띄어쓰기 없이 20글자까지, 특수문자/이모지 불가)';

-- 3. 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'services' AND column_name = 'search_keywords';
