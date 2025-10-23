-- ============================================
-- AI 재능 거래 플랫폼 - 추가 테이블
-- ============================================

-- ============================================
-- 1. 결제 관련 테이블
-- ============================================

-- payments 테이블 (결제)
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

-- refunds 테이블 (환불)
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

-- ============================================
-- 2. 정산 관련 테이블
-- ============================================

-- settlements 테이블 (정산)
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

-- settlement_details 테이블 (정산 상세)
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

-- ============================================
-- 3. 광고 관련 테이블
-- ============================================

-- advertising_campaigns 테이블 (광고 캠페인)
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

-- premium_placements 테이블 (프리미엄 배치)
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

-- ============================================
-- 4. 리뷰 관련 테이블
-- ============================================

-- reviews 테이블 (리뷰)
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

-- ============================================
-- 5. 커뮤니케이션 테이블
-- ============================================

-- conversations 테이블 (대화방)
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

-- messages 테이블 (메시지)
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

-- notifications 테이블 (알림)
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

-- ============================================
-- 6. 신고 및 분쟁 테이블
-- ============================================

-- reports 테이블 (신고)
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

-- disputes 테이블 (분쟁)
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

-- ============================================
-- 7. 기타 테이블
-- ============================================

-- favorites 테이블 (찜하기)
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    service_id UUID NOT NULL REFERENCES public.services(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, service_id)
);

-- search_logs 테이블 (검색 로그)
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

-- activity_logs 테이블 (활동 로그)
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

-- tags 테이블 (태그)
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- service_tags 테이블 (서비스-태그 매핑)
CREATE TABLE public.service_tags (
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (service_id, tag_id)
);

-- ============================================
-- 8. 인덱스 생성
-- ============================================

-- Payments 인덱스
CREATE INDEX idx_payments_order ON public.payments(order_id);
CREATE INDEX idx_payments_transaction ON public.payments(transaction_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Settlements 인덱스
CREATE INDEX idx_settlements_seller ON public.settlements(seller_id);
CREATE INDEX idx_settlements_date ON public.settlements(settlement_date);
CREATE INDEX idx_settlements_status ON public.settlements(status);

-- Advertising 인덱스
CREATE INDEX idx_campaigns_seller ON public.advertising_campaigns(seller_id);
CREATE INDEX idx_campaigns_status ON public.advertising_campaigns(status, approval_status);
CREATE INDEX idx_premium_service ON public.premium_placements(service_id);
CREATE INDEX idx_premium_active ON public.premium_placements(is_active, start_date, end_date);

-- Reviews 인덱스
CREATE INDEX idx_reviews_service ON public.reviews(service_id);
CREATE INDEX idx_reviews_seller ON public.reviews(seller_id);
CREATE INDEX idx_reviews_buyer ON public.reviews(buyer_id);
CREATE INDEX idx_reviews_visible ON public.reviews(is_visible, is_featured);

-- Messages 인덱스
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_conversations_participants ON public.conversations(participant1_id, participant2_id);

-- Notifications 인덱스
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);

-- Reports 인덱스
CREATE INDEX idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX idx_reports_status ON public.reports(status, severity);

-- Favorites 인덱스
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_favorites_service ON public.favorites(service_id);

-- Search logs 인덱스
CREATE INDEX idx_search_logs_user ON public.search_logs(user_id);
CREATE INDEX idx_search_logs_keyword ON public.search_logs(keyword);

-- ============================================
-- 9. 트리거 추가
-- ============================================

-- 각 테이블에 updated_at 트리거 적용
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_settlements_updated_at BEFORE UPDATE ON public.settlements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.advertising_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_premium_updated_at BEFORE UPDATE ON public.premium_placements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 10. 스키마 버전 업데이트
-- ============================================

INSERT INTO public.schema_migrations (version) VALUES ('002_additional_tables');

-- 성공 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ 추가 테이블 생성 완료!';
    RAISE NOTICE '생성된 테이블: payments, refunds, settlements, advertising_campaigns, premium_placements, reviews, conversations, messages, notifications, reports, disputes, favorites, search_logs, activity_logs, tags';
    RAISE NOTICE '다음 단계: RLS 정책 설정';
END $$;