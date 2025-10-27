-- ============================================
-- 긴급 보안 수정: users 테이블 RLS 정책
-- 본인 정보만 조회 가능하도록 변경
-- ============================================

-- 위험한 정책 삭제
DROP POLICY IF EXISTS "Users profiles are viewable by everyone" ON public.users;

-- 안전한 정책 생성
-- SELECT: 본인 프로필만 조회 가능
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

-- UPDATE: 본인 프로필만 수정 가능
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- INSERT: 본인 프로필만 생성 가능
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Comments
COMMENT ON POLICY "Users can view their own profile" ON public.users IS '본인 프로필만 조회 가능 - 개인정보 보호';
