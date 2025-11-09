-- Realtime Replication 최적화
-- 필요한 테이블만 Realtime 활성화하여 성능 개선

-- 필수 테이블만 Realtime 활성화
-- ✅ services - 서비스 목록 실시간 업데이트 (사용자에게 최신 서비스 보여주기)
-- ✅ orders - 주문 상태 실시간 알림 (판매자/구매자 양쪽 모두 중요)
-- ✅ service_revisions - 관리자 승인 상태 실시간 확인

-- 모든 기존 테이블을 제거하고 필수 테이블만 설정
ALTER PUBLICATION supabase_realtime SET TABLE
  public.services,
  public.orders,
  public.service_revisions;

-- 참고: messages 테이블은 아직 생성되지 않았으므로 제외
-- 향후 messages 테이블 생성 시 다음 명령어로 추가:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 4단계: 설정 확인 쿼리 (마이그레이션 후 수동 실행)
-- SELECT
--   schemaname,
--   tablename,
--   'Realtime ENABLED' as status
-- FROM pg_publication_tables
-- WHERE pubname = 'supabase_realtime'
-- ORDER BY tablename;
