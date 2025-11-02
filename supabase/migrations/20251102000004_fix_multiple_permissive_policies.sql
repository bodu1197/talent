-- Fix multiple_permissive_policies warnings by consolidating duplicate RLS policies
-- This merges multiple permissive policies into single policies with OR conditions

-- ============================================
-- ADMINS TABLE - Consolidate SELECT policies
-- ============================================

DROP POLICY IF EXISTS "Admins can view all admin records" ON public.admins;
DROP POLICY IF EXISTS "Admins can view their own record" ON public.admins;

CREATE POLICY "Admins can view admin records"
    ON public.admins
    FOR SELECT
    USING (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.user_id = (select auth.uid())
        )
    );

-- Note: conversations, favorites, notifications, orders, and reviews tables policies skipped
-- These tables either don't exist yet or will be handled in future migrations

-- ============================================
-- SELLERS TABLE - Consolidate SELECT policies
-- ============================================

DROP POLICY IF EXISTS "Sellers can view their own record" ON public.sellers;
DROP POLICY IF EXISTS "Admins can view all sellers" ON public.sellers;

CREATE POLICY "Users can view sellers"
    ON public.sellers
    FOR SELECT
    USING (
        user_id = (select auth.uid())
        OR is_verified = true
        OR EXISTS (
            SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid())
        )
    );

-- Consolidate UPDATE policies
DROP POLICY IF EXISTS "Sellers can update their own record" ON public.sellers;
DROP POLICY IF EXISTS "Admins can update sellers" ON public.sellers;

CREATE POLICY "Users can update sellers"
    ON public.sellers
    FOR UPDATE
    USING (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid())
        )
    );

-- ============================================
-- SERVICES TABLE - Consolidate SELECT policies
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
DROP POLICY IF EXISTS "Sellers can view their own services" ON public.services;
DROP POLICY IF EXISTS "Admins can view all services" ON public.services;

CREATE POLICY "Users can view services"
    ON public.services
    FOR SELECT
    USING (
        status = 'active'
        OR seller_id IN (
            SELECT id FROM public.sellers WHERE user_id = (select auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid())
        )
    );

-- Consolidate UPDATE policies
DROP POLICY IF EXISTS "Sellers can update their own services" ON public.services;
DROP POLICY IF EXISTS "Admins can update all services" ON public.services;

CREATE POLICY "Users can update services"
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
-- SERVICE_VIEW_LOGS TABLE - Consolidate SELECT policies
-- ============================================

DROP POLICY IF EXISTS "Service owners can view their logs" ON public.service_view_logs;
DROP POLICY IF EXISTS "Admins can view all logs" ON public.service_view_logs;

CREATE POLICY "Users can view service logs"
    ON public.service_view_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.services
            JOIN public.sellers ON sellers.id = services.seller_id
            WHERE services.id = service_view_logs.service_id
            AND sellers.user_id = (select auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid())
        )
    );

-- ============================================
-- USERS TABLE - Consolidate SELECT policies
-- ============================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Anyone can view verified sellers" ON public.users;

CREATE POLICY "Users can view user profiles"
    ON public.users
    FOR SELECT
    USING (
        id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.sellers
            WHERE sellers.user_id = users.id
            AND sellers.is_verified = true
        )
    );

-- Consolidate UPDATE policies
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

CREATE POLICY "Users can update user profiles"
    ON public.users
    FOR UPDATE
    USING (
        id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid())
        )
    );
