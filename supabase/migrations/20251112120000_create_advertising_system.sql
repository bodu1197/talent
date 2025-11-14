-- 광고 시스템 테이블 생성
-- 작성일: 2025-01-12
-- 설명: 월 10만원 정액제 광고 시스템

-- 1. advertising_credits (광고 크레딧)
CREATE TABLE advertising_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 잔액 정보
  amount INTEGER NOT NULL DEFAULT 0, -- 현재 잔액 (원)
  initial_amount INTEGER NOT NULL DEFAULT 0, -- 초기 지급액
  used_amount INTEGER NOT NULL DEFAULT 0, -- 사용한 금액

  -- 프로모션 정보
  promotion_type TEXT, -- 'launch_promo', 'referral', null
  expires_at TIMESTAMP WITH TIME ZONE, -- 만료일 (프로모션용)

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_advertising_credits_seller_id ON advertising_credits(seller_id);
CREATE INDEX idx_advertising_credits_expires_at ON advertising_credits(expires_at);

-- 코멘트 추가
COMMENT ON TABLE advertising_credits IS '광고 크레딧 관리 테이블';
COMMENT ON COLUMN advertising_credits.amount IS '현재 크레딧 잔액 (원)';
COMMENT ON COLUMN advertising_credits.promotion_type IS '프로모션 타입: launch_promo(런칭), referral(추천)';
COMMENT ON COLUMN advertising_credits.expires_at IS '크레딧 만료일 (NULL이면 무기한)';

-- 2. advertising_subscriptions (광고 구독)
CREATE TABLE advertising_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  -- 구독 정보 (단일 플랜: 월 10만원)
  monthly_price INTEGER NOT NULL DEFAULT 100000, -- 월 10만원 고정
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'pending_payment', 'cancelled', 'expired'

  -- 결제 방법
  payment_method TEXT NOT NULL, -- 'credit', 'card', 'bank_transfer'
  next_billing_date DATE NOT NULL,
  last_billed_at TIMESTAMP WITH TIME ZONE,

  -- 무통장 입금 정보
  bank_transfer_deadline TIMESTAMP WITH TIME ZONE, -- 입금 기한
  bank_transfer_confirmed BOOLEAN DEFAULT false, -- 입금 확인 여부
  bank_transfer_confirmed_at TIMESTAMP WITH TIME ZONE,
  bank_transfer_confirmed_by UUID REFERENCES admins(id), -- 확인한 관리자

  -- 구독 기간
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,

  -- 통계
  total_impressions INTEGER DEFAULT 0, -- 총 노출 수
  total_clicks INTEGER DEFAULT 0, -- 총 클릭 수
  total_paid INTEGER DEFAULT 0, -- 총 결제 금액

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 제약 조건: 서비스당 하나의 활성 구독만
  UNIQUE(service_id)
);

-- 인덱스 생성
CREATE INDEX idx_ad_subscriptions_seller_id ON advertising_subscriptions(seller_id);
CREATE INDEX idx_ad_subscriptions_service_id ON advertising_subscriptions(service_id);
CREATE INDEX idx_ad_subscriptions_status ON advertising_subscriptions(status);
CREATE INDEX idx_ad_subscriptions_next_billing ON advertising_subscriptions(next_billing_date);
CREATE INDEX idx_ad_subscriptions_bank_transfer ON advertising_subscriptions(bank_transfer_confirmed)
  WHERE payment_method = 'bank_transfer';

-- 코멘트 추가
COMMENT ON TABLE advertising_subscriptions IS '광고 구독 관리 테이블 (월 10만원 정액제)';
COMMENT ON COLUMN advertising_subscriptions.status IS 'active(활성), pending_payment(결제대기), cancelled(취소), expired(만료)';
COMMENT ON COLUMN advertising_subscriptions.payment_method IS 'credit(크레딧), card(카드), bank_transfer(무통장입금)';

