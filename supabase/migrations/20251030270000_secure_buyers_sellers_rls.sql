-- ============================================
-- Secure buyers and sellers RLS - only allow viewing own records
-- ============================================

-- Drop permissive policies
DROP POLICY IF EXISTS "Authenticated users can check buyer records" ON public.buyers;
DROP POLICY IF EXISTS "Authenticated users can check seller records" ON public.sellers;

-- Buyers: Only view own record
CREATE POLICY "Users can view their own buyer record"
    ON public.buyers FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Sellers: Only view own record
CREATE POLICY "Users can view their own seller record"
    ON public.sellers FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Keep the public seller verification policy for marketplace
DROP POLICY IF EXISTS "Anyone can view active verified sellers" ON public.sellers;
CREATE POLICY "Anyone can view active verified sellers"
    ON public.sellers FOR SELECT
    USING (is_active = true AND is_verified = true);
