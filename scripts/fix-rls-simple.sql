-- ========================================
-- category_visits RLS 정책 생성 (간단 버전)
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- 기존 정책 삭제 (있다면)
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

-- 확인
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'category_visits';
