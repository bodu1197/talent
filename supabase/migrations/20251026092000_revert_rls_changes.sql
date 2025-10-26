-- ============================================
-- RLS 정책을 원래대로 복원
-- ============================================

-- 내가 추가한 정책들 삭제
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Public can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- 원래 정책으로 복원
CREATE POLICY "Users profiles are viewable by everyone"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 성공 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ RLS 정책 원래대로 복원 완료!';
END $$;
