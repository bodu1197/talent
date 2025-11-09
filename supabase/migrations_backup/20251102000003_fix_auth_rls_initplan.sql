-- Fix auth_rls_initplan warnings by wrapping auth.uid() with (select auth.uid())
-- This prevents auth.uid() from being re-evaluated for each row

-- ============================================
-- ADMINS TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can view all admin records" ON public.admins;
CREATE POLICY "Admins can view all admin records"
    ON public.admins
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Admins can view their own record" ON public.admins;
CREATE POLICY "Admins can view their own record"
    ON public.admins
    FOR SELECT
    USING (user_id = (select auth.uid()));

-- ============================================
-- BUYERS TABLE
-- ============================================

DROP POLICY IF EXISTS "Buyers can view their own record" ON public.buyers;
CREATE POLICY "Buyers can view their own record"
    ON public.buyers
    FOR SELECT
    USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own buyer record" ON public.buyers;
CREATE POLICY "Users can insert their own buyer record"
    ON public.buyers
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Buyers can update their own record" ON public.buyers;
CREATE POLICY "Buyers can update their own record"
    ON public.buyers
    FOR UPDATE
    USING (user_id = (select auth.uid()));

-- ============================================
-- CATEGORIES TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories"
    ON public.categories
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories"
    ON public.categories
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories"
    ON public.categories
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = (select auth.uid())
        )
    );

-- Note: messages, conversations, orders, and reviews tables policies skipped
-- These tables either don't exist yet or will be handled in future migrations

-- ============================================
-- SELLERS TABLE
-- ============================================

DROP POLICY IF EXISTS "Sellers can view their own record" ON public.sellers;
CREATE POLICY "Sellers can view their own record"
    ON public.sellers
    FOR SELECT
    USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can view all sellers" ON public.sellers;
CREATE POLICY "Admins can view all sellers"
    ON public.sellers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can insert their own seller record" ON public.sellers;
CREATE POLICY "Users can insert their own seller record"
    ON public.sellers
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Sellers can update their own record" ON public.sellers;
CREATE POLICY "Sellers can update their own record"
    ON public.sellers
    FOR UPDATE
    USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can update sellers" ON public.sellers;
CREATE POLICY "Admins can update sellers"
    ON public.sellers
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = (select auth.uid())
        )
    );

-- ============================================
-- SERVICES TABLE
-- ============================================

