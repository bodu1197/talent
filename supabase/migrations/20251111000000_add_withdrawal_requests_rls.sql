-- Enable RLS on withdrawal_requests table
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Sellers can create withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Sellers can view own withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Sellers can update own pending withdrawals" ON withdrawal_requests;

-- Policy: Sellers can insert their own withdrawal requests
CREATE POLICY "Sellers can create withdrawal requests"
ON withdrawal_requests
FOR INSERT
TO authenticated
WITH CHECK (
  seller_id IN (
    SELECT id FROM sellers WHERE user_id = auth.uid()
  )
);

-- Policy: Sellers can view their own withdrawal requests
CREATE POLICY "Sellers can view own withdrawal requests"
ON withdrawal_requests
FOR SELECT
TO authenticated
USING (
  seller_id IN (
    SELECT id FROM sellers WHERE user_id = auth.uid()
  )
);

-- Policy: Sellers can update their own pending withdrawal requests (e.g., cancel)
CREATE POLICY "Sellers can update own pending withdrawals"
ON withdrawal_requests
FOR UPDATE
TO authenticated
USING (
  seller_id IN (
    SELECT id FROM sellers WHERE user_id = auth.uid()
  )
  AND status = 'pending'
)
WITH CHECK (
  seller_id IN (
    SELECT id FROM sellers WHERE user_id = auth.uid()
  )
);
