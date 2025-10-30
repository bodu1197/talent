-- ============================================
-- Secure users table RLS - only allow viewing own profile
-- ============================================

-- Drop the permissive policy
DROP POLICY IF EXISTS "View all user profiles" ON public.users;

-- Create secure policy - authenticated users can only view their own profile
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- This is secure but may cause loading issues if auth is slow
-- The timeout in AuthProvider will handle this by setting fallback profile
