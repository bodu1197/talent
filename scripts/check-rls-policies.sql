-- ========================================
-- RLS 정책 확인
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- 1. category_visits 테이블의 RLS 활성화 여부
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'category_visits';

-- 2. category_visits 테이블의 정책 확인
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
WHERE tablename = 'category_visits';

-- 3. RLS 비활성화 (임시 테스트용)
-- ALTER TABLE category_visits DISABLE ROW LEVEL SECURITY;

-- 4. 필요한 RLS 정책 생성
-- 사용자가 자신의 방문 기록을 INSERT/SELECT/UPDATE 할 수 있도록
DO $$
BEGIN
  -- 기존 정책 삭제
  DROP POLICY IF EXISTS "Users can insert own visits" ON category_visits;
  DROP POLICY IF EXISTS "Users can view own visits" ON category_visits;
  DROP POLICY IF EXISTS "Users can update own visits" ON category_visits;

  -- INSERT 정책
  CREATE POLICY "Users can insert own visits"
    ON category_visits
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  -- SELECT 정책
  CREATE POLICY "Users can view own visits"
    ON category_visits
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  -- UPDATE 정책
  CREATE POLICY "Users can update own visits"
    ON category_visits
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- 5. 확인
SELECT
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'category_visits';
