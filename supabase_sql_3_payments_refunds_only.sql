-- ============================================
-- 3. payments 및 refunds 테이블만 생성
-- ============================================
-- orders 테이블 컬럼은 UI로 추가한 후 이 SQL을 실행하세요

-- payments 테이블 생성
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  pg_provider TEXT,
  pg_tid TEXT,
  receipt_url TEXT,
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- refunds 테이블 생성
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON public.payments(payment_id);

CREATE INDEX IF NOT EXISTS idx_refunds_order ON public.refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment ON public.refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON public.refunds(status);

-- 트리거 생성
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
  CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_refunds_updated_at ON public.refunds;
  CREATE TRIGGER update_refunds_updated_at
    BEFORE UPDATE ON public.refunds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- RLS 활성화
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- Payments RLS 정책
DROP POLICY IF EXISTS "Users can view their payments" ON public.payments;
CREATE POLICY "Users can view their payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can create payments" ON public.payments;
CREATE POLICY "System can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (true);

-- Refunds RLS 정책
DROP POLICY IF EXISTS "Users can view their refunds" ON public.refunds;
CREATE POLICY "Users can view their refunds"
  ON public.refunds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Buyers can create refund requests" ON public.refunds;
CREATE POLICY "Buyers can create refund requests"
  ON public.refunds FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND buyer_id = auth.uid()
    )
  );

-- 주석 추가
COMMENT ON TABLE public.payments IS '결제 정보';
COMMENT ON TABLE public.refunds IS '환불 정보';
COMMENT ON COLUMN public.payments.status IS 'pending: 대기, completed: 완료, failed: 실패, cancelled: 취소';
COMMENT ON COLUMN public.refunds.status IS 'pending: 대기, approved: 승인, rejected: 거부, completed: 완료';
