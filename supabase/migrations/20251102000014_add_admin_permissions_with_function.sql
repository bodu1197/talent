-- Admin 권한을 안전하게 체크하는 함수 생성 및 정책 업데이트
-- SECURITY DEFINER 함수를 사용하여 무한 재귀 방지

-- ============================================
-- 1. Admin 권한 체크 함수 생성
-- ============================================

-- 현재 사용자가 admin인지 체크하는 함수
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  -- admins 테이블에서 현재 사용자 확인
  SELECT EXISTS (
    SELECT 1
    FROM public.admins
    WHERE user_id = auth.uid()
  ) INTO is_admin_user;

  RETURN is_admin_user;
END;
$$;

-- 함수 설명
COMMENT ON FUNCTION public.is_admin() IS 'Admin 권한 체크 함수 (SECURITY DEFINER로 RLS 우회하여 무한 재귀 방지)';

-- 함수 권한 부여
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ============================================
-- 2. USERS 테이블 - Admin 권한 추가
-- ============================================

DROP POLICY IF EXISTS "users_select_own" ON public.users;

-- 일반 사용자: 자신의 프로필만 조회
-- Admin: 모든 사용자 프로필 조회
CREATE POLICY "users_select_policy"
    ON public.users
    FOR SELECT
    USING (
        id = auth.uid()
        OR public.is_admin()
    );

-- ============================================
-- 3. BUYERS 테이블 - Admin 권한 추가
-- ============================================

DROP POLICY IF EXISTS "buyers_select_own" ON public.buyers;

CREATE POLICY "buyers_select_policy"
    ON public.buyers
    FOR SELECT
    USING (
        user_id = auth.uid()
        OR public.is_admin()
    );

-- ============================================
-- 4. SELLERS 테이블 - Admin 권한 추가
-- ============================================

DROP POLICY IF EXISTS "sellers_select_own" ON public.sellers;
DROP POLICY IF EXISTS "sellers_select_verified" ON public.sellers;

-- 자신의 seller 정보 조회 OR admin OR verified seller (모든 사용자가 볼 수 있음)
CREATE POLICY "sellers_select_policy"
    ON public.sellers
    FOR SELECT
    USING (
        user_id = auth.uid()
        OR public.is_admin()
        OR is_verified = true
    );

-- ============================================
-- 5. UPDATE/DELETE 정책에도 Admin 권한 추가
-- ============================================

-- USERS UPDATE
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_policy"
    ON public.users
    FOR UPDATE
    USING (
        id = auth.uid()
        OR public.is_admin()
    );

-- BUYERS UPDATE
DROP POLICY IF EXISTS "buyers_update_own" ON public.buyers;
CREATE POLICY "buyers_update_policy"
    ON public.buyers
    FOR UPDATE
    USING (
        user_id = auth.uid()
        OR public.is_admin()
    );

-- SELLERS UPDATE
DROP POLICY IF EXISTS "sellers_update_own" ON public.sellers;
CREATE POLICY "sellers_update_policy"
    ON public.sellers
    FOR UPDATE
    USING (
        user_id = auth.uid()
        OR public.is_admin()
    );

-- ADMINS UPDATE (관리자는 자신의 admin 정보만 수정 가능)
DROP POLICY IF EXISTS "admins_update_own" ON public.admins;
CREATE POLICY "admins_update_policy"
    ON public.admins
    FOR UPDATE
    USING (user_id = auth.uid());
