-- 주문 테이블 생성 (이미 존재할 수 있음)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 관계
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  payment_request_id UUID REFERENCES public.payment_requests(id) ON DELETE SET NULL,
  payment_id UUID,

  -- 주문 정보
  amount INTEGER NOT NULL CHECK (amount > 0),
  title TEXT NOT NULL,
  description TEXT,
  merchant_uid TEXT UNIQUE,

  -- 작업 조건
  delivery_days INTEGER DEFAULT 7,
  revision_count INTEGER DEFAULT 0,
  revisions_used INTEGER DEFAULT 0,

  -- 상태 관리
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN (
    'pending_payment',
    'paid',
    'in_progress',
    'revision_requested',
    'completed',
    'cancelled',
    'refunded'
  )),

  -- 날짜
  paid_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 결제 테이블 생성 (이미 존재할 수 있음)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 관계
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,

  -- 결제 정보
  amount INTEGER NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  payment_id TEXT, -- PortOne payment ID

  -- 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),

  -- PG 정보
  pg_provider TEXT,
  pg_tid TEXT,
  receipt_url TEXT,

  -- 날짜
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 환불 테이블 생성 (이미 존재할 수 있음)
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 관계
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,

  -- 환불 정보
  amount INTEGER NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL,

  -- 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),

  -- 처리 정보
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_service ON public.orders(service_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_uid ON public.orders(merchant_uid);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON public.payments(payment_id);

CREATE INDEX IF NOT EXISTS idx_refunds_order ON public.refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment ON public.refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON public.refunds(status);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER IF NOT EXISTS update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_refunds_updated_at
  BEFORE UPDATE ON public.refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS 활성화
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- Orders RLS 정책
CREATE POLICY IF NOT EXISTS "Users can view their own orders"
  ON public.orders
  FOR SELECT
  USING (
    auth.uid() = buyer_id OR
    auth.uid() = seller_id
  );

CREATE POLICY IF NOT EXISTS "Buyers can create orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY IF NOT EXISTS "Users can update their orders"
  ON public.orders
  FOR UPDATE
  USING (
    auth.uid() = buyer_id OR
    auth.uid() = seller_id
  )
  WITH CHECK (
    auth.uid() = buyer_id OR
    auth.uid() = seller_id
  );

-- Payments RLS 정책
CREATE POLICY IF NOT EXISTS "Users can view their payments"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

CREATE POLICY IF NOT EXISTS "System can create payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (true);

-- Refunds RLS 정책
CREATE POLICY IF NOT EXISTS "Users can view their refunds"
  ON public.refunds
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

CREATE POLICY IF NOT EXISTS "Buyers can create refund requests"
  ON public.refunds
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND buyer_id = auth.uid()
    )
  );

-- 주석 추가
COMMENT ON TABLE public.orders IS '주문 정보';
COMMENT ON TABLE public.payments IS '결제 정보';
COMMENT ON TABLE public.refunds IS '환불 정보';
COMMENT ON COLUMN public.orders.status IS 'pending_payment: 결제대기, paid: 결제완료, in_progress: 작업중, revision_requested: 수정요청, completed: 완료, cancelled: 취소, refunded: 환불';
COMMENT ON COLUMN public.payments.status IS 'pending: 대기, completed: 완료, failed: 실패, cancelled: 취소';
COMMENT ON COLUMN public.refunds.status IS 'pending: 대기, approved: 승인, rejected: 거부, completed: 완료';
