-- 페이지 뷰 추적 테이블
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'bot')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 시간별 통계 집계 테이블
CREATE TABLE IF NOT EXISTS visitor_stats_hourly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hour TIMESTAMPTZ NOT NULL,
  path TEXT NOT NULL,
  total_views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  desktop_views INTEGER NOT NULL DEFAULT 0,
  mobile_views INTEGER NOT NULL DEFAULT 0,
  tablet_views INTEGER NOT NULL DEFAULT 0,
  bot_views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hour, path)
);

-- 일별 통계 집계 테이블
CREATE TABLE IF NOT EXISTS visitor_stats_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  path TEXT NOT NULL,
  total_views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  desktop_views INTEGER NOT NULL DEFAULT 0,
  mobile_views INTEGER NOT NULL DEFAULT 0,
  tablet_views INTEGER NOT NULL DEFAULT 0,
  bot_views INTEGER NOT NULL DEFAULT 0,
  avg_session_duration INTEGER, -- 초 단위
  bounce_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, path)
);

-- 월별 통계 집계 테이블
CREATE TABLE IF NOT EXISTS visitor_stats_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  path TEXT NOT NULL,
  total_views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  desktop_views INTEGER NOT NULL DEFAULT 0,
  mobile_views INTEGER NOT NULL DEFAULT 0,
  tablet_views INTEGER NOT NULL DEFAULT 0,
  bot_views INTEGER NOT NULL DEFAULT 0,
  avg_session_duration INTEGER,
  bounce_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(year, month, path)
);

-- 인덱스 생성 (쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_device_type ON page_views(device_type);

CREATE INDEX IF NOT EXISTS idx_visitor_stats_hourly_hour ON visitor_stats_hourly(hour DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_stats_hourly_path ON visitor_stats_hourly(path);

CREATE INDEX IF NOT EXISTS idx_visitor_stats_daily_date ON visitor_stats_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_stats_daily_path ON visitor_stats_daily(path);

CREATE INDEX IF NOT EXISTS idx_visitor_stats_monthly_year_month ON visitor_stats_monthly(year DESC, month DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_stats_monthly_path ON visitor_stats_monthly(path);

-- RLS 정책 (관리자만 조회 가능)
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_stats_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_stats_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_stats_monthly ENABLE ROW LEVEL SECURITY;

-- 관리자 조회 정책
CREATE POLICY "Admins can view page_views" ON page_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role = 'super_admin'
    )
  );

CREATE POLICY "Admins can view hourly stats" ON visitor_stats_hourly
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role = 'super_admin'
    )
  );

CREATE POLICY "Admins can view daily stats" ON visitor_stats_daily
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role = 'super_admin'
    )
  );

CREATE POLICY "Admins can view monthly stats" ON visitor_stats_monthly
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role = 'super_admin'
    )
  );

-- 시간별 집계 함수 (매시간 실행)
CREATE OR REPLACE FUNCTION aggregate_hourly_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO visitor_stats_hourly (hour, path, total_views, unique_visitors, desktop_views, mobile_views, tablet_views, bot_views)
  SELECT
    date_trunc('hour', created_at) as hour,
    path,
    COUNT(*) as total_views,
    COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_visitors,
    COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_views,
    COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_views,
    COUNT(*) FILTER (WHERE device_type = 'tablet') as tablet_views,
    COUNT(*) FILTER (WHERE device_type = 'bot') as bot_views
  FROM page_views
  WHERE created_at >= date_trunc('hour', NOW()) - INTERVAL '1 hour'
    AND created_at < date_trunc('hour', NOW())
  GROUP BY date_trunc('hour', created_at), path
  ON CONFLICT (hour, path)
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_visitors = EXCLUDED.unique_visitors,
    desktop_views = EXCLUDED.desktop_views,
    mobile_views = EXCLUDED.mobile_views,
    tablet_views = EXCLUDED.tablet_views,
    bot_views = EXCLUDED.bot_views;
END;
$$;

-- 일별 집계 함수 (매일 실행)
CREATE OR REPLACE FUNCTION aggregate_daily_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO visitor_stats_daily (date, path, total_views, unique_visitors, desktop_views, mobile_views, tablet_views, bot_views)
  SELECT
    DATE(created_at) as date,
    path,
    COUNT(*) as total_views,
    COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_visitors,
    COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_views,
    COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_views,
    COUNT(*) FILTER (WHERE device_type = 'tablet') as tablet_views,
    COUNT(*) FILTER (WHERE device_type = 'bot') as bot_views
  FROM page_views
  WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY DATE(created_at), path
  ON CONFLICT (date, path)
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_visitors = EXCLUDED.unique_visitors,
    desktop_views = EXCLUDED.desktop_views,
    mobile_views = EXCLUDED.mobile_views,
    tablet_views = EXCLUDED.tablet_views,
    bot_views = EXCLUDED.bot_views;
END;
$$;

-- 월별 집계 함수 (매월 1일 실행)
CREATE OR REPLACE FUNCTION aggregate_monthly_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO visitor_stats_monthly (year, month, path, total_views, unique_visitors, desktop_views, mobile_views, tablet_views, bot_views)
  SELECT
    EXTRACT(YEAR FROM created_at)::INTEGER as year,
    EXTRACT(MONTH FROM created_at)::INTEGER as month,
    path,
    COUNT(*) as total_views,
    COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_visitors,
    COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_views,
    COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_views,
    COUNT(*) FILTER (WHERE device_type = 'tablet') as tablet_views,
    COUNT(*) FILTER (WHERE device_type = 'bot') as bot_views
  FROM page_views
  WHERE date_trunc('month', created_at) = date_trunc('month', NOW()) - INTERVAL '1 month'
  GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at), path
  ON CONFLICT (year, month, path)
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_visitors = EXCLUDED.unique_visitors,
    desktop_views = EXCLUDED.desktop_views,
    mobile_views = EXCLUDED.mobile_views,
    tablet_views = EXCLUDED.tablet_views,
    bot_views = EXCLUDED.bot_views;
END;
$$;

COMMENT ON TABLE page_views IS '페이지 뷰 추적 - 모든 방문 기록';
COMMENT ON TABLE visitor_stats_hourly IS '시간별 집계 통계';
COMMENT ON TABLE visitor_stats_daily IS '일별 집계 통계';
COMMENT ON TABLE visitor_stats_monthly IS '월별 집계 통계';
