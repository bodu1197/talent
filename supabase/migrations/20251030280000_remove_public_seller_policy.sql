-- ============================================
-- Remove public seller viewing policy
-- Only authenticated users can view sellers (their own records only)
-- ============================================

-- Drop the policy that allows anyone to view verified sellers
DROP POLICY IF EXISTS "Anyone can view active verified sellers" ON public.sellers;

-- Now sellers table only has:
-- 1. "Users can view their own seller record" (auth.uid() = user_id)
-- 2. "Users can update their own seller profile" (auth.uid() = user_id)
-- 3. "Users can insert their own seller profile"

-- All seller information is now private
