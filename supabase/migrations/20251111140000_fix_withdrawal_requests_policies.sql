-- Fix withdrawal_requests policies - Remove duplicates and optimize
DROP POLICY IF EXISTS "Sellers can create withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Sellers can view own withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Sellers can update own pending withdrawals" ON withdrawal_requests;
DROP POLICY IF EXISTS "View own or all withdrawal requests" ON withdrawal_requests;

CREATE POLICY "Sellers can create withdrawal requests"
ON withdrawal_requests
FOR INSERT
TO authenticated
WITH CHECK (
  seller_id IN (
    SELECT id FROM sellers WHERE user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Sellers can view own withdrawal requests"
ON withdrawal_requests
FOR SELECT
TO authenticated
USING (
  seller_id IN (
    SELECT id FROM sellers WHERE user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Sellers can update own pending withdrawals"
ON withdrawal_requests
FOR UPDATE
TO authenticated
USING (
  seller_id IN (
    SELECT id FROM sellers WHERE user_id = (SELECT auth.uid())
  )
  AND status = 'pending'
)
WITH CHECK (
  seller_id IN (
    SELECT id FROM sellers WHERE user_id = (SELECT auth.uid())
  )
);
