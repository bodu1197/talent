-- ============================================
-- 관리자 계정 생성 스크립트
-- ============================================
-- 이 스크립트는 Supabase Dashboard의 SQL Editor에서 실행하세요.

-- 1. 먼저 일반 사용자 계정이 필요합니다.
--    Supabase Auth에서 먼저 사용자를 생성하거나
--    회원가입을 통해 계정을 만든 후, 해당 이메일로 user_id를 찾습니다.

-- 예시: 이메일로 사용자 찾기
-- SELECT id, email, name FROM users WHERE email = 'admin@example.com';

-- ============================================
-- 방법 1: 기존 사용자를 관리자로 승격
-- ============================================
-- 사용자의 이메일을 확인한 후 실행

-- Step 1: 사용자 ID 확인
SELECT id, email, name, user_type
FROM users
WHERE email = 'YOUR_EMAIL@example.com';  -- 여기에 실제 이메일 입력

-- Step 2: 관리자로 승격 (위에서 확인한 user_id를 사용)
INSERT INTO admins (user_id, role, department, notes)
VALUES (
    'USER_ID_HERE',           -- Step 1에서 확인한 user_id를 여기에 입력
    'super_admin',            -- 역할: super_admin, admin, moderator, cs_agent 중 선택
    'IT',                     -- 부서 (선택사항)
    '최고 관리자'              -- 메모 (선택사항)
);

-- ============================================
-- 방법 2: 새 사용자를 직접 생성하고 관리자로 설정
-- ============================================
-- 주의: 이 방법은 Supabase Auth를 우회하므로 로그인이 불가능합니다.
-- 실제로는 Supabase Dashboard > Authentication에서 사용자를 먼저 생성하세요.

/*
-- 새 사용자 생성 (Supabase Auth 우회 - 권장하지 않음)
WITH new_user AS (
    INSERT INTO users (email, name, user_type, is_active, email_verified)
    VALUES (
        'admin@example.com',
        '관리자',
        'buyer',  -- 초기 타입 (나중에 변경 가능)
        true,
        true
    )
    RETURNING id
)
INSERT INTO admins (user_id, role, department, notes)
SELECT id, 'super_admin', 'IT', '시스템 관리자'
FROM new_user;
*/

-- ============================================
-- 관리자 역할 설명
-- ============================================
-- super_admin: 최고 관리자 - 모든 권한
-- admin: 일반 관리자 - 대부분의 관리 기능
-- moderator: 중재자 - 콘텐츠 검토 및 신고 처리
-- cs_agent: 고객 지원 - 고객 문의 및 기본 지원

-- ============================================
-- 관리자 목록 확인
-- ============================================
SELECT
    a.id as admin_id,
    u.email,
    u.name,
    a.role,
    a.department,
    a.notes,
    a.created_at
FROM admins a
JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC;

-- ============================================
-- 관리자 권한 부여 (선택사항)
-- ============================================
-- 특정 관리자에게 커스텀 권한 부여
/*
UPDATE admins
SET permissions = jsonb_build_object(
    'can_manage_users', true,
    'can_approve_services', true,
    'can_process_settlements', true,
    'can_manage_reports', true,
    'can_manage_disputes', true
)
WHERE user_id = 'USER_ID_HERE';
*/

-- ============================================
-- 관리자 삭제
-- ============================================
/*
DELETE FROM admins WHERE user_id = 'USER_ID_HERE';
*/
