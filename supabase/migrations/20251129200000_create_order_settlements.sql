-- 주문별 정산 추적 테이블 (플랫폼 에스크로)
-- 결제 완료 시 정산 대기(pending) → 구매확정 시 정산 승인(confirmed) → 출금 완료 시(paid)

CREATE TABLE IF NOT EXISTS order_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 금액 정보
  order_amount INTEGER NOT NULL,           -- 주문 금액
  pg_fee INTEGER DEFAULT 0,                -- PG 수수료 (약 3%)
  platform_fee INTEGER DEFAULT 0,          -- 플랫폼 수수료 (현재 0%)
  net_amount INTEGER NOT NULL,             -- 정산 금액 (order_amount - pg_fee - platform_fee)

  -- 정산 상태
  -- pending: 결제 완료, 구매확정 대기 (돌파구가 대금 보관 중)
  -- confirmed: 구매확정됨, 출금 대기
  -- processing: 출금 처리 중
  -- paid: 출금 완료
  -- cancelled: 취소/환불됨
  status VARCHAR(20) NOT NULL DEFAULT 'pending',

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),    -- 결제 완료 시점
  confirmed_at TIMESTAMPTZ,                -- 구매확정 시점
  paid_at TIMESTAMPTZ,                     -- 출금 완료 시점
  cancelled_at TIMESTAMPTZ,                -- 취소 시점

  -- 자동 구매확정 관련
  auto_confirm_at TIMESTAMPTZ,             -- 자동 구매확정 예정일 (납품 후 8일)

  -- 출금 관련 (일괄 정산 시 사용)
  batch_settlement_id UUID REFERENCES settlements(id),

  -- 메모
  note TEXT,

  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'processing', 'paid', 'cancelled'))
);

-- 인덱스
CREATE INDEX idx_order_settlements_order_id ON order_settlements(order_id);
CREATE INDEX idx_order_settlements_seller_id ON order_settlements(seller_id);
CREATE INDEX idx_order_settlements_status ON order_settlements(status);
CREATE INDEX idx_order_settlements_confirmed_at ON order_settlements(confirmed_at) WHERE status = 'confirmed';
CREATE INDEX idx_order_settlements_auto_confirm ON order_settlements(auto_confirm_at) WHERE status = 'pending' AND auto_confirm_at IS NOT NULL;

-- RLS 활성화
ALTER TABLE order_settlements ENABLE ROW LEVEL SECURITY;

-- 정책: 판매자는 자신의 정산 내역만 조회 가능
CREATE POLICY "Sellers can view own settlements" ON order_settlements
  FOR SELECT USING (seller_id = auth.uid());

-- 정책: 서비스 역할만 삽입/수정 가능
CREATE POLICY "Service role can manage settlements" ON order_settlements
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 주문 테이블에 자동 구매확정일 필드 추가 (납품 완료 후 8일)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS auto_confirm_at TIMESTAMPTZ;

-- 주석
COMMENT ON TABLE order_settlements IS '주문별 정산 추적 (플랫폼 에스크로)';
COMMENT ON COLUMN order_settlements.status IS 'pending: 구매확정 대기, confirmed: 출금 대기, processing: 출금 중, paid: 완료, cancelled: 취소';
COMMENT ON COLUMN order_settlements.auto_confirm_at IS '자동 구매확정 예정일 (납품 후 8일)';
