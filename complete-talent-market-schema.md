# 재능마켓 플랫폼 - 완전한 데이터베이스 스키마 설계
## (판매자 + 구매자 통합 버전)

---

## 📊 핵심 테이블 구조

### 1. users (사용자)
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    nickname VARCHAR(50) UNIQUE,
    user_type VARCHAR(20) DEFAULT 'buyer', -- buyer/seller/both
    profile_image TEXT,
    
    -- 판매자 정보
    expert_grade VARCHAR(20), -- bronze/silver/gold/platinum/diamond
    message_response_rate DECIMAL(5,2) DEFAULT 0,
    
    -- 연락처
    phone VARCHAR(20),
    
    -- 계정 상태
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_nickname ON users(nickname);
CREATE INDEX idx_users_type ON users(user_type);
```

### 2. categories (카테고리)
```sql
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    depth INT DEFAULT 0,
    order_index INT DEFAULT 0,
    icon TEXT, -- 카테고리 아이콘 URL
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
```

### 3. services (서비스/상품)
```sql
CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    delivery_days INT DEFAULT 7, -- 작업일
    status VARCHAR(20) DEFAULT 'active', -- active/inactive/deleted/suspended
    
    -- 통계
    view_count INT DEFAULT 0,
    order_count INT DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0,
    like_count INT DEFAULT 0,
    
    -- 미디어
    thumbnail_image TEXT,
    images JSONB, -- 여러 이미지
    video_url TEXT, -- 소개 영상
    
    -- 메타데이터
    tags JSONB, -- 태그 배열
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_seller ON services(seller_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_rating ON services(rating_avg DESC);
```

### 4. service_packages (서비스 패키지 옵션)
```sql
CREATE TABLE service_packages (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(50), -- basic/standard/premium
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    delivery_days INT,
    features JSONB, -- 포함 항목 배열
    revision_count INT DEFAULT 0, -- 수정 횟수
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_packages_service ON service_packages(service_id);
```

### 5. orders (주문) ⭐ 핵심 테이블
```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- #3477722
    
    -- 관계
    service_id BIGINT REFERENCES services(id),
    package_id BIGINT REFERENCES service_packages(id),
    seller_id BIGINT REFERENCES users(id),
    buyer_id BIGINT REFERENCES users(id),
    
    -- 주문 상태
    status VARCHAR(30) DEFAULT 'payment_pending', 
    -- payment_pending (결제대기)
    -- paid (결제완료/진행중)
    -- in_progress (작업중)
    -- revision_requested (수정요청)
    -- delivered (작업완료 도착)
    -- review (검수중)
    -- completed (구매확정/거래완료)
    -- auto_completed (자동 구매확정)
    -- cancelled (취소)
    -- cancel_requested (취소요청)
    -- refund_requested (환불요청)
    -- refunded (환불완료)
    -- dispute (분쟁중)
    
    -- 가격 정보
    original_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    coupon_discount DECIMAL(10,2) DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50), -- card/bank/kakao/naver/toss
    
    -- 주문 내용
    requirements TEXT, -- 구매자 요구사항
    buyer_note TEXT, -- 구매자 메모
    
    -- 중요 날짜들
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_date TIMESTAMP, -- 결제일
    expected_delivery_date TIMESTAMP, -- 예상 완료일
    started_at TIMESTAMP, -- 작업 시작일
    delivered_at TIMESTAMP, -- 작업 완료 도착일
    completed_date TIMESTAMP, -- 구매 확정일
    auto_complete_date TIMESTAMP, -- 자동 구매확정일 (도착 후 N일)
    modified_date TIMESTAMP, -- 수정일자
    cancelled_at TIMESTAMP,
    refunded_at TIMESTAMP,
    
    -- 취소/환불 정보
    cancel_reason TEXT,
    cancel_requested_by VARCHAR(10), -- buyer/seller
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,
    
    -- 견적 관련
    is_quote BOOLEAN DEFAULT false, -- 견적 주문 여부
    quote_requested_at TIMESTAMP,
    quote_responded_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date DESC);
