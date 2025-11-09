-- Fix remaining multiple_permissive_policies warnings
-- Consolidating all duplicate RLS policies

-- ============================================
-- BUYERS TABLE
-- ============================================

-- Consolidate INSERT policies
DROP POLICY IF EXISTS "Users can insert their own buyer profile" ON public.buyers;
DROP POLICY IF EXISTS "Users can insert their own buyer record" ON public.buyers;

CREATE POLICY "Users can insert buyer record"
    ON public.buyers
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

-- Consolidate SELECT policies
DROP POLICY IF EXISTS "Buyers can view their own record" ON public.buyers;
DROP POLICY IF EXISTS "Users can view their own buyer record" ON public.buyers;

CREATE POLICY "Users can view buyer record"
    ON public.buyers
    FOR SELECT
    USING (user_id = (select auth.uid()));

-- Consolidate UPDATE policies
DROP POLICY IF EXISTS "Buyers can update their own record" ON public.buyers;
DROP POLICY IF EXISTS "Users can update their own buyer profile" ON public.buyers;
DROP POLICY IF EXISTS "Users can update their own buyer record" ON public.buyers;

CREATE POLICY "Users can update buyer record"
    ON public.buyers
    FOR UPDATE
    USING (user_id = (select auth.uid()));

-- ============================================
-- SELLERS TABLE
-- ============================================

-- Consolidate INSERT policies
DROP POLICY IF EXISTS "Users can insert their own seller profile" ON public.sellers;
DROP POLICY IF EXISTS "Users can insert their own seller record" ON public.sellers;

CREATE POLICY "Users can insert seller record"
    ON public.sellers
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

-- Consolidate UPDATE policies (keep the consolidated one from previous migration)
DROP POLICY IF EXISTS "Users can update their own seller profile" ON public.sellers;

-- Consolidate SELECT policies (keep the consolidated one from previous migration)
DROP POLICY IF EXISTS "Users can view their own seller record" ON public.sellers;

-- ============================================
-- CATEGORIES TABLE
-- ============================================

-- Consolidate DELETE policies
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can delete categories" ON public.categories;

CREATE POLICY "Admins manage category deletion"
    ON public.categories
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid())
        )
    );

-- Consolidate INSERT policies
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can insert categories" ON public.categories;

CREATE POLICY "Admins manage category insertion"
    ON public.categories
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid())
        )
    );

-- Consolidate SELECT policies
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can view all categories" ON public.categories;

CREATE POLICY "Everyone can view categories"
    ON public.categories
    FOR SELECT
    USING (true);

-- Consolidate UPDATE policies
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON public.categories;

CREATE POLICY "Admins manage category updates"
    ON public.categories
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid())
        )
    );

-- ============================================
-- CATEGORY_VISITS TABLE
-- ============================================

-- Consolidate INSERT policies
DROP POLICY IF EXISTS "Users and admins manage category visits" ON public.category_visits;
DROP POLICY IF EXISTS "Users can insert their own category visits" ON public.category_visits;

CREATE POLICY "Users manage category visit inserts"
    ON public.category_visits
    FOR INSERT
    WITH CHECK (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid())
        )
    );

-- Consolidate SELECT policies
DROP POLICY IF EXISTS "Users can view their own category visits" ON public.category_visits;

CREATE POLICY "Users manage category visit selects"
    ON public.category_visits
    FOR SELECT
    USING (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid())
        )
    );

-- Consolidate UPDATE policies
DROP POLICY IF EXISTS "Users can update their own category visits" ON public.category_visits;

CREATE POLICY "Users manage category visit updates"
    ON public.category_visits
    FOR UPDATE
    USING (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid())
        )
    );

-- ============================================
-- SERVICE_PACKAGES TABLE
-- ============================================

-- Consolidate DELETE policies
DROP POLICY IF EXISTS "Sellers can delete packages for their services" ON public.service_packages;
DROP POLICY IF EXISTS "Service owners manage packages" ON public.service_packages;

