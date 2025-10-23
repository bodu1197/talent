-- ============================================
-- AI 재능 거래 플랫폼 - 초기 스키마
-- ============================================

-- 기존 테이블 삭제 (개발 환경용 - 주의!)
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;

-- ============================================
-- 1. USERS 관련 테이블
-- ============================================

-- users 테이블 (Supabase Auth와 연동)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    user_type TEXT CHECK (user_type IN ('buyer', 'seller', 'both', 'admin')) DEFAULT 'buyer',
    profile_image TEXT,
    bio TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- seller_profiles 테이블 (판매자 추가 정보)
CREATE TABLE public.seller_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    business_name TEXT,
    business_number TEXT,
    business_verified BOOLEAN DEFAULT FALSE,
    bank_name TEXT,
    bank_account TEXT,
    account_holder TEXT,
    introduction TEXT,
    skills TEXT[],
    portfolio_urls TEXT[],
    response_time_hours INTEGER DEFAULT 24,
    auto_accept_order BOOLEAN DEFAULT FALSE,
    vacation_mode BOOLEAN DEFAULT FALSE,
    vacation_message TEXT,
    total_earnings BIGINT DEFAULT 0,
    available_balance BIGINT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- admins 테이블 (관리자)
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'cs_agent')),
    permissions JSONB DEFAULT '{}',
    department TEXT,
    notes TEXT,
    last_action_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CATEGORIES 테이블
-- ============================================

CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
    icon TEXT,
    description TEXT,
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT[],
    display_order INTEGER DEFAULT 0,
    service_count INTEGER DEFAULT 0,
    is_ai_category BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    commission_rate DECIMAL(5,2) DEFAULT 20.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. SERVICES 테이블
-- ============================================

CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,

    -- 가격 정보
    price INTEGER NOT NULL CHECK (price > 0),
    price_unit TEXT DEFAULT 'project' CHECK (price_unit IN ('project', 'hour', 'revision')),

    -- 작업 정보
    delivery_days INTEGER NOT NULL CHECK (delivery_days > 0),
    revision_count INTEGER DEFAULT 1 CHECK (revision_count >= 0),
    express_delivery BOOLEAN DEFAULT FALSE,
    express_days INTEGER,
    express_price INTEGER,

    -- 이미지/포트폴리오
    thumbnail_url TEXT,
    portfolio_urls TEXT[],
    video_url TEXT,

    -- 통계
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    in_progress_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,

    -- 상태
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'suspended', 'deleted')),
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMPTZ,

    -- SEO
    meta_title TEXT,
    meta_description TEXT,

    -- 버전 관리
    version INTEGER DEFAULT 1,
    last_modified_by UUID REFERENCES public.users(id),

    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- service_categories 매핑 테이블
CREATE TABLE public.service_categories (
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (service_id, category_id)
);

-- ai_services 테이블 (AI 재능 추가 정보)
CREATE TABLE public.ai_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID UNIQUE NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,

    -- AI 도구 정보
    ai_tools TEXT[],
    ai_model TEXT,
    ai_version TEXT,

    -- AI 특화 정보
    generation_time_minutes INTEGER,
    prompt_included BOOLEAN DEFAULT FALSE,
    prompt_consultation BOOLEAN DEFAULT FALSE,
    source_file_provided BOOLEAN DEFAULT FALSE,
    commercial_use BOOLEAN DEFAULT TRUE,

    -- 작업 범위
    min_generations INTEGER DEFAULT 1,
    max_generations INTEGER DEFAULT 10,

    -- 전문가 레벨
    expert_level TEXT CHECK (expert_level IN ('starter', 'professional', 'master')) DEFAULT 'starter',
    certified_at TIMESTAMPTZ,
    certification_score DECIMAL(5,2),
    portfolio_quality_score DECIMAL(3,2),

    -- 통계
    avg_generation_count INTEGER DEFAULT 5,
    success_rate DECIMAL(5,2) DEFAULT 100.00,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. ORDERS 테이블
-- ============================================

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES public.users(id),
    seller_id UUID NOT NULL REFERENCES public.users(id),
    service_id UUID NOT NULL REFERENCES public.services(id),

    -- 주문 정보
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    attachments TEXT[],

    -- 가격 정보
    base_amount INTEGER NOT NULL,
    express_amount INTEGER DEFAULT 0,
    additional_amount INTEGER DEFAULT 0,
    discount_amount INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_fee INTEGER NOT NULL,
    seller_amount INTEGER NOT NULL,

    -- 작업 정보
    delivery_date DATE NOT NULL,
    revision_count INTEGER DEFAULT 1,
    used_revisions INTEGER DEFAULT 0,

    -- 상태
    status TEXT DEFAULT 'pending_payment' CHECK (status IN (
        'pending_payment', 'paid', 'in_progress', 'delivered',
        'revision_requested', 'completed', 'cancelled',
        'refund_requested', 'refunded'
    )),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    work_status TEXT DEFAULT 'waiting' CHECK (work_status IN ('waiting', 'working', 'delivered', 'accepted')),

    -- 날짜
    paid_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    auto_complete_at TIMESTAMPTZ,

    -- 평가
    buyer_satisfied BOOLEAN,
    seller_rating INTEGER CHECK (seller_rating >= 1 AND seller_rating <= 5),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. 인덱스 생성
