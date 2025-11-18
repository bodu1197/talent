-- Add role column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin'));

-- Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update existing profiles to set appropriate roles based on sellers table
UPDATE profiles p
SET role = 'seller'
FROM sellers s
WHERE p.user_id = s.user_id
AND p.role = 'buyer';

-- Comment
COMMENT ON COLUMN profiles.role IS 'User role: buyer, seller, or admin';