CREATE POLICY "Service owners manage package deletion"
    ON public.service_packages
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.services
            WHERE services.id = service_id
            AND services.seller_id IN (
                SELECT id FROM public.sellers WHERE user_id = (select auth.uid())
            )
        )
    );

-- Consolidate INSERT policies
DROP POLICY IF EXISTS "Sellers can insert packages for their services" ON public.service_packages;

CREATE POLICY "Service owners manage package insertion"
    ON public.service_packages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.services
            WHERE services.id = service_id
            AND services.seller_id IN (
                SELECT id FROM public.sellers WHERE user_id = (select auth.uid())
            )
        )
    );

-- Consolidate SELECT policies
DROP POLICY IF EXISTS "Service packages are viewable by service viewers" ON public.service_packages;

CREATE POLICY "Service owners manage package selection"
    ON public.service_packages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.services
            WHERE services.id = service_id
            AND (
                services.status = 'active'
                OR services.seller_id IN (
                    SELECT id FROM public.sellers WHERE user_id = (select auth.uid())
                )
                OR EXISTS (
                    SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid())
                )
            )
        )
    );

-- Consolidate UPDATE policies
DROP POLICY IF EXISTS "Sellers can update packages for their services" ON public.service_packages;

CREATE POLICY "Service owners manage package updates"
    ON public.service_packages
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.services
            WHERE services.id = service_id
            AND services.seller_id IN (
                SELECT id FROM public.sellers WHERE user_id = (select auth.uid())
            )
        )
    );

-- ============================================
-- SERVICE_REVISIONS TABLE
-- ============================================

-- Consolidate SELECT policies (keep the consolidated ones from previous migration)
-- Already consolidated in migration 20251102000004

-- ============================================
-- SERVICES TABLE
-- ============================================

-- Consolidate DELETE policies
DROP POLICY IF EXISTS "Sellers can delete own services" ON public.services;
DROP POLICY IF EXISTS "Sellers can delete their own services" ON public.services;
DROP POLICY IF EXISTS "Sellers delete own services" ON public.services;

CREATE POLICY "Sellers manage service deletion"
    ON public.services
    FOR DELETE
    USING (
        seller_id IN (
            SELECT id FROM public.sellers WHERE user_id = (select auth.uid())
        )
    );

-- Consolidate INSERT policies
DROP POLICY IF EXISTS "Sellers can insert their own services" ON public.services;
DROP POLICY IF EXISTS "Sellers create services" ON public.services;

CREATE POLICY "Sellers manage service insertion"
    ON public.services
    FOR INSERT
    WITH CHECK (
        seller_id IN (
            SELECT id FROM public.sellers WHERE user_id = (select auth.uid())
        )
    );

-- Consolidate SELECT policies (keep the consolidated one from previous migration)
DROP POLICY IF EXISTS "View active or own services" ON public.services;

-- Consolidate UPDATE policies
DROP POLICY IF EXISTS "Sellers can update own services" ON public.services;
DROP POLICY IF EXISTS "Sellers update own services" ON public.services;

CREATE POLICY "Sellers manage service updates"
    ON public.services
    FOR UPDATE
    USING (
        seller_id IN (
            SELECT id FROM public.sellers WHERE user_id = (select auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid())
        )
    );

-- ============================================
-- USERS TABLE
-- ============================================

-- Consolidate UPDATE policies (keep the consolidated one from previous migration)
DROP POLICY IF EXISTS "Users update own profile" ON public.users;

-- ============================================
-- ADMINS TABLE
-- ============================================

-- Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can view their own admin record" ON public.admins;
DROP POLICY IF EXISTS "Users can view own admin record" ON public.admins;
DROP POLICY IF EXISTS "Admins can view admin records" ON public.admins;

CREATE POLICY "Users can view admin records"
    ON public.admins
    FOR SELECT
    USING (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid())
        )
    );
