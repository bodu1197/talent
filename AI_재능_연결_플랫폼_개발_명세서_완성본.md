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
- UI Components: Shadcn/ui
- Icons: Lucide React
- Animation: Framer Motion
- Form Handling: React Hook Form + Zod
- Data Fetching: TanStack Query
- Image Optimization: Next/Image + Sharp
- SEO: Next SEO
```

### 백엔드
```
- Framework: NestJS (엔터프라이즈급 구조)
- Language: TypeScript
- ORM: Prisma
- Validation: Class-validator + Class-transformer
- Authentication: JWT + Passport.js
- Authorization: CASL
- API Documentation: Swagger/OpenAPI
- Rate Limiting: @nestjs/throttler
- Security: Helmet.js
- Logging: Winston + Morgan
- Queue: Bull (Redis 기반)
- File Upload: Multer + Sharp
```

### 데이터베이스
```
- Primary DB: PostgreSQL 15+
- Cache: Redis
- Search: PostgreSQL Full-text search + pg_trgm
- Session Store: Redis
- File Storage: AWS S3 (프로덕션) / Local (개발)
```

### 인프라 & DevOps
```
- Container: Docker + Docker Compose
- Web Server: Nginx (리버스 프록시)
- Process Manager: PM2
- Monitoring: Sentry (에러) + Google Analytics (사용자)
- CI/CD: GitHub Actions
- Testing: Jest (단위) + Supertest (통합) + Cypress (E2E)
```

### 실시간 통신
```
- WebSocket: Socket.io
- 용도: 실시간 알림, 채팅, 주문 상태 업데이트
```

### 결제
```
- PG사: 토스페이먼츠 (주 결제)
- 부가 결제: 카카오페이, 네이버페이
- 정산: 자동 정산 시스템
```

---

## 데이터베이스 스키마 (완전판)

### 1. 사용자 관리 테이블

#### users (사용자)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(20) CHECK (user_type IN ('buyer', 'seller', 'both', 'admin')) DEFAULT 'buyer',
    profile_image VARCHAR(500),
    bio TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    deleted_at TIMESTAMP, -- Soft delete
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_active ON users(is_active, deleted_at);
```

#### seller_profiles (판매자 프로필)
```sql
CREATE TABLE seller_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    business_name VARCHAR(100),
    business_number VARCHAR(50), -- 사업자번호
    business_verified BOOLEAN DEFAULT FALSE,
    bank_name VARCHAR(50),
    bank_account VARCHAR(50),
    account_holder VARCHAR(100),
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
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seller_profiles_user ON seller_profiles(user_id);
CREATE INDEX idx_seller_profiles_verified ON seller_profiles(is_verified, business_verified);
```

#### admins (관리자)
```sql
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'cs_agent')),
    permissions JSONB DEFAULT '{}',
    department VARCHAR(50),
    notes TEXT,
    last_action_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admins_user ON admins(user_id);
CREATE INDEX idx_admins_role ON admins(role);
```

### 2. 카테고리 및 서비스 테이블

#### categories (카테고리 - 계층 구조)
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
    icon VARCHAR(50),
    description TEXT,
    meta_title VARCHAR(200),
    meta_description TEXT,
    keywords TEXT[],
    display_order INTEGER DEFAULT 0,
    service_count INTEGER DEFAULT 0,
    is_ai_category BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    commission_rate DECIMAL(5,2) DEFAULT 20.00, -- 카테고리별 수수료율
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_level ON categories(level);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_ai ON categories(is_ai_category, is_active);
CREATE INDEX idx_categories_featured ON categories(is_featured, is_active);
```

#### services (재능/서비스)
```sql
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT, -- 구매자 요구사항

    -- 가격 정보
    price INTEGER NOT NULL,
    price_unit VARCHAR(20) DEFAULT 'project', -- project, hour, revision

    -- 작업 정보
    delivery_days INTEGER NOT NULL,
    revision_count INTEGER DEFAULT 1,
    express_delivery BOOLEAN DEFAULT FALSE,
    express_days INTEGER,
    express_price INTEGER,

    -- 이미지/포트폴리오
    thumbnail_url VARCHAR(500),
    portfolio_urls TEXT[],
    video_url VARCHAR(500),

    -- 통계
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    orders INTEGER DEFAULT 0,
    in_progress_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,

    -- 상태
    status VARCHAR(20) DEFAULT 'draft', -- draft, pending_review, active, suspended, deleted
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP,

    -- SEO
    meta_title VARCHAR(200),
    meta_description TEXT,

    -- 버전 관리
    version INTEGER DEFAULT 1,
    last_modified_by INTEGER REFERENCES users(id),

    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_seller ON services(seller_id);
