-- ============================================
-- Fix RLS policies for buyers/sellers tables
-- Allow querying even when no record exists
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own buyer profile" ON public.buyers;
DROP POLICY IF EXISTS "Users can view their own seller profile" ON public.sellers;

-- Create new policies that allow checking existence
-- Allow authenticated users to check if they have buyer/seller records
CREATE POLICY "Authenticated users can check buyer records"
    ON public.buyers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can check seller records"
    ON public.sellers FOR SELECT
    TO authenticated
    USING (true);

-- Keep update policies restricted to own records
-- (already exist from previous migration)
