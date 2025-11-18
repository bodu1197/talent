-- 뷰 보안 속성 명시적 지정
-- Supabase Linter 경고 해결: SECURITY INVOKER 명시

-- ============================================================
-- order_revision_stats 뷰 재생성 (SECURITY INVOKER 명시)
-- ============================================================

-- 기존 뷰 삭제
DROP VIEW IF EXISTS order_revision_stats;

-- SECURITY INVOKER로 명시적 생성
-- 이렇게 하면 뷰를 조회하는 사용자의 권한으로 실행됨 (안전)
CREATE VIEW order_revision_stats
WITH (security_invoker = true)
AS
SELECT
  order_id,
  COUNT(*) as total_revisions,
  COUNT(*) FILTER (WHERE completed_at IS NOT NULL) as completed_revisions,
  COUNT(*) FILTER (WHERE completed_at IS NULL) as pending_revisions,
  MAX(requested_at) as last_revision_requested_at
FROM revision_history
GROUP BY order_id;

-- 주석 추가
COMMENT ON VIEW order_revision_stats IS '주문별 수정 요청 통계 뷰 (SECURITY INVOKER)';

-- ============================================================
-- 참고: SECURITY INVOKER vs SECURITY DEFINER
-- ============================================================
--
-- SECURITY INVOKER (안전):
--   - 뷰를 조회하는 사용자의 권한으로 실행
--   - RLS 정책이 적용됨
--   - 사용자는 자신이 접근 가능한 데이터만 볼 수 있음
--
-- SECURITY DEFINER (위험):
--   - 뷰를 생성한 사용자의 권한으로 실행
--   - RLS 정책을 우회할 수 있음
--   - 권한 상승 공격에 취약
--
-- 따라서 특별한 이유가 없다면 항상 SECURITY INVOKER를 사용해야 함
-- ============================================================
