-- ============================================
-- Fix admins table RLS - only super_admin can view admins table
-- ============================================

-- Drop the permissive policy that allows all authenticated users to view admins
DROP POLICY IF EXISTS "Authenticated users view admins" ON public.admins;

-- Create secure policy - only super_admin can view admins table
CREATE POLICY "Only super admin can view admins table"
    ON public.admins FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE user_id = auth.uid()
            AND role = 'super_admin'
        )
    );

-- Now admins table has secure policies:
-- 1. "Only super admin can view admins table" (role = 'super_admin') - SELECT
-- 2. "Admins update own info" (auth.uid() = user_id) - UPDATE
-- 3. "Admins delete own info" (auth.uid() = user_id) - DELETE

-- Only super_admin can view the admins table
-- Regular users (buyers/sellers) have no access to admins table
