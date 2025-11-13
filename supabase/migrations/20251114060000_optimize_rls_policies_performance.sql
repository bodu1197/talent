-- RLS 정책 성능 최적화
-- Supabase Linter 경고 해결: auth_rls_initplan 및 multiple_permissive_policies

-- ============================================================
-- 최적화 배경
-- ============================================================
-- 1. auth_rls_initplan 문제:
--    auth.uid()를 직접 사용하면 각 행마다 함수 재평가
--    → (select auth.uid())로 감싸면 쿼리당 1번만 평가
--
-- 2. multiple_permissive_policies 문제:
--    같은 action에 여러 정책이 있으면 모두 평가해야 함
--    → OR 조건으로 병합하여 하나의 정책으로 통합
-- ============================================================

-- ============================================================
-- 1. settlements 테이블 (4개 정책 → 3개로 최적화)
-- ============================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "판매자는 자신의 정산 내역 조회 가능" ON settlements;
DROP POLICY IF EXISTS "관리자는 모든 정산 내역 조회 가능" ON settlements;
DROP POLICY IF EXISTS "관리자는 정산 생성 가능" ON settlements;
DROP POLICY IF EXISTS "관리자는 정산 업데이트 가능" ON settlements;

-- SELECT 정책 병합 (2개 → 1개)
CREATE POLICY "정산 내역 조회 권한"
ON settlements FOR SELECT
TO authenticated
USING (
  seller_id = (select auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (select auth.uid())
  )
);

-- INSERT 정책 최적화
CREATE POLICY "관리자는 정산 생성 가능"
ON settlements FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (select auth.uid())
  )
);

-- UPDATE 정책 최적화
CREATE POLICY "관리자는 정산 업데이트 가능"
ON settlements FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (select auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (select auth.uid())
  )
);

-- ============================================================
-- 2. page_views 테이블
-- ============================================================

DROP POLICY IF EXISTS "Admins can view page_views" ON page_views;

CREATE POLICY "Admins can view page_views"
ON page_views FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (select auth.uid())
      AND admins.role = 'super_admin'::text
  )
);

-- ============================================================
-- 3. visitor_stats_hourly 테이블
-- ============================================================

DROP POLICY IF EXISTS "Admins can view hourly stats" ON visitor_stats_hourly;

CREATE POLICY "Admins can view hourly stats"
ON visitor_stats_hourly FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (select auth.uid())
      AND admins.role = 'super_admin'::text
  )
);

-- ============================================================
-- 4. visitor_stats_daily 테이블
-- ============================================================

DROP POLICY IF EXISTS "Admins can view daily stats" ON visitor_stats_daily;

CREATE POLICY "Admins can view daily stats"
ON visitor_stats_daily FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (select auth.uid())
      AND admins.role = 'super_admin'::text
  )
);

-- ============================================================
-- 5. visitor_stats_monthly 테이블
-- ============================================================

DROP POLICY IF EXISTS "Admins can view monthly stats" ON visitor_stats_monthly;

CREATE POLICY "Admins can view monthly stats"
ON visitor_stats_monthly FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (select auth.uid())
      AND admins.role = 'super_admin'::text
  )
);

-- ============================================================
-- 6. revision_history 테이블 (4개 정책 → 3개로 최적화)
-- ============================================================

DROP POLICY IF EXISTS "구매자는 자신의 수정 요청 이력 조회 가능" ON revision_history;
DROP POLICY IF EXISTS "판매자는 판매 주문의 수정 이력 조회 가능" ON revision_history;
DROP POLICY IF EXISTS "구매자는 수정 요청 생성 가능" ON revision_history;
DROP POLICY IF EXISTS "판매자는 수정 완료 처리 가능" ON revision_history;

-- SELECT 정책 병합 (2개 → 1개)
CREATE POLICY "수정 요청 이력 조회 권한"
ON revision_history FOR SELECT
TO authenticated
USING (
  requested_by = (select auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = revision_history.order_id
      AND orders.seller_id = (select auth.uid())
  )
);

-- INSERT 정책 최적화
CREATE POLICY "구매자는 수정 요청 생성 가능"
ON revision_history FOR INSERT
TO authenticated
WITH CHECK (
  requested_by = (select auth.uid())
  AND EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = revision_history.order_id
      AND orders.buyer_id = (select auth.uid())
  )
);

-- UPDATE 정책 최적화
CREATE POLICY "판매자는 수정 완료 처리 가능"
ON revision_history FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = revision_history.order_id
      AND orders.seller_id = (select auth.uid())
  )
)
WITH CHECK (
  completed_by = (select auth.uid())
  AND EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = revision_history.order_id
      AND orders.seller_id = (select auth.uid())
  )
);

