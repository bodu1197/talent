# AI 재능 연결 플랫폼 개발 명세서 (완성본)

## 프로젝트 개요

### 프로젝트명
**AI Talent Hub** - 국내 최대 AI 재능 거래 플랫폼

### 핵심 컨셉
AI 재능을 전문으로 하는 한국형 재능 거래 플랫폼. AI 기술을 활용한 재능(이미지 생성, 영상 제작, 글쓰기 등)을 판매자와 구매자가 거래하는 전문 마켓플레이스.

### 주요 특징
1. **AI 재능 우선 배치**: 홈페이지의 80%를 AI 재능 카테고리에 할애
2. **프리미엄 광고 시스템**: 판매자가 자신의 서비스를 상단 노출하기 위한 광고 시스템
3. **AI 전문가 인증 시스템**: 3단계 등급 시스템으로 품질 보증
4. **대규모 카테고리 관리**: 300개 이상의 세부 카테고리
5. **역할 전환 시스템**: 구매자 ↔ 판매자 자유로운 전환

---

## 기술 스택

### 프론트엔드
```
- Framework: Next.js 14+ (App Router)
- Language: TypeScript
- Styling: TailwindCSS
- State Management: Zustand
- UI Components: Shadcn/ui (예정)
- Icons: FontAwesome (현재), Lucide React (예정)
- Animation: Framer Motion (예정)
- Form Handling: React Hook Form + Zod
- Data Fetching: TanStack Query
- Image Optimization: Next/Image
- SEO: Next SEO (예정)
```

### 백엔드
```
- BaaS: Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- Language: TypeScript (Edge Functions)
- ORM: Supabase Client Library
- Authentication: Supabase Auth
- Authorization: Supabase RLS (Row Level Security)
- API: Supabase REST API, Supabase Edge Functions, Next.js API Routes
- Validation: Zod (프론트엔드 및 Edge Functions)
- Queue: Supabase Edge Functions 또는 외부 서비스 연동 (예정)
- File Upload: Supabase Storage
```

### 데이터베이스
```
- Primary DB: PostgreSQL 15+ (Supabase Managed)
- Cache: Redis (예정, Supabase Edge Functions 또는 외부 서비스 연동)
- Search: PostgreSQL Full-text search + pg_trgm (Supabase Managed)
- Session Store: Supabase Auth
- File Storage: Supabase Storage
```

### 인프라 & DevOps
```
- Frontend Hosting: Vercel
- Backend Hosting: Supabase
- CI/CD: GitHub Actions (예정)
- Monitoring: Sentry (예정) + Google Analytics (예정)
- Testing: Jest (단위), Cypress (E2E) (예정)
```

### 실시간 통신
```
- WebSocket: Supabase Realtime
- 용도: 실시간 알림, 채팅, 주문 상태 업데이트
```

### 결제
```
- PG사: 토스페이먼츠 (주 결제) (연동 예정)
- 부가 결제: 카카오페이, 네이버페이 (연동 예정)
- 정산: 자동 정산 시스템 (구현 예정)
```

---

## 데이터베이스 스키마 (완전판)

### 1. 사용자 관리 테이블

#### users (사용자)
```sql
CREATE TABLE users (
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

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_type ON public.users(user_type);
CREATE INDEX idx_users_active ON public.users(is_active, deleted_at);
```

#### seller_profiles (판매자 프로필)
```sql
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

CREATE INDEX idx_seller_profiles_user ON public.seller_profiles(user_id);
CREATE INDEX idx_seller_profiles_verified ON public.seller_profiles(is_verified, business_verified);
```

#### admins (관리자)
```sql
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

CREATE INDEX idx_admins_user ON public.admins(user_id);
CREATE INDEX idx_admins_role ON public.admins(role);
```

### 2. 카테고리 및 서비스 테이블

#### categories (카테고리 - 계층 구조)
```sql
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

CREATE INDEX idx_categories_parent ON public.categories(parent_id);
CREATE INDEX idx_categories_level ON public.categories(level);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_ai ON public.categories(is_ai_category, is_active);
CREATE INDEX idx_categories_featured ON public.categories(is_featured, is_active);
```

#### services (재능/서비스)
```sql
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

CREATE INDEX idx_services_seller ON public.services(seller_id);
CREATE INDEX idx_services_status ON public.services(status, deleted_at);
CREATE INDEX idx_services_slug ON public.services(slug);
CREATE INDEX idx_services_rating ON public.services(rating DESC, review_count DESC);
```

#### service_versions (서비스 버전 이력)
```sql
-- 이 테이블은 현재 Supabase 마이그레이션에 포함되어 있지 않습니다.
-- 필요시 추가 구현 예정입니다.
```

#### ai_services (AI 재능 전용 정보)
```sql
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

CREATE INDEX idx_ai_services_service ON public.ai_services(service_id);
CREATE INDEX idx_ai_services_level ON public.ai_services(expert_level);
CREATE INDEX idx_ai_services_tools ON public.ai_services USING GIN(ai_tools);
```

### 3. 광고 및 프리미엄 배치 테이블

#### advertising_campaigns (광고 캠페인)
```sql
CREATE TABLE public.advertising_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.users(id),
    campaign_name TEXT NOT NULL,
    campaign_type TEXT NOT NULL CHECK (campaign_type IN ('premium_placement', 'sponsored_search', 'banner')),

    -- 예산 관리
    daily_budget INTEGER,
    total_budget INTEGER,
    spent_amount INTEGER DEFAULT 0,

    -- 타겟팅
    target_categories UUID[],
    target_keywords TEXT[],
    target_user_types TEXT[],

    -- 입찰
    bid_type TEXT DEFAULT 'cpc' CHECK (bid_type IN ('cpc', 'cpm', 'fixed')),
    bid_amount INTEGER NOT NULL,

    -- 기간
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,

    -- 상태
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'paused', 'completed', 'cancelled')),
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,

    -- 성과
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    ctr DECIMAL(5,2) DEFAULT 0.00,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    roi DECIMAL(10,2) DEFAULT 0.00,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_seller ON public.advertising_campaigns(seller_id);
CREATE INDEX idx_campaigns_status ON public.advertising_campaigns(status, approval_status);
CREATE INDEX idx_campaigns_dates ON public.advertising_campaigns(start_date, end_date);
```

#### premium_placements (프리미엄 배치 상세)
```sql
CREATE TABLE public.premium_placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.advertising_campaigns(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id),

    -- 배치 정보
    placement_type TEXT NOT NULL CHECK (placement_type IN ('home_hero', 'home_top', 'category_top', 'search_top')),
    placement_slot INTEGER,
    category_id UUID REFERENCES public.categories(id),
    keywords TEXT[],

    -- 노출 위치
    position_score INTEGER DEFAULT 0,
    display_priority INTEGER DEFAULT 0,

    -- 기간 및 비용
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    daily_cost INTEGER,
    total_cost INTEGER,
    actual_cost INTEGER DEFAULT 0,

    -- 성과 추적
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue_generated BIGINT DEFAULT 0,

    -- 상태
    is_active BOOLEAN DEFAULT TRUE,
    paused_at TIMESTAMPTZ,
    paused_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_premium_active ON public.premium_placements(is_active, start_date, end_date);
CREATE INDEX idx_premium_service ON public.premium_placements(service_id);
CREATE INDEX idx_premium_campaign ON public.premium_placements(campaign_id);
CREATE INDEX idx_premium_type ON public.premium_placements(placement_type, category_id);
CREATE INDEX idx_premium_position ON public.premium_placements(position_score DESC, display_priority DESC);
```

#### advertising_analytics (광고 분석)
```sql
-- 이 테이블은 현재 Supabase 마이그레이션에 포함되어 있지 않습니다.
-- 필요시 추가 구현 예정입니다.
```

### 4. 주문 및 결제 테이블

#### orders (주문)
```sql
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

CREATE INDEX idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller ON public.orders(seller_id);
CREATE INDEX idx_orders_service ON public.orders(service_id);
CREATE INDEX idx_orders_status ON public.orders(status, payment_status);
CREATE INDEX idx_orders_number ON public.orders(order_number);
CREATE INDEX idx_orders_dates ON public.orders(created_at DESC);
```

#### payments (결제)
```sql
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE NOT NULL,

    -- 결제 정보
    payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'bank_transfer', 'kakao_pay', 'naver_pay')),
    pg_provider TEXT NOT NULL,

    -- 금액
    amount INTEGER NOT NULL,
    vat INTEGER DEFAULT 0,

    -- 카드 정보 (카드 결제시)
    card_company TEXT,
    card_number_masked TEXT,
    installment_months INTEGER DEFAULT 0,

    -- 상태
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),

    -- PG 응답
    pg_response JSONB,
    approval_number TEXT,

    -- 날짜
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON public.payments(order_id);
CREATE INDEX idx_payments_transaction ON public.payments(transaction_id);
CREATE INDEX idx_payments_status ON public.payments(status);
```

