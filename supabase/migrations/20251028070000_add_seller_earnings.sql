-- Migration: Add seller earnings and withdrawal tables
-- Created: 2025-10-28
-- Description: Add tables for seller earnings tracking and withdrawal management

-- ============================================
-- seller_earnings 테이블 (판매자 수익 현황)
-- ============================================
CREATE TABLE IF NOT EXISTS public.seller_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- 수익 정보
    available_balance INTEGER DEFAULT 0 CHECK (available_balance >= 0), -- 출금 가능 금액
    pending_balance INTEGER DEFAULT 0 CHECK (pending_balance >= 0),     -- 정산 대기중
    total_withdrawn INTEGER DEFAULT 0 CHECK (total_withdrawn >= 0),     -- 총 출금액
    total_earned INTEGER DEFAULT 0 CHECK (total_earned >= 0),           -- 총 수익

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- earnings_transactions 테이블 (수익 거래 내역)
-- ============================================
CREATE TABLE IF NOT EXISTS public.earnings_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,

    -- 거래 정보
    type TEXT NOT NULL CHECK (type IN ('sale', 'withdraw', 'refund', 'adjustment')),
    amount INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'available', 'completed', 'cancelled')),

    -- 추가 정보
    description TEXT,
    order_number TEXT,

    -- 날짜
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- withdrawal_requests 테이블 (출금 요청)
-- ============================================
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- 출금 정보
    amount INTEGER NOT NULL CHECK (amount > 0),
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_holder TEXT NOT NULL,

    -- 상태
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),

    -- 처리 정보
    processed_by UUID REFERENCES public.users(id),
    processed_at TIMESTAMPTZ,
    rejection_reason TEXT,

    -- 날짜
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- portfolio_items 테이블 (포트폴리오 아이템)
-- ============================================
CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- 포트폴리오 정보
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    images TEXT[],

    -- 통계
    view_count INTEGER DEFAULT 0,

    -- 상태
    is_visible BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 인덱스
-- ============================================
CREATE INDEX IF NOT EXISTS idx_seller_earnings_seller_id ON seller_earnings(seller_id);
CREATE INDEX IF NOT EXISTS idx_earnings_transactions_seller_id ON earnings_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_earnings_transactions_order_id ON earnings_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_earnings_transactions_status ON earnings_transactions(status);
CREATE INDEX IF NOT EXISTS idx_earnings_transactions_date ON earnings_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_seller_id ON withdrawal_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_seller_id ON portfolio_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_visible ON portfolio_items(is_visible);

-- ============================================
-- RLS 정책
-- ============================================
ALTER TABLE seller_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- seller_earnings 정책
DROP POLICY IF EXISTS "Sellers can view own earnings" ON seller_earnings;
CREATE POLICY "Sellers can view own earnings"
    ON seller_earnings FOR SELECT
    USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can update own earnings" ON seller_earnings;
CREATE POLICY "Sellers can update own earnings"
    ON seller_earnings FOR UPDATE
    USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "System can manage earnings" ON seller_earnings;
CREATE POLICY "System can manage earnings"
    ON seller_earnings FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- earnings_transactions 정책
DROP POLICY IF EXISTS "Sellers can view own transactions" ON earnings_transactions;
CREATE POLICY "Sellers can view own transactions"
    ON earnings_transactions FOR SELECT
    USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "System can manage transactions" ON earnings_transactions;
CREATE POLICY "System can manage transactions"
    ON earnings_transactions FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- withdrawal_requests 정책
DROP POLICY IF EXISTS "Sellers can view own withdrawals" ON withdrawal_requests;
CREATE POLICY "Sellers can view own withdrawals"
    ON withdrawal_requests FOR SELECT
    USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can create withdrawals" ON withdrawal_requests;
CREATE POLICY "Sellers can create withdrawals"
    ON withdrawal_requests FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Admins can manage withdrawals" ON withdrawal_requests;
CREATE POLICY "Admins can manage withdrawals"
    ON withdrawal_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- portfolio_items 정책
DROP POLICY IF EXISTS "Public can view visible portfolios" ON portfolio_items;
CREATE POLICY "Public can view visible portfolios"
    ON portfolio_items FOR SELECT
    USING (is_visible = true);

DROP POLICY IF EXISTS "Sellers can manage own portfolios" ON portfolio_items;
CREATE POLICY "Sellers can manage own portfolios"
    ON portfolio_items FOR ALL
    USING (auth.uid() = seller_id);

-- ============================================
-- 트리거 함수
-- ============================================

-- seller_earnings의 updated_at 자동 업데이트
DROP TRIGGER IF EXISTS update_seller_earnings_updated_at ON seller_earnings;
CREATE TRIGGER update_seller_earnings_updated_at
    BEFORE UPDATE ON seller_earnings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- withdrawal_requests의 updated_at 자동 업데이트
DROP TRIGGER IF EXISTS update_withdrawal_requests_updated_at ON withdrawal_requests;
CREATE TRIGGER update_withdrawal_requests_updated_at
    BEFORE UPDATE ON withdrawal_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- portfolio_items의 updated_at 자동 업데이트
DROP TRIGGER IF EXISTS update_portfolio_items_updated_at ON portfolio_items;
CREATE TRIGGER update_portfolio_items_updated_at
    BEFORE UPDATE ON portfolio_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 초기 데이터 함수
-- ============================================

-- 판매자가 생성될 때 자동으로 earnings 레코드 생성
CREATE OR REPLACE FUNCTION create_seller_earnings()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_type IN ('seller', 'both') THEN
        INSERT INTO seller_earnings (seller_id, available_balance, pending_balance, total_withdrawn, total_earned)
        VALUES (NEW.id, 0, 0, 0, 0)
        ON CONFLICT (seller_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_seller_earnings ON users;
CREATE TRIGGER trigger_create_seller_earnings
    AFTER INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_seller_earnings();
