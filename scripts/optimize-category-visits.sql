-- ========================================
-- 최근 방문 카테고리 최적화
-- 1. 테이블 구조 최적화 (복합 유니크 인덱스)
-- 2. 자동 삭제 함수 (30일 지난 데이터)
-- 3. RPC 함수 재생성
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- ============================================
-- 1. 복합 유니크 인덱스 생성
-- 같은 날 같은 유저가 같은 카테고리 방문 = 1개만 저장
-- ============================================

-- 기존 인덱스 확인 및 삭제 (있다면)
DROP INDEX IF EXISTS idx_category_visits_unique_daily;
DROP INDEX IF EXISTS idx_category_visits_user_date;
DROP INDEX IF EXISTS idx_category_visits_cleanup;

-- 복합 유니크 인덱스: 같은 날 같은 카테고리 방문은 1개만
CREATE UNIQUE INDEX idx_category_visits_unique_daily
ON category_visits (user_id, category_id, DATE(visited_at));

-- 쿼리 성능 최적화 인덱스
CREATE INDEX idx_category_visits_user_date
ON category_visits (user_id, visited_at DESC);

-- 자동 삭제용 인덱스
CREATE INDEX idx_category_visits_cleanup
ON category_visits (visited_at);

-- ============================================
-- 2. 30일 지난 데이터 자동 삭제 함수
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_old_category_visits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 30일 지난 데이터 삭제
  DELETE FROM category_visits
  WHERE visited_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- 로그 출력 (선택사항)
  RAISE NOTICE 'Deleted % old category visit records', deleted_count;
END;
$$;

-- 함수 권한 설정
GRANT EXECUTE ON FUNCTION cleanup_old_category_visits TO service_role;

-- ============================================
-- 3. RPC 함수 재생성 (최적화)
-- ============================================

CREATE OR REPLACE FUNCTION get_recent_category_visits(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  category_id UUID,
  category_name TEXT,
  category_slug TEXT,
  last_visited TIMESTAMPTZ,
  visit_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cv.category_id::UUID,
    cv.category_name,
    cv.category_slug,
    MAX(cv.visited_at) as last_visited,
    COUNT(*)::BIGINT as visit_count
  FROM category_visits cv
  WHERE cv.user_id = p_user_id
    AND cv.visited_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY cv.category_id, cv.category_name, cv.category_slug
  ORDER BY MAX(cv.visited_at) DESC
  LIMIT p_limit;
END;
$$;

-- 함수 권한 설정
GRANT EXECUTE ON FUNCTION get_recent_category_visits TO authenticated;

-- ============================================
-- 4. Supabase Cron Job 설정 안내
-- ============================================

-- Supabase Dashboard > Database > Cron Jobs 에서 설정:
--
-- Job Name: cleanup_old_category_visits
-- Schedule: 0 2 * * * (매일 새벽 2시)
-- SQL: SELECT cleanup_old_category_visits();
--
-- 또는 pg_cron extension 사용 (활성화 필요):

-- pg_cron 확장 활성화 (Supabase에서는 기본 활성화)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 매일 새벽 2시에 자동 실행
SELECT cron.schedule(
  'cleanup-old-category-visits',
  '0 2 * * *',
  'SELECT cleanup_old_category_visits();'
);

-- ============================================
-- 5. 확인 쿼리
-- ============================================

-- 인덱스 확인
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'category_visits'
ORDER BY indexname;

-- Cron Job 확인
SELECT * FROM cron.job WHERE jobname LIKE '%category%';

-- 현재 저장된 데이터 확인 (비어있어야 함)
SELECT COUNT(*) as total_records FROM category_visits;

-- 테스트: RPC 함수 실행
SELECT * FROM get_recent_category_visits(auth.uid(), 30, 10);