CREATE INDEX idx_services_status ON services(status, deleted_at);
CREATE INDEX idx_services_active ON services(status, is_featured, created_at DESC);
CREATE INDEX idx_services_rating ON services(rating DESC, review_count DESC);
CREATE INDEX idx_services_slug ON services(slug);
```

#### service_versions (서비스 버전 이력)
```sql
CREATE TABLE service_versions (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES services(id),
    version INTEGER NOT NULL,
    title VARCHAR(200),
    description TEXT,
    price INTEGER,
    changes JSONB,
    modified_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_versions_service ON service_versions(service_id, version DESC);
```

#### ai_services (AI 재능 전용 정보)
```sql
CREATE TABLE ai_services (
    id SERIAL PRIMARY KEY,
    service_id INTEGER UNIQUE NOT NULL REFERENCES services(id) ON DELETE CASCADE,

    -- AI 도구 정보
    ai_tools TEXT[], -- ["Midjourney", "ChatGPT", "Stable Diffusion"]
    ai_model VARCHAR(100), -- "GPT-4", "Midjourney v6"
    ai_version VARCHAR(50),

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
    expert_level VARCHAR(20) CHECK (expert_level IN ('starter', 'professional', 'master')) DEFAULT 'starter',
    certified_at TIMESTAMP,
    certification_score DECIMAL(5,2),
    portfolio_quality_score DECIMAL(3,2),

    -- 통계
    avg_generation_count INTEGER DEFAULT 5,
    success_rate DECIMAL(5,2) DEFAULT 100.00,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_services_service ON ai_services(service_id);
CREATE INDEX idx_ai_services_level ON ai_services(expert_level);
CREATE INDEX idx_ai_services_tools ON ai_services USING GIN(ai_tools);
```

### 3. 광고 및 프리미엄 배치 테이블

#### advertising_campaigns (광고 캠페인)
```sql
CREATE TABLE advertising_campaigns (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(id),
    campaign_name VARCHAR(200) NOT NULL,
    campaign_type VARCHAR(50) NOT NULL, -- 'premium_placement', 'sponsored_search', 'banner'

    -- 예산 관리
    daily_budget INTEGER,
    total_budget INTEGER,
    spent_amount INTEGER DEFAULT 0,

    -- 타겟팅
    target_categories INTEGER[],
    target_keywords TEXT[],
    target_user_types VARCHAR(20)[], -- ['buyer', 'seller', 'both']

    -- 입찰
    bid_type VARCHAR(20) DEFAULT 'cpc', -- cpc, cpm, fixed
    bid_amount INTEGER NOT NULL,

    -- 기간
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,

    -- 상태
    status VARCHAR(20) DEFAULT 'draft', -- draft, pending, active, paused, completed, cancelled
    approval_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    rejection_reason TEXT,

    -- 성과
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    ctr DECIMAL(5,2) DEFAULT 0.00, -- Click Through Rate
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    roi DECIMAL(10,2) DEFAULT 0.00,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_seller ON advertising_campaigns(seller_id);
CREATE INDEX idx_campaigns_status ON advertising_campaigns(status, approval_status);
CREATE INDEX idx_campaigns_dates ON advertising_campaigns(start_date, end_date);
```

#### premium_placements (프리미엄 배치 상세)
```sql
CREATE TABLE premium_placements (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES advertising_campaigns(id),
    service_id INTEGER NOT NULL REFERENCES services(id),

    -- 배치 정보
    placement_type VARCHAR(50) NOT NULL, -- 'home_hero', 'home_top', 'category_top', 'search_top'
    placement_slot INTEGER, -- 슬롯 번호 (1-10)
    category_id INTEGER REFERENCES categories(id),
    keywords TEXT[],

    -- 노출 위치
    position_score INTEGER DEFAULT 0, -- 순위 점수
    display_priority INTEGER DEFAULT 0,

    -- 기간 및 비용
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
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
    paused_at TIMESTAMP,
    paused_reason TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_premium_active ON premium_placements(is_active, start_date, end_date);
CREATE INDEX idx_premium_service ON premium_placements(service_id);
CREATE INDEX idx_premium_campaign ON premium_placements(campaign_id);
CREATE INDEX idx_premium_type ON premium_placements(placement_type, category_id);
CREATE INDEX idx_premium_position ON premium_placements(position_score DESC, display_priority DESC);
```

#### advertising_analytics (광고 분석)
```sql
CREATE TABLE advertising_analytics (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES advertising_campaigns(id),
    placement_id INTEGER REFERENCES premium_placements(id),

    -- 일자별 집계
    date DATE NOT NULL,
    hour INTEGER, -- 0-23, NULL for daily aggregate

    -- 성과 지표
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    cost INTEGER DEFAULT 0,
    revenue BIGINT DEFAULT 0,

    -- 상세 지표
    unique_viewers INTEGER DEFAULT 0,
    avg_position DECIMAL(5,2),
    quality_score DECIMAL(3,2), -- 품질 점수 (0-10)

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ad_analytics_campaign ON advertising_analytics(campaign_id, date DESC);
CREATE INDEX idx_ad_analytics_date ON advertising_analytics(date, hour);
```

### 4. 주문 및 결제 테이블

#### orders (주문)
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- YYYYMMDD-XXXXXX
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    seller_id INTEGER NOT NULL REFERENCES users(id),
    service_id INTEGER NOT NULL REFERENCES services(id),

    -- 주문 정보
    title VARCHAR(200) NOT NULL,
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
    seller_amount INTEGER NOT NULL, -- 판매자 수령액

    -- 작업 정보
    delivery_date DATE NOT NULL,
    revision_count INTEGER DEFAULT 1,
    used_revisions INTEGER DEFAULT 0,

    -- 상태
    status VARCHAR(30) DEFAULT 'pending_payment',
    -- pending_payment, paid, in_progress, delivered, revision_requested, completed, cancelled, refund_requested, refunded

    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, refunded
    work_status VARCHAR(20) DEFAULT 'waiting', -- waiting, working, delivered, accepted

    -- 날짜
    paid_at TIMESTAMP,
    started_at TIMESTAMP,
    delivered_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    auto_complete_at TIMESTAMP, -- 자동 완료 예정일

    -- 평가
    buyer_satisfied BOOLEAN,
    seller_rating INTEGER CHECK (seller_rating >= 1 AND seller_rating <= 5),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_service ON orders(service_id);
CREATE INDEX idx_orders_status ON orders(status, payment_status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_dates ON orders(created_at DESC);
```

#### payments (결제)
```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    transaction_id VARCHAR(100) UNIQUE NOT NULL, -- PG사 거래 ID

    -- 결제 정보
    payment_method VARCHAR(50) NOT NULL, -- card, bank_transfer, kakao_pay, naver_pay
    pg_provider VARCHAR(50) NOT NULL, -- toss_payments, kakao_pay, naver_pay

    -- 금액
    amount INTEGER NOT NULL,
    vat INTEGER DEFAULT 0,

    -- 카드 정보 (카드 결제시)
    card_company VARCHAR(50),
    card_number_masked VARCHAR(20), -- 1234-****-****-5678
    installment_months INTEGER DEFAULT 0,

    -- 상태
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, cancelled, refunded

    -- PG 응답
    pg_response JSONB,
    approval_number VARCHAR(50),

    -- 날짜
    paid_at TIMESTAMP,
    failed_at TIMESTAMP,
    cancelled_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);
```

#### refunds (환불)
```sql
CREATE TABLE refunds (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    payment_id INTEGER NOT NULL REFERENCES payments(id),

    -- 환불 정보
    refund_amount INTEGER NOT NULL,
    refund_reason VARCHAR(100) NOT NULL,
    refund_description TEXT,

    -- 수수료 처리
    commission_refund INTEGER DEFAULT 0,
    seller_penalty INTEGER DEFAULT 0,

    -- 상태
    status VARCHAR(20) DEFAULT 'requested', -- requested, approved, rejected, completed
    approval_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected

    -- 처리 정보
    requested_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES admins(id),
    rejection_reason TEXT,

    -- PG 정보
    pg_refund_id VARCHAR(100),
    pg_response JSONB,

    -- 날짜
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    completed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refunds_order ON refunds(order_id);
CREATE INDEX idx_refunds_payment ON refunds(payment_id);
CREATE INDEX idx_refunds_status ON refunds(status);
```

### 5. 정산 테이블

#### settlements (정산)
```sql
CREATE TABLE settlements (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(id),

    -- 정산 기간
    settlement_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- 금액
    total_sales BIGINT DEFAULT 0,
    total_commission BIGINT DEFAULT 0,
    total_refunds BIGINT DEFAULT 0,
    adjustments BIGINT DEFAULT 0, -- 조정 금액
    settlement_amount BIGINT NOT NULL, -- 최종 정산액

    -- 상태
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, paid, failed

    -- 지급 정보
    bank_name VARCHAR(50),
    bank_account VARCHAR(50),
    account_holder VARCHAR(100),

    -- 처리 정보
    confirmed_at TIMESTAMP,
    paid_at TIMESTAMP,
    payment_proof VARCHAR(500), -- 지급 증빙

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settlements_seller ON settlements(seller_id);
CREATE INDEX idx_settlements_date ON settlements(settlement_date);
CREATE INDEX idx_settlements_status ON settlements(status);
```

#### settlement_details (정산 상세)
```sql
CREATE TABLE settlement_details (
    id SERIAL PRIMARY KEY,
    settlement_id INTEGER NOT NULL REFERENCES settlements(id),
    order_id INTEGER NOT NULL REFERENCES orders(id),

    -- 금액 정보
    order_amount INTEGER NOT NULL,
    commission_amount INTEGER NOT NULL,
    seller_amount INTEGER NOT NULL,

    -- 유형
    type VARCHAR(20) DEFAULT 'order', -- order, refund, adjustment
    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settlement_details_settlement ON settlement_details(settlement_id);
CREATE INDEX idx_settlement_details_order ON settlement_details(order_id);
```

### 6. 리뷰 및 평가 테이블

#### reviews (리뷰)
```sql
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    order_id INTEGER UNIQUE NOT NULL REFERENCES orders(id),
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    seller_id INTEGER NOT NULL REFERENCES users(id),
    service_id INTEGER NOT NULL REFERENCES services(id),

    -- 평가
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

    -- 상세 평가
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),

    -- 리뷰 내용
    comment TEXT,
    tags TEXT[], -- ['친절해요', '전문적이에요', '빨라요']
    images TEXT[],

    -- 판매자 답변
    seller_reply TEXT,
    seller_reply_at TIMESTAMP,

    -- 도움됨 투표
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,

    -- 상태
    is_visible BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    moderated BOOLEAN DEFAULT FALSE,
    moderation_reason TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_service ON reviews(service_id);
CREATE INDEX idx_reviews_seller ON reviews(seller_id);
CREATE INDEX idx_reviews_buyer ON reviews(buyer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC, created_at DESC);
CREATE INDEX idx_reviews_visible ON reviews(is_visible, is_featured);
```

### 7. 커뮤니케이션 테이블

#### conversations (대화방)
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    participant1_id INTEGER NOT NULL REFERENCES users(id),
    participant2_id INTEGER NOT NULL REFERENCES users(id),

    -- 상태
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMP,
    last_message_preview TEXT,

    -- 읽음 상태
    participant1_last_read TIMESTAMP,
    participant2_last_read TIMESTAMP,
    participant1_unread_count INTEGER DEFAULT 0,
    participant2_unread_count INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_order ON conversations(order_id);
CREATE INDEX idx_conversations_participants ON conversations(participant1_id, participant2_id);
CREATE INDEX idx_conversations_active ON conversations(is_active, last_message_at DESC);
```

#### messages (메시지)
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id),
    sender_id INTEGER NOT NULL REFERENCES users(id),

    -- 메시지 내용
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, file, system
    content TEXT,
    attachments JSONB, -- [{url, name, size, type}]

    -- 상태
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

#### notifications (알림)
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),

    -- 알림 정보
    type VARCHAR(50) NOT NULL, -- order_received, message_received, payment_completed, etc.
    title VARCHAR(200) NOT NULL,
    content TEXT,
    data JSONB, -- 관련 데이터 (order_id, message_id 등)

    -- 링크
    link_url VARCHAR(500),

    -- 상태
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_pushed BOOLEAN DEFAULT FALSE, -- 푸시 알림 발송 여부
    pushed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### 8. 신고 및 분쟁 테이블

#### reports (신고)
```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL REFERENCES users(id),

    -- 신고 대상
    reported_user_id INTEGER REFERENCES users(id),
    reported_service_id INTEGER REFERENCES services(id),
    reported_order_id INTEGER REFERENCES orders(id),
    reported_review_id INTEGER REFERENCES reviews(id),

    -- 신고 내용
    report_type VARCHAR(50) NOT NULL,
    -- spam, fraud, inappropriate_content, copyright, quality_issue, non_delivery

    report_reason VARCHAR(200) NOT NULL,
    description TEXT,
    evidence_urls TEXT[],

    -- 처리
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewing, resolved, rejected
    severity VARCHAR(20) DEFAULT 'low', -- low, medium, high, critical

    -- 처리 정보
    assigned_to INTEGER REFERENCES admins(id),
    admin_notes TEXT,
    action_taken TEXT,

    -- 날짜
    assigned_at TIMESTAMP,
    resolved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX idx_reports_status ON reports(status, severity);
CREATE INDEX idx_reports_type ON reports(report_type);
```

#### disputes (분쟁)
```sql
CREATE TABLE disputes (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    initiated_by INTEGER NOT NULL REFERENCES users(id),

    -- 분쟁 정보
    dispute_type VARCHAR(50) NOT NULL, -- quality, non_delivery, delay, communication
    reason TEXT NOT NULL,
    requested_action VARCHAR(50), -- refund, revision, compensation

    -- 증거
    evidence_description TEXT,
    evidence_urls TEXT[],

    -- 상태
    status VARCHAR(20) DEFAULT 'open', -- open, in_mediation, resolved, closed
    resolution VARCHAR(50), -- refund_full, refund_partial, revision, rejected
    resolution_details TEXT,

    -- 중재
    mediator_id INTEGER REFERENCES admins(id),
    mediation_notes TEXT,

    -- 날짜
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mediation_started_at TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_disputes_order ON disputes(order_id);
CREATE INDEX idx_disputes_initiated_by ON disputes(initiated_by);
CREATE INDEX idx_disputes_status ON disputes(status);
```

### 9. 기타 테이블

#### favorites (찜하기)
```sql
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    service_id INTEGER NOT NULL REFERENCES services(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, service_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_service ON favorites(service_id);
```

#### search_logs (검색 로그)
```sql
CREATE TABLE search_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_id VARCHAR(100),
    keyword VARCHAR(200) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    filters JSONB,
    result_count INTEGER,
    clicked_service_ids INTEGER[],
    converted_service_id INTEGER REFERENCES services(id),
    search_duration_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_logs_user ON search_logs(user_id);
CREATE INDEX idx_search_logs_keyword ON search_logs(keyword);
CREATE INDEX idx_search_logs_created ON search_logs(created_at DESC);
```

#### activity_logs (활동 로그)
```sql
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    admin_id INTEGER REFERENCES admins(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- user, service, order, payment, etc.
    entity_id INTEGER,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_admin ON activity_logs(admin_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
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

#### GET /api/admin/payments
결제/정산 관리

#### GET /api/admin/advertising
광고 관리

#### PATCH /api/admin/advertising/campaigns/:id/approve
광고 승인

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
- **2FA 옵션**: Google Authenticator 연동
- **Rate Limiting**: IP당 분당 60회 요청 제한
- **CAPTCHA**: 로그인 3회 실패시 reCAPTCHA
- **Session Management**: Redis 기반 세션 관리

### 2. 입력 검증
- **XSS 방지**: DOMPurify 사용
- **SQL Injection 방지**: Prisma ORM 파라미터 바인딩
- **CSRF 방지**: Double Submit Cookie
- **File Upload 검증**:
  - MIME type 체크
  - 파일 크기 제한 (이미지 5MB, 문서 10MB)
  - 바이러스 스캔 (ClamAV)
  - 이미지 재인코딩 (Sharp)

### 3. API 보안
```typescript
// Rate Limiting 설정
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 60,
      ignoreUserAgents: [/googlebot/gi],
    }),
  ],
})

// Helmet 설정
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "https:", "data:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));
```

### 4. 데이터 보안
- **암호화**: bcrypt (saltRounds: 12)
- **민감정보 마스킹**: 카드번호, 계좌번호
- **PII 보호**: 개인정보 암호화 저장
- **백업**: 일일 자동 백업, 30일 보관

---

## 성능 최적화 전략

### 1. 프론트엔드 최적화
- **코드 스플리팅**: 라우트 기반 동적 import
- **이미지 최적화**:
  - WebP 포맷 자동 변환
  - Lazy loading
  - Responsive images
  - CDN 캐싱
- **번들 최적화**: Tree shaking, Minification
- **SSG/ISR**:
  - 정적 페이지: SSG
  - 카테고리 페이지: ISR (60초)
  - 서비스 상세: ISR (300초)

### 2. 백엔드 최적화
- **데이터베이스**:
  - Connection pooling (min: 5, max: 20)
  - Query 최적화 (EXPLAIN ANALYZE)
  - 인덱스 전략
  - Partial index 활용
- **캐싱 전략**:
  ```typescript
  // Redis 캐싱
  - 카테고리 트리: 1시간
  - 인기 서비스: 10분
  - 사용자 세션: 30분
  - 검색 결과: 5분
  ```
- **Queue 처리**: Bull Queue
  - 이메일 발송
  - 이미지 처리
  - 알림 발송
  - 정산 처리

### 3. 인프라 최적화
- **로드 밸런싱**: Nginx 리버스 프록시
- **CDN**: CloudFlare (정적 자원)
- **모니터링**:
  - APM: Datadog
  - 에러: Sentry
  - 로그: Winston + CloudWatch

---

## 구현 일정 (수정본)

### Phase 1: 기본 인프라 구축 (2주)
**Week 1-2**
- 프로젝트 환경 설정
- 데이터베이스 설계 및 구축
- 기본 인증 시스템
- 관리자/판매자/구매자 역할 구분

### Phase 2: 핵심 기능 개발 (3주)
**Week 3-5**
- 카테고리 시스템 (300개 데이터 입력)
- 서비스 CRUD
- 검색 기능
- 파일 업로드

### Phase 3: 거래 시스템 (3주)
**Week 6-8**
- 주문 프로세스
- 결제 연동 (토스페이먼츠)
- 환불 시스템
- 정산 시스템

### Phase 4: 광고 시스템 (2주)
**Week 9-10**
- 광고 캠페인 관리
- 프리미엄 배치
- 광고 성과 분석
- 자동 입찰 시스템

### Phase 5: 커뮤니케이션 (2주)
**Week 11-12**
- 실시간 채팅 (Socket.io)
- 알림 시스템
- 리뷰 시스템
- 신고/분쟁 처리

### Phase 6: 관리자 시스템 (2주)
**Week 13-14**
- 관리자 대시보드
- 사용자 관리
- 서비스 승인
- 통계 및 분석

### Phase 7: 최적화 및 테스트 (2주)
**Week 15-16**
- 성능 최적화
- 보안 강화
- 테스트 (단위/통합/E2E)
- 버그 수정

### Phase 8: 배포 준비 (1주)
**Week 17**
- 프로덕션 환경 구성
- CI/CD 파이프라인
- 모니터링 설정
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
- API 엔드포인트
- 데이터베이스 연동
- 외부 서비스 연동

### 3. E2E 테스트 (Cypress)
- 주요 사용자 시나리오
- 결제 플로우
- 주문 프로세스
- 관리자 기능

### 4. 성능 테스트
- Load testing (K6)
- Stress testing
- API 응답 시간

---

## 모니터링 및 분석

### 1. 실시간 모니터링
- **서버 모니터링**: CPU, Memory, Disk
- **애플리케이션 모니터링**: APM (Datadog)
- **데이터베이스 모니터링**: Slow query, Connection pool
- **에러 추적**: Sentry

### 2. 비즈니스 메트릭
- **사용자 분석**: Google Analytics 4
- **매출 분석**: 일/주/월별 대시보드
- **전환율 추적**: Funnel 분석
- **광고 ROI**: 캠페인별 성과

### 3. 로깅 전략
```typescript
// Winston 로깅 레벨
- error: 에러 및 예외
- warn: 경고 사항
- info: 중요 이벤트
- debug: 디버깅 정보

// 로그 저장
- 로컬: 7일 보관
- CloudWatch: 30일 보관
- 아카이브: S3 (1년)
```

---

## 초기 데이터

### AI 카테고리 구조 (주요 대분류)
```
1. AI 이미지/디자인 (60개 세부)
2. AI 영상/모션 (40개 세부)
3. AI 음악/사운드 (30개 세부)
4. AI 글쓰기/콘텐츠 (50개 세부)
5. AI 프로그래밍/개발 (40개 세부)
6. AI 데이터 분석 (30개 세부)
7. AI 챗봇/자동화 (25개 세부)
8. AI 번역/언어 (25개 세부)
```

### 일반 카테고리는 필요시 추가

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