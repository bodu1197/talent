-- ============================================
-- 구매자 기능 테이블 추가
-- ============================================

-- 1. COUPONS 테이블 (쿠폰 마스터)
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 쿠폰 정보
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- 할인 정보
  discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percent')),
  discount_value INTEGER NOT NULL CHECK (discount_value > 0),
  max_discount INTEGER, -- percent 타입일 때 최대 할인 금액

  -- 사용 조건
  min_amount INTEGER DEFAULT 0,
  applicable_categories UUID[], -- NULL이면 전체 카테고리
  applicable_services UUID[], -- NULL이면 전체 서비스

  -- 발급 정보
  total_quantity INTEGER, -- NULL이면 무제한
  issued_quantity INTEGER DEFAULT 0,
  max_per_user INTEGER DEFAULT 1,

  -- 유효 기간
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,

  -- 상태
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER_COUPONS 테이블 (사용자 쿠폰 보유)
CREATE TABLE IF NOT EXISTS public.user_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,

  -- 사용 정보
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,

  -- 유효 기간 (개별 설정 가능)
  expires_at TIMESTAMPTZ NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER_WALLETS 테이블 (사용자 지갑/캐시)
CREATE TABLE IF NOT EXISTS public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- 잔액
  balance INTEGER DEFAULT 0 CHECK (balance >= 0),

  -- 총 충전/사용 금액 (통계용)
  total_charged INTEGER DEFAULT 0,
  total_used INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WALLET_TRANSACTIONS 테이블 (캐시 거래 내역)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.user_wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- 거래 정보
  type TEXT NOT NULL CHECK (type IN ('charge', 'use', 'refund', 'reward')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,

  -- 설명
  description TEXT NOT NULL,

  -- 연관 정보
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  payment_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. QUOTES 테이블 (견적 요청)
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- 요청 정보
  title TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  attachments TEXT[],

  -- 예산 및 일정
  budget_min INTEGER,
  budget_max INTEGER,
  deadline DATE,

  -- 상태
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'selected', 'cancelled')),

  -- 통계
  response_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,

  -- 선택된 답변
  selected_response_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. QUOTE_RESPONSES 테이블 (견적 답변)
CREATE TABLE IF NOT EXISTS public.quote_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- 답변 내용
  message TEXT NOT NULL,
  proposed_price INTEGER NOT NULL,
  delivery_days INTEGER NOT NULL,
  attachments TEXT[],

  -- 상태
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),

  -- 답변 읽음 여부
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 인덱스 생성
-- ============================================

-- Coupons
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active ON public.coupons(is_active, starts_at, expires_at);

-- User Coupons
CREATE INDEX idx_user_coupons_user_id ON public.user_coupons(user_id);
CREATE INDEX idx_user_coupons_coupon_id ON public.user_coupons(coupon_id);
CREATE INDEX idx_user_coupons_used ON public.user_coupons(is_used, expires_at);
CREATE UNIQUE INDEX idx_user_coupons_unique ON public.user_coupons(user_id, coupon_id) WHERE is_used = false;

-- User Wallets
CREATE INDEX idx_user_wallets_user_id ON public.user_wallets(user_id);

-- Wallet Transactions
CREATE INDEX idx_wallet_transactions_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);

-- Quotes
CREATE INDEX idx_quotes_buyer_id ON public.quotes(buyer_id);
CREATE INDEX idx_quotes_category_id ON public.quotes(category_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_created_at ON public.quotes(created_at DESC);

-- Quote Responses
CREATE INDEX idx_quote_responses_quote_id ON public.quote_responses(quote_id);
CREATE INDEX idx_quote_responses_seller_id ON public.quote_responses(seller_id);
CREATE INDEX idx_quote_responses_status ON public.quote_responses(status);

-- ============================================
-- RLS (Row Level Security) 정책
-- ============================================

-- Coupons 테이블
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true AND starts_at <= NOW() AND expires_at >= NOW());

CREATE POLICY "Only admins can manage coupons"
  ON public.coupons FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

-- User Coupons 테이블
ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupons"
  ON public.user_coupons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can use own coupons"
  ON public.user_coupons FOR UPDATE
  USING (auth.uid() = user_id);

-- User Wallets 테이블
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
  ON public.user_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own wallet"
  ON public.user_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Wallet Transactions 테이블
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.wallet_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Quotes 테이블
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active quotes"
  ON public.quotes FOR SELECT
  USING (status = 'pending' OR buyer_id = auth.uid());

CREATE POLICY "Buyers can create quotes"
  ON public.quotes FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update own quotes"
  ON public.quotes FOR UPDATE
  USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can delete own quotes"
  ON public.quotes FOR DELETE
  USING (auth.uid() = buyer_id);

-- Quote Responses 테이블
ALTER TABLE public.quote_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quote participants can view responses"
  ON public.quote_responses FOR SELECT
  USING (
    auth.uid() = seller_id OR
    EXISTS (SELECT 1 FROM public.quotes WHERE id = quote_id AND buyer_id = auth.uid())
  );

CREATE POLICY "Sellers can create responses"
  ON public.quote_responses FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own responses"
  ON public.quote_responses FOR UPDATE
  USING (auth.uid() = seller_id);

-- ============================================
-- 트리거 함수
-- ============================================

-- User Wallet 자동 생성 (회원가입 시)
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_wallets (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_wallet_on_user_creation
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet();

-- 쿠폰 발급 수량 업데이트
CREATE OR REPLACE FUNCTION update_coupon_issued_quantity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.coupons
  SET issued_quantity = issued_quantity + 1
  WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coupon_quantity_on_issue
  AFTER INSERT ON public.user_coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupon_issued_quantity();

-- 견적 답변 수 업데이트
CREATE OR REPLACE FUNCTION update_quote_response_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.quotes
    SET response_count = response_count + 1
    WHERE id = NEW.quote_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.quotes
    SET response_count = GREATEST(response_count - 1, 0)
    WHERE id = OLD.quote_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quote_response_count_on_change
  AFTER INSERT OR DELETE ON public.quote_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_response_count();

-- Updated_at 트리거
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_wallets_updated_at
  BEFORE UPDATE ON public.user_wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_responses_updated_at
  BEFORE UPDATE ON public.quote_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 초기 데이터 (샘플 쿠폰)
-- ============================================

-- 신규가입 축하 쿠폰
INSERT INTO public.coupons (code, name, description, discount_type, discount_value, min_amount, starts_at, expires_at) VALUES
('WELCOME5000', '신규 가입 축하 쿠폰', '5,000원 할인 쿠폰', 'fixed', 5000, 30000, NOW(), NOW() + INTERVAL '3 months'),
('DISCOUNT10', '10% 할인 쿠폰', '전 품목 10% 할인', 'percent', 10, 50000, NOW(), NOW() + INTERVAL '1 month')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 완료
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ 구매자 기능 테이블 생성 완료!';
  RAISE NOTICE '생성된 테이블: coupons, user_coupons, user_wallets, wallet_transactions, quotes, quote_responses';
END $$;
