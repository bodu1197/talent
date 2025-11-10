-- Optimize RLS policies for payment tables to improve performance

-- ============================================================================
-- payment_requests 테이블 RLS 정책 최적화
-- ============================================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "payment_requests_select" ON payment_requests;
DROP POLICY IF EXISTS "payment_requests_insert" ON payment_requests;
DROP POLICY IF EXISTS "payment_requests_update_buyer" ON payment_requests;
DROP POLICY IF EXISTS "payment_requests_update_seller" ON payment_requests;

-- SELECT 정책 (auth.uid() 최적화)
CREATE POLICY "payment_requests_select"
  ON payment_requests FOR SELECT
  USING (
    buyer_id = (SELECT auth.uid())
    OR seller_id = (SELECT auth.uid())
  );

-- INSERT 정책 (auth.uid() 최적화)
CREATE POLICY "payment_requests_insert"
  ON payment_requests FOR INSERT
  WITH CHECK (buyer_id = (SELECT auth.uid()));

-- UPDATE 정책 통합 (buyer와 seller를 하나의 정책으로)
CREATE POLICY "payment_requests_update"
  ON payment_requests FOR UPDATE
  USING (
    buyer_id = (SELECT auth.uid())
    OR seller_id = (SELECT auth.uid())
  )
  WITH CHECK (
    -- buyer_id와 seller_id는 변경 불가
    buyer_id = (SELECT auth.uid())
    OR seller_id = (SELECT auth.uid())
  );

-- ============================================================================
-- payments 테이블 RLS 정책 최적화
-- ============================================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "payments_select" ON payments;

-- SELECT 정책 (auth.uid() 최적화)
CREATE POLICY "payments_select"
  ON payments FOR SELECT
  USING (
    buyer_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
        AND orders.seller_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- refunds 테이블 RLS 정책 최적화
-- ============================================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "refunds_select" ON refunds;
DROP POLICY IF EXISTS "refunds_insert" ON refunds;

-- SELECT 정책 (auth.uid() 최적화)
CREATE POLICY "refunds_select"
  ON refunds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = refunds.order_id
        AND (orders.buyer_id = (SELECT auth.uid()) OR orders.seller_id = (SELECT auth.uid()))
    )
  );

-- INSERT 정책 (auth.uid() 최적화)
CREATE POLICY "refunds_insert"
  ON refunds FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = refunds.order_id
        AND (orders.buyer_id = (SELECT auth.uid()) OR orders.seller_id = (SELECT auth.uid()))
    )
  );
