require('dotenv').config({ path: '.env.local' })

console.log('Adding unique constraint to prevent duplicate pending withdrawals...\n')

const sql = `
-- Add unique constraint to prevent multiple pending withdrawals per seller
-- First, delete duplicate pending requests (keep only the earliest one per seller)
DELETE FROM withdrawal_requests
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY seller_id, status ORDER BY created_at ASC) as rn
    FROM withdrawal_requests
    WHERE status = 'pending'
  ) t
  WHERE rn > 1
);

-- Create unique partial index to enforce only one pending withdrawal per seller
CREATE UNIQUE INDEX IF NOT EXISTS idx_withdrawal_requests_seller_pending
ON withdrawal_requests(seller_id)
WHERE status = 'pending';
`

console.log('⚠️  Please execute the following SQL in Supabase Dashboard:')
console.log('https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new')
console.log('\n' + sql)
