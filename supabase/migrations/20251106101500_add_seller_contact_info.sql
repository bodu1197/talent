-- ========================================
-- sellers 테이블에 연락 가능 시간 및 세금계산서 발행 여부 컬럼 추가
-- ========================================

-- 1. 연락 가능 시간 컬럼 추가 (TEXT 타입, NULL 허용)
ALTER TABLE sellers
ADD COLUMN IF NOT EXISTS contact_hours TEXT;

-- 2. 세금계산서 발행 여부 컬럼 추가 (BOOLEAN 타입, 기본값 false)
ALTER TABLE sellers
ADD COLUMN IF NOT EXISTS tax_invoice_available BOOLEAN DEFAULT false;

-- 3. 컬럼 코멘트 추가
COMMENT ON COLUMN sellers.contact_hours IS '연락 가능 시간 (예: 평일 09:00-18:00)';
COMMENT ON COLUMN sellers.tax_invoice_available IS '세금계산서 발행 가능 여부';

-- 4. 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'sellers' AND column_name IN ('contact_hours', 'tax_invoice_available');
