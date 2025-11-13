-- RLS 정책 없는 테이블에 보안 정책 추가
-- disputes, seller_earnings, settlements

-- ============================================================
-- 1. DISPUTES (분쟁 테이블) RLS 정책
-- ============================================================

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "분쟁 당사자는 자신의 분쟁 조회 가능" ON disputes;
DROP POLICY IF EXISTS "관리자는 모든 분쟁 조회 가능" ON disputes;
DROP POLICY IF EXISTS "사용자는 자신의 주문에 대해 분쟁 생성 가능" ON disputes;
DROP POLICY IF EXISTS "중재자는 분쟁 업데이트 가능" ON disputes;

-- 분쟁 당사자(구매자/판매자)는 자신이 관련된 분쟁만 조회 가능
CREATE POLICY "분쟁 당사자는 자신의 분쟁 조회 가능"
ON disputes FOR SELECT
TO authenticated
USING (
  initiated_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = disputes.order_id
    AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
  )
);

-- 관리자는 모든 분쟁 조회 가능
CREATE POLICY "관리자는 모든 분쟁 조회 가능"
ON disputes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
  )
);

-- 사용자는 자신의 주문에 대해서만 분쟁 생성 가능
CREATE POLICY "사용자는 자신의 주문에 대해 분쟁 생성 가능"
ON disputes FOR INSERT
TO authenticated
WITH CHECK (
  initiated_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = disputes.order_id
    AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
  )
);

-- 중재자(관리자)만 분쟁 업데이트 가능
CREATE POLICY "중재자는 분쟁 업데이트 가능"
ON disputes FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
  )
);

-- ============================================================
-- 2. SELLER_EARNINGS (판매자 수익 테이블) RLS 정책
-- ============================================================

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "판매자는 자신의 수익 정보 조회 가능" ON seller_earnings;
DROP POLICY IF EXISTS "관리자는 모든 판매자 수익 조회 가능" ON seller_earnings;
DROP POLICY IF EXISTS "판매자는 자신의 수익 정보 업데이트 가능" ON seller_earnings;

-- 판매자는 자신의 수익 정보만 조회 가능
CREATE POLICY "판매자는 자신의 수익 정보 조회 가능"
ON seller_earnings FOR SELECT
TO authenticated
USING (seller_id = auth.uid());

-- 관리자는 모든 판매자 수익 조회 가능
CREATE POLICY "관리자는 모든 판매자 수익 조회 가능"
ON seller_earnings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
  )
);

-- 판매자는 자신의 수익 정보만 업데이트 가능 (시스템이 주로 업데이트)
CREATE POLICY "판매자는 자신의 수익 정보 업데이트 가능"
ON seller_earnings FOR UPDATE
TO authenticated
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

-- 시스템이 seller_earnings 생성 가능 (판매자 등록 시)
CREATE POLICY "seller_earnings 생성 허용"
ON seller_earnings FOR INSERT
TO authenticated
WITH CHECK (seller_id = auth.uid());

-- ============================================================
-- 3. SETTLEMENTS (정산 테이블) RLS 정책
-- ============================================================

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "판매자는 자신의 정산 내역 조회 가능" ON settlements;
DROP POLICY IF EXISTS "관리자는 모든 정산 내역 조회 가능" ON settlements;
DROP POLICY IF EXISTS "관리자는 정산 생성 가능" ON settlements;
DROP POLICY IF EXISTS "관리자는 정산 업데이트 가능" ON settlements;

-- 판매자는 자신의 정산 내역만 조회 가능
CREATE POLICY "판매자는 자신의 정산 내역 조회 가능"
ON settlements FOR SELECT
TO authenticated
USING (seller_id = auth.uid());

-- 관리자는 모든 정산 내역 조회 가능
CREATE POLICY "관리자는 모든 정산 내역 조회 가능"
ON settlements FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
  )
);

-- 관리자만 정산 생성 가능
CREATE POLICY "관리자는 정산 생성 가능"
ON settlements FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
  )
);

-- 관리자만 정산 업데이트 가능
CREATE POLICY "관리자는 정산 업데이트 가능"
ON settlements FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
  )
);

-- ============================================================
-- 주석 추가
-- ============================================================

COMMENT ON POLICY "분쟁 당사자는 자신의 분쟁 조회 가능" ON disputes IS '구매자와 판매자는 자신이 관련된 분쟁만 조회 가능';
COMMENT ON POLICY "관리자는 모든 분쟁 조회 가능" ON disputes IS '관리자는 모든 분쟁 조회하여 중재 가능';
COMMENT ON POLICY "사용자는 자신의 주문에 대해 분쟁 생성 가능" ON disputes IS '주문 당사자만 분쟁 생성 가능';
COMMENT ON POLICY "중재자는 분쟁 업데이트 가능" ON disputes IS '관리자만 분쟁 상태 및 결과 업데이트 가능';

COMMENT ON POLICY "판매자는 자신의 수익 정보 조회 가능" ON seller_earnings IS '판매자는 본인 수익만 조회';
COMMENT ON POLICY "관리자는 모든 판매자 수익 조회 가능" ON seller_earnings IS '관리자는 모든 판매자 수익 조회 가능';
COMMENT ON POLICY "판매자는 자신의 수익 정보 업데이트 가능" ON seller_earnings IS '판매자 본인만 수익 정보 업데이트';
COMMENT ON POLICY "seller_earnings 생성 허용" ON seller_earnings IS '판매자 등록 시 수익 정보 생성';

COMMENT ON POLICY "판매자는 자신의 정산 내역 조회 가능" ON settlements IS '판매자는 본인 정산 내역만 조회';
COMMENT ON POLICY "관리자는 모든 정산 내역 조회 가능" ON settlements IS '관리자는 모든 정산 내역 조회 및 관리';
COMMENT ON POLICY "관리자는 정산 생성 가능" ON settlements IS '관리자만 정산 생성 가능';
COMMENT ON POLICY "관리자는 정산 업데이트 가능" ON settlements IS '관리자만 정산 상태 업데이트 가능';
