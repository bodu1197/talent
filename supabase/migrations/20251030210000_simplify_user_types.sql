-- ============================================
-- Simplify user_type to only 'buyer' and 'seller'
-- Remove 'both' and 'admin' types
-- ============================================

-- Update the check constraint on users table
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_user_type_check;

ALTER TABLE public.users
ADD CONSTRAINT users_user_type_check
CHECK (user_type IN ('buyer', 'seller'));

-- Update any existing 'both' users to 'seller' (they can access both dashboards anyway)
UPDATE public.users
SET user_type = 'seller'
WHERE user_type = 'both';

-- Update any existing 'admin' users to 'seller' (admin pages are accessed separately)
UPDATE public.users
SET user_type = 'seller'
WHERE user_type = 'admin';

-- Add comment explaining the change
COMMENT ON COLUMN public.users.user_type IS
'User type: buyer or seller. All users can access both dashboards via sidebar navigation.';
