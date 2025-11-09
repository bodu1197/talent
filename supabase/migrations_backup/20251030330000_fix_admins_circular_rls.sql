-- ============================================
-- Fix admins table circular RLS reference
-- Allow users to check their own admin status
-- ============================================

DROP POLICY IF EXISTS "Only super admin can view admins table" ON public.admins;

-- Users can view their own admin record (no circular reference)
CREATE POLICY "Users can view own admin record"
    ON public.admins FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- This allows authenticated users to check if they are admin
-- by querying their own record, without needing to check if they're admin first