#### refunds (환불)
```sql
CREATE TABLE public.refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    payment_id UUID NOT NULL REFERENCES public.payments(id),

    -- 환불 정보
    refund_amount INTEGER NOT NULL,
    refund_reason TEXT NOT NULL,
    refund_description TEXT,

    -- 수수료 처리
    commission_refund INTEGER DEFAULT 0,
    seller_penalty INTEGER DEFAULT 0,

    -- 상태
    status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected', 'completed')),
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),

    -- 처리 정보
    requested_by UUID REFERENCES public.users(id),
    approved_by UUID REFERENCES public.admins(id),
    rejection_reason TEXT,

    -- PG 정보
    pg_refund_id TEXT,
    pg_response JSONB,

    -- 날짜
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refunds_order ON public.refunds(order_id);
CREATE INDEX idx_refunds_payment ON public.refunds(payment_id);
CREATE INDEX idx_refunds_status ON public.refunds(status);
```

### 5. 정산 테이블

#### settlements (정산)
```sql
CREATE TABLE public.settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.users(id),

    -- 정산 기간
    settlement_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- 금액
    total_sales BIGINT DEFAULT 0,
    total_commission BIGINT DEFAULT 0,
    total_refunds BIGINT DEFAULT 0,
    adjustments BIGINT DEFAULT 0,
    settlement_amount BIGINT NOT NULL,

    -- 상태
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'failed')),

    -- 지급 정보
    bank_name TEXT,
    bank_account TEXT,
    account_holder TEXT,

    -- 처리 정보
    confirmed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    payment_proof TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settlements_seller ON public.settlements(seller_id);
CREATE INDEX idx_settlements_date ON public.settlements(settlement_date);
CREATE INDEX idx_settlements_status ON public.settlements(status);
```

#### settlement_details (정산 상세)
```sql
CREATE TABLE public.settlement_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id UUID NOT NULL REFERENCES public.settlements(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id),

    -- 금액 정보
    order_amount INTEGER NOT NULL,
    commission_amount INTEGER NOT NULL,
    seller_amount INTEGER NOT NULL,

    -- 유형
    type TEXT DEFAULT 'order' CHECK (type IN ('order', 'refund', 'adjustment')),
    description TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settlement_details_settlement ON public.settlement_details(settlement_id);
CREATE INDEX idx_settlement_details_order ON public.settlement_details(order_id);
```

### 6. 리뷰 및 평가 테이블

#### reviews (리뷰)
```sql
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id),
    buyer_id UUID NOT NULL REFERENCES public.users(id),
    seller_id UUID NOT NULL REFERENCES public.users(id),
    service_id UUID NOT NULL REFERENCES public.services(id),

    -- 평가
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

    -- 상세 평가
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),

    -- 리뷰 내용
    comment TEXT,
    tags TEXT[],
    images TEXT[],

    -- 판매자 답변
    seller_reply TEXT,
    seller_reply_at TIMESTAMPTZ,

    -- 도움됨 투표
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,

    -- 상태
    is_visible BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    moderated BOOLEAN DEFAULT FALSE,
    moderation_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_service ON public.reviews(service_id);
CREATE INDEX idx_reviews_seller ON public.reviews(seller_id);
CREATE INDEX idx_reviews_buyer ON public.reviews(buyer_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating DESC, created_at DESC);
CREATE INDEX idx_reviews_visible ON public.reviews(is_visible, is_featured);
```

### 7. 커뮤니케이션 테이블

#### conversations (대화방)
```sql
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id),
    participant1_id UUID NOT NULL REFERENCES public.users(id),
    participant2_id UUID NOT NULL REFERENCES public.users(id),

    -- 상태
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,

    -- 읽음 상태
    participant1_last_read TIMESTAMPTZ,
    participant2_last_read TIMESTAMPTZ,
    participant1_unread_count INTEGER DEFAULT 0,
    participant2_unread_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_order ON public.conversations(order_id);
CREATE INDEX idx_conversations_participants ON public.conversations(participant1_id, participant2_id);
CREATE INDEX idx_conversations_active ON public.conversations(is_active, last_message_at DESC);
```

#### messages (메시지)
```sql
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id),

    -- 메시지 내용
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    content TEXT,
    attachments JSONB,

    -- 상태
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);
```

#### notifications (알림)
```sql
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),

    -- 알림 정보
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    data JSONB,

    -- 링크
    link_url TEXT,

    -- 상태
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_pushed BOOLEAN DEFAULT FALSE,
    pushed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
```

### 8. 신고 및 분쟁 테이블

#### reports (신고)
```sql
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.users(id),

    -- 신고 대상
    reported_user_id UUID REFERENCES public.users(id),
    reported_service_id UUID REFERENCES public.services(id),
    reported_order_id UUID REFERENCES public.orders(id),
    reported_review_id UUID REFERENCES public.reviews(id),

    -- 신고 내용
    report_type TEXT NOT NULL CHECK (report_type IN (
        'spam', 'fraud', 'inappropriate_content',
        'copyright', 'quality_issue', 'non_delivery'
    )),
    report_reason TEXT NOT NULL,
    description TEXT,
    evidence_urls TEXT[],

    -- 처리
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'rejected')),
    severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    -- 처리 정보
    assigned_to UUID REFERENCES public.admins(id),
    admin_notes TEXT,
    action_taken TEXT,

    -- 날짜
    assigned_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX idx_reports_reported_user ON public.reports(reported_user_id);
CREATE INDEX idx_reports_status ON public.reports(status, severity);
CREATE INDEX idx_reports_type ON public.reports(report_type);
```

#### disputes (분쟁)
```sql
CREATE TABLE public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    initiated_by UUID NOT NULL REFERENCES public.users(id),

    -- 분쟁 정보
    dispute_type TEXT NOT NULL CHECK (dispute_type IN ('quality', 'non_delivery', 'delay', 'communication')),
    reason TEXT NOT NULL,
    requested_action TEXT CHECK (requested_action IN ('refund', 'revision', 'compensation')),

    -- 증거
    evidence_description TEXT,
    evidence_urls TEXT[],

    -- 상태
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_mediation', 'resolved', 'closed')),
    resolution TEXT CHECK (resolution IN ('refund_full', 'refund_partial', 'revision', 'rejected')),
    resolution_details TEXT,

    -- 중재
    mediator_id UUID REFERENCES public.admins(id),
    mediation_notes TEXT,

    -- 날짜
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    mediation_started_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_disputes_order ON public.disputes(order_id);
CREATE INDEX idx_disputes_initiated_by ON public.disputes(initiated_by);
CREATE INDEX idx_disputes_status ON public.disputes(status);
```

### 9. 기타 테이블

#### favorites (찜하기)
```sql
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    service_id UUID NOT NULL REFERENCES public.services(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, service_id)
);

CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_favorites_service ON public.favorites(service_id);
```

#### search_logs (검색 로그)
```sql
CREATE TABLE public.search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    session_id TEXT,
    keyword TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id),
    filters JSONB,
    result_count INTEGER,
    clicked_service_ids UUID[],
    converted_service_id UUID REFERENCES public.services(id),
    search_duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_logs_user ON public.search_logs(user_id);
CREATE INDEX idx_search_logs_keyword ON public.search_logs(keyword);
CREATE INDEX idx_search_logs_created ON public.search_logs(created_at DESC);
```

#### activity_logs (활동 로그)
```sql
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    admin_id UUID REFERENCES public.admins(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_admin ON public.activity_logs(admin_id);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at DESC);
```

---

## API 설계 (완전판)

### 인증 API

#### POST /api/auth/register
사용자 회원가입
```json
Request:
{
  "email": "user@example.com",
  "password": "Password123!",
  "password_confirm": "Password123!",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "user_type": "buyer", // buyer, seller, both
  "agree_terms": true,
  "agree_privacy": true,
  "agree_marketing": false
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "홍길동",
      "user_type": "buyer"
    },
    "token": "jwt_token_here",
    "refresh_token": "refresh_token_here"
  }
}
```

#### POST /api/auth/login
로그인
```json
Request:
{
  "email": "user@example.com",
  "password": "Password123!"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here",
    "refresh_token": "refresh_token_here"
  }
}
```

#### POST /api/auth/refresh
토큰 갱신
```json
Request:
{
  "refresh_token": "refresh_token_here"
}

Response:
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refresh_token": "new_refresh_token"
  }
}
```

#### POST /api/auth/logout
로그아웃

#### POST /api/auth/verify-email
이메일 인증

#### POST /api/auth/forgot-password
비밀번호 재설정 요청

#### PATCH /api/auth/reset-password
비밀번호 재설정

### 사용자 관리 API

#### GET /api/users/profile
내 프로필 조회

#### PATCH /api/users/profile
프로필 수정

#### POST /api/users/switch-role
역할 전환 (구매자 ↔ 판매자)
```json
Request:
{
  "new_role": "seller" // or "buyer", "both"
}

Response:
{
  "success": true,
  "data": {
    "user_type": "seller",
    "requires_profile": true // 판매자 프로필 설정 필요
  }
}
```

#### POST /api/users/become-seller
판매자 등록
```json
Request:
{
  "business_name": "AI 디자인 스튜디오",
  "business_number": "123-45-67890", // 선택
  "introduction": "전문 AI 디자이너입니다",
  "skills": ["Midjourney", "Stable Diffusion"],
  "bank_name": "국민은행",
  "bank_account": "123456-78-901234",
  "account_holder": "홍길동"
}
```

