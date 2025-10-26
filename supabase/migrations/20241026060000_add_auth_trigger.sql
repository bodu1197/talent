-- ============================================
-- Auth 사용자 생성 시 자동으로 users 테이블에 프로필 생성
-- ============================================

-- 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, phone, user_type, email_verified, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        'buyer',  -- 기본값: 구매자
        false,
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성 (이미 존재하면 삭제 후 재생성)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- users 테이블 INSERT 정책 수정
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- 새 정책: 인증된 사용자는 자신의 프로필을 생성할 수 있음 (트리거용)
-- 하지만 실제로는 트리거가 처리하므로 이 정책은 백업용
CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Service role은 항상 삽입 가능 (트리거가 service role로 실행됨)
-- SECURITY DEFINER 덕분에 트리거는 작동함

-- 성공 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ Auth 트리거 설정 완료!';
    RAISE NOTICE '이제 회원가입 시 자동으로 users 테이블에 프로필이 생성됩니다.';
END $$;
