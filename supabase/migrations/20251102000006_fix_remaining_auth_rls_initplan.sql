-- Fix remaining auth_rls_initplan warnings
-- Wrapping auth.uid() with (select auth.uid()) for policies that were missed

-- ============================================
-- ADMINS TABLE - Additional policies
-- ============================================

DROP POLICY IF EXISTS "Users can view own admin record" ON public.admins;
CREATE POLICY "Users can view own admin record"
    ON public.admins
    FOR SELECT
    USING (user_id = (select auth.uid()));

-- ============================================
-- BUYERS TABLE - Additional policies
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own buyer profile" ON public.buyers;
CREATE POLICY "Users can insert their own buyer profile"
    ON public.buyers
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own buyer profile" ON public.buyers;
CREATE POLICY "Users can update their own buyer profile"
    ON public.buyers
    FOR UPDATE
    USING (user_id = (select auth.uid()));

-- ============================================
-- SELLERS TABLE - Additional policies
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own seller profile" ON public.sellers;
CREATE POLICY "Users can insert their own seller profile"
    ON public.sellers
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own seller profile" ON public.sellers;
CREATE POLICY "Users can update their own seller profile"
    ON public.sellers
    FOR UPDATE
    USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their own seller record" ON public.sellers;
CREATE POLICY "Users can view their own seller record"
    ON public.sellers
    FOR SELECT
    USING (user_id = (select auth.uid()));

-- ============================================
-- CATEGORY_VISITS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view their own category visits" ON public.category_visits;
CREATE POLICY "Users can view their own category visits"
    ON public.category_visits
    FOR SELECT
    USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own category visits" ON public.category_visits;
CREATE POLICY "Users can insert their own category visits"
    ON public.category_visits
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own category visits" ON public.category_visits;
CREATE POLICY "Users can update their own category visits"
    ON public.category_visits
    FOR UPDATE
    USING (user_id = (select auth.uid()));

-- ============================================
-- SERVICES TABLE - Additional policies
-- ============================================

DROP POLICY IF EXISTS "Sellers create services" ON public.services;
CREATE POLICY "Sellers create services"
    ON public.services
    FOR INSERT
    WITH CHECK (
        seller_id IN (
            SELECT id FROM public.sellers WHERE user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Sellers can update own services" ON public.services;
CREATE POLICY "Sellers can update own services"
    ON public.services
    FOR UPDATE
    USING (
        seller_id IN (
            SELECT id FROM public.sellers WHERE user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Sellers can delete own services" ON public.services;
CREATE POLICY "Sellers can delete own services"
    ON public.services
    FOR DELETE
    USING (
        seller_id IN (
            SELECT id FROM public.sellers WHERE user_id = (select auth.uid())
        )
    );
