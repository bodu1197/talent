-- ============================================
-- 결제 시스템 완전 새로 설치
-- ============================================
-- cleanup.sql 실행 후 이 SQL을 실행하세요

-- ==========================================
-- 1. payment_requests 테이블 생성
-- ==========================================
CREATE TABLE public.payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  title TEXT NOT NULL,
  description TEXT,
  delivery_days INTEGER DEFAULT 7,
  revision_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'paid')),
  buyer_response TEXT,
  responded_at TIMESTAMPTZ,
  order_id UUID,
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '72 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_requests_room ON public.payment_requests(room_id);
CREATE INDEX idx_payment_requests_seller ON public.payment_requests(seller_id);
CREATE INDEX idx_payment_requests_buyer ON public.payment_requests(buyer_id);
CREATE INDEX idx_payment_requests_status ON public.payment_requests(status);

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_requests_select" ON public.payment_requests FOR SELECT USING (auth.uid() = seller_id OR auth.uid() = buyer_id);
CREATE POLICY "payment_requests_insert" ON public.payment_requests FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "payment_requests_update_buyer" ON public.payment_requests FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "payment_requests_update_seller" ON public.payment_requests FOR UPDATE USING (auth.uid() = seller_id AND status = 'pending');

-- ==========================================
-- 2. orders 테이블에 컬럼 추가
-- ==========================================
ALTER TABLE public.orders ADD COLUMN payment_id UUID;
ALTER TABLE public.orders ADD COLUMN merchant_uid TEXT UNIQUE;
ALTER TABLE public.orders ADD COLUMN payment_request_id UUID REFERENCES public.payment_requests(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN delivery_days INTEGER DEFAULT 7;
ALTER TABLE public.orders ADD COLUMN revision_count INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN revisions_used INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN title TEXT;
ALTER TABLE public.orders ADD COLUMN description TEXT;
ALTER TABLE public.orders ADD COLUMN paid_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN started_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN cancelled_at TIMESTAMPTZ;

CREATE INDEX idx_orders_merchant_uid ON public.orders(merchant_uid);
CREATE INDEX idx_orders_payment_id ON public.orders(payment_id);
CREATE INDEX idx_orders_payment_request_id ON public.orders(payment_request_id);

-- ==========================================
-- 3. payments 테이블 생성
-- ==========================================
CREATE TABLE public.payments (
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

CREATE INDEX idx_payments_order ON public.payments(order_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_payment_id ON public.payments(payment_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
);
CREATE POLICY "payments_insert" ON public.payments FOR INSERT WITH CHECK (true);

-- ==========================================
-- 4. refunds 테이블 생성
-- ==========================================
CREATE TABLE public.refunds (
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

CREATE INDEX idx_refunds_order ON public.refunds(order_id);
CREATE INDEX idx_refunds_payment ON public.refunds(payment_id);
CREATE INDEX idx_refunds_status ON public.refunds(status);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "refunds_select" ON public.refunds FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
);
CREATE POLICY "refunds_insert" ON public.refunds FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND buyer_id = auth.uid())
);

-- 완료 메시지
SELECT 'Payment system setup completed successfully!' as message;
