-- Foreign Key 인덱스 추가
-- 성능 최적화: FK를 통한 JOIN, DELETE, UPDATE 성능 향상

-- ============================================================
-- 1. activity_logs 테이블
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_id ON activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- ============================================================
-- 2. conversations 테이블
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_conversations_order_id ON conversations(order_id);

-- ============================================================
-- 3. disputes 테이블
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_disputes_initiated_by ON disputes(initiated_by);
CREATE INDEX IF NOT EXISTS idx_disputes_mediator_id ON disputes(mediator_id);
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON disputes(order_id);

-- ============================================================
-- 4. payment_requests 테이블
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_payment_requests_service_id ON payment_requests(service_id);

-- ============================================================
-- 5. premium_placements 테이블
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_premium_placements_campaign_id ON premium_placements(campaign_id);
CREATE INDEX IF NOT EXISTS idx_premium_placements_category_id ON premium_placements(category_id);

-- ============================================================
-- 6. refunds 테이블
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_refunds_approved_by ON refunds(approved_by);

-- ============================================================
-- 7. reports 테이블
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_reports_assigned_to ON reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_reports_reported_order_id ON reports(reported_order_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_review_id ON reports(reported_review_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_service_id ON reports(reported_service_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON reports(reported_user_id);

-- ============================================================
-- 8. search_logs 테이블
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_search_logs_category_id ON search_logs(category_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_converted_service_id ON search_logs(converted_service_id);

-- ============================================================
-- 9. service_revision_categories 테이블
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_service_revision_categories_category_id ON service_revision_categories(category_id);

-- ============================================================
-- 10. services 테이블
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_services_last_modified_by ON services(last_modified_by);

-- ============================================================
-- 11. settlement_details 테이블
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_settlement_details_order_id ON settlement_details(order_id);
CREATE INDEX IF NOT EXISTS idx_settlement_details_settlement_id ON settlement_details(settlement_id);

-- ============================================================
-- 12. user_coupons 테이블
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_coupons_order_id ON user_coupons(order_id);

-- ============================================================
-- 13. wallet_transactions 테이블
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_order_id ON wallet_transactions(order_id);

-- ============================================================
-- 14. withdrawal_requests 테이블
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_processed_by ON withdrawal_requests(processed_by);

-- ============================================================
-- 주석 추가
-- ============================================================

COMMENT ON INDEX idx_activity_logs_admin_id IS '관리자 활동 로그 조회 성능 향상';
COMMENT ON INDEX idx_activity_logs_user_id IS '사용자 활동 로그 조회 성능 향상';
COMMENT ON INDEX idx_conversations_order_id IS '주문별 대화 조회 성능 향상';
COMMENT ON INDEX idx_disputes_initiated_by IS '사용자별 분쟁 조회 성능 향상';
COMMENT ON INDEX idx_disputes_mediator_id IS '중재자별 분쟁 조회 성능 향상';
COMMENT ON INDEX idx_disputes_order_id IS '주문별 분쟁 조회 성능 향상';
COMMENT ON INDEX idx_payment_requests_service_id IS '서비스별 결제 요청 조회 성능 향상';
COMMENT ON INDEX idx_premium_placements_campaign_id IS '캠페인별 프리미엄 배치 조회 성능 향상';
COMMENT ON INDEX idx_premium_placements_category_id IS '카테고리별 프리미엄 배치 조회 성능 향상';
COMMENT ON INDEX idx_refunds_approved_by IS '승인자별 환불 조회 성능 향상';
COMMENT ON INDEX idx_reports_assigned_to IS '담당자별 신고 조회 성능 향상';
COMMENT ON INDEX idx_reports_reported_order_id IS '주문별 신고 조회 성능 향상';
COMMENT ON INDEX idx_reports_reported_review_id IS '리뷰별 신고 조회 성능 향상';
COMMENT ON INDEX idx_reports_reported_service_id IS '서비스별 신고 조회 성능 향상';
COMMENT ON INDEX idx_reports_reported_user_id IS '사용자별 신고 조회 성능 향상';
COMMENT ON INDEX idx_search_logs_category_id IS '카테고리별 검색 로그 분석 성능 향상';
COMMENT ON INDEX idx_search_logs_converted_service_id IS '전환된 서비스별 검색 로그 분석 성능 향상';
COMMENT ON INDEX idx_service_revision_categories_category_id IS '카테고리별 서비스 수정 조회 성능 향상';
COMMENT ON INDEX idx_services_last_modified_by IS '수정자별 서비스 조회 성능 향상';
COMMENT ON INDEX idx_settlement_details_order_id IS '주문별 정산 상세 조회 성능 향상';
COMMENT ON INDEX idx_settlement_details_settlement_id IS '정산별 상세 내역 조회 성능 향상';
COMMENT ON INDEX idx_user_coupons_order_id IS '주문별 쿠폰 사용 조회 성능 향상';
COMMENT ON INDEX idx_wallet_transactions_order_id IS '주문별 지갑 거래 조회 성능 향상';
COMMENT ON INDEX idx_withdrawal_requests_processed_by IS '처리자별 출금 요청 조회 성능 향상';