### 카테고리 API

#### GET /api/categories/tree
전체 카테고리 트리 (계층 구조)

#### GET /api/categories/ai
AI 카테고리만 조회

#### GET /api/categories/:slug
카테고리 상세

#### GET /api/categories/:slug/services
카테고리별 서비스 목록
```json
Query Parameters:
- page: 1
- limit: 20
- sort: popular | recent | price_low | price_high | rating | orders
- min_price: 10000
- max_price: 500000
- delivery_days: 1 | 3 | 7 | 14
- rating: 4.0
- ai_tools: ["Midjourney", "ChatGPT"]
- expert_level: starter | professional | master

Response:
{
  "success": true,
  "data": {
    "services": [...],
    "filters": {
      "price_range": { "min": 5000, "max": 1000000 },
      "ai_tools": ["Midjourney", "ChatGPT", ...],
      "delivery_days": [1, 3, 7, 14, 30]
    },
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_count": 200,
      "per_page": 20
    }
  }
}
```

### 서비스 API

#### GET /api/services/:id
서비스 상세 조회

#### GET /api/services/search
서비스 검색
```json
Query Parameters:
- q: "AI 로고"
- category_id: 123
- ai_only: true
- min_price: 10000
- max_price: 100000
- delivery_days: 3
- rating: 4.0
- expert_level: professional
- sort: relevance | popular | recent | price_low | price_high
- page: 1
- limit: 20
```

#### POST /api/services
서비스 등록
```json
Request:
{
  "title": "AI 로고 디자인 - 24시간 완성",
  "description": "Midjourney를 활용한 프로 로고 디자인...",
  "requirements": "원하시는 스타일 설명...",
  "price": 49000,
  "price_unit": "project",
  "delivery_days": 1,
  "revision_count": 3,
  "express_delivery": true,
  "express_days": 0,
  "express_price": 20000,
  "category_ids": [3, 5],
  "tags": ["AI로고", "Midjourney", "빠른작업"],
  "ai_info": {
    "ai_tools": ["Midjourney"],
    "ai_model": "Midjourney v6",
    "generation_time_minutes": 30,
    "prompt_included": true,
    "commercial_use": true,
    "min_generations": 5,
    "max_generations": 20
  }
}
```

#### PUT /api/services/:id
서비스 수정

#### DELETE /api/services/:id
서비스 삭제

#### POST /api/services/:id/images
서비스 이미지 업로드
```json
Request: Multipart/form-data
- thumbnail: File
- portfolio[]: File[]

Response:
{
  "success": true,
  "data": {
    "thumbnail_url": "https://...",
    "portfolio_urls": ["https://...", ...]
  }
}
```

### 광고 API

#### GET /api/advertising/campaigns
내 광고 캠페인 목록

#### POST /api/advertising/campaigns
광고 캠페인 생성
```json
Request:
{
  "campaign_name": "AI 로고 서비스 프로모션",
  "campaign_type": "premium_placement",
  "service_ids": [123, 456],
  "placement_type": "category_top",
  "category_ids": [3],
  "daily_budget": 50000,
  "total_budget": 500000,
  "bid_amount": 1000,
  "start_date": "2025-01-01",
  "end_date": "2025-01-31"
}

Response:
{
  "success": true,
  "data": {
    "campaign_id": 789,
    "status": "pending",
    "estimated_impressions": 10000,
    "estimated_clicks": 500,
    "payment_required": 500000,
    "payment_url": "https://..."
  }
}
```

#### GET /api/advertising/campaigns/:id
캠페인 상세

#### PATCH /api/advertising/campaigns/:id
캠페인 수정 (일시정지, 재개, 예산 수정)

#### DELETE /api/advertising/campaigns/:id
캠페인 삭제

#### GET /api/advertising/campaigns/:id/analytics
캠페인 성과 분석
```json
Response:
{
  "success": true,
  "data": {
    "summary": {
      "impressions": 5432,
      "clicks": 234,
      "ctr": 4.31,
      "conversions": 12,
      "conversion_rate": 5.13,
      "spent": 234000,
      "roi": 245.5
    },
    "daily_stats": [...],
    "hourly_distribution": [...],
    "top_keywords": [...],
    "device_breakdown": {...}
  }
}
```

#### GET /api/advertising/pricing
광고 가격표 조회
```json
Response:
{
  "success": true,
  "data": {
    "premium_placement": {
      "home_hero": {
        "ai_category": {
          "daily": 100000,
          "weekly": 600000,
          "monthly": 2000000
        },
        "regular_category": {
          "daily": 50000,
          "weekly": 300000,
          "monthly": 1000000
        }
      },
      "category_top": {
        "slot_1-3": {
          "daily": 50000,
          "weekly": 300000
        },
        "slot_4-10": {
          "daily": 30000,
          "weekly": 180000
        }
      }
    },
    "sponsored_search": {
      "cpc_min": 500,
      "cpc_max": 5000,
      "suggested_bid": 1200
    }
  }
}
```

#### GET /api/advertising/available-slots
이용 가능한 광고 슬롯 조회

### 주문 API

#### POST /api/orders
주문 생성
```json
Request:
{
  "service_id": 123,
  "requirements": "상세 요구사항...",
  "attachments": ["file_url_1", "file_url_2"],
  "express_delivery": false,
  "payment_method": "card"
}

Response:
{
  "success": true,
  "data": {
    "order": {
      "id": 456,
      "order_number": "20250101-000001",
      "total_amount": 49000,
      "delivery_date": "2025-01-02"
    },
    "payment_url": "https://..."
  }
}
```

#### GET /api/orders
주문 목록
```json
Query Parameters:
- role: buyer | seller
- status: all | pending | in_progress | completed | cancelled
- page: 1
- limit: 20
```

#### GET /api/orders/:id
주문 상세

#### PATCH /api/orders/:id/status
주문 상태 변경
```json
Request:
{
  "action": "start_work" | "deliver" | "request_revision" | "complete" | "cancel",
  "message": "작업 완료했습니다",
  "attachments": ["url1", "url2"]
}
```

#### POST /api/orders/:id/messages
주문 메시지 전송

#### GET /api/orders/:id/messages
주문 메시지 목록

### 결제 API

#### POST /api/payments/process
결제 처리
```json
Request:
{
  "order_id": 456,
  "payment_method": "card",
  "card_number": "1234-5678-9012-3456",
  "expiry": "12/26",
  "cvv": "123",
  "installments": 0
}
```

#### GET /api/payments/:id
결제 상세

#### POST /api/payments/webhook
PG사 웹훅 처리

### 환불 API

#### POST /api/refunds
환불 요청
```json
Request:
{
  "order_id": 456,
  "reason": "quality_issue",
  "description": "요청한 디자인과 전혀 다름",
  "evidence_urls": ["url1", "url2"]
}
```

#### GET /api/refunds
환불 요청 목록

#### PATCH /api/refunds/:id
환불 상태 변경 (관리자)

### 정산 API

#### GET /api/settlements
정산 내역

#### GET /api/settlements/:id
정산 상세

#### POST /api/settlements/request-withdrawal
출금 요청
```json
Request:
{
  "amount": 500000,
  "bank_name": "국민은행",
  "bank_account": "123456-78-901234",
  "account_holder": "홍길동"
}
```

### 리뷰 API

#### POST /api/reviews
리뷰 작성
```json
Request:
{
  "order_id": 456,
  "rating": 5,
  "communication_rating": 5,
  "quality_rating": 5,
  "delivery_rating": 4,
  "comment": "정말 만족스러운 작업이었습니다",
  "tags": ["친절해요", "전문적이에요"],
  "images": ["url1", "url2"]
}
```

#### GET /api/reviews
리뷰 목록

#### POST /api/reviews/:id/reply
리뷰 답변 (판매자)

#### POST /api/reviews/:id/helpful
도움됨 투표

### 알림 API

#### GET /api/notifications
알림 목록

#### PATCH /api/notifications/read
알림 읽음 처리

#### GET /api/notifications/unread-count
읽지 않은 알림 수

#### POST /api/notifications/subscribe
푸시 알림 구독

### 메시지 API

#### GET /api/conversations
대화 목록

#### GET /api/conversations/:id/messages
메시지 목록

#### POST /api/conversations/:id/messages
메시지 전송

#### PATCH /api/conversations/:id/read
읽음 처리

### 신고 API

#### POST /api/reports
신고하기
```json
Request:
{
  "report_type": "fraud",
  "reported_user_id": 789,
  "reported_service_id": 123,
  "reason": "허위 포트폴리오",
  "description": "다른 사람의 작품을 도용...",
  "evidence_urls": ["url1", "url2"]
}
```

#### GET /api/reports
내 신고 내역

### 분쟁 API

#### POST /api/disputes
분쟁 신청

#### GET /api/disputes
분쟁 목록

#### POST /api/disputes/:id/messages
분쟁 메시지

### 관리자 API

#### GET /api/admin/dashboard
관리자 대시보드 통계

#### GET /api/admin/users
사용자 관리

#### PATCH /api/admin/users/:id
사용자 상태 변경

#### GET /api/admin/services
서비스 관리

#### PATCH /api/admin/services/:id/approve
서비스 승인

