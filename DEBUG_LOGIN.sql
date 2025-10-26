-- ============================================
-- 로그인 문제 진단 SQL
-- ============================================

-- 1. users 테이블에서 ohyus1197@gmail.com 확인
SELECT
    id,
    email,
    name,
    user_type,
    email_verified,
    is_active,
    created_at
FROM users
WHERE email = 'ohyus1197@gmail.com';

-- 2. admins 테이블 확인
SELECT * FROM admins;

-- 3. users 테이블 RLS 정책 확인
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- 4. admins 테이블 RLS 정책 확인
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'admins'
ORDER BY policyname;
