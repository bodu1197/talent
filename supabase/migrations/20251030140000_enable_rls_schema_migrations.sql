-- Enable RLS for schema_migrations table
-- This is a system table used by Supabase to track migration versions

-- RLS 활성화
ALTER TABLE IF EXISTS public.schema_migrations ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 조회 가능 (마이그레이션 버전 확인용)
DROP POLICY IF EXISTS "Anyone can view schema migrations" ON public.schema_migrations;
CREATE POLICY "Anyone can view schema migrations"
  ON public.schema_migrations
  FOR SELECT
  USING (true);

-- RLS 정책: 시스템/관리자만 삽입 가능
DROP POLICY IF EXISTS "System can insert schema migrations" ON public.schema_migrations;
CREATE POLICY "System can insert schema migrations"
  ON public.schema_migrations
  FOR INSERT
  WITH CHECK (true);

-- 코멘트 추가
COMMENT ON POLICY "Anyone can view schema migrations" ON public.schema_migrations
  IS '모든 사용자가 마이그레이션 버전 조회 가능';
COMMENT ON POLICY "System can insert schema migrations" ON public.schema_migrations
  IS '시스템이 마이그레이션 기록 삽입 가능';