#### GET /api/admin/reports
신고 관리

#### PATCH /api/admin/reports/:id/resolve
신고 처리

#### GET /api/admin/disputes
분쟁 관리

#### POST /api/admin/disputes/:id/mediate
분쟁 중재

#### GET /api/admin/analytics
플랫폼 분석

---

## 프론트엔드 구조 (완전판)

### 페이지 구조

```
# 공개 페이지
/                                   - 홈페이지
/categories                         - 카테고리 전체보기
/categories/:slug                   - 카테고리별 서비스
/services/:id                       - 서비스 상세
/search                            - 검색 결과

# 인증
/auth/login                        - 로그인
/auth/register                     - 회원가입
/auth/forgot-password              - 비밀번호 찾기
/auth/reset-password               - 비밀번호 재설정
/auth/verify-email                 - 이메일 인증

# 공통 (로그인 필요)
/profile                           - 내 프로필
/settings                          - 설정
/notifications                     - 알림
/messages                          - 메시지
/messages/:conversationId          - 메시지 대화

# 구매자 페이지
/buyer                             - 구매자 대시보드
/buyer/orders                      - 구매 내역
/buyer/orders/:id                  - 주문 상세
/buyer/favorites                   - 찜한 서비스
/buyer/reviews                     - 작성한 리뷰
/buyer/payments                    - 결제 수단 관리

# 판매자 페이지
/seller                            - 판매자 대시보드
/seller/services                   - 내 서비스 관리
/seller/services/new               - 서비스 등록
/seller/services/:id/edit          - 서비스 수정
/seller/services/:id/analytics     - 서비스 분석
/seller/orders                     - 주문 관리
/seller/orders/:id                 - 주문 처리
/seller/earnings                   - 수익 관리
/seller/earnings/withdrawal        - 출금 신청
/seller/reviews                    - 받은 리뷰
/seller/advertising                - 광고 관리
/seller/advertising/new            - 광고 만들기
/seller/advertising/:id            - 광고 캠페인 상세
/seller/profile                    - 판매자 프로필 관리

# 관리자 페이지
/admin                             - 관리자 대시보드
/admin/users                       - 사용자 관리
/admin/users/:id                   - 사용자 상세
/admin/services                    - 서비스 관리
/admin/services/:id                - 서비스 상세/승인
/admin/categories                  - 카테고리 관리
/admin/orders                      - 주문 관리
/admin/payments                    - 결제/정산 관리
/admin/reports                     - 신고 관리
/admin/reports/:id                 - 신고 처리
/admin/disputes                    - 분쟁 관리
/admin/disputes/:id                - 분쟁 중재
/admin/advertising                 - 광고 관리
/admin/ai-certification            - AI 전문가 인증
/admin/analytics                   - 플랫폼 통계
/admin/settings                    - 시스템 설정

# 기타
/help                              - 고객센터
/help/faq                          - FAQ
/help/contact                      - 문의하기
/terms                             - 이용약관
/privacy                           - 개인정보처리방침
```

### 주요 컴포넌트 구조

```tsx
components/
├── common/
│   ├── Layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── MegaMenu.tsx
│   ├── Auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthGuard.tsx
│   └── UI/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       └── LoadingSpinner.tsx
│
├── home/
│   ├── HeroSection.tsx
│   ├── AITalentShowcase.tsx
│   ├── PremiumPlacements.tsx
│   ├── CategoryGrid.tsx
│   └── TrendingServices.tsx
│
├── service/
│   ├── ServiceCard.tsx
│   ├── ServiceGrid.tsx
│   ├── ServiceDetail.tsx
│   ├── ServiceFilter.tsx
│   └── AIServiceBadge.tsx
│
├── search/
│   ├── SearchBar.tsx
│   ├── SearchFilters.tsx
│   ├── SearchResults.tsx
│   └── AutoComplete.tsx
│
├── order/
│   ├── OrderForm.tsx
│   ├── OrderStatus.tsx
│   ├── OrderChat.tsx
│   └── OrderTimeline.tsx
│
├── payment/
│   ├── PaymentForm.tsx
│   ├── PaymentMethod.tsx
│   └── RefundRequest.tsx
│
├── review/
│   ├── ReviewForm.tsx
│   ├── ReviewList.tsx
│   ├── ReviewCard.tsx
│   └── StarRating.tsx
│
├── advertising/
│   ├── CampaignForm.tsx
│   ├── CampaignDashboard.tsx
│   ├── AdPreview.tsx
│   └── BudgetCalculator.tsx
│
├── seller/
│   ├── SellerDashboard.tsx
│   ├── ServiceManager.tsx
│   ├── EarningsChart.tsx
│   └── OrderQueue.tsx
│
├── buyer/
│   ├── BuyerDashboard.tsx
│   ├── OrderHistory.tsx
│   └── FavoritesList.tsx
│
├── admin/
│   ├── AdminDashboard.tsx
│   ├── UserManager.tsx
│   ├── ServiceApproval.tsx
│   ├── ReportHandler.tsx
│   └── SystemStats.tsx
│
└── chat/
    ├── ChatWindow.tsx
    ├── MessageList.tsx
    ├── MessageInput.tsx
    └── OnlineStatus.tsx
```

---

## 보안 강화 계획

### 1. 인증/인가
- **JWT + Refresh Token**: Access Token (15분), Refresh Token (7일)
- **2FA 옵션**: Google Authenticator 연동 (구현 예정)
- **Rate Limiting**: Supabase Edge Functions 또는 Next.js API Routes (구현 예정)
- **CAPTCHA**: 로그인 3회 실패시 reCAPTCHA (구현 예정)
- **Session Management**: Supabase Auth

### 2. 입력 검증
- **XSS 방지**: React/Next.js 기본 방어 및 DOMPurify (프론트엔드) (구현 예정)
- **SQL Injection 방지**: Supabase RLS 및 Supabase Client Library 사용
- **CSRF 방지**: Next.js/Supabase 환경에 맞는 구현 (구현 예정)
- **File Upload 검증**:
  - MIME type 체크 (구현 예정)
  - 파일 크기 제한 (구현 예정)
  - 바이러스 스캔 (ClamAV) (외부 서비스 연동 예정)
  - 이미지 재인코딩 (Sharp) (Supabase Edge Functions 또는 외부 서비스 연동 예정)

### 3. API 보안
```typescript
// Rate Limiting 설정 (Supabase Edge Functions 또는 Next.js API Routes에서 구현 예정)
// Helmet 설정 (Next.js 미들웨어 또는 Edge Functions에서 구현 예정)
```

### 4. 데이터 보안
- **암호화**: Supabase Auth (bcrypt 유사), PII 보호 (구현 예정)
- **민감정보 마스킹**: 카드번호, 계좌번호 (구현 예정)
- **백업**: Supabase 자동 백업

---

## 성능 최적화 전략

### 1. 프론트엔드 최적화
- **코드 스플리팅**: Next.js 기본 지원
- **이미지 최적화**:
  - WebP 포맷 자동 변환 (Next/Image)
  - Lazy loading (Next/Image)
  - Responsive images (Next/Image)
  - CDN 캐싱 (Vercel/Supabase Storage)
- **번들 최적화**: Next.js 기본 지원
- **SSG/ISR**:
  - 정적 페이지: SSG (Next.js)
  - 카테고리 페이지: ISR (60초) (Next.js)
  - 서비스 상세: ISR (300초) (Next.js)

### 2. 백엔드 최적화
- **데이터베이스**:
  - Connection pooling (Supabase Managed)
  - Query 최적화 (PostgreSQL)
  - 인덱스 전략 (PostgreSQL)
  - Partial index 활용 (PostgreSQL)
- **캐싱 전략**:
  ```typescript
  // Redis 캐싱 (Supabase Edge Functions 또는 외부 서비스 연동 예정)
  - 카테고리 트리: 1시간
  - 인기 서비스: 10분
  - 사용자 세션: 30분
  - 검색 결과: 5분
  ```
- **Queue 처리**: Supabase Edge Functions 또는 외부 서비스 연동 (예정)
  - 이메일 발송
  - 이미지 처리
  - 알림 발송
  - 정산 처리

### 3. 인프라 최적화
- **로드 밸런싱**: Vercel/Supabase Managed
- **CDN**: Vercel/Supabase Storage
- **모니터링**:
  - APM: Datadog (연동 예정)
  - 에러: Sentry (연동 예정)
  - 로그: Supabase Logs + CloudWatch (연동 예정)

---

## 구현 일정 (수정본)

### Phase 1: 기본 인프라 구축 (2주)
**Week 1-2**
- 프로젝트 환경 설정
- 데이터베이스 설계 및 구축 (Supabase)
- 기본 인증 시스템 (Supabase Auth)
- 관리자/판매자/구매자 역할 구분

### Phase 2: 핵심 기능 개발 (3주)
**Week 3-5**
- 카테고리 시스템 (데이터 입력 및 관리)
- 서비스 CRUD
- 검색 기능
- 파일 업로드 (Supabase Storage)

### Phase 3: 거래 시스템 (3주)
**Week 6-8**
- 주문 프로세스
- 결제 연동 (토스페이먼츠) (구현 예정)
- 환불 시스템 (구현 예정)
- 정산 시스템 (구현 예정)

