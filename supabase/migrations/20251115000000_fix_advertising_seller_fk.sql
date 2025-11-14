-- advertising_subscriptions 테이블의 seller_id FK 수정
-- 기존 FK 제약조건 삭제
ALTER TABLE advertising_subscriptions
DROP CONSTRAINT IF EXISTS advertising_subscriptions_seller_id_fkey;

-- 새로운 FK 제약조건 추가 (sellers 테이블 참조)
ALTER TABLE advertising_subscriptions
ADD CONSTRAINT advertising_subscriptions_seller_id_fkey
FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE;

-- advertising_payments 테이블의 seller_id FK 수정
-- 기존 FK 제약조건 삭제
ALTER TABLE advertising_payments
DROP CONSTRAINT IF EXISTS advertising_payments_seller_id_fkey;

-- 새로운 FK 제약조건 추가 (sellers 테이블 참조)
ALTER TABLE advertising_payments
ADD CONSTRAINT advertising_payments_seller_id_fkey
FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE;

-- 기존 데이터 마이그레이션
-- advertising_subscriptions의 잘못된 seller_id(users.id) -> 올바른 seller_id(sellers.id)로 변경
UPDATE advertising_subscriptions
SET seller_id = (
  SELECT s.id
  FROM sellers s
  WHERE s.user_id = advertising_subscriptions.seller_id
)
WHERE seller_id IN (
  SELECT user_id FROM sellers
);

-- advertising_payments의 잘못된 seller_id(users.id) -> 올바른 seller_id(sellers.id)로 변경
UPDATE advertising_payments
SET seller_id = (
  SELECT s.id
  FROM sellers s
  WHERE s.user_id = advertising_payments.seller_id
)
WHERE seller_id IN (
  SELECT user_id FROM sellers
);
