-- 회원가입 시 자동으로 public.users 테이블에 프로필 생성하는 트리거 생성
-- 그리고 기존 auth.users에만 있는 사용자들을 public.users로 마이그레이션

-- ============================================
-- 1. handle_new_user 함수 생성 (SECURITY DEFINER로 RLS 우회)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- public.users 테이블에 프로필 생성
  INSERT INTO public.users (
    id,
    email,
    name,
    phone,
    email_verified,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.email_confirmed_at IS NOT NULL,
    true,
    NOW(),
    NOW()
  );

  -- buyers 테이블에도 자동 생성 (모든 사용자는 기본적으로 구매자)
  INSERT INTO public.buyers (
    user_id,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- 함수에 대한 주석
COMMENT ON FUNCTION public.handle_new_user() IS '회원가입 시 자동으로 users 및 buyers 테이블에 프로필 생성 (SECURITY DEFINER로 RLS 우회)';

-- ============================================
-- 2. auth.users 테이블에 트리거 연결
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. 기존 auth.users에만 있고 public.users에 없는 사용자 마이그레이션
-- ============================================

-- 먼저 기존 사용자 확인
DO $$
DECLARE
  auth_user RECORD;
  user_count INTEGER := 0;
BEGIN
  -- auth.users에는 있지만 public.users에 없는 사용자들을 찾아서 마이그레이션
  FOR auth_user IN
    SELECT
      au.id,
      au.email,
      au.raw_user_meta_data,
      au.email_confirmed_at,
      au.created_at
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE pu.id IS NULL
  LOOP
    -- public.users 테이블에 프로필 생성
    INSERT INTO public.users (
      id,
      email,
      name,
      phone,
      email_verified,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      auth_user.id,
      auth_user.email,
      COALESCE(auth_user.raw_user_meta_data->>'name', split_part(auth_user.email, '@', 1)),
      auth_user.raw_user_meta_data->>'phone',
      auth_user.email_confirmed_at IS NOT NULL,
      true,
      auth_user.created_at,
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    -- buyers 테이블에도 자동 생성 (모든 사용자는 기본적으로 구매자)
    INSERT INTO public.buyers (
      user_id,
      created_at,
      updated_at
    ) VALUES (
      auth_user.id,
      auth_user.created_at,
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;

    user_count := user_count + 1;
  END LOOP;

  -- 마이그레이션 결과 로그
  RAISE NOTICE 'Migrated % existing users from auth.users to public.users', user_count;
END $$;

-- ============================================
-- 4. 권한 설정
-- ============================================

-- handle_new_user 함수에 대한 권한 부여
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
