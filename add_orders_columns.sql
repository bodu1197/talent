-- ============================================
-- orders 테이블에 결제 시스템 필요 컬럼 추가
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- orders 테이블에 필요한 모든 컬럼 추가
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS amount INTEGER;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_days INTEGER DEFAULT 7;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS revisions_used INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS merchant_uid TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_request_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- 유니크 제약 조건 추가 (중복 실행해도 안전)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_merchant_uid_key'
  ) THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_merchant_uid_key UNIQUE (merchant_uid);
  END IF;
END $$;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_orders_merchant_uid ON public.orders(merchant_uid);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id);

-- 완료 메시지
SELECT 'Orders table columns added successfully!' as message;
