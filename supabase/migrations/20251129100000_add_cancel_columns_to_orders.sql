-- 주문 취소 관련 컬럼 추가
-- cancel_reason: 취소 사유
-- cancelled_at: 취소 시간

ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- 인덱스 추가 (취소된 주문 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_orders_cancelled_at ON orders(cancelled_at) WHERE cancelled_at IS NOT NULL;

-- 코멘트 추가
COMMENT ON COLUMN orders.cancel_reason IS '주문 취소 사유';
COMMENT ON COLUMN orders.cancelled_at IS '주문 취소 시간';