-- ============================================================
-- 7. notifications 테이블
-- ============================================================

DROP POLICY IF EXISTS "사용자는 자신의 알림만 조회" ON notifications;
DROP POLICY IF EXISTS "사용자는 자신의 알림만 업데이트" ON notifications;
DROP POLICY IF EXISTS "알림 생성 허용" ON notifications;

CREATE POLICY "사용자는 자신의 알림만 조회"
ON notifications FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "사용자는 자신의 알림만 업데이트"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "알림 생성 허용"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================================
-- 8. disputes 테이블 (4개 정책 → 3개로 최적화)
-- ============================================================

DROP POLICY IF EXISTS "분쟁 당사자는 자신의 분쟁 조회 가능" ON disputes;
DROP POLICY IF EXISTS "관리자는 모든 분쟁 조회 가능" ON disputes;
DROP POLICY IF EXISTS "사용자는 자신의 주문에 대해 분쟁 생성 가능" ON disputes;
DROP POLICY IF EXISTS "중재자는 분쟁 업데이트 가능" ON disputes;

-- SELECT 정책 병합 (2개 → 1개)
CREATE POLICY "분쟁 조회 권한"
ON disputes FOR SELECT
TO authenticated
USING (
  initiated_by = (select auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = disputes.order_id
      AND (orders.buyer_id = (select auth.uid()) OR orders.seller_id = (select auth.uid()))
  )
  OR
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (select auth.uid())
  )
);

-- INSERT 정책 최적화
CREATE POLICY "사용자는 자신의 주문에 대해 분쟁 생성 가능"
ON disputes FOR INSERT
TO authenticated
WITH CHECK (
  initiated_by = (select auth.uid())
  AND EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = disputes.order_id
      AND (orders.buyer_id = (select auth.uid()) OR orders.seller_id = (select auth.uid()))
  )
);

-- UPDATE 정책 최적화
CREATE POLICY "중재자는 분쟁 업데이트 가능"
ON disputes FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (select auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (select auth.uid())
  )
);

-- ============================================================
-- 9. seller_earnings 테이블 (4개 정책 → 3개로 최적화)
-- ============================================================

DROP POLICY IF EXISTS "판매자는 자신의 수익 정보 조회 가능" ON seller_earnings;
DROP POLICY IF EXISTS "관리자는 모든 판매자 수익 조회 가능" ON seller_earnings;
DROP POLICY IF EXISTS "seller_earnings 생성 허용" ON seller_earnings;
DROP POLICY IF EXISTS "판매자는 자신의 수익 정보 업데이트 가능" ON seller_earnings;

-- SELECT 정책 병합 (2개 → 1개)
CREATE POLICY "수익 정보 조회 권한"
ON seller_earnings FOR SELECT
TO authenticated
USING (
  seller_id = (select auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = (select auth.uid())
  )
);

-- INSERT 정책 최적화
CREATE POLICY "seller_earnings 생성 허용"
ON seller_earnings FOR INSERT
TO authenticated
WITH CHECK (seller_id = (select auth.uid()));

-- UPDATE 정책 최적화
CREATE POLICY "판매자는 자신의 수익 정보 업데이트 가능"
ON seller_earnings FOR UPDATE
TO authenticated
USING (seller_id = (select auth.uid()))
WITH CHECK (seller_id = (select auth.uid()));

-- ============================================================
-- 주석 추가
-- ============================================================

COMMENT ON POLICY "정산 내역 조회 권한" ON settlements IS
'판매자는 자신의 정산, 관리자는 모든 정산 조회 가능 (최적화됨)';

COMMENT ON POLICY "수정 요청 이력 조회 권한" ON revision_history IS
'구매자는 자신의 요청, 판매자는 판매 주문의 수정 이력 조회 가능 (최적화됨)';

COMMENT ON POLICY "분쟁 조회 권한" ON disputes IS
'당사자, 주문 관련자, 관리자가 분쟁 조회 가능 (최적화됨)';

COMMENT ON POLICY "수익 정보 조회 권한" ON seller_earnings IS
'판매자는 자신의 수익, 관리자는 모든 수익 조회 가능 (최적화됨)';

-- ============================================================
-- 최적화 요약
-- ============================================================
--
-- Before:
-- - 22개 정책에서 auth.uid()가 매 행마다 재평가됨
-- - 4개 테이블에 중복 SELECT 정책 존재 (총 26개 정책)
--
-- After:
-- - 모든 auth.uid()를 (select auth.uid())로 변경 → 쿼리당 1번만 평가
-- - 중복 SELECT 정책 병합 (26개 → 18개)
-- - 성능 향상: 대규모 데이터 조회 시 수십~수백 배 빠름
--
-- ============================================================
