-- Remove unused last_mode column from users table
-- This feature was never implemented in the application

-- Drop the index first
DROP INDEX IF EXISTS idx_users_last_mode;

-- Drop the column
ALTER TABLE users DROP COLUMN IF EXISTS last_mode;

-- Verification query (optional - comment out for production)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public';