-- 3. advertising_payments (광고 결제 내역)
CREATE TABLE advertising_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES advertising_subscriptions(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 결제 정보
  amount INTEGER NOT NULL, -- 결제 금액
  payment_method TEXT NOT NULL, -- 'credit', 'card', 'bank_transfer'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'

  -- 무통장 입금 정보
  depositor_name TEXT, -- 입금자명
  bank_name TEXT, -- 입금 은행
  deposit_date DATE, -- 입금일
  deposit_time TIME, -- 입금 시간
  receipt_image TEXT, -- 입금증 이미지 URL

  -- 카드 결제 정보
  pg_transaction_id TEXT, -- PG사 거래 ID
  card_company TEXT,
  card_number_masked TEXT,

  -- 처리 정보
  paid_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by UUID REFERENCES admins(id), -- 확인한 관리자 (무통장 입금)
  admin_memo TEXT, -- 관리자 메모

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_ad_payments_subscription_id ON advertising_payments(subscription_id);
CREATE INDEX idx_ad_payments_seller_id ON advertising_payments(seller_id);
CREATE INDEX idx_ad_payments_status ON advertising_payments(status);
CREATE INDEX idx_ad_payments_payment_method ON advertising_payments(payment_method);
CREATE INDEX idx_ad_payments_created_at ON advertising_payments(created_at);

-- 코멘트 추가
COMMENT ON TABLE advertising_payments IS '광고 결제 내역 테이블';
COMMENT ON COLUMN advertising_payments.status IS 'pending(대기), completed(완료), failed(실패), cancelled(취소)';
COMMENT ON COLUMN advertising_payments.receipt_image IS '무통장 입금 시 입금증 이미지 파일 경로';

-- 4. advertising_impressions (노출 기록)
CREATE TABLE advertising_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES advertising_subscriptions(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  -- 노출 정보
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  position INTEGER NOT NULL, -- 노출 순서 (1, 2, 3...)
  page_number INTEGER DEFAULT 1, -- 페이지 번호

  -- 사용자 정보
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,

  -- 클릭 여부
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_ad_impressions_subscription_id ON advertising_impressions(subscription_id);
CREATE INDEX idx_ad_impressions_service_id ON advertising_impressions(service_id);
CREATE INDEX idx_ad_impressions_created_at ON advertising_impressions(created_at);
CREATE INDEX idx_ad_impressions_clicked ON advertising_impressions(clicked) WHERE clicked = true;
CREATE INDEX idx_ad_impressions_category_id ON advertising_impressions(category_id);

-- 코멘트 추가
COMMENT ON TABLE advertising_impressions IS '광고 노출 및 클릭 기록 테이블';
COMMENT ON COLUMN advertising_impressions.position IS '페이지 내 노출 순서 (1=첫번째)';
COMMENT ON COLUMN advertising_impressions.clicked IS '클릭 여부';

-- 5. credit_transactions (크레딧 거래 내역)
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_id UUID NOT NULL REFERENCES advertising_credits(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 거래 정보
  transaction_type TEXT NOT NULL, -- 'earned', 'spent', 'refunded', 'expired'
  amount INTEGER NOT NULL, -- 양수: 지급, 음수: 사용
  balance_after INTEGER NOT NULL, -- 거래 후 잔액

  -- 상세 정보
  description TEXT NOT NULL,
  reference_type TEXT, -- 'subscription', 'promotion', 'refund'
  reference_id UUID, -- subscription_id 등

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_credit_transactions_credit_id ON credit_transactions(credit_id);
CREATE INDEX idx_credit_transactions_seller_id ON credit_transactions(seller_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type);

-- 코멘트 추가
COMMENT ON TABLE credit_transactions IS '광고 크레딧 거래 내역 테이블';
COMMENT ON COLUMN credit_transactions.transaction_type IS 'earned(획득), spent(사용), refunded(환불), expired(만료)';
COMMENT ON COLUMN credit_transactions.amount IS '거래 금액 (양수=지급, 음수=사용)';

-- 6. 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_advertising_credits_updated_at
  BEFORE UPDATE ON advertising_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertising_subscriptions_updated_at
  BEFORE UPDATE ON advertising_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertising_payments_updated_at
  BEFORE UPDATE ON advertising_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Row Level Security (RLS) 정책

-- advertising_credits
ALTER TABLE advertising_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "판매자는 자신의 크레딧만 조회"
  ON advertising_credits FOR SELECT
  USING (auth.uid() = seller_id);

-- advertising_subscriptions
ALTER TABLE advertising_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "판매자는 자신의 구독만 조회"
  ON advertising_subscriptions FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "판매자는 자신의 구독 생성 가능"
  ON advertising_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "판매자는 자신의 구독 수정 가능"
  ON advertising_subscriptions FOR UPDATE
  USING (auth.uid() = seller_id);

-- advertising_payments
ALTER TABLE advertising_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "판매자는 자신의 결제 내역만 조회"
  ON advertising_payments FOR SELECT
  USING (auth.uid() = seller_id);

-- advertising_impressions
ALTER TABLE advertising_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자는 노출 기록 조회 가능"
  ON advertising_impressions FOR SELECT
  USING (true);

-- credit_transactions
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "판매자는 자신의 거래 내역만 조회"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = seller_id);

-- 8. 관리자 전용 정책 (service_role 키 사용 시 모든 권한)
-- 관리자는 service_role 키로 접근하므로 RLS 우회

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '광고 시스템 테이블 생성 완료!';
  RAISE NOTICE '- advertising_credits (크레딧)';
  RAISE NOTICE '- advertising_subscriptions (구독)';
  RAISE NOTICE '- advertising_payments (결제)';
  RAISE NOTICE '- advertising_impressions (노출)';
  RAISE NOTICE '- credit_transactions (거래내역)';
END $$;
