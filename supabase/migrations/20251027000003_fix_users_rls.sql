-- ============================================
-- users 테이블 RLS 정책 재설정
-- ============================================

-- 기존 정책들 삭제
DROP POLICY IF EXISTS "Users profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- RLS 활성화 확인
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 새 정책 생성
-- SELECT: 모든 사람이 모든 프로필 조회 가능 (마켓플레이스용)
CREATE POLICY "Users profiles are viewable by everyone"
    ON public.users FOR SELECT
    USING (true);

-- UPDATE: 본인만 수정 가능
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- INSERT: 본인만 생성 가능
CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Comments
COMMENT ON POLICY "Users profiles are viewable by everyone" ON public.users IS '모든 사용자 프로필을 누구나 조회 가능 (마켓플레이스)';
COMMENT ON POLICY "Users can update own profile" ON public.users IS '본인 프로필만 수정 가능';
COMMENT ON POLICY "Users can insert own profile" ON public.users IS '본인 프로필만 생성 가능';
