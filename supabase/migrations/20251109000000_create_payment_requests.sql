-- 결제 요청 테이블 생성
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 관계
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,

  -- 결제 정보
  amount INTEGER NOT NULL CHECK (amount > 0),
  title TEXT NOT NULL,
  description TEXT,

  -- 배송/작업 정보
  delivery_days INTEGER DEFAULT 7,
  revision_count INTEGER DEFAULT 0,

  -- 상태 관리
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'paid')),

  -- 응답 정보
  buyer_response TEXT, -- 구매자가 거부했을 때 이유
  responded_at TIMESTAMPTZ,

  -- 결제 완료 정보
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ,

  -- 만료 시간 (기본 72시간)
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '72 hours'),

  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_payment_requests_room ON public.payment_requests(room_id);
CREATE INDEX idx_payment_requests_seller ON public.payment_requests(seller_id);
CREATE INDEX idx_payment_requests_buyer ON public.payment_requests(buyer_id);
CREATE INDEX idx_payment_requests_status ON public.payment_requests(status);
CREATE INDEX idx_payment_requests_created ON public.payment_requests(created_at DESC);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_payment_requests_updated_at
  BEFORE UPDATE ON public.payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 활성화
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 판매자와 구매자만 자신의 결제 요청 조회 가능
CREATE POLICY "Users can view their own payment requests"
  ON public.payment_requests
  FOR SELECT
  USING (
    auth.uid() = seller_id OR
    auth.uid() = buyer_id
  );

-- RLS 정책: 판매자만 결제 요청 생성 가능
CREATE POLICY "Sellers can create payment requests"
  ON public.payment_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id AND
    -- 판매자가 해당 채팅방의 참여자인지 확인
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = room_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- RLS 정책: 구매자가 결제 요청 응답 가능 (accept/reject)
CREATE POLICY "Buyers can update payment request status"
  ON public.payment_requests
  FOR UPDATE
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);

-- RLS 정책: 판매자가 자신의 결제 요청 취소/수정 가능
CREATE POLICY "Sellers can update their payment requests"
  ON public.payment_requests
  FOR UPDATE
  USING (
    auth.uid() = seller_id AND
    status = 'pending' -- pending 상태일 때만 수정 가능
  )
  WITH CHECK (auth.uid() = seller_id);

-- 주석 추가
COMMENT ON TABLE public.payment_requests IS '판매자가 구매자에게 보내는 결제 요청';
COMMENT ON COLUMN public.payment_requests.status IS 'pending: 대기중, accepted: 수락됨, rejected: 거부됨, expired: 만료됨, paid: 결제완료';
COMMENT ON COLUMN public.payment_requests.expires_at IS '결제 요청 만료 시간 (기본 72시간)';