### Phase 4: 광고 시스템 (2주)
**Week 9-10**
- 광고 캠페인 관리 (구현 예정)
- 프리미엄 배치 (구현 예정)
- 광고 성과 분석 (구현 예정)
- 자동 입찰 시스템 (구현 예정)

### Phase 5: 커뮤니케이션 (2주)
**Week 11-12**
- 실시간 채팅 (Supabase Realtime) (구현 예정)
- 알림 시스템 (구현 예정)
- 리뷰 시스템 (구현 예정)
- 신고/분쟁 처리 (구현 예정)

### Phase 6: 관리자 시스템 (2주)
**Week 13-14**
- 관리자 대시보드 (구현 예정)
- 사용자 관리 (구현 예정)
- 서비스 승인 (구현 예정)
- 통계 및 분석 (구현 예정)

### Phase 7: 최적화 및 테스트 (2주)
**Week 15-16**
- 성능 최적화 (구현 예정)
- 보안 강화 (구현 예정)
- 테스트 (단위/E2E) (구현 예정)
- 버그 수정

### Phase 8: 배포 준비 (1주)
**Week 17**
- 프로덕션 환경 구성 (Vercel/Supabase)
- CI/CD 파이프라인 (GitHub Actions) (구현 예정)
- 모니터링 설정 (구현 예정)
- 문서화

**총 예상 기간: 17주 (약 4개월)**

---

## 테스트 전략

### 1. 단위 테스트 (Jest)
- 목표 커버리지: 80%
- 서비스 로직
- 유틸리티 함수
- 컴포넌트 단위

### 2. 통합 테스트 (Supertest)
- API 엔드포인트 (Next.js API Routes, Supabase Edge Functions)
- 데이터베이스 연동 (Supabase Client)
- 외부 서비스 연동

### 3. E2E 테스트 (Cypress)
- 주요 사용자 시나리오
- 결제 플로우
- 주문 프로세스
- 관리자 기능

### 4. 성능 테스트
- Load testing (K6) (예정)
- Stress testing (예정)
- API 응답 시간

---

## 모니터링 및 분석

### 1. 실시간 모니터링
- **서버 모니터링**: CPU, Memory, Disk (Supabase/Vercel 제공)
- **애플리케이션 모니터링**: APM (Datadog) (연동 예정)
- **데이터베이스 모니터링**: Slow query, Connection pool (Supabase 제공)
- **에러 추적**: Sentry (연동 예정)

### 2. 비즈니스 메트릭
- **사용자 분석**: Google Analytics 4 (연동 예정)
- **매출 분석**: 일/주/월별 대시보드 (구현 예정)
- **전환율 추적**: Funnel 분석 (구현 예정)
- **광고 ROI**: 캠페인별 성과 (구현 예정)

### 3. 로깅 전략
```typescript
// Winston 로깅 레벨 (Next.js/Edge Functions에서 구현 예정)
- error: 에러 및 예외
- warn: 경고 사항
- info: 중요 이벤트
- debug: 디버깅 정보

// 로그 저장
- 로컬: 7일 보관
- CloudWatch: 30일 보관 (연동 예정)
- 아카이브: S3 (1년) (연동 예정)
```

---

## 초기 데이터

### AI 카테고리 구조 (현재 적용된 카테고리)
- AI 서비스 (ID: ai-services, Slug: ai-services, AI 카테고리)
    - AI 디자인 (ID: ai-design, Slug: ai-design, AI 카테고리)
        - AI 일러스트 (ID: ai-illustration, Slug: ai-illustration, AI 카테고리)
        - AI 실사·모델 (ID: ai-photorealistic-model, Slug: ai-photorealistic-model, AI 카테고리)
        - AI 광고소재 디자인 (ID: ai-ad-material-design, Slug: ai-ad-material-design, AI 카테고리)
        - AI 캐릭터 디자인 (ID: ai-character-design, Slug: ai-character-design, AI 카테고리)
        - AI 제품·패키지 디자인 (ID: ai-product-package-design, Slug: ai-product-package-design, AI 카테고리)
        - AI 공간 디자인 (ID: ai-space-design, Slug: ai-space-design, AI 카테고리)
        - AI 보정·누끼·합성 (ID: ai-retouching-composition, Slug: ai-retouching-composition, AI 카테고리)
        - AI 책 표지 (ID: ai-book-cover, Slug: ai-book-cover, AI 카테고리)
        - AI 디자인 기타 (ID: ai-design-etc, Slug: ai-design-etc, AI 카테고리)
    - AI 이미지 (ID: ai-image, Slug: ai-image, AI 카테고리)
        - AI 이미지 제작·누끼·보정 (ID: ai-image-creation-retouching, Slug: ai-image-creation-retouching, AI 카테고리)
        - AI 제품 사진 (ID: ai-product-photo, Slug: ai-product-photo, AI 카테고리)
        - AI 업스케일링(화질 개선) (ID: ai-upscaling, Slug: ai-upscaling, AI 카테고리)
        - AI 헤어 모델 (ID: ai-hair-model, Slug: ai-hair-model, AI 카테고리)
        - AI 광고 모델 (ID: ai-ad-model, Slug: ai-ad-model, AI 카테고리)
    - AI 개발 (ID: ai-development, Slug: ai-development, AI 카테고리)
        - 맞춤형 챗봇·GPT (ID: custom-chatbot-gpt, Slug: custom-chatbot-gpt, AI 카테고리)
        - AI 시스템·서비스 (ID: ai-system-service, Slug: ai-system-service, AI 카테고리)
        - AI 자동화 프로그램 (ID: ai-automation-program, Slug: ai-automation-program, AI 카테고리)
        - 프롬프트 설계(엔지니어링) (ID: prompt-engineering, Slug: prompt-engineering, AI 카테고리)
        - AI 모델링·최적화 (ID: ai-modeling-optimization, Slug: ai-modeling-optimization, AI 카테고리)
        - 이미지·음성 인식 (ID: image-voice-recognition, Slug: image-voice-recognition, AI 카테고리)
        - AI 기능 개발·연동 (ID: ai-feature-development-integration, Slug: ai-feature-development-integration, AI 카테고리)
        - AI 에이전트 (ID: ai-agent, Slug: ai-agent, AI 카테고리)
        - AI 데이터 분석 (ID: ai-data-analysis, Slug: ai-data-analysis, AI 카테고리)
        - AI 도입 컨설팅 (ID: ai-introduction-consulting, Slug: ai-introduction-consulting, AI 카테고리)
        - 자연어 처리 (ID: natural-language-processing, Slug: natural-language-processing, AI 카테고리)
    - AI 프롬프트 (ID: ai-prompt, Slug: ai-prompt, AI 카테고리)
        - AI 프롬프트 (ID: ai-prompt-child, Slug: ai-prompt-child, AI 카테고리)
    - AI 마케팅 (ID: ai-marketing, Slug: ai-marketing, AI 카테고리)
        - AI 마케팅 콘텐츠 (ID: ai-marketing-content, Slug: ai-marketing-content, AI 카테고리)
        - AI AEO·GEO (ID: ai-aeo-geo, Slug: ai-aeo-geo, AI 카테고리)
        - AI 숏폼 광고 제작 (ID: ai-short-form-ad-production, Slug: ai-short-form-ad-production, AI 카테고리)
        - AI 마케팅 컨설팅 (ID: ai-marketing-consulting, Slug: ai-marketing-consulting, AI 카테고리)
        - AI 마케팅 기타 (ID: ai-marketing-etc, Slug: ai-marketing-etc, AI 카테고리)
    - AI 영상 (ID: ai-video, Slug: ai-video, AI 카테고리)
        - AI 광고 영상 (ID: ai-ad-video, Slug: ai-ad-video, AI 카테고리)
        - AI 숏폼 영상 (ID: ai-short-form-video, Slug: ai-short-form-video, AI 카테고리)
        - AI 영상 편집·보정·자막 (ID: ai-video-editing-retouching-captioning, Slug: ai-video-editing-retouching-captioning, AI 카테고리)
    - AI 음향 (ID: ai-sound, Slug: ai-sound, AI 카테고리)
        - AI 음원 (ID: ai-music, Slug: ai-music, AI 카테고리)
        - AI 더빙·나레이션 (ID: ai-dubbing-narration, Slug: ai-dubbing-narration, AI 카테고리)
    - AI 콘텐츠 라이팅 (ID: ai-content-writing, Slug: ai-content-writing, AI 카테고리)
        - AI 콘텐츠 생산 (ID: ai-content-production, Slug: ai-content-production, AI 카테고리)
        - AI 콘텐츠 검수·편집 (ID: ai-content-review-editing, Slug: ai-content-review-editing, AI 카테고리)
    - AI 창업·수익화 (ID: ai-startup-monetization, Slug: ai-startup-monetization, AI 카테고리)
        - AI 사업·수익화 전자책 (ID: ai-business-monetization-ebook, Slug: ai-business-monetization-ebook, AI 카테고리)
        - AI 창업 자문 (ID: ai-startup-consulting, Slug: ai-startup-consulting, AI 카테고리)
        - AI 경영·운영 자문 (ID: ai-management-operation-consulting, Slug: ai-management-operation-consulting, AI 카테고리)
    - AI 취업·입시 (ID: ai-employment-admission, Slug: ai-employment-admission, AI 카테고리)
        - AI 취업·입시 컨설팅 (ID: ai-employment-admission-consulting, Slug: ai-employment-admission-consulting, AI 카테고리)
    - AI 교육 (ID: ai-education, Slug: ai-education, AI 카테고리)
        - AI 스킬 전자책 (ID: ai-skill-ebook, Slug: ai-skill-ebook, AI 카테고리)
        - AI 업무 활용 레슨 (ID: ai-work-utilization-lesson, Slug: ai-work-utilization-lesson, AI 카테고리)
        - AI 개발·분석 레슨 (ID: ai-development-analysis-lesson, Slug: ai-development-analysis-lesson, AI 카테고리)
        - AI 마케팅 레슨 (ID: ai-marketing-lesson, Slug: ai-marketing-lesson, AI 카테고리)
        - AI 콘텐츠 제작 레슨 (ID: ai-content-production-lesson, Slug: ai-content-production-lesson, AI 카테고리)
        - 기타 AI 레슨 (ID: etc-ai-lesson, Slug: etc-ai-lesson, AI 카테고리)
    - AI 통·번역 (ID: ai-translation-interpretation, Slug: ai-translation-interpretation, AI 카테고리)
        - AI 번역 검수·편집 (ID: ai-translation-review-editing, Slug: ai-translation-review-editing, AI 카테고리)
        - AI 통역 (ID: ai-interpretation, Slug: ai-interpretation, AI 카테고리)
