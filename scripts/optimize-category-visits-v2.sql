-- ========================================
-- 최근 방문 카테고리 최적화 (수정 버전)
-- DATE() 함수 대신 generated column 사용
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- ============================================
-- 1. visited_date 컬럼 추가 (날짜만 저장)
-- ============================================

-- visited_date 컬럼이 없으면 추가
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'category_visits' AND column_name = 'visited_date'
  ) THEN
    ALTER TABLE category_visits
    ADD COLUMN visited_date DATE GENERATED ALWAYS AS (visited_at::date) STORED;
  END IF;
END $$;

-- ============================================
-- 2. 기존 인덱스 삭제 및 새 인덱스 생성
-- ============================================

-- 기존 인덱스 삭제 (있다면)
DROP INDEX IF EXISTS idx_category_visits_unique_daily;
DROP INDEX IF EXISTS idx_category_visits_user_date;
DROP INDEX IF EXISTS idx_category_visits_cleanup;

-- 복합 유니크 인덱스: 같은 날 같은 카테고리 방문은 1개만
CREATE UNIQUE INDEX idx_category_visits_unique_daily
ON category_visits (user_id, category_id, visited_date);

-- 쿼리 성능 최적화 인덱스
CREATE INDEX idx_category_visits_user_date
ON category_visits (user_id, visited_at DESC);

-- 자동 삭제용 인덱스
CREATE INDEX idx_category_visits_cleanup
ON category_visits (visited_at);

-- ============================================
-- 3. 30일 지난 데이터 자동 삭제 함수
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
-- 4. RPC 함수 재생성 (최적화)
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
-- 5. Supabase Cron Job 설정
-- ============================================

-- pg_cron 확장 활성화 (Supabase에서는 기본 활성화되어 있을 수 있음)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 기존 cron job 삭제 (있다면)
SELECT cron.unschedule('cleanup-old-category-visits')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-old-category-visits'
);

-- 매일 새벽 2시에 자동 실행
SELECT cron.schedule(
  'cleanup-old-category-visits',
  '0 2 * * *',
  'SELECT cleanup_old_category_visits();'
);

-- ============================================
-- 6. 확인 쿼리
-- ============================================

-- 인덱스 확인
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'category_visits'
ORDER BY indexname;

-- Cron Job 확인
SELECT
  jobid,
  jobname,
  schedule,
  command
FROM cron.job
WHERE jobname LIKE '%category%';

-- 현재 저장된 데이터 확인
SELECT COUNT(*) as total_records FROM category_visits;

-- visited_date 컬럼 확인
SELECT
  id,
  category_name,
  visited_at,
  visited_date
FROM category_visits
ORDER BY visited_at DESC
LIMIT 5;

-- 테스트: RPC 함수 실행
SELECT * FROM get_recent_category_visits(auth.uid(), 30, 10);
