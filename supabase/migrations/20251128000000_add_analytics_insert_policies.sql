-- 페이지 뷰 추적을 위한 INSERT 정책 추가
-- 이전에 SELECT 정책만 있어서 데이터가 저장되지 않았음

-- page_views 테이블: 모든 사용자가 페이지 뷰 기록 가능
CREATE POLICY IF NOT EXISTS "Anyone can insert page_views" ON page_views
  FOR INSERT
  WITH CHECK (true);

-- visitor_stats_hourly 테이블: 집계 함수가 데이터 삽입/업데이트 가능
CREATE POLICY IF NOT EXISTS "Service role can insert hourly stats" ON visitor_stats_hourly
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role can update hourly stats" ON visitor_stats_hourly
  FOR UPDATE
  USING (true);

-- visitor_stats_daily 테이블
CREATE POLICY IF NOT EXISTS "Service role can insert daily stats" ON visitor_stats_daily
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role can update daily stats" ON visitor_stats_daily
  FOR UPDATE
  USING (true);

-- visitor_stats_monthly 테이블
CREATE POLICY IF NOT EXISTS "Service role can insert monthly stats" ON visitor_stats_monthly
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role can update monthly stats" ON visitor_stats_monthly
  FOR UPDATE
  USING (true);

COMMENT ON POLICY "Anyone can insert page_views" ON page_views IS '모든 방문자가 페이지 뷰를 기록할 수 있음 (추적용)';
