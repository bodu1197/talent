-- 쿼리 성능 개선을 위한 통계 정보 업데이트 및 최적화

-- 1. 모든 테이블의 통계 정보 업데이트
ANALYZE public.admins;
ANALYZE public.buyers;
ANALYZE public.sellers;
ANALYZE public.users;
ANALYZE public.categories;
ANALYZE public.category_visits;
ANALYZE public.services;
ANALYZE public.service_categories;
ANALYZE public.service_packages;
ANALYZE public.service_revisions;
ANALYZE public.service_revision_categories;
ANALYZE public.service_revision_packages;
ANALYZE public.service_view_logs;

-- 2. 자주 조회되는 테이블의 autovacuum 설정 최적화
-- services 테이블 (가장 자주 조회됨)
ALTER TABLE public.services SET (
  autovacuum_vacuum_scale_factor = 0.05,  -- 5% 변경 시 vacuum (기본값: 20%)
  autovacuum_analyze_scale_factor = 0.02  -- 2% 변경 시 analyze (기본값: 10%)
);

-- service_view_logs 테이블 (자주 INSERT됨)
ALTER TABLE public.service_view_logs SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02
);

-- orders 테이블 (중요한 트랜잭션 데이터)
ALTER TABLE public.orders SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02
);

-- 3. 쿼리 플래너를 위한 통계 수집 향상
-- 자주 JOIN되는 컬럼의 통계 정보 상세도 증가
ALTER TABLE public.services ALTER COLUMN seller_id SET STATISTICS 1000;
ALTER TABLE public.services ALTER COLUMN status SET STATISTICS 1000;
ALTER TABLE public.service_categories ALTER COLUMN service_id SET STATISTICS 1000;
ALTER TABLE public.service_categories ALTER COLUMN category_id SET STATISTICS 1000;

-- 4. 통계 정보 재수집
ANALYZE public.services;
ANALYZE public.service_categories;
ANALYZE public.orders;
ANALYZE public.service_view_logs;

-- 5. 자주 사용될 쿼리 패턴을 위한 복합 인덱스 추가

-- services 테이블: status + created_at (최신 활성 서비스 조회)
CREATE INDEX IF NOT EXISTS idx_services_status_created
ON public.services(status, created_at DESC)
WHERE status = 'active';

-- services 테이블: seller_id + status (판매자의 서비스 목록)
CREATE INDEX IF NOT EXISTS idx_services_seller_status
ON public.services(seller_id, status);

-- service_view_logs: service_id + created_at (서비스별 일별 조회수)
CREATE INDEX IF NOT EXISTS idx_service_view_logs_service_created
ON public.service_view_logs(service_id, created_at DESC);

-- orders: buyer_id + status (구매자의 주문 목록)
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status
ON public.orders(buyer_id, status)
WHERE buyer_id IS NOT NULL;

-- orders: seller_id + status (판매자의 주문 목록)
CREATE INDEX IF NOT EXISTS idx_orders_seller_status
ON public.orders(seller_id, status)
WHERE seller_id IS NOT NULL;

-- service_revisions: seller_id + status (판매자의 수정 요청 목록)
CREATE INDEX IF NOT EXISTS idx_service_revisions_seller_status
ON public.service_revisions(seller_id, status);

-- 6. BRIN 인덱스로 대용량 로그 테이블 최적화
-- service_view_logs는 시간순으로 계속 증가하므로 BRIN 인덱스가 효율적
DROP INDEX IF EXISTS public.idx_service_view_logs_created_at;
CREATE INDEX IF NOT EXISTS idx_service_view_logs_created_brin
ON public.service_view_logs USING BRIN (created_at);

-- 7. 통계 정보 최종 업데이트
ANALYZE;
