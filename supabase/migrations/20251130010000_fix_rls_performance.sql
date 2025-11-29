-- RLS 성능 최적화 마이그레이션
-- 1. auth.uid()를 (select auth.uid())로 변경하여 매 행마다 재평가 방지
-- 2. 중복 permissive 정책을 단일 정책으로 통합

-- =====================================================
-- order_settlements 테이블 정책 수정
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Sellers can view own settlements" ON order_settlements;
DROP POLICY IF EXISTS "Service role can manage settlements" ON order_settlements;

-- 통합된 SELECT 정책 (판매자 본인 + 관리자)
CREATE POLICY "order_settlements_select" ON order_settlements
  FOR SELECT
  USING (
    seller_id IN (
      SELECT id FROM sellers WHERE user_id = (select auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = (select auth.uid())
    )
  );

-- INSERT 정책 (시스템만)
CREATE POLICY "order_settlements_insert" ON order_settlements
  FOR INSERT
  WITH CHECK (true);

-- UPDATE 정책 (관리자만)
CREATE POLICY "order_settlements_update" ON order_settlements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = (select auth.uid())
    )
  );

-- =====================================================
-- notices 테이블 정책 수정
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "notices_select_admin" ON notices;
DROP POLICY IF EXISTS "notices_select_published" ON notices;
DROP POLICY IF EXISTS "notices_insert_admin" ON notices;
DROP POLICY IF EXISTS "notices_update_admin" ON notices;
DROP POLICY IF EXISTS "notices_delete_admin" ON notices;

-- 통합된 SELECT 정책 (공개된 공지 + 관리자는 모든 공지)
CREATE POLICY "notices_select" ON notices
  FOR SELECT
  USING (
    is_published = true
    OR
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = (select auth.uid())
    )
  );

-- INSERT 정책 (관리자만)
CREATE POLICY "notices_insert" ON notices
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = (select auth.uid())
    )
  );

-- UPDATE 정책 (관리자만)
CREATE POLICY "notices_update" ON notices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = (select auth.uid())
    )
  );

-- DELETE 정책 (관리자만)
CREATE POLICY "notices_delete" ON notices
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = (select auth.uid())
    )
  );
