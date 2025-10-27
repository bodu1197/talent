-- ============================================
-- 기존 auth.users에 있지만 public.users에 없는 사용자 백필
-- ============================================

-- auth.users에는 있지만 public.users에 없는 사용자들을 찾아서 추가
INSERT INTO public.users (id, email, name, phone, user_type, email_verified, is_active, created_at)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', '사용자'),
    COALESCE(au.raw_user_meta_data->>'phone', NULL),
    'buyer',  -- 기본값: 구매자
    au.email_confirmed_at IS NOT NULL,
    true,
    au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL  -- public.users에 없는 경우만
ON CONFLICT (id) DO NOTHING;  -- 이미 있으면 무시

-- 성공 메시지
DO $$
DECLARE
    backfilled_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO backfilled_count
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE pu.id IS NULL;

    IF backfilled_count > 0 THEN
        RAISE NOTICE '✅ % 명의 사용자 프로필이 백필되었습니다', backfilled_count;
    ELSE
        RAISE NOTICE '✅ 백필이 필요한 사용자가 없습니다';
    END IF;
END $$;
