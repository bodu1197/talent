-- ============================================
-- 결제 관련 테이블 전체 삭제
-- ============================================
-- 이 SQL을 먼저 실행하세요

-- 1. refunds 테이블 삭제
DROP TABLE IF EXISTS public.refunds CASCADE;

-- 2. payments 테이블 삭제
DROP TABLE IF EXISTS public.payments CASCADE;

-- 3. payment_requests 테이블 삭제
DROP TABLE IF EXISTS public.payment_requests CASCADE;

-- 4. orders 테이블에서 추가한 컬럼들 삭제
ALTER TABLE public.orders DROP COLUMN IF EXISTS payment_id CASCADE;
ALTER TABLE public.orders DROP COLUMN IF EXISTS merchant_uid CASCADE;
ALTER TABLE public.orders DROP COLUMN IF EXISTS payment_request_id CASCADE;
ALTER TABLE public.orders DROP COLUMN IF EXISTS delivery_days CASCADE;
ALTER TABLE public.orders DROP COLUMN IF EXISTS revision_count CASCADE;
ALTER TABLE public.orders DROP COLUMN IF EXISTS revisions_used CASCADE;
ALTER TABLE public.orders DROP COLUMN IF EXISTS title CASCADE;
ALTER TABLE public.orders DROP COLUMN IF EXISTS description CASCADE;
ALTER TABLE public.orders DROP COLUMN IF EXISTS paid_at CASCADE;
ALTER TABLE public.orders DROP COLUMN IF EXISTS started_at CASCADE;
ALTER TABLE public.orders DROP COLUMN IF EXISTS cancelled_at CASCADE;

-- 완료 메시지
SELECT 'All payment-related tables and columns have been dropped successfully!' as message;
