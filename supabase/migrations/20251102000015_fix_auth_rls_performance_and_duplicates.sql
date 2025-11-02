-- RLS 성능 최적화 및 중복 정책 제거
-- 1. auth.uid()를 (select auth.uid())로 변경하여 성능 개선
-- 2. 중복 정책 제거

-- ============================================
-- 이전 마이그레이션에서 남은 중복 정책 제거
-- ============================================

DROP POLICY IF EXISTS "Users can update user profiles" ON public.users;
DROP POLICY IF EXISTS "Authorized users can update services" ON public.users;

-- ============================================
-- USERS 테이블 - 성능 최적화된 정책
-- ============================================

DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;

CREATE POLICY "users_select_policy"
    ON public.users
    FOR SELECT
    USING (
        id = (select auth.uid())
        OR public.is_admin()
    );

CREATE POLICY "users_update_policy"
    ON public.users
    FOR UPDATE
    USING (
        id = (select auth.uid())
        OR public.is_admin()
    );

-- ============================================
-- ADMINS 테이블 - 성능 최적화
-- ============================================

DROP POLICY IF EXISTS "admins_select_own" ON public.admins;
DROP POLICY IF EXISTS "admins_insert_own" ON public.admins;
DROP POLICY IF EXISTS "admins_update_policy" ON public.admins;

CREATE POLICY "admins_select_own"
    ON public.admins
    FOR SELECT
    USING (user_id = (select auth.uid()));

CREATE POLICY "admins_insert_own"
    ON public.admins
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "admins_update_policy"
    ON public.admins
    FOR UPDATE
    USING (user_id = (select auth.uid()));

-- ============================================
-- BUYERS 테이블 - 성능 최적화
-- ============================================

DROP POLICY IF EXISTS "buyers_select_policy" ON public.buyers;
DROP POLICY IF EXISTS "buyers_insert_own" ON public.buyers;
DROP POLICY IF EXISTS "buyers_update_policy" ON public.buyers;

CREATE POLICY "buyers_select_policy"
    ON public.buyers
    FOR SELECT
    USING (
        user_id = (select auth.uid())
        OR public.is_admin()
    );

CREATE POLICY "buyers_insert_own"
    ON public.buyers
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "buyers_update_policy"
    ON public.buyers
    FOR UPDATE
    USING (
        user_id = (select auth.uid())
        OR public.is_admin()
    );

-- ============================================
-- SELLERS 테이블 - 성능 최적화
-- ============================================

DROP POLICY IF EXISTS "sellers_select_policy" ON public.sellers;
DROP POLICY IF EXISTS "sellers_insert_own" ON public.sellers;
DROP POLICY IF EXISTS "sellers_update_policy" ON public.sellers;

CREATE POLICY "sellers_select_policy"
    ON public.sellers
    FOR SELECT
    USING (
        user_id = (select auth.uid())
        OR public.is_admin()
        OR is_verified = true
    );

CREATE POLICY "sellers_insert_own"
    ON public.sellers
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "sellers_update_policy"
    ON public.sellers
    FOR UPDATE
    USING (
        user_id = (select auth.uid())
        OR public.is_admin()
    );
