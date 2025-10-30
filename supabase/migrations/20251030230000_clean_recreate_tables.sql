-- ============================================
-- CLEAN RESET: Drop and recreate users, buyers, sellers tables
-- ============================================

-- ============================================
-- 1. Drop existing tables cleanly
-- ============================================

DROP TABLE IF EXISTS public.buyers CASCADE;
DROP TABLE IF EXISTS public.sellers CASCADE;

-- Drop user_type constraint and column from users
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_user_type_check;
ALTER TABLE public.users DROP COLUMN IF EXISTS user_type CASCADE;

-- ============================================
-- 2. Create buyers table (구매자 활동 데이터)
-- ============================================
CREATE TABLE public.buyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 구매자 통계
    total_orders INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,

    -- 혜택 정보
    points INTEGER DEFAULT 0,
    coupon_count INTEGER DEFAULT 0,

    -- 활동 정보
    last_order_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id)
);

-- ============================================
-- 3. Create sellers table (판매자 활동 데이터)
-- ============================================
CREATE TABLE public.sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 비즈니스 정보
    business_name TEXT,
    business_number TEXT,
    business_registration_file TEXT,

    -- 정산 정보
    bank_name TEXT,
    account_number TEXT,
    account_holder TEXT,

    -- 인증 정보
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,

    -- 판매자 통계
    total_sales INTEGER DEFAULT 0,
    total_revenue INTEGER DEFAULT 0,
    service_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,

    -- 활동 정보
    last_sale_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id)
);

-- ============================================
-- 4. Migrate existing users data
-- ============================================

-- 모든 users를 buyers로 (기본적으로 모두 구매 가능)
INSERT INTO public.buyers (user_id, created_at, updated_at)
SELECT id, created_at, updated_at
FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- seller_profiles가 있다면 해당 유저를 sellers로 (테이블이 없으면 스킵)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'seller_profiles') THEN
        INSERT INTO public.sellers (user_id, created_at, updated_at)
        SELECT user_id, created_at, updated_at
        FROM public.seller_profiles
        WHERE EXISTS (SELECT 1 FROM public.users WHERE id = seller_profiles.user_id)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;

-- ============================================
-- 5. Indexes
-- ============================================
CREATE INDEX idx_buyers_user_id ON public.buyers(user_id);
CREATE INDEX idx_buyers_is_active ON public.buyers(is_active);
CREATE INDEX idx_buyers_created_at ON public.buyers(created_at DESC);

CREATE INDEX idx_sellers_user_id ON public.sellers(user_id);
CREATE INDEX idx_sellers_is_active ON public.sellers(is_active);
CREATE INDEX idx_sellers_is_verified ON public.sellers(is_verified);
CREATE INDEX idx_sellers_verification_status ON public.sellers(verification_status);
CREATE INDEX idx_sellers_created_at ON public.sellers(created_at DESC);

-- ============================================
-- 6. RLS Policies
-- ============================================

-- Enable RLS
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own buyer profile" ON public.buyers;
DROP POLICY IF EXISTS "Users can update their own buyer profile" ON public.buyers;
DROP POLICY IF EXISTS "Users can insert their own buyer profile" ON public.buyers;
DROP POLICY IF EXISTS "Users can view their own seller profile" ON public.sellers;
DROP POLICY IF EXISTS "Users can update their own seller profile" ON public.sellers;
DROP POLICY IF EXISTS "Users can insert their own seller profile" ON public.sellers;
DROP POLICY IF EXISTS "Anyone can view active verified sellers" ON public.sellers;

-- Buyers policies
CREATE POLICY "Users can view their own buyer profile"
    ON public.buyers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own buyer profile"
    ON public.buyers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own buyer profile"
    ON public.buyers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Sellers policies
CREATE POLICY "Users can view their own seller profile"
    ON public.sellers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own seller profile"
    ON public.sellers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own seller profile"
    ON public.sellers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active verified sellers"
    ON public.sellers FOR SELECT
    USING (is_active = true AND is_verified = true);

-- ============================================
-- 7. Triggers
-- ============================================

DROP TRIGGER IF EXISTS update_buyers_updated_at ON public.buyers;
CREATE TRIGGER update_buyers_updated_at
    BEFORE UPDATE ON public.buyers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sellers_updated_at ON public.sellers;
CREATE TRIGGER update_sellers_updated_at
    BEFORE UPDATE ON public.sellers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. Helper functions
-- ============================================

-- 사용자가 구매자인지 확인
CREATE OR REPLACE FUNCTION is_buyer(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.buyers
        WHERE user_id = check_user_id AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자가 판매자인지 확인
CREATE OR REPLACE FUNCTION is_seller(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.sellers
        WHERE user_id = check_user_id AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자가 인증된 판매자인지 확인
CREATE OR REPLACE FUNCTION is_verified_seller(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.sellers
        WHERE user_id = check_user_id
        AND is_active = true
        AND is_verified = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. Comments
-- ============================================
COMMENT ON TABLE public.buyers IS '구매자 활동 데이터 - 주문, 포인트, 쿠폰 등';
COMMENT ON TABLE public.sellers IS '판매자 활동 데이터 - 비즈니스 정보, 인증, 정산 등';
COMMENT ON TABLE public.users IS '기본 회원 정보만 - 활동 데이터는 buyers/sellers 테이블에서 관리';

COMMENT ON COLUMN public.buyers.user_id IS 'users 테이블 참조 - 한 유저가 buyer와 seller 둘 다 될 수 있음';
COMMENT ON COLUMN public.sellers.user_id IS 'users 테이블 참조 - 한 유저가 buyer와 seller 둘 다 될 수 있음';
