-- Fix withdrawal_requests foreign key to reference sellers.id instead of users.id

-- Drop the incorrect foreign key constraint
ALTER TABLE withdrawal_requests
DROP CONSTRAINT IF EXISTS withdrawal_requests_seller_id_fkey;

-- Add the correct foreign key constraint referencing sellers.id
ALTER TABLE withdrawal_requests
ADD CONSTRAINT withdrawal_requests_seller_id_fkey
FOREIGN KEY (seller_id)
REFERENCES sellers(id)
ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_seller_id
ON withdrawal_requests(seller_id);
