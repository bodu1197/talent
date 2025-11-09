-- users 테이블에 UPDATE 정책 추가
-- 사용자가 자신의 프로필을 수정할 수 있도록 함

-- 기존 UPDATE 정책 제거 (있다면)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.users;

-- 새 UPDATE 정책: 인증된 사용자는 자신의 프로필을 수정할 수 있음
CREATE POLICY "Users can update own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() IS NOT NULL AND id = auth.uid())
    WITH CHECK (auth.uid() IS NOT NULL AND id = auth.uid());
