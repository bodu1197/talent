-- ============================================
-- ohyus1197@gmail.com을 슈퍼 어드민으로 설정
-- ============================================

-- Step 1: 사용자 확인 및 ID 가져오기
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- 사용자 ID 조회
    SELECT id INTO v_user_id
    FROM public.users
    WHERE email = 'ohyus1197@gmail.com';

    -- 사용자가 존재하는지 확인
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION '사용자를 찾을 수 없습니다. 먼저 ohyus1197@gmail.com으로 회원가입을 해주세요.';
    END IF;

    RAISE NOTICE '사용자 ID: %', v_user_id;

    -- Step 2: 이미 관리자인지 확인
    IF EXISTS (SELECT 1 FROM public.admins WHERE user_id = v_user_id) THEN
        -- 이미 관리자면 역할 업데이트
        UPDATE public.admins
        SET
            role = 'super_admin',
            department = 'IT',
            notes = '시스템 최고 관리자',
            updated_at = NOW()
        WHERE user_id = v_user_id;

        RAISE NOTICE '✅ 기존 관리자 역할을 super_admin으로 업데이트했습니다.';
    ELSE
        -- 새로 관리자 추가
        INSERT INTO public.admins (user_id, role, department, notes)
        VALUES (
            v_user_id,
            'super_admin',
            'IT',
            '시스템 최고 관리자'
        );

        RAISE NOTICE '✅ 새로운 슈퍼 어드민으로 등록했습니다.';
    END IF;

    -- Step 3: 결과 확인
    RAISE NOTICE '====================================';
    RAISE NOTICE '관리자 정보:';
    RAISE NOTICE 'Email: ohyus1197@gmail.com';
    RAISE NOTICE 'Role: super_admin';
    RAISE NOTICE 'Department: IT';
    RAISE NOTICE '====================================';

END $$;

-- 최종 확인 쿼리
SELECT
    a.id as admin_id,
    u.email,
    u.name,
    u.user_type,
    a.role,
    a.department,
    a.notes,
    a.created_at,
    a.updated_at
FROM public.admins a
JOIN public.users u ON a.user_id = u.id
WHERE u.email = 'ohyus1197@gmail.com';
