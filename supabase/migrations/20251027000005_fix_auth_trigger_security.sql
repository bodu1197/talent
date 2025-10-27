-- ============================================
-- 근본 해결: Auth 트리거 SECURITY DEFINER로 변경
-- ============================================

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 새 함수 생성: SECURITY DEFINER로 변경
-- RLS를 우회하여 회원가입 시 users 테이블에 자동 INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER  -- 함수 소유자 권한으로 실행 (RLS 우회)
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.users (id, email, name, phone, user_type, email_verified, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', '사용자'),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        'buyer',  -- 기본값: 구매자
        false,
        true
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- 이미 존재하는 경우 무시
        RETURN NEW;
    WHEN OTHERS THEN
        -- 다른 에러는 로그만 남기고 계속 진행
        RAISE WARNING 'Failed to create user profile: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- 트리거 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 함수에 주석 추가
COMMENT ON FUNCTION public.handle_new_user() IS '회원가입 시 자동으로 users 테이블에 프로필 생성 (SECURITY DEFINER로 RLS 우회)';
