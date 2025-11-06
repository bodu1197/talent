-- ========================================
-- services 테이블의 check constraint 확인
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- 1. services 테이블의 모든 제약조건 확인
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'services'::regclass
  AND contype = 'c';  -- check constraints

-- 2. delivery_days_check constraint 제거 (너무 제한적일 경우)
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_delivery_days_check;

-- 3. 새로운 제약조건 추가 (1일 이상, 365일 이하)
ALTER TABLE services ADD CONSTRAINT services_delivery_days_check
CHECK (delivery_days >= 1 AND delivery_days <= 365);

-- 4. 확인
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'services'::regclass
  AND contype = 'c';
