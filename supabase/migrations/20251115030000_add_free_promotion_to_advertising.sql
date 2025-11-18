-- 광고 구독에 무료 프로모션 컬럼 추가
ALTER TABLE advertising_subscriptions
ADD COLUMN IF NOT EXISTS is_free_promotion BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS promotion_end_date TIMESTAMP WITH TIME ZONE;

-- 기존 데이터는 무료 프로모션이 아님으로 설정
UPDATE advertising_subscriptions
SET is_free_promotion = false
WHERE is_free_promotion IS NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_advertising_subscriptions_is_free_promotion
ON advertising_subscriptions(is_free_promotion);

COMMENT ON COLUMN advertising_subscriptions.is_free_promotion IS '무료 프로모션 여부 (신규 서비스 1개월 무료 등)';
COMMENT ON COLUMN advertising_subscriptions.promotion_end_date IS '무료 프로모션 종료일';
