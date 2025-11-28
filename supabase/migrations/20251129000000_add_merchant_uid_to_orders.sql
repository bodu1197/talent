-- orders 테이블에 merchant_uid 컬럼 추가
ALTER TABLE orders ADD COLUMN IF NOT EXISTS merchant_uid TEXT UNIQUE;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_orders_merchant_uid ON orders(merchant_uid);

COMMENT ON COLUMN orders.merchant_uid IS '결제 시스템 주문 고유 ID (멱등성 보장용)';