DROP POLICY IF EXISTS "Sellers can view their own services" ON public.services;
CREATE POLICY "Sellers can view their own services"
    ON public.services
    FOR SELECT
    USING (
        seller_id IN (
            SELECT id FROM public.sellers WHERE user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Admins can view all services" ON public.services;
CREATE POLICY "Admins can view all services"
    ON public.services
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Sellers can insert their own services" ON public.services;
CREATE POLICY "Sellers can insert their own services"
    ON public.services
    FOR INSERT
    WITH CHECK (
        seller_id IN (
            SELECT id FROM public.sellers WHERE user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Sellers can update their own services" ON public.services;
CREATE POLICY "Sellers can update their own services"
    ON public.services
    FOR UPDATE
    USING (
        seller_id IN (
            SELECT id FROM public.sellers WHERE user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Admins can update all services" ON public.services;
CREATE POLICY "Admins can update all services"
    ON public.services
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Sellers can delete their own services" ON public.services;
CREATE POLICY "Sellers can delete their own services"
    ON public.services
    FOR DELETE
    USING (
        seller_id IN (
            SELECT id FROM public.sellers WHERE user_id = (select auth.uid())
        )
    );

-- ============================================
-- SERVICE_CATEGORIES TABLE
-- ============================================

DROP POLICY IF EXISTS "Service categories are viewable by service viewers" ON public.service_categories;
CREATE POLICY "Service categories are viewable by service viewers"
    ON public.service_categories
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

DROP POLICY IF EXISTS "Sellers can insert categories for their services" ON public.service_categories;
CREATE POLICY "Sellers can insert categories for their services"
    ON public.service_categories
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

DROP POLICY IF EXISTS "Sellers can delete categories for their services" ON public.service_categories;
CREATE POLICY "Sellers can delete categories for their services"
    ON public.service_categories
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

-- ============================================
-- SERVICE_PACKAGES TABLE
-- ============================================

DROP POLICY IF EXISTS "Service packages are viewable by service viewers" ON public.service_packages;
CREATE POLICY "Service packages are viewable by service viewers"
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

DROP POLICY IF EXISTS "Sellers can insert packages for their services" ON public.service_packages;
CREATE POLICY "Sellers can insert packages for their services"
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

DROP POLICY IF EXISTS "Sellers can update packages for their services" ON public.service_packages;
CREATE POLICY "Sellers can update packages for their services"
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

DROP POLICY IF EXISTS "Sellers can delete packages for their services" ON public.service_packages;
CREATE POLICY "Sellers can delete packages for their services"
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

-- ============================================
-- SERVICE_REVISIONS TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can view all service revisions" ON public.service_revisions;
CREATE POLICY "Admins can view all service revisions"
    ON public.service_revisions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Sellers can view their own service revisions" ON public.service_revisions;
CREATE POLICY "Sellers can view their own service revisions"
    ON public.service_revisions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sellers
            WHERE sellers.id = service_revisions.seller_id
            AND sellers.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Sellers can create their own service revisions" ON public.service_revisions;
CREATE POLICY "Sellers can create their own service revisions"
    ON public.service_revisions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sellers
            WHERE sellers.id = seller_id
            AND sellers.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Admins can update service revisions" ON public.service_revisions;
CREATE POLICY "Admins can update service revisions"
    ON public.service_revisions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = (select auth.uid())
        )
    );

-- ============================================
-- SERVICE_REVISION_CATEGORIES TABLE
-- ============================================

DROP POLICY IF EXISTS "Service revision categories are viewable by revision viewers" ON public.service_revision_categories;
CREATE POLICY "Service revision categories are viewable by revision viewers"
    ON public.service_revision_categories
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.service_revisions
            WHERE service_revisions.id = revision_id
            AND (
                EXISTS (
                    SELECT 1 FROM public.admins
                    WHERE admins.user_id = (select auth.uid())
                )
                OR EXISTS (
                    SELECT 1 FROM public.sellers
                    WHERE sellers.id = service_revisions.seller_id
                    AND sellers.user_id = (select auth.uid())
                )
            )
        )
    );

DROP POLICY IF EXISTS "Sellers can insert revision categories" ON public.service_revision_categories;
CREATE POLICY "Sellers can insert revision categories"
    ON public.service_revision_categories
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.service_revisions
            JOIN public.sellers ON sellers.id = service_revisions.seller_id
            WHERE service_revisions.id = revision_id
            AND sellers.user_id = (select auth.uid())
        )
    );

-- ============================================
-- SERVICE_REVISION_PACKAGES TABLE
-- ============================================

DROP POLICY IF EXISTS "Service revision packages are viewable by revision viewers" ON public.service_revision_packages;
CREATE POLICY "Service revision packages are viewable by revision viewers"
    ON public.service_revision_packages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.service_revisions
            WHERE service_revisions.id = revision_id
            AND (
                EXISTS (
                    SELECT 1 FROM public.admins
                    WHERE admins.user_id = (select auth.uid())
                )
                OR EXISTS (
                    SELECT 1 FROM public.sellers
                    WHERE sellers.id = service_revisions.seller_id
                    AND sellers.user_id = (select auth.uid())
                )
            )
        )
    );

DROP POLICY IF EXISTS "Sellers can insert revision packages" ON public.service_revision_packages;
CREATE POLICY "Sellers can insert revision packages"
    ON public.service_revision_packages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.service_revisions
            JOIN public.sellers ON sellers.id = service_revisions.seller_id
            WHERE service_revisions.id = revision_id
            AND sellers.user_id = (select auth.uid())
        )
    );

-- ============================================
-- SERVICE_VIEW_LOGS TABLE
-- ============================================

DROP POLICY IF EXISTS "Service owners can view their logs" ON public.service_view_logs;
CREATE POLICY "Service owners can view their logs"
    ON public.service_view_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.services
            JOIN public.sellers ON sellers.id = services.seller_id
            WHERE services.id = service_view_logs.service_id
            AND sellers.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Admins can view all logs" ON public.service_view_logs;
CREATE POLICY "Admins can view all logs"
    ON public.service_view_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = (select auth.uid())
        )
    );

-- ============================================
-- USERS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
    ON public.users
    FOR SELECT
    USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
    ON public.users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
    ON public.users
    FOR INSERT
    WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
    ON public.users
    FOR UPDATE
    USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users"
    ON public.users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = (select auth.uid())
        )
    );
