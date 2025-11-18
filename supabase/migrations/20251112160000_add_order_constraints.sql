-- 주문 중복 방지 및 데이터 무결성 제약 조건 추가

-- 1. merchant_uid 유니크 제약 조건 (동일한 merchant_uid로 중복 주문 방지)
-- merchant_uid는 주문 생성 시 고유하게 생성되므로 유니크해야 함
ALTER TABLE orders
ADD CONSTRAINT orders_merchant_uid_unique UNIQUE (merchant_uid);

-- 2. 주문 번호 유니크 제약 조건 (이미 있다면 스킵)
-- order_number는 자동 생성되는 주문 번호로 유니크해야 함
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_order_number_unique'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);
  END IF;
END $$;

-- 3. 결제 테이블 payment_id 유니크 제약 (중복 결제 방지)
-- 동일한 payment_id로 여러 결제 기록 생성 방지
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payments_payment_id_unique'
  ) THEN
    ALTER TABLE payments
    ADD CONSTRAINT payments_payment_id_unique UNIQUE (payment_id);
  END IF;
END $$;

-- 4. 인덱스 추가로 조회 성능 최적화
-- merchant_uid로 주문 조회 시 성능 향상
CREATE INDEX IF NOT EXISTS idx_orders_merchant_uid ON orders(merchant_uid);

-- payment_id로 결제 조회 시 성능 향상
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);

-- 5. 주석 추가
COMMENT ON CONSTRAINT orders_merchant_uid_unique ON orders IS '주문 중복 생성 방지: merchant_uid는 고유해야 함';
COMMENT ON CONSTRAINT orders_order_number_unique ON orders IS '주문 번호 중복 방지: order_number는 고유해야 함';
COMMENT ON CONSTRAINT payments_payment_id_unique ON payments IS '결제 중복 방지: payment_id는 고유해야 함';