- 디자인 (ID: design, Slug: design)
    - 그래픽 디자인 (ID: graphic-design, Slug: graphic-design)
        - 로고 디자인 (ID: logo-design, Slug: logo-design)
        - 명함 디자인 (ID: business-card, Slug: business-card)
        - 포스터 디자인 (ID: poster-design, Slug: poster-design)
        - 배너 디자인 (ID: banner-design, Slug: banner-design)
        - 인포그래픽 (ID: infographic, Slug: infographic)
        - PPT 디자인 (ID: ppt-design, Slug: ppt-design)
        - 썸네일 디자인 (ID: thumbnail-design, Slug: thumbnail-design)
        - SNS 디자인 (ID: social-media-design, Slug: social-media-design)
    - 웹/앱 디자인 (ID: web-app-design, Slug: web-app-design)
        - 웹사이트 디자인 (ID: website-design, Slug: website-design)
        - 랜딩페이지 (ID: landing-page, Slug: landing-page)
        - UI/UX 디자인 (ID: ui-ux-design, Slug: ui-ux-design)
        - 모바일 앱 디자인 (ID: mobile-app-design, Slug: mobile-app-design)
        - 반응형 디자인 (ID: responsive-design, Slug: responsive-design)
        - 대시보드 디자인 (ID: dashboard-design, Slug: dashboard-design)
    - 제품/패키지 디자인 (ID: product-package-design, Slug: product-package-design)
        - 패키지 디자인 (ID: packaging-design, Slug: packaging-design)
        - 라벨 디자인 (ID: label-design, Slug: label-design)
        - 제품 목업 (ID: product-mockup, Slug: product-mockup)
    - 인쇄/출판물 (ID: print-publishing, Slug: print-publishing)
        - 브로슈어 (ID: brochure-design, Slug: brochure-design)
        - 카탈로그 (ID: catalog-design, Slug: catalog-design)
        - 책 표지 (ID: book-cover, Slug: book-cover)
        - 잡지 레이아웃 (ID: magazine-layout, Slug: magazine-layout)
        - 메뉴판 디자인 (ID: menu-design, Slug: menu-design)
    - 3D/AR 디자인 (ID: 3d-ar-design, Slug: 3d-ar-design)
        - 3D 모델링 (ID: 3d-modeling, Slug: 3d-modeling)
        - 3D 렌더링 (ID: 3d-rendering, Slug: 3d-rendering)
        - CAD 설계 (ID: cad-design, Slug: cad-design)
        - AR 필터 (ID: ar-filter, Slug: ar-filter)
    - 패션 디자인 (ID: fashion-design, Slug: fashion-design)
        - 의류 디자인 (ID: clothing-design, Slug: clothing-design)
        - 텍스타일 패턴 (ID: textile-pattern, Slug: textile-pattern)
        - 액세서리 디자인 (ID: accessory-design, Slug: accessory-design)
- IT/프로그래밍 (ID: it-programming, Slug: it-programming)
    - 웹 개발 (ID: web-development, Slug: web-development)
        - 프론트엔드 (ID: frontend-dev, Slug: frontend-dev)
        - 백엔드 (ID: backend-dev, Slug: backend-dev)
        - 풀스택 (ID: fullstack-dev, Slug: fullstack-dev)
        - 워드프레스 (ID: wordpress-dev, Slug: wordpress-dev)
        - 쇼피파이 (ID: shopify-dev, Slug: shopify-dev)
        - WIX (ID: wix-dev, Slug: wix-dev)
        - 랜딩페이지 개발 (ID: landing-page-dev, Slug: landing-page-dev)
    - 모바일 앱 (ID: mobile-app-dev, Slug: mobile-app-dev)
        - 안드로이드 앱 (ID: android-app, Slug: android-app)
        - iOS 앱 (ID: ios-app, Slug: ios-app)
        - 하이브리드 앱 (ID: hybrid-app, Slug: hybrid-app)
        - Flutter (ID: flutter-app, Slug: flutter-app)
        - React Native (ID: react-native-app, Slug: react-native-app)
    - 소프트웨어 개발 (ID: software-dev, Slug: software-dev)
        - 데스크톱 앱 (ID: desktop-app, Slug: desktop-app)
        - API 개발 (ID: api-dev, Slug: api-dev)
        - 플러그인 개발 (ID: plugin-dev, Slug: plugin-dev)
        - 봇 개발 (ID: bot-dev, Slug: bot-dev)
    - 게임 개발 (ID: game-development, Slug: game-development)
        - Unity 개발 (ID: unity-dev, Slug: unity-dev)
        - Unreal 개발 (ID: unreal-dev, Slug: unreal-dev)
        - 모바일 게임 (ID: mobile-game, Slug: mobile-game)
        - 웹 게임 (ID: web-game, Slug: web-game)
    - 데이터 분석 (ID: data-analytics, Slug: data-analytics)
        - 데이터 분석 (ID: data-analysis, Slug: data-analysis)
        - 데이터 시각화 (ID: data-visualization, Slug: data-visualization)
        - 머신러닝 (ID: machine-learning, Slug: machine-learning)
        - 웹 크롤링 (ID: web-crawling, Slug: web-crawling)
        - 엑셀 자동화 (ID: excel-automation, Slug: excel-automation)
    - IT 지원 (ID: it-support, Slug: it-support)
        - 서버 호스팅 (ID: server-hosting, Slug: server-hosting)
        - DB 관리 (ID: database-admin, Slug: database-admin)
        - 기술 지원 (ID: tech-support, Slug: tech-support)
        - 보안 점검 (ID: security-audit, Slug: security-audit)
- 마케팅 (ID: marketing, Slug: marketing)
    - 디지털 광고 (ID: digital-advertising, Slug: digital-advertising)
        - 구글 광고 (ID: google-ads, Slug: google-ads)
        - 페이스북 광고 (ID: facebook-ads, Slug: facebook-ads)
        - 네이버 광고 (ID: naver-ads, Slug: naver-ads)
        - 카카오 광고 (ID: kakao-ads, Slug: kakao-ads)
        - 인스타그램 광고 (ID: instagram-ads, Slug: instagram-ads)
    - 콘텐츠 마케팅 (ID: content-marketing, Slug: content-marketing)
        - 블로그 운영 대행 (ID: blog-management, Slug: blog-management)
        - SEO 최적화 (ID: seo-optimization, Slug: seo-optimization)
        - 콘텐츠 기획 (ID: content-planning, Slug: content-planning)
        - 바이럴 마케팅 (ID: viral-marketing, Slug: viral-marketing)
    - SNS 마케팅 (ID: sns-marketing, Slug: sns-marketing)
        - 인스타그램 마케팅 (ID: instagram-marketing, Slug: instagram-marketing)
        - 유튜브 마케팅 (ID: youtube-marketing, Slug: youtube-marketing)
        - 페이스북 마케팅 (ID: facebook-marketing, Slug: facebook-marketing)
        - 틱톡 마케팅 (ID: tiktok-marketing, Slug: tiktok-marketing)
        - 네이버 블로그 (ID: naver-blog-marketing, Slug: naver-blog-marketing)
    - 브랜딩/CI (ID: branding-ci, Slug: branding-ci)
        - 브랜드 아이덴티티 (ID: brand-identity, Slug: brand-identity)
        - 네이밍 (ID: naming, Slug: naming)
        - 브랜드 스토리 (ID: brand-story, Slug: brand-story)
        - 슬로건 (ID: slogan, Slug: slogan)
    - 인플루언서 마케팅 (ID: influencer-marketing, Slug: influencer-marketing)
        - 인플루언서 매칭 (ID: influencer-matching, Slug: influencer-matching)
        - 제품 리뷰 (ID: product-review, Slug: product-review)
        - 스폰서 콘텐츠 (ID: sponsored-content, Slug: sponsored-content)
