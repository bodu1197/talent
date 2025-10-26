-- =====================================================
-- 2단계: 모든 테이블, 인덱스, 트리거 및 초기 데이터 생성
-- 설명: 깨끗한 데이터베이스에 최신 스키마를 생성합니다.
-- =====================================================

-- =====================================================
-- 테이블 생성
-- =====================================================

-- users 테이블
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

-- admins 테이블
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

-- categories 테이블
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

-- services 테이블
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    price INTEGER NOT NULL CHECK (price > 0),
    price_unit TEXT DEFAULT 'project' CHECK (price_unit IN ('project', 'hour', 'revision')),
    delivery_days INTEGER NOT NULL CHECK (delivery_days > 0),
    revision_count INTEGER DEFAULT 1 CHECK (revision_count >= 0),
    express_delivery BOOLEAN DEFAULT FALSE,
    express_days INTEGER,
    express_price INTEGER,
    thumbnail_url TEXT,
    portfolio_urls TEXT[],
    video_url TEXT,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    in_progress_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'suspended', 'deleted')),
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMPTZ,
    meta_title TEXT,
    meta_description TEXT,
    version INTEGER DEFAULT 1,
    last_modified_by UUID REFERENCES public.users(id),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- service_categories 테이블
CREATE TABLE public.service_categories (
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (service_id, category_id)
);

-- orders 테이블
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE,
    buyer_id UUID NOT NULL REFERENCES public.users(id),
    seller_id UUID NOT NULL REFERENCES public.users(id),
    service_id UUID NOT NULL REFERENCES public.services(id),
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    attachments TEXT[],
    base_amount INTEGER NOT NULL,
    express_amount INTEGER DEFAULT 0,
    additional_amount INTEGER DEFAULT 0,
    discount_amount INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_fee INTEGER NOT NULL,
    seller_amount INTEGER NOT NULL,
    delivery_date DATE NOT NULL,
    revision_count INTEGER DEFAULT 1,
    used_revisions INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'in_progress', 'delivered', 'revision_requested', 'completed', 'cancelled', 'refund_requested', 'refunded')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    work_status TEXT DEFAULT 'waiting' CHECK (work_status IN ('waiting', 'working', 'delivered', 'accepted')),
    paid_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    auto_complete_at TIMESTAMPTZ,
    buyer_satisfied BOOLEAN,
    seller_rating INTEGER CHECK (seller_rating >= 1 AND seller_rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- seller_profiles 테이블 (최신)
CREATE TABLE public.seller_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255),
  description TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0),
  total_sales INTEGER DEFAULT 0 CHECK (total_sales >= 0),
  response_time VARCHAR(50),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ai_services 테이블 (최신)
CREATE TABLE public.ai_services (
  service_id UUID PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
  ai_tool VARCHAR(255) NOT NULL,
  version VARCHAR(50),
  features TEXT[] DEFAULT '{}',
  sample_prompts TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- payments 테이블
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'bank_transfer', 'kakao_pay', 'naver_pay')),
    pg_provider TEXT NOT NULL,
    amount INTEGER NOT NULL,
    vat INTEGER DEFAULT 0,
    card_company TEXT,
    card_number_masked TEXT,
    installment_months INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    pg_response JSONB,
    approval_number TEXT,
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- reviews 테이블
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id),
    buyer_id UUID NOT NULL REFERENCES public.users(id),
    seller_id UUID NOT NULL REFERENCES public.users(id),
    service_id UUID NOT NULL REFERENCES public.services(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    comment TEXT,
    tags TEXT[],
    images TEXT[],
    seller_reply TEXT,
    seller_reply_at TIMESTAMPTZ,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    moderated BOOLEAN DEFAULT FALSE,
    moderation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- conversations 테이블
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id),
    participant1_id UUID NOT NULL REFERENCES public.users(id),
    participant2_id UUID NOT NULL REFERENCES public.users(id),
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,
    participant1_last_read TIMESTAMPTZ,
    participant2_last_read TIMESTAMPTZ,
    participant1_unread_count INTEGER DEFAULT 0,
    participant2_unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- messages 테이블
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    content TEXT,
    attachments JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- favorites 테이블
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    service_id UUID NOT NULL REFERENCES public.services(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, service_id)
);

-- =====================================================
-- 인덱스 생성
-- =====================================================
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_type ON public.users(user_type);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_services_seller ON public.services(seller_id);
CREATE INDEX idx_services_status ON public.services(status, deleted_at);
CREATE INDEX idx_services_rating ON public.services(rating DESC, review_count DESC);
CREATE INDEX idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller ON public.orders(seller_id);
CREATE INDEX idx_seller_profiles_rating ON public.seller_profiles(rating DESC);
CREATE INDEX idx_seller_profiles_total_sales ON public.seller_profiles(total_sales DESC);
CREATE INDEX idx_ai_services_ai_tool ON public.ai_services(ai_tool);
CREATE INDEX idx_reviews_service ON public.reviews(service_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);

-- =====================================================
-- 트리거 및 함수 생성
-- =====================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seller_profiles_updated_at BEFORE UPDATE ON seller_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_services_updated_at BEFORE UPDATE ON ai_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 주문 번호 자동 생성 함수
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                       LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- =====================================================
-- 초기 데이터 삽입
-- =====================================================
INSERT INTO public.categories (name, slug, level, icon, is_ai_category, is_active, display_order) VALUES
('AI 이미지/디자인', 'ai-image-design', 1, '🎨', true, true, 1),
('AI 영상/모션', 'ai-video-motion', 1, '🎬', true, true, 2),
('AI 글쓰기/콘텐츠', 'ai-writing-content', 1, '✍️', true, true, 3),
('AI 프로그래밍/개발', 'ai-programming', 1, '💻', true, true, 4),
('AI 음악/사운드', 'ai-music-sound', 1, '🎵', true, true, 5),
('일반 디자인', 'general-design', 1, '🖌️', false, true, 10),
('일반 개발', 'general-development', 1, '⚙️', false, true, 11);

INSERT INTO public.categories (name, slug, parent_id, level, is_ai_category, is_active, display_order)
SELECT 'AI 로고 디자인', 'ai-logo-design', id, 2, true, true, 1 FROM public.categories WHERE slug = 'ai-image-design';

INSERT INTO public.categories (name, slug, parent_id, level, is_ai_category, is_active, display_order)
SELECT 'AI 일러스트', 'ai-illustration', id, 2, true, true, 2 FROM public.categories WHERE slug = 'ai-image-design';

INSERT INTO public.categories (name, slug, parent_id, level, is_ai_category, is_active, display_order)
SELECT 'AI 캐릭터 디자인', 'ai-character-design', id, 2, true, true, 3 FROM public.categories WHERE slug = 'ai-image-design';

-- =====================================================
-- 완료
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ 모든 테이블이 최신 상태로 생성되었습니다.';
END $$;
