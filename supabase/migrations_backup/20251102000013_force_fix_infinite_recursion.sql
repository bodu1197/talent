-- 무한 재귀 문제를 완전히 해결하기 위해 모든 관련 정책을 강제로 재설정

-- ============================================
-- 1. USERS 테이블 - 모든 정책 제거 후 재생성
-- ============================================

-- 기존 모든 SELECT 정책 제거
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'users'
          AND cmd = 'SELECT'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', r.policyname);
    END LOOP;
END $$;

-- 새 정책: 단순하게 자신의 프로필만 조회 가능
CREATE POLICY "users_select_own"
    ON public.users
    FOR SELECT
    USING (id = auth.uid());

-- ============================================
-- 2. ADMINS 테이블 - 모든 정책 제거 후 재생성
-- ============================================

-- 기존 모든 정책 제거
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'admins'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.admins', r.policyname);
    END LOOP;
END $$;

-- 새 정책: 단순하게 자신의 admin 레코드만 조회 가능
CREATE POLICY "admins_select_own"
    ON public.admins
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "admins_insert_own"
    ON public.admins
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins_update_own"
    ON public.admins
    FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================
-- 3. BUYERS 테이블 - 모든 정책 제거 후 재생성
-- ============================================

-- 기존 모든 정책 제거
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'buyers'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.buyers', r.policyname);
    END LOOP;
END $$;

-- 새 정책: 단순하게 자신의 buyer 레코드만 조회 가능
CREATE POLICY "buyers_select_own"
    ON public.buyers
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "buyers_insert_own"
    ON public.buyers
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "buyers_update_own"
    ON public.buyers
    FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================
-- 4. SELLERS 테이블 - 모든 정책 제거 후 재생성
-- ============================================

-- 기존 모든 정책 제거
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'sellers'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.sellers', r.policyname);
    END LOOP;
END $$;

-- 새 정책: 자신의 seller 레코드 조회 + 모든 사용자는 verified seller 조회 가능
CREATE POLICY "sellers_select_own"
    ON public.sellers
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "sellers_select_verified"
    ON public.sellers
    FOR SELECT
    USING (is_verified = true);

CREATE POLICY "sellers_insert_own"
    ON public.sellers
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "sellers_update_own"
    ON public.sellers
    FOR UPDATE
    USING (user_id = auth.uid());
