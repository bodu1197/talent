-- Enable RLS for public tables that are missing it

-- schema_migrations: 시스템 테이블, RLS 비활성화 유지 (마이그레이션 관리용)
-- 이 테이블은 Supabase가 내부적으로 사용하므로 RLS를 활성화하지 않습니다.

-- settlement_details 테이블 RLS 활성화
ALTER TABLE IF EXISTS public.settlement_details ENABLE ROW LEVEL SECURITY;

-- settlement_details RLS 정책: 관리자만 조회 가능
DROP POLICY IF EXISTS "Admins can view all settlement details" ON public.settlement_details;
CREATE POLICY "Admins can view all settlement details"
  ON public.settlement_details
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid()
    )
  );

-- search_logs 테이블 RLS 활성화
ALTER TABLE IF EXISTS public.search_logs ENABLE ROW LEVEL SECURITY;

-- search_logs RLS 정책 (사용자는 자신의 검색 로그만 조회)
DROP POLICY IF EXISTS "Users can view their own search logs" ON public.search_logs;
CREATE POLICY "Users can view their own search logs"
  ON public.search_logs
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can insert search logs" ON public.search_logs;
CREATE POLICY "Anyone can insert search logs"
  ON public.search_logs
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all search logs" ON public.search_logs;
CREATE POLICY "Admins can view all search logs"
  ON public.search_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid()
    )
  );

-- activity_logs 테이블 RLS 활성화
ALTER TABLE IF EXISTS public.activity_logs ENABLE ROW LEVEL SECURITY;

-- activity_logs RLS 정책 (관리자만 조회 가능)
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;
CREATE POLICY "System can insert activity logs"
  ON public.activity_logs
  FOR INSERT
  WITH CHECK (true);

-- service_tags 테이블 RLS 활성화
ALTER TABLE IF EXISTS public.service_tags ENABLE ROW LEVEL SECURITY;

-- service_tags RLS 정책 (모든 사용자가 조회 가능, 서비스 소유자만 수정 가능)
DROP POLICY IF EXISTS "Anyone can view service tags" ON public.service_tags;
CREATE POLICY "Anyone can view service tags"
  ON public.service_tags
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service owners can manage their service tags" ON public.service_tags;
CREATE POLICY "Service owners can manage their service tags"
  ON public.service_tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.services
      WHERE services.id = service_tags.service_id
      AND services.seller_id = auth.uid()
    )
  );

-- tags 테이블 RLS 활성화
ALTER TABLE IF EXISTS public.tags ENABLE ROW LEVEL SECURITY;

-- tags RLS 정책 (모든 사용자가 조회 가능, 관리자만 수정 가능)
DROP POLICY IF EXISTS "Anyone can view tags" ON public.tags;
CREATE POLICY "Anyone can view tags"
  ON public.tags
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage tags" ON public.tags;
CREATE POLICY "Admins can manage tags"
  ON public.tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid()
    )
  );

-- 코멘트 추가
COMMENT ON POLICY "Admins can view all settlement details" ON public.settlement_details IS '관리자는 모든 정산 내역 조회 가능';
COMMENT ON POLICY "Users can view their own search logs" ON public.search_logs IS '사용자는 자신의 검색 로그만 조회 가능';
COMMENT ON POLICY "Anyone can insert search logs" ON public.search_logs IS '누구나 검색 로그 삽입 가능 (익명 포함)';
COMMENT ON POLICY "Admins can view all activity logs" ON public.activity_logs IS '관리자는 모든 활동 로그 조회 가능';
COMMENT ON POLICY "Anyone can view service tags" ON public.service_tags IS '모든 사용자가 서비스 태그 조회 가능';
COMMENT ON POLICY "Anyone can view tags" ON public.tags IS '모든 사용자가 태그 조회 가능';