CREATE INDEX idx_orders_number ON orders(order_number);
```

### 6. order_status_history (주문 상태 이력)
```sql
CREATE TABLE order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    changed_by BIGINT REFERENCES users(id),
    actor_type VARCHAR(10), -- buyer/seller/admin/system
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_history_order ON order_status_history(order_id);
```

### 7. order_deliverables (납품물)
```sql
CREATE TABLE order_deliverables (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(50),
    description TEXT,
    version INT DEFAULT 1, -- 수정본 버전
    uploaded_by BIGINT REFERENCES users(id),
    is_final BOOLEAN DEFAULT false, -- 최종본 여부
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deliverables_order ON order_deliverables(order_id);
```

### 8. order_revisions (수정 요청)
```sql
CREATE TABLE order_revisions (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    revision_number INT NOT NULL, -- 몇 번째 수정인지
    description TEXT NOT NULL, -- 수정 요청 내용
    requested_by BIGINT REFERENCES users(id), -- 요청자 (보통 구매자)
    status VARCHAR(20) DEFAULT 'pending', -- pending/accepted/rejected/completed
    responded_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_revisions_order ON order_revisions(order_id);
```

### 9. reviews (리뷰)
```sql
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    service_id BIGINT REFERENCES services(id),
    buyer_id BIGINT REFERENCES users(id),
    seller_id BIGINT REFERENCES users(id),
    
    -- 평가
    rating INT CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    
    -- 세부 평가 (optional)
    communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
    quality_rating INT CHECK (quality_rating >= 1 AND quality_rating <= 5),
    delivery_rating INT CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    
    -- 판매자 답변
    reply TEXT,
    reply_date TIMESTAMP,
    
    -- 노출 여부
    is_visible BOOLEAN DEFAULT true,
    is_reported BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_service ON reviews(service_id);
CREATE INDEX idx_reviews_seller ON reviews(seller_id);
CREATE INDEX idx_reviews_buyer ON reviews(buyer_id);
CREATE INDEX idx_reviews_order ON reviews(order_id);
```

### 10. portfolios (포트폴리오)
```sql
CREATE TABLE portfolios (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    images JSONB, -- 여러 이미지
    category_id BIGINT REFERENCES categories(id),
    tags JSONB,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_portfolios_seller ON portfolios(seller_id);
CREATE INDEX idx_portfolios_category ON portfolios(category_id);
```

### 11. conversations (대화방)
```sql
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id), -- nullable (주문 전 문의 가능)
    service_id BIGINT REFERENCES services(id), -- 문의한 서비스
    buyer_id BIGINT REFERENCES users(id) NOT NULL,
    seller_id BIGINT REFERENCES users(id) NOT NULL,
    
    -- 대화 상태
    last_message_at TIMESTAMP,
    last_message_preview TEXT,
    
    -- 아카이브
    is_archived_by_buyer BOOLEAN DEFAULT false,
    is_archived_by_seller BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller ON conversations(seller_id);
CREATE INDEX idx_conversations_order ON conversations(order_id);
```

### 12. messages (메시지)
```sql
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT REFERENCES users(id),
    receiver_id BIGINT REFERENCES users(id),
    content TEXT NOT NULL,
    attachments JSONB, -- 첨부파일 배열
    message_type VARCHAR(20) DEFAULT 'text', -- text/file/system/quote
    
    -- 읽음 상태
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

### 13. kmong_cash (크몽 캐시 - 포인트/충전금)
```sql
CREATE TABLE kmong_cash (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL, 
    -- charge (충전)
    -- use (사용)
    -- refund (환불)
    -- expire (소멸)
    -- reward (적립)
    
    description TEXT,
    related_order_id BIGINT REFERENCES orders(id),
    balance_after DECIMAL(10,2) NOT NULL, -- 거래 후 잔액
    
    -- 만료일 (충전금에만 적용)
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kmong_cash_user ON kmong_cash(user_id);
CREATE INDEX idx_kmong_cash_type ON kmong_cash(type);
CREATE INDEX idx_kmong_cash_created ON kmong_cash(created_at DESC);
```

### 14. cash_charges (충전 내역)
```sql
CREATE TABLE cash_charges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100), -- PG사 거래번호
    status VARCHAR(20) DEFAULT 'pending', -- pending/completed/failed/cancelled
    
    -- 결제 정보
    pg_provider VARCHAR(50), -- iamport/toss/kakao 등
    receipt_url TEXT,
    
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_charges_user ON cash_charges(user_id);
CREATE INDEX idx_charges_status ON cash_charges(status);
```

### 15. coupons (쿠폰)
```sql
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- 할인 정보
    discount_type VARCHAR(20), -- percentage/fixed/cashback
    discount_value DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2), -- 최대 할인 금액
    min_purchase_amount DECIMAL(10,2) DEFAULT 0, -- 최소 구매 금액
    
    -- 사용 조건
    applicable_categories JSONB, -- 적용 가능한 카테고리
    applicable_services JSONB, -- 특정 서비스만
    
    -- 기간
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    
    -- 사용 제한
    usage_limit_per_user INT DEFAULT 1, -- 1인당 사용 횟수
    total_usage_limit INT, -- 전체 발급 수량
    used_count INT DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
```

### 16. user_coupons (사용자 쿠폰)
```sql
CREATE TABLE user_coupons (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    coupon_id BIGINT REFERENCES coupons(id),
    
    -- 사용 상태
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP,
    order_id BIGINT REFERENCES orders(id),
    
    -- 만료일
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_coupons_user ON user_coupons(user_id);
CREATE INDEX idx_user_coupons_used ON user_coupons(is_used);
CREATE UNIQUE INDEX idx_user_coupons_unique ON user_coupons(user_id, coupon_id) WHERE is_used = false;
```

### 17. payments (결제 내역)
```sql
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id),
    user_id BIGINT REFERENCES users(id),
    
    -- 금액
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50), -- card/bank/cash/kakao/naver/toss
    
    -- PG 정보
    pg_provider VARCHAR(50),
    transaction_id VARCHAR(100), -- PG사 거래번호
    
    -- 카드 정보 (마스킹)
    card_name VARCHAR(50),
    card_number_masked VARCHAR(20), -- **** **** **** 1234
    
    -- 상태
    status VARCHAR(20) DEFAULT 'pending', -- pending/completed/failed/cancelled/refunded
    
    -- 영수증
    receipt_url TEXT,
    
    -- 환불 정보
    refund_amount DECIMAL(10,2),
    refunded_at TIMESTAMP,
    
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### 18. earnings (판매자 수익)
```sql
CREATE TABLE earnings (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    order_id BIGINT REFERENCES orders(id),
    
    -- 금액
    order_amount DECIMAL(10,2) NOT NULL, -- 주문 금액
    commission_rate DECIMAL(5,2) DEFAULT 15.00, -- 수수료율 (%)
    commission_amount DECIMAL(10,2), -- 수수료 금액
    vat_amount DECIMAL(10,2), -- 부가세
    net_amount DECIMAL(10,2), -- 실수령액
    
    -- 정산 상태
    status VARCHAR(20) DEFAULT 'pending', 
    -- pending (대기)
    -- confirmed (확정)
    -- settlement_scheduled (정산예정)
    -- settled (정산완료)
    -- withdrawn (출금완료)
    
    settlement_date TIMESTAMP, -- 정산 가능일
    settled_at TIMESTAMP, -- 정산일
    withdrawn_at TIMESTAMP, -- 출금일
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_earnings_seller ON earnings(seller_id);
CREATE INDEX idx_earnings_order ON earnings(order_id);
CREATE INDEX idx_earnings_status ON earnings(status);
CREATE INDEX idx_earnings_settlement ON earnings(settlement_date);
```

### 19. withdrawals (출금 신청)
```sql
CREATE TABLE withdrawals (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    
    -- 계좌 정보
    bank_name VARCHAR(50) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_holder VARCHAR(100) NOT NULL,
    
    -- 상태
    status VARCHAR(20) DEFAULT 'pending', -- pending/processing/completed/rejected
    
    -- 처리 정보
    processed_by BIGINT REFERENCES users(id), -- 처리한 관리자
    reject_reason TEXT,
    
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX idx_withdrawals_seller ON withdrawals(seller_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
```

### 20. favorites (찜하기)
```sql
CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    service_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, service_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_service ON favorites(service_id);
```

### 21. notifications (알림)
```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    
    -- 알림 타입
    type VARCHAR(30) NOT NULL, 
    -- order_new (신규 주문)
    -- order_status (주문 상태 변경)
    -- message_new (새 메시지)
    -- review_new (새 리뷰)
    -- review_reply (리뷰 답변)
    -- payment (결제 관련)
    -- settlement (정산 관련)
    -- ad (광고 관련)
    -- system (시스템 공지)
    
    title VARCHAR(200) NOT NULL,
    content TEXT,
    
    -- 관련 데이터
    related_id BIGINT, -- order_id, message_id 등
    related_type VARCHAR(30), -- order/message/review 등
    action_url TEXT, -- 클릭 시 이동할 URL
    
    -- 읽음 상태
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    
    -- 푸시 발송
    is_push_sent BOOLEAN DEFAULT false,
    push_sent_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### 22. advertisements (광고)
```sql
CREATE TABLE advertisements (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    service_id BIGINT REFERENCES services(id),
    
    -- 광고 타입
    ad_type VARCHAR(30), -- featured/banner/search/category/homepage
    position VARCHAR(50), -- 광고 위치
    
    -- 예산
    budget DECIMAL(10,2) NOT NULL,
    daily_budget DECIMAL(10,2),
    spent_amount DECIMAL(10,2) DEFAULT 0,
    
    -- 기간
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    
    -- 상태
    status VARCHAR(20) DEFAULT 'active', -- active/paused/completed/cancelled
    
    -- 광고 성과
    impressions INT DEFAULT 0, -- 노출수
    clicks INT DEFAULT 0, -- 클릭수
    orders INT DEFAULT 0, -- 전환된 주문수
    revenue DECIMAL(10,2) DEFAULT 0, -- 발생 매출
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ads_seller ON advertisements(seller_id);
CREATE INDEX idx_ads_service ON advertisements(service_id);
CREATE INDEX idx_ads_status ON advertisements(status);
```

### 23. ad_statistics (광고 통계 - 일별)
```sql
CREATE TABLE ad_statistics (
    id BIGSERIAL PRIMARY KEY,
    ad_id BIGINT REFERENCES advertisements(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- 일별 성과
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    orders INT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    
    -- 계산 지표
    ctr DECIMAL(5,2), -- Click Through Rate
    cpc DECIMAL(10,2), -- Cost Per Click
    roas DECIMAL(10,2), -- Return On Ad Spend
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(ad_id, date)
);

CREATE INDEX idx_ad_stats_ad ON ad_statistics(ad_id);
CREATE INDEX idx_ad_stats_date ON ad_statistics(date DESC);
```

### 24. expert_grades (전문가 등급)
```sql
CREATE TABLE expert_grades (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL, -- bronze/silver/gold/platinum/diamond
    display_name VARCHAR(50) NOT NULL, -- 브론즈/실버/골드/플래티넘/다이아몬드
    
    -- 승급 조건
    required_sales INT DEFAULT 0, -- 필요 판매 건수
    required_rating DECIMAL(3,2) DEFAULT 0, -- 필요 평점
    required_revenue DECIMAL(12,2) DEFAULT 0, -- 필요 누적 매출
    
    -- 혜택
    benefits JSONB, 
    -- { 
    --   "commission_rate": 12, 
    --   "priority_exposure": true,
    --   "badge_color": "#FFD700",
    --   "max_services": 50
    -- }
    
    badge_color VARCHAR(20),
    badge_icon TEXT,
    order_index INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 25. seller_statistics (판매자 통계)
```sql
CREATE TABLE seller_statistics (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- 누적 통계
    total_sales INT DEFAULT 0, -- 총 판매 건수
    total_revenue DECIMAL(12,2) DEFAULT 0, -- 총 매출
    total_reviews INT DEFAULT 0, -- 총 리뷰 수
    average_rating DECIMAL(3,2) DEFAULT 0, -- 평균 평점
    
    -- 기간별 통계
    today_sales INT DEFAULT 0,
    today_revenue DECIMAL(10,2) DEFAULT 0,
    weekly_sales INT DEFAULT 0,
    weekly_revenue DECIMAL(10,2) DEFAULT 0,
    monthly_sales INT DEFAULT 0,
    monthly_revenue DECIMAL(10,2) DEFAULT 0,
    
    -- 응답 관련
    message_response_rate DECIMAL(5,2) DEFAULT 0, -- 메시지 응답률
    average_response_time INT, -- 평균 응답 시간(분)
    
    -- 완료율
    completion_rate DECIMAL(5,2) DEFAULT 0, -- 거래 완료율
    on_time_delivery_rate DECIMAL(5,2) DEFAULT 0, -- 기한 내 납품률
    
    -- 재구매율
    repeat_buyer_rate DECIMAL(5,2) DEFAULT 0,
    repeat_buyer_count INT DEFAULT 0,
    
    -- 취소율
    cancellation_rate DECIMAL(5,2) DEFAULT 0,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seller_stats_seller ON seller_statistics(seller_id);
```

### 26. buyer_statistics (구매자 통계)
```sql
CREATE TABLE buyer_statistics (
    id BIGSERIAL PRIMARY KEY,
    buyer_id BIGINT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- 구매 통계
    total_purchases INT DEFAULT 0, -- 총 구매 건수
    total_spent DECIMAL(12,2) DEFAULT 0, -- 총 지출액
    
    -- 리뷰 작성
    reviews_written INT DEFAULT 0, -- 작성한 리뷰 수
    pending_reviews INT DEFAULT 0, -- 작성 가능한 리뷰 수
    
    -- 취소/환불
    cancelled_orders INT DEFAULT 0,
    refunded_orders INT DEFAULT 0,
    
    -- 기간별
    monthly_purchases INT DEFAULT 0,
    monthly_spent DECIMAL(10,2) DEFAULT 0,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_buyer_stats_buyer ON buyer_statistics(buyer_id);
```

### 27. quotes (견적 요청)
```sql
CREATE TABLE quotes (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT REFERENCES services(id),
    buyer_id BIGINT REFERENCES users(id),
    seller_id BIGINT REFERENCES users(id),
    
    -- 견적 요청
    description TEXT NOT NULL, -- 요청 내용
    attachments JSONB, -- 참고 파일
    budget_range VARCHAR(50), -- 예산 범위
    deadline TIMESTAMP, -- 희망 완료일
    
    -- 견적 답변
    quoted_price DECIMAL(10,2),
    quoted_delivery_days INT,
    seller_note TEXT, -- 판매자 답변
    
    -- 상태
    status VARCHAR(20) DEFAULT 'pending', 
    -- pending (대기)
    -- quoted (견적 제시)
    -- accepted (수락)
    -- rejected (거절)
    -- expired (만료)
    
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    expires_at TIMESTAMP -- 견적 유효기간
);

CREATE INDEX idx_quotes_buyer ON quotes(buyer_id);
CREATE INDEX idx_quotes_seller ON quotes(seller_id);
CREATE INDEX idx_quotes_status ON quotes(status);
```

### 28. search_history (검색 기록)
```sql
CREATE TABLE search_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    keyword VARCHAR(200) NOT NULL,
    result_count INT DEFAULT 0,
    clicked_service_id BIGINT REFERENCES services(id), -- 클릭한 서비스
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_user ON search_history(user_id);
CREATE INDEX idx_search_keyword ON search_history(keyword);
CREATE INDEX idx_search_created ON search_history(created_at DESC);
```

### 29. service_views (서비스 조회 기록)
```sql
CREATE TABLE service_views (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT, -- 유입 경로
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_views_service ON service_views(service_id);
CREATE INDEX idx_service_views_user ON service_views(user_id);
CREATE INDEX idx_service_views_created ON service_views(created_at DESC);
```

---

## 🎯 구매자 페이지 특화 기능

### 구매 관리 대시보드 통계 쿼리

```sql
-- 구매자 대시보드 상단 통계
SELECT 
    COUNT(CASE WHEN status IN ('paid', 'in_progress') THEN 1 END) as in_progress_count,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count,
    COUNT(CASE WHEN status IN ('cancel_requested', 'refund_requested') THEN 1 END) as pending_cancel_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count
FROM orders
WHERE buyer_id = ?;

-- 작성 가능한 리뷰 수
SELECT COUNT(*)
FROM orders o
LEFT JOIN reviews r ON o.id = r.order_id
WHERE o.buyer_id = ?
    AND o.status = 'completed'
    AND r.id IS NULL;
```

### 주문 목록 조회 (필터링)

```sql
-- 닉네임 검색 + 상태 필터 + 기간 필터
SELECT 
    o.*,
    s.title as service_title,
    s.thumbnail_image,
    u.nickname as seller_nickname,
    u.profile_image as seller_profile
FROM orders o
JOIN services s ON o.service_id = s.id
JOIN users u ON o.seller_id = u.id
WHERE o.buyer_id = ?
    AND (? IS NULL OR u.nickname LIKE ?)  -- 닉네임 검색
    AND (? IS NULL OR o.status = ?)       -- 상태 필터
    AND (? IS NULL OR o.order_date >= ?)  -- 시작일
    AND (? IS NULL OR o.order_date <= ?)  -- 종료일
    AND (? = false OR o.is_quote = true)  -- 견적이 있는 것만
ORDER BY o.order_date DESC
LIMIT 20 OFFSET ?;
```

### 구매 확정 자동화 (스케줄러)

```sql
-- 작업 완료 도착 후 7일 경과 시 자동 구매 확정
UPDATE orders
SET 
    status = 'auto_completed',
    completed_date = CURRENT_TIMESTAMP,
    auto_complete_date = CURRENT_TIMESTAMP
WHERE status = 'delivered'
    AND delivered_at <= CURRENT_TIMESTAMP - INTERVAL '7 days';
```

---

## 🔍 주문 상태 흐름도

### 일반 주문 흐름
```
payment_pending (결제대기)
    ↓ [결제 완료]
paid (결제완료/진행 대기)
    ↓ [판매자 작업 시작]
in_progress (작업중)
    ↓ [납품물 제출]
delivered (작업완료 도착)
    ↓ [구매자 확인 또는 7일 자동]
completed (구매확정/거래완료)
```

### 수정 요청 흐름
```
in_progress (작업중)
    ↓ [구매자 수정 요청]
revision_requested (수정요청)
    ↓ [판매자 수정 작업]
in_progress (작업중)
    ↓
delivered (작업완료 도착)
```

### 취소/환불 흐름
```
any_status
    ↓ [취소 요청]
cancel_requested (취소요청)
    ↓ [승인]
cancelled (취소)

delivered
    ↓ [환불 요청]
refund_requested (환불요청)
    ↓ [승인]
refunded (환불완료)
```

### 분쟁 흐름
```
any_status
    ↓ [분쟁 발생]
dispute (분쟁중)
    ↓ [중재 결과]
cancelled / refunded / completed
```

---

## 📊 주요 비즈니스 로직

### 1. 구매 확정 로직
```sql
-- 구매 확정 시 처리
BEGIN;

-- 주문 상태 변경
UPDATE orders 
SET status = 'completed', completed_date = CURRENT_TIMESTAMP
WHERE id = ? AND status = 'delivered';

-- 판매자 수익 확정
UPDATE earnings
SET status = 'confirmed', settlement_date = CURRENT_TIMESTAMP + INTERVAL '7 days'
WHERE order_id = ?;

-- 캐시 적립 (구매자)
INSERT INTO kmong_cash (user_id, amount, type, description, related_order_id, balance_after)
SELECT 
    buyer_id,
    final_price * 0.01, -- 1% 적립
    'reward',
    '구매 확정 적립',
    id,
    (SELECT COALESCE(SUM(amount), 0) FROM kmong_cash WHERE user_id = buyer_id) + (final_price * 0.01)
FROM orders WHERE id = ?;

COMMIT;
```

### 2. 리뷰 작성 가능 여부 체크
```sql
SELECT 
    o.id,
    o.order_number,
    s.title,
    CASE 
        WHEN r.id IS NOT NULL THEN false
        WHEN o.status != 'completed' THEN false
        WHEN o.completed_date < CURRENT_TIMESTAMP - INTERVAL '30 days' THEN false
        ELSE true
    END as can_review
FROM orders o
JOIN services s ON o.service_id = s.id
LEFT JOIN reviews r ON o.id = r.order_id
WHERE o.buyer_id = ?;
```

### 3. 쿠폰 적용 가능 여부
```sql
SELECT c.*
FROM coupons c
JOIN user_coupons uc ON c.id = uc.coupon_id
WHERE uc.user_id = ?
    AND uc.is_used = false
    AND c.is_active = true
    AND c.start_date <= CURRENT_TIMESTAMP
    AND c.end_date >= CURRENT_TIMESTAMP
    AND uc.expires_at >= CURRENT_TIMESTAMP
    AND (c.min_purchase_amount <= ? OR c.min_purchase_amount IS NULL)
    AND (
        c.applicable_categories IS NULL 
        OR ? = ANY(SELECT jsonb_array_elements_text(c.applicable_categories))
    );
```

### 4. 크몽 캐시 잔액 조회
```sql
SELECT COALESCE(SUM(
    CASE 
        WHEN type IN ('charge', 'reward', 'refund') THEN amount
        WHEN type IN ('use', 'expire') THEN -amount
        ELSE 0
    END
), 0) as balance
FROM kmong_cash
WHERE user_id = ?
    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);
```

---

## 🔔 알림 트리거 예시

### 주문 상태 변경 시 알림
```sql
-- 구매자에게 알림
INSERT INTO notifications (user_id, type, title, content, related_id, related_type, action_url)
VALUES (
    buyer_id,
    'order_status',
    '주문 상태가 변경되었습니다',
    '작업이 완료되어 도착했습니다. 확인해주세요.',
    order_id,
    'order',
    '/buyer/order-list?id=' || order_id
);
```

### 새 메시지 알림
```sql
INSERT INTO notifications (user_id, type, title, content, related_id, related_type, action_url)
SELECT 
    receiver_id,
    'message_new',
    sender.nickname || '님이 메시지를 보냈습니다',
    LEFT(content, 50),
    conversation_id,
    'message',
    '/messages/' || conversation_id
FROM messages m
JOIN users sender ON m.sender_id = sender.id
WHERE m.id = ?;
```

---

## 🎨 인덱스 최적화 전략

### 복합 인덱스
```sql
-- 구매자 주문 조회 최적화
CREATE INDEX idx_orders_buyer_status_date ON orders(buyer_id, status, order_date DESC);

-- 판매자 주문 조회 최적화
CREATE INDEX idx_orders_seller_status_date ON orders(seller_id, status, order_date DESC);

-- 메시지 조회 최적화
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
```

### 파티셔닝 전략 (대용량 데이터)
```sql
-- 주문 테이블 월별 파티셔닝
CREATE TABLE orders_2025_01 PARTITION OF orders
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE orders_2025_02 PARTITION OF orders
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

---

이 스키마로 kmong과 같은 재능마켓 플랫폼의 판매자/구매자 기능을 모두 구현할 수 있습니다!
