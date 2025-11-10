-- Add missing columns to withdrawal_requests table

-- Add completed_at column for tracking when withdrawal was processed
ALTER TABLE withdrawal_requests
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Add rejected_reason column for storing rejection reason
ALTER TABLE withdrawal_requests
ADD COLUMN IF NOT EXISTS rejected_reason TEXT;

-- Update existing records to set completed_at if status is completed
UPDATE withdrawal_requests
SET completed_at = created_at
WHERE status = 'completed' AND completed_at IS NULL;