- 영상/사진 (ID: video-photo, Slug: video-photo)
    - 영상 편집 (ID: video-editing, Slug: video-editing)
        - 유튜브 영상 편집 (ID: youtube-editing, Slug: youtube-editing)
        - 숏폼 영상 편집 (ID: shorts-editing, Slug: shorts-editing)
        - 브이로그 편집 (ID: vlog-editing, Slug: vlog-editing)
        - 웨딩 영상 (ID: wedding-video, Slug: wedding-video)
        - 행사 영상 (ID: event-video, Slug: event-video)
    - 영상 제작 (ID: video-production, Slug: video-production)
        - 홍보 영상 (ID: promotional-video, Slug: promotional-video)
        - 제품 영상 (ID: product-video, Slug: product-video)
        - 드론 촬영 (ID: drone-filming, Slug: drone-filming)
        - 뮤직비디오 (ID: music-video, Slug: music-video)
    - 애니메이션/모션 (ID: animation-motion, Slug: animation-motion)
        - 모션그래픽 (ID: motion-graphics, Slug: motion-graphics)
        - 2D 애니메이션 (ID: 2d-animation, Slug: 2d-animation)
        - 3D 애니메이션 (ID: 3d-animation, Slug: 3d-animation)
        - 화이트보드 애니메이션 (ID: whiteboard-animation, Slug: whiteboard-animation)
    - 사진 촬영 (ID: photography, Slug: photography)
        - 제품 사진 (ID: product-photography, Slug: product-photography)
        - 프로필 사진 (ID: profile-photography, Slug: profile-photography)
        - 음식 사진 (ID: food-photography, Slug: food-photography)
        - 행사 사진 (ID: event-photography, Slug: event-photography)
        - 웨딩 촬영 (ID: wedding-photography, Slug: wedding-photography)
    - 사진 편집 (ID: photo-editing, Slug: photo-editing)
        - 사진 보정 (ID: photo-retouching, Slug: photo-retouching)
        - 배경 제거 (ID: background-removal, Slug: background-removal)
        - 사진 복원 (ID: photo-restoration, Slug: photo-restoration)
- 번역/통역 (ID: translation, Slug: translation)
    - 문서 번역 (ID: document-translation, Slug: document-translation)
        - 영어 번역 (ID: english-translation, Slug: english-translation)
        - 중국어 번역 (ID: chinese-translation, Slug: chinese-translation)
        - 일본어 번역 (ID: japanese-translation, Slug: japanese-translation)
        - 스페인어 번역 (ID: spanish-translation, Slug: spanish-translation)
        - 프랑스어 번역 (ID: french-translation, Slug: french-translation)
        - 독일어 번역 (ID: german-translation, Slug: german-translation)
    - 영상 번역 (ID: media-translation, Slug: media-translation)
        - 자막 번역 (ID: subtitle-translation, Slug: subtitle-translation)
        - 더빙 (ID: dubbing, Slug: dubbing)
        - 음성 텍스트 변환 (ID: transcription, Slug: transcription)
    - 전문 분야 번역 (ID: professional-translation, Slug: professional-translation)
        - 법률 번역 (ID: legal-translation, Slug: legal-translation)
        - 의료 번역 (ID: medical-translation, Slug: medical-translation)
        - 기술 번역 (ID: technical-translation, Slug: technical-translation)
        - 학술 번역 (ID: academic-translation, Slug: academic-translation)
    - 통역 (ID: interpretation, Slug: interpretation)
        - 동시통역 (ID: simultaneous-interpretation, Slug: simultaneous-interpretation)
        - 순차통역 (ID: consecutive-interpretation, Slug: consecutive-interpretation)
        - 비즈니스 통역 (ID: business-interpretation, Slug: business-interpretation)
- 문서/글쓰기 (ID: writing, Slug: writing)
    - 콘텐츠 작성 (ID: content-writing, Slug: content-writing)
        - 블로그 포스팅 (ID: blog-posting, Slug: blog-posting)
        - 기사 작성 (ID: article-writing, Slug: article-writing)
        - 상품 설명 (ID: product-description, Slug: product-description)
        - 카피라이팅 (ID: copywriting, Slug: copywriting)
        - 보도자료 (ID: press-release, Slug: press-release)
        - 스크립트 작성 (ID: script-writing, Slug: script-writing)
    - 비즈니스 문서 (ID: business-documents, Slug: business-documents)
        - 사업계획서 (ID: business-plan, Slug: business-plan)
        - 제안서 작성 (ID: proposal-writing, Slug: proposal-writing)
        - 보고서 작성 (ID: report-writing, Slug: report-writing)
        - 프레젠테이션 (ID: presentation, Slug: presentation)
    - 학술 문서 (ID: academic-documents, Slug: academic-documents)
        - 논문 교정 (ID: thesis-editing, Slug: thesis-editing)
        - 연구 보고서 (ID: research-paper, Slug: research-paper)
        - 에세이 (ID: essay-writing, Slug: essay-writing)
        - 이력서/자소서 (ID: cv-resume, Slug: cv-resume)
    - 창작 글쓰기 (ID: creative-writing, Slug: creative-writing)
        - 소설 (ID: novel-writing, Slug: novel-writing)
        - 시나리오 (ID: scenario-writing, Slug: scenario-writing)
        - 웹툰 스토리 (ID: webtoon-story, Slug: webtoon-story)
        - 시/수필 (ID: poetry, Slug: poetry)
- 음악/오디오 (ID: music-audio, Slug: music-audio)
    - 음악 제작 (ID: music-production, Slug: music-production)
        - 작곡 (ID: music-composition, Slug: music-composition)
        - 편곡 (ID: music-arrangement, Slug: music-arrangement)
        - BGM 제작 (ID: bgm-production, Slug: bgm-production)
        - 징글/CM송 (ID: jingle-production, Slug: jingle-production)
    - 오디오 작업 (ID: audio-production, Slug: audio-production)
        - 믹싱/마스터링 (ID: mixing-mastering, Slug: mixing-mastering)
        - 효과음 제작 (ID: sound-effects, Slug: sound-effects)
        - 오디오 편집 (ID: audio-editing, Slug: audio-editing)
        - 팟캐스트 편집 (ID: podcast-editing, Slug: podcast-editing)
    - 보이스/나레이션 (ID: voice-narration, Slug: voice-narration)
        - 성우/나레이션 (ID: voice-over, Slug: voice-over)
        - ARS 녹음 (ID: ars-recording, Slug: ars-recording)
        - 오디오북 (ID: audiobook, Slug: audiobook)
- 비즈니스 (ID: business, Slug: business)
    - 컨설팅 (ID: consulting, Slug: consulting)
        - 창업 컨설팅 (ID: startup-consulting, Slug: startup-consulting)
        - 경영 컨설팅 (ID: management-consulting, Slug: management-consulting)
        - 마케팅 컨설팅 (ID: marketing-consulting, Slug: marketing-consulting)
        - 인사 컨설팅 (ID: hr-consulting, Slug: hr-consulting)
    - 재무/회계 (ID: finance-accounting, Slug: finance-accounting)
        - 장부 기장 (ID: bookkeeping, Slug: bookkeeping)
        - 세무 서비스 (ID: tax-service, Slug: tax-service)
        - 재무 설계 (ID: financial-planning, Slug: financial-planning)
        - 투자 컨설팅 (ID: investment-consulting, Slug: investment-consulting)
    - 법률 서비스 (ID: legal-services, Slug: legal-services)
        - 법률 자문 (ID: legal-consulting, Slug: legal-consulting)
        - 특허/상표 (ID: patent-trademark, Slug: patent-trademark)
        - 계약서 작성 (ID: contract-drafting, Slug: contract-drafting)
    - 비즈니스 지원 (ID: business-support, Slug: business-support)
        - 가상 비서 (ID: virtual-assistant, Slug: virtual-assistant)
        - 데이터 입력 (ID: data-entry, Slug: data-entry)
        - 시장 조사 (ID: market-research, Slug: market-research)
- 라이프스타일 (ID: lifestyle, Slug: lifestyle)
    - 온라인 레슨 (ID: online-lessons, Slug: online-lessons)
        - 외국어 레슨 (ID: language-lesson, Slug: language-lesson)
        - 음악 레슨 (ID: music-lesson, Slug: music-lesson)
        - 미술 레슨 (ID: art-lesson, Slug: art-lesson)
        - 요리 레슨 (ID: cooking-lesson, Slug: cooking-lesson)
        - 코딩 레슨 (ID: coding-lesson, Slug: coding-lesson)
    - 건강/웰니스 (ID: health-wellness, Slug: health-wellness)
        - 피트니스 트레이닝 (ID: fitness-training, Slug: fitness-training)
        - 다이어트 상담 (ID: diet-consulting, Slug: diet-consulting)
        - 요가/필라테스 (ID: yoga-pilates, Slug: yoga-pilates)
        - 명상 (ID: meditation, Slug: meditation)
    - 코칭/상담 (ID: coaching-counseling, Slug: coaching-counseling)
        - 라이프 코칭 (ID: life-coaching, Slug: life-coaching)
        - 커리어 코칭 (ID: career-coaching, Slug: career-coaching)
        - 관계 상담 (ID: relationship-counseling, Slug: relationship-counseling)
        - 심리 상담 (ID: psychological-counseling, Slug: psychological-counseling)
    - 운세/타로 (ID: astrology-fortune, Slug: astrology-fortune)
        - 타로 리딩 (ID: tarot-reading, Slug: tarot-reading)
        - 사주/운세 (ID: fortune-telling, Slug: fortune-telling)
        - 작명 (ID: naming-service, Slug: naming-service)
