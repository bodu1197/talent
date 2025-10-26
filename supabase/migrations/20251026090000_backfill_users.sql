-- ============================================
-- 기존 auth.users의 프로필을 public.users로 백필
-- ============================================

-- auth.users에는 있지만 public.users에는 없는 사용자들의 프로필 생성
INSERT INTO public.users (id, email, name, phone, user_type, email_verified, is_active)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', ''),
    COALESCE(au.raw_user_meta_data->>'phone', NULL),
    'buyer',  -- 기본값: 구매자
    au.email_confirmed_at IS NOT NULL,
    true
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu
    WHERE pu.id = au.id
);

-- 성공 메시지
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users;
    RAISE NOTICE '✅ Users 백필 완료!';
    RAISE NOTICE '현재 public.users 테이블에 % 명의 사용자가 있습니다.', user_count;
END $$;