-- ============================================

-- Users 인덱스
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_type ON public.users(user_type);
CREATE INDEX idx_users_active ON public.users(is_active, deleted_at);

-- Seller profiles 인덱스
CREATE INDEX idx_seller_profiles_user ON public.seller_profiles(user_id);
CREATE INDEX idx_seller_profiles_verified ON public.seller_profiles(is_verified, business_verified);

-- Categories 인덱스
CREATE INDEX idx_categories_parent ON public.categories(parent_id);
CREATE INDEX idx_categories_level ON public.categories(level);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_ai ON public.categories(is_ai_category, is_active);

-- Services 인덱스
CREATE INDEX idx_services_seller ON public.services(seller_id);
CREATE INDEX idx_services_status ON public.services(status, deleted_at);
CREATE INDEX idx_services_slug ON public.services(slug);
CREATE INDEX idx_services_rating ON public.services(rating DESC, review_count DESC);

-- Orders 인덱스
CREATE INDEX idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller ON public.orders(seller_id);
CREATE INDEX idx_orders_service ON public.orders(service_id);
CREATE INDEX idx_orders_status ON public.orders(status, payment_status);
CREATE INDEX idx_orders_number ON public.orders(order_number);

-- ============================================
-- 6. 트리거 함수
-- ============================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updated_at 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_seller_profiles_updated_at BEFORE UPDATE ON public.seller_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 7. 주문 번호 자동 생성 함수
-- ============================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                       LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 주문 번호 시퀀스 생성
CREATE SEQUENCE order_number_seq START 1;

-- 주문 생성시 주문번호 자동 생성 트리거
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- ============================================
-- 8. 서비스 슬러그 자동 생성 함수
-- ============================================

CREATE OR REPLACE FUNCTION generate_service_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- 기본 슬러그 생성 (한글 처리 포함)
    base_slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9가-힣]+', '-', 'g'));
    base_slug := TRIM(BOTH '-' FROM base_slug);

    final_slug := base_slug;

    -- 중복 체크 및 고유 슬러그 생성
    WHILE EXISTS (SELECT 1 FROM public.services WHERE slug = final_slug AND id != NEW.id) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := final_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 서비스 생성/수정시 슬러그 자동 생성 트리거
CREATE TRIGGER generate_service_slug_trigger
    BEFORE INSERT OR UPDATE OF title ON public.services
    FOR EACH ROW
    WHEN (NEW.slug IS NULL OR NEW.title != OLD.title)
    EXECUTE FUNCTION generate_service_slug();

-- ============================================
-- 9. 초기 데이터 삽입
-- ============================================

-- 테스트용 관리자 계정 (실제 운영시 변경 필요)
-- 주의: auth.users에 먼저 계정을 생성한 후 실행해야 함

-- AI 카테고리 초기 데이터
INSERT INTO public.categories (name, slug, level, icon, is_ai_category, is_active, display_order) VALUES
-- Level 1: 대분류
('AI 이미지/디자인', 'ai-image-design', 1, '🎨', true, true, 1),
('AI 영상/모션', 'ai-video-motion', 1, '🎬', true, true, 2),
('AI 글쓰기/콘텐츠', 'ai-writing-content', 1, '✍️', true, true, 3),
('AI 프로그래밍/개발', 'ai-programming', 1, '💻', true, true, 4),
('AI 음악/사운드', 'ai-music-sound', 1, '🎵', true, true, 5),
('일반 디자인', 'general-design', 1, '🖌️', false, true, 10),
('일반 개발', 'general-development', 1, '⚙️', false, true, 11);

-- Level 2: 중분류 (AI 이미지/디자인의 하위)
INSERT INTO public.categories (name, slug, parent_id, level, is_ai_category, is_active, display_order)
SELECT
    'AI 로고 디자인' as name,
    'ai-logo-design' as slug,
    id as parent_id,
    2 as level,
    true as is_ai_category,
    true as is_active,
    1 as display_order
FROM public.categories WHERE slug = 'ai-image-design';

INSERT INTO public.categories (name, slug, parent_id, level, is_ai_category, is_active, display_order)
SELECT
    'AI 일러스트' as name,
    'ai-illustration' as slug,
    id as parent_id,
    2 as level,
    true as is_ai_category,
    true as is_active,
    2 as display_order
FROM public.categories WHERE slug = 'ai-image-design';

INSERT INTO public.categories (name, slug, parent_id, level, is_ai_category, is_active, display_order)
SELECT
    'AI 캐릭터 디자인' as name,
    'ai-character-design' as slug,
    id as parent_id,
    2 as level,
    true as is_ai_category,
    true as is_active,
    3 as display_order
FROM public.categories WHERE slug = 'ai-image-design';

-- ============================================
-- 완료 메시지
-- ============================================

-- 스키마 버전 관리 테이블
CREATE TABLE IF NOT EXISTS public.schema_migrations (
    version TEXT PRIMARY KEY,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.schema_migrations (version) VALUES ('001_initial_schema');

-- 성공 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ 초기 스키마 생성 완료!';
    RAISE NOTICE '생성된 테이블: users, seller_profiles, admins, categories, services, ai_services, orders';
    RAISE NOTICE '다음 단계: RLS 정책 설정 (002_rls_policies.sql)';
END $$;