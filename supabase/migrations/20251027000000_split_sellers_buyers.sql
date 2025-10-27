-- ============================================
-- 판매자/구매자 테이블 분리 마이그레이션
-- ============================================

-- ============================================
-- 1. BUYERS 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS public.buyers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    profile_image TEXT,
    bio TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_mode TEXT DEFAULT 'buyer' CHECK (last_mode IN ('buyer', 'seller')),
    last_login_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. SELLERS 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS public.sellers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    profile_image TEXT,
    bio TEXT,
    business_name TEXT,
    business_number TEXT,
    bank_name TEXT,
    account_number TEXT,
    account_holder TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    is_active BOOLEAN DEFAULT TRUE,
    last_mode TEXT DEFAULT 'seller' CHECK (last_mode IN ('buyer', 'seller')),
    last_login_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. 기존 users 데이터를 buyers/sellers로 분리
-- ============================================

-- user_type이 'buyer' 또는 'both'인 경우 → buyers 테이블로
INSERT INTO public.buyers (
    id, email, name, phone, profile_image, bio,
    email_verified, phone_verified, is_active,
    last_login_at, deleted_at, created_at, updated_at
)
SELECT
    id, email, name, phone, profile_image, bio,
    email_verified, phone_verified, is_active,
    last_login_at, deleted_at, created_at, updated_at
FROM public.users
WHERE user_type IN ('buyer', 'both')
ON CONFLICT (id) DO NOTHING;

-- user_type이 'seller' 또는 'both'인 경우 → sellers 테이블로
INSERT INTO public.sellers (
    id, email, name, phone, profile_image, bio,
    email_verified, phone_verified, is_active,
    last_login_at, deleted_at, created_at, updated_at
)
SELECT
    id, email, name, phone, profile_image, bio,
    email_verified, phone_verified, is_active,
    last_login_at, deleted_at, created_at, updated_at
FROM public.users
WHERE user_type IN ('seller', 'both')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. 인덱스 생성
-- ============================================
CREATE INDEX IF NOT EXISTS idx_buyers_email ON public.buyers(email);
CREATE INDEX IF NOT EXISTS idx_buyers_is_active ON public.buyers(is_active);
CREATE INDEX IF NOT EXISTS idx_buyers_created_at ON public.buyers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sellers_email ON public.sellers(email);
CREATE INDEX IF NOT EXISTS idx_sellers_is_active ON public.sellers(is_active);
CREATE INDEX IF NOT EXISTS idx_sellers_is_verified ON public.sellers(is_verified);
CREATE INDEX IF NOT EXISTS idx_sellers_created_at ON public.sellers(created_at DESC);

-- ============================================
-- 5. RLS (Row Level Security) 정책
-- ============================================

-- Enable RLS
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- Buyers policies
CREATE POLICY "Users can view their own buyer profile"
    ON public.buyers FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own buyer profile"
    ON public.buyers FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own buyer profile"
    ON public.buyers FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Sellers policies
CREATE POLICY "Users can view their own seller profile"
    ON public.sellers FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own seller profile"
    ON public.sellers FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own seller profile"
    ON public.sellers FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Public can view active sellers (for marketplace)
CREATE POLICY "Anyone can view active verified sellers"
    ON public.sellers FOR SELECT
    USING (is_active = true AND is_verified = true);

-- ============================================
-- 6. Triggers for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_buyers_updated_at
    BEFORE UPDATE ON public.buyers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sellers_updated_at
    BEFORE UPDATE ON public.sellers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. Comments
-- ============================================
COMMENT ON TABLE public.buyers IS '구매자 전용 테이블';
COMMENT ON TABLE public.sellers IS '판매자 전용 테이블 (비즈니스 정보 포함)';

COMMENT ON COLUMN public.sellers.business_name IS '사업자명 (개인/법인)';
COMMENT ON COLUMN public.sellers.business_number IS '사업자등록번호';
COMMENT ON COLUMN public.sellers.is_verified IS '판매자 인증 완료 여부';
COMMENT ON COLUMN public.sellers.verification_status IS '인증 상태 (pending/verified/rejected)';
