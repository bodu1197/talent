-- 로그인 후 사용자가 자신의 정보를 조회하지 못하는 문제 수정
-- users 테이블 RLS 정책을 단순화하여 모든 로그인 사용자가 자신의 정보를 볼 수 있도록 함

-- ============================================
-- USERS TABLE - SELECT POLICY FIX
-- ============================================

-- 기존 정책 제거
DROP POLICY IF EXISTS "Users can view user profiles" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;

-- 새 정책: 모든 인증된 사용자는 자신의 프로필을 볼 수 있음
-- admins 체크를 제거하여 무한 재귀 방지
CREATE POLICY "Authenticated users can view own profile"
    ON public.users
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND id = auth.uid()
    );

-- ============================================
-- ADMINS TABLE - FIX INFINITE RECURSION
-- ============================================

-- admins 테이블의 무한 재귀 문제 수정
-- "Admins can view all admin records" 정책이 자기 자신을 참조하여 무한 재귀 발생
DROP POLICY IF EXISTS "Admins can view all admin records" ON public.admins;
DROP POLICY IF EXISTS "Admins can view their own record" ON public.admins;

-- 단순 정책: 인증된 사용자는 자신의 admin 레코드만 볼 수 있음
CREATE POLICY "Users can view own admin record"
    ON public.admins
    FOR SELECT
    USING (user_id = auth.uid());

-- ============================================
-- BUYERS TABLE - SELECT POLICY CHECK
-- ============================================

-- buyers 테이블도 확인 - 사용자가 자신의 buyer 정보를 조회할 수 있어야 함
DROP POLICY IF EXISTS "Users can view buyer profiles" ON public.buyers;
DROP POLICY IF EXISTS "Buyers can view their own record" ON public.buyers;

CREATE POLICY "Users can view own buyer profile"
    ON public.buyers
    FOR SELECT
    USING (user_id = auth.uid());

-- ============================================
-- SELLERS TABLE - SELECT POLICY CHECK
-- ============================================

-- sellers 테이블도 확인 - 사용자가 자신의 seller 정보를 조회할 수 있어야 함
DROP POLICY IF EXISTS "Users can view seller profiles" ON public.sellers;
DROP POLICY IF EXISTS "Anyone can view verified sellers" ON public.sellers;
DROP POLICY IF EXISTS "Users can view own seller profile" ON public.sellers;
DROP POLICY IF EXISTS "Sellers can view their own record" ON public.sellers;

-- 자신의 seller 정보 조회 (admins 체크 제거하여 무한 재귀 방지)
CREATE POLICY "Users can view own seller profile"
    ON public.sellers
    FOR SELECT
    USING (user_id = auth.uid());

-- 인증된 모든 사용자는 verified된 seller 정보를 볼 수 있음 (서비스 목록용)
CREATE POLICY "Anyone can view verified sellers"
    ON public.sellers
    FOR SELECT
    USING (is_verified = true);

-- ============================================
-- INSERT POLICIES - 회원가입 시 필요
-- ============================================

-- users 테이블 INSERT 정책 확인 (회원가입 시)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

CREATE POLICY "Service role can insert users"
    ON public.users
    FOR INSERT
    WITH CHECK (true);

-- buyers 테이블 INSERT 정책
DROP POLICY IF EXISTS "Users can insert their buyer profile" ON public.buyers;

CREATE POLICY "Users can insert their buyer profile"
    ON public.buyers
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- sellers 테이블 INSERT 정책
DROP POLICY IF EXISTS "Users can insert their seller profile" ON public.sellers;

CREATE POLICY "Users can insert their seller profile"
    ON public.sellers
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
