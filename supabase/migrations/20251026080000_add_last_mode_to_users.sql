-- Add last_mode column to users table for tracking user's preferred page (buyer/seller)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_mode TEXT DEFAULT 'buyer' CHECK (last_mode IN ('buyer', 'seller'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_last_mode ON users(last_mode);

-- Update existing users
UPDATE users SET last_mode = 'buyer' WHERE last_mode IS NULL;

-- Add comment
COMMENT ON COLUMN users.last_mode IS 'Last visited mode (buyer/seller page) - used for redirect after login';
