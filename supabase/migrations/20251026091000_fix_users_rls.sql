-- ============================================
-- users 테이블 RLS 정책 재설정
-- ============================================

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Users profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- 새 정책 생성: 인증된 사용자는 모든 프로필 조회 가능
CREATE POLICY "Authenticated users can view all profiles"
    ON public.users FOR SELECT
    TO authenticated
    USING (true);

-- 익명 사용자도 모든 프로필 조회 가능 (public)
CREATE POLICY "Public can view all profiles"
    ON public.users FOR SELECT
    TO anon
    USING (true);

-- 본인 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 회원가입시 프로필 생성
CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 성공 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ Users 테이블 RLS 정책 재설정 완료!';
    RAISE NOTICE 'authenticated와 anon role 모두 프로필 조회 가능';
END $$;
