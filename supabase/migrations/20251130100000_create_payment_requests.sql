-- 결제 요청 테이블 생성
-- 채팅에서 판매자가 구매자에게 결제 요청을 보내는 기능

-- ============================================================
-- payment_requests 테이블 생성
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,

  -- 결제 정보
  title VARCHAR(200) NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL CHECK (amount >= 1000),
  delivery_days INTEGER NOT NULL DEFAULT 7 CHECK (delivery_days > 0),
  revision_count INTEGER NOT NULL DEFAULT 0 CHECK (revision_count >= 0),

  -- 상태 관리
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'paid')),
  buyer_response TEXT,
  responded_at TIMESTAMPTZ,

  -- 주문 연결
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ,

  -- 만료 시간
  expires_at TIMESTAMPTZ NOT NULL,

  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 인덱스 생성
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_payment_requests_room_id
  ON payment_requests(room_id);

CREATE INDEX IF NOT EXISTS idx_payment_requests_seller_id
  ON payment_requests(seller_id);

CREATE INDEX IF NOT EXISTS idx_payment_requests_buyer_id
  ON payment_requests(buyer_id);

CREATE INDEX IF NOT EXISTS idx_payment_requests_status
  ON payment_requests(status);

CREATE INDEX IF NOT EXISTS idx_payment_requests_expires_at
  ON payment_requests(expires_at);

-- ============================================================
-- updated_at 자동 업데이트 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION update_payment_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_payment_requests_updated_at ON payment_requests;
CREATE TRIGGER set_payment_requests_updated_at
  BEFORE UPDATE ON payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_requests_updated_at();

-- ============================================================
-- RLS 정책
-- ============================================================

ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- 판매자: 자신이 보낸 결제 요청 조회
-- seller_id는 sellers.id를 참조하므로, sellers 테이블에서 user_id를 확인
CREATE POLICY "Sellers can view own payment requests"
  ON payment_requests FOR SELECT
  TO authenticated
  USING (
    seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
  );

-- 판매자: 결제 요청 생성
CREATE POLICY "Sellers can create payment requests"
  ON payment_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
  );

-- 구매자: 자신에게 온 결제 요청 조회
-- buyer_id는 auth.users.id를 직접 참조
CREATE POLICY "Buyers can view payment requests to them"
  ON payment_requests FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

-- 구매자: 결제 요청 업데이트 (수락/거절)
CREATE POLICY "Buyers can update payment requests to them"
  ON payment_requests FOR UPDATE
  TO authenticated
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

-- ============================================================
-- 코멘트
-- ============================================================

COMMENT ON TABLE payment_requests IS '채팅 내 결제 요청';
COMMENT ON COLUMN payment_requests.room_id IS '채팅방 ID';
COMMENT ON COLUMN payment_requests.seller_id IS '판매자 ID (sellers 테이블)';
COMMENT ON COLUMN payment_requests.buyer_id IS '구매자 ID (auth.users)';
COMMENT ON COLUMN payment_requests.service_id IS '관련 서비스 ID (선택사항)';
COMMENT ON COLUMN payment_requests.title IS '작업 제목';
COMMENT ON COLUMN payment_requests.description IS '작업 설명';
COMMENT ON COLUMN payment_requests.amount IS '결제 금액 (원)';
COMMENT ON COLUMN payment_requests.delivery_days IS '작업 기간 (일)';
COMMENT ON COLUMN payment_requests.revision_count IS '수정 횟수';
COMMENT ON COLUMN payment_requests.status IS '상태: pending, accepted, rejected, expired, paid';
COMMENT ON COLUMN payment_requests.buyer_response IS '구매자 응답 (거부 사유 등)';
COMMENT ON COLUMN payment_requests.responded_at IS '응답 시간';
COMMENT ON COLUMN payment_requests.order_id IS '생성된 주문 ID';
COMMENT ON COLUMN payment_requests.paid_at IS '결제 완료 시간';
COMMENT ON COLUMN payment_requests.expires_at IS '만료 시간 (72시간)';
