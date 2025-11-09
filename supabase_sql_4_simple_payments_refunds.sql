-- ============================================
-- 4. payments 및 refunds 테이블 간단 버전
-- ============================================

-- payments 테이블 생성 (가장 단순한 버전)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  pg_provider TEXT,
  pg_tid TEXT,
  receipt_url TEXT,
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- refunds 테이블 생성 (가장 단순한 버전)
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  payment_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- Payments 정책
CREATE POLICY IF NOT EXISTS "payments_select_policy"
  ON public.payments FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "payments_insert_policy"
  ON public.payments FOR INSERT
  WITH CHECK (true);

-- Refunds 정책
CREATE POLICY IF NOT EXISTS "refunds_select_policy"
  ON public.refunds FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "refunds_insert_policy"
  ON public.refunds FOR INSERT
  WITH CHECK (true);