- 이벤트 (ID: event, Slug: event)
    - 행사 기획 (ID: event-planning, Slug: event-planning)
        - 웨딩 플래닝 (ID: wedding-planning, Slug: wedding-planning)
        - 생일 파티 (ID: birthday-party, Slug: birthday-party)
        - 기업 행사 (ID: corporate-event, Slug: corporate-event)
        - 세미나/컨퍼런스 (ID: seminar-conference, Slug: seminar-conference)
    - 행사 서비스 (ID: event-services, Slug: event-services)
        - 사회/진행 (ID: mc-hosting, Slug: mc-hosting)
        - 공연 (ID: performance, Slug: performance)
        - DJ 서비스 (ID: dj-service, Slug: dj-service)
        - 케이터링 (ID: catering, Slug: catering)
- 취미/핸드메이드 (ID: hobby-handmade, Slug: hobby-handmade)
    - 핸드메이드 (ID: handmade-craft, Slug: handmade-craft)
        - 맞춤 제작 (ID: custom-goods, Slug: custom-goods)
        - 액세서리 (ID: jewelry-making, Slug: jewelry-making)
        - 도자기 (ID: pottery, Slug: pottery)
        - 뜨개질 (ID: knitting, Slug: knitting)
    - 선물/기념품 (ID: gift-items, Slug: gift-items)
        - 개인화 선물 (ID: personalized-gift, Slug: personalized-gift)
        - 선물 포장 (ID: gift-wrapping, Slug: gift-wrapping)
        - 꽃꽂이 (ID: flower-arrangement, Slug: flower-arrangement)
    - 게임 (ID: gaming, Slug: gaming)
        - 게임 코칭 (ID: game-coaching, Slug: game-coaching)
        - 레벨링 대행 (ID: game-leveling, Slug: game-leveling)
        - 게임 계정 (ID: game-account, Slug: game-account)
- 뷰티/패션 (ID: beauty-fashion, Slug: beauty-fashion)
    - 뷰티 서비스 (ID: beauty-services, Slug: beauty-services)
        - 메이크업 (ID: makeup, Slug: makeup)
        - 헤어 스타일링 (ID: hair-styling, Slug: hair-styling)
        - 네일아트 (ID: nail-art, Slug: nail-art)
    - 패션 스타일링 (ID: fashion-styling, Slug: fashion-styling)
        - 퍼스널 컬러 (ID: personal-color, Slug: personal-color)
        - 스타일링 컨설팅 (ID: styling-consulting, Slug: styling-consulting)
- 상담/코칭 (ID: counseling-coaching, Slug: counseling-coaching)
    - 라이프 코칭 (ID: life-coaching, Slug: life-coaching)
        - 커리어 코칭 (ID: career-coaching, Slug: career-coaching)
        - 관계 상담 (ID: relationship-counseling, Slug: relationship-counseling)
    - 심리 상담 (ID: psychological-counseling, Slug: psychological-counseling)
        - 스트레스 관리 (ID: stress-management, Slug: stress-management)
        - 감정 치유 (ID: emotional-healing, Slug: emotional-healing)
- 운세/타로 (ID: fortune-tarot, Slug: fortune-tarot)
    - 타로 리딩 (ID: tarot-reading, Slug: tarot-reading)
        - 연애운 타로 (ID: love-tarot, Slug: love-tarot)
        - 직업운 타로 (ID: career-tarot, Slug: career-tarot)
    - 사주/운세 (ID: fortune-telling, Slug: fortune-telling)
        - 사주 풀이 (ID: saju-reading, Slug: saju-reading)
        - 작명/개명 (ID: naming, Slug: naming)
- 전자책/템플릿 (ID: ebook-template, Slug: ebook-template)
    - 전자책 (ID: ebook, Slug: ebook)
        - 전자책 제작 (ID: ebook-creation, Slug: ebook-creation)
        - 전자책 출판 (ID: ebook-publishing, Slug: ebook-publishing)
    - 템플릿 (ID: templates, Slug: templates)
        - PPT 템플릿 (ID: ppt-template, Slug: ppt-template)
        - 엑셀 템플릿 (ID: excel-template, Slug: excel-template)
        - 노션 템플릿 (ID: notion-template, Slug: notion-template)
- 세무/법무/노무 (ID: tax-legal-labor, Slug: tax-legal-labor)
    - 세무 서비스 (ID: tax-service, Slug: tax-service)
        - 세금 신고 (ID: tax-return, Slug: tax-return)
        - 세무 상담 (ID: tax-consulting, Slug: tax-consulting)
    - 법무 서비스 (ID: legal-service, Slug: legal-service)
        - 계약서 검토 (ID: contract-review, Slug: contract-review)
        - 법률 상담 (ID: legal-consulting, Slug: legal-consulting)
- 주문제작 (ID: custom-order, Slug: custom-order)
    - 굿즈 제작 (ID: custom-goods, Slug: custom-goods)
        - 티셔츠 제작 (ID: tshirt-making, Slug: tshirt-making)
        - 머그컵 제작 (ID: mug-making, Slug: mug-making)
        - 스티커 제작 (ID: sticker-making, Slug: sticker-making)
    - 인쇄물 (ID: printing, Slug: printing)
        - 명함 인쇄 (ID: business-card, Slug: business-card)
        - 포스터 인쇄 (ID: poster-printing, Slug: poster-printing)
- 취업/입시 (ID: career-admission, Slug: career-admission)
    - 취업 준비 (ID: job-preparation, Slug: job-preparation)
        - 이력서 작성 (ID: resume-writing, Slug: resume-writing)
        - 면접 코칭 (ID: interview-coaching, Slug: interview-coaching)
        - 포트폴리오 제작 (ID: portfolio-making, Slug: portfolio-making)
    - 입시 준비 (ID: admission-prep, Slug: admission-prep)
        - 대입 컨설팅 (ID: college-consulting, Slug: college-consulting)
        - 자소서 작성 (ID: essay-writing, Slug: essay-writing)
- 직무역량 (ID: job-skills, Slug: job-skills)
    - 오피스 스킬 (ID: office-skills, Slug: office-skills)
        - 엑셀 교육 (ID: excel-training, Slug: excel-training)
        - PPT 교육 (ID: ppt-training, Slug: ppt-training)
    - 비즈니스 스킬 (ID: business-skills, Slug: business-skills)
        - 프레젠테이션 (ID: presentation-skill, Slug: presentation-skill)
        - 협상 스킬 (ID: negotiation-skill, Slug: negotiation-skill)
```

---

## 주요 환경변수 (.env)

```bash
# Application
NODE_ENV=production
PORT=4000
APP_URL=https://ai-talent-hub.co.kr

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_talent_platform"
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-secret-key-32-chars-minimum
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret-32-chars
REFRESH_TOKEN_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=ai-talent-hub-prod

# Payment (Toss Payments)
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
TOSS_WEBHOOK_SECRET=

# Email (AWS SES)
EMAIL_FROM=noreply@ai-talent-hub.co.kr
AWS_SES_REGION=ap-northeast-2

# Google
GOOGLE_ANALYTICS_ID=
GOOGLE_RECAPTCHA_SITE_KEY=
GOOGLE_RECAPTCHA_SECRET_KEY=

# Monitoring
SENTRY_DSN=
DATADOG_API_KEY=

# Security
CORS_ORIGIN=https://ai-talent-hub.co.kr
SESSION_SECRET=your-session-secret-32-chars
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=60
```

---

## 결론

이 명세서는 한국 시장을 타겟으로 하는 AI 재능 거래 플랫폼의 완전한 개발 가이드입니다.

### 핵심 차별화 요소
1. **AI 재능 특화**: 시장에서 가장 빠르게 성장하는 AI 서비스에 집중
2. **강력한 광고 시스템**: 판매자 수익과 플랫폼 수익의 균형
3. **신뢰할 수 있는 거래**: 체계적인 분쟁 해결 및 환불 시스템
4. **확장 가능한 구조**: 마이크로서비스로 쉽게 전환 가능

### 예상 성과
- **MVP 출시**: 4개월
- **초기 사용자 목표**: 6개월 내 판매자 1,000명, 구매자 10,000명
- **거래액 목표**: 월 1억원 (1년 차)
- **수익 목표**: 월 2,000만원 (수수료 20%)

이 플랫폼은 AI 기술의 대중화와 함께 급성장할 수 있는 잠재력을 가지고 있으며, 체계적인 개발과 운영을 통해 국내 대표 AI 재능 거래 플랫폼으로 성장할 수 있을 것입니다.