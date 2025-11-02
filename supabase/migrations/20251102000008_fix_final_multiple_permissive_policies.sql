-- Fix final multiple_permissive_policies warnings
-- Consolidating remaining duplicate policies for service_revisions and services tables

-- ============================================
-- SERVICE_REVISIONS TABLE
-- ============================================

-- Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can view all service revisions" ON public.service_revisions;
DROP POLICY IF EXISTS "Sellers can view their own service revisions" ON public.service_revisions;

CREATE POLICY "Users can view service revisions"
    ON public.service_revisions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = (select auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.sellers
            WHERE sellers.id = service_revisions.seller_id
            AND sellers.user_id = (select auth.uid())
        )
    );

-- ============================================
-- SERVICES TABLE
-- ============================================

-- Consolidate UPDATE policies
DROP POLICY IF EXISTS "Sellers manage service updates" ON public.services;
DROP POLICY IF EXISTS "Users can update services" ON public.services;

CREATE POLICY "Authorized users can update services"
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
