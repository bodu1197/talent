-- ========================================
-- 최근 방문 카테고리 최적화 (트리거 방식)
-- visited_date 컬럼을 트리거로 자동 설정
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- ============================================
-- 1. visited_date 컬럼 추가 (일반 컬럼)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'category_visits' AND column_name = 'visited_date'
  ) THEN
    ALTER TABLE category_visits
    ADD COLUMN visited_date DATE;
  END IF;
END $$;

-- 기존 데이터에 visited_date 설정 (비어있는 경우)
UPDATE category_visits
SET visited_date = visited_at::date
WHERE visited_date IS NULL;

-- ============================================
-- 2. 트리거 함수: visited_date 자동 설정
-- ============================================

CREATE OR REPLACE FUNCTION set_visited_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.visited_date := NEW.visited_at::date;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (INSERT 및 UPDATE 시)
DROP TRIGGER IF EXISTS trigger_set_visited_date ON category_visits;
CREATE TRIGGER trigger_set_visited_date
BEFORE INSERT OR UPDATE ON category_visits
FOR EACH ROW
EXECUTE FUNCTION set_visited_date();

-- ============================================
-- 3. 인덱스 생성
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
-- 4. 30일 지난 데이터 자동 삭제 함수
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

  -- 로그 출력
  RAISE NOTICE 'Deleted % old category visit records', deleted_count;
END;
$$;

-- 함수 권한 설정
GRANT EXECUTE ON FUNCTION cleanup_old_category_visits TO service_role;

-- ============================================
-- 5. RPC 함수 재생성 (최적화)
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
-- 6. Supabase Cron Job 설정
-- ============================================

-- pg_cron 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 기존 cron job 삭제 (있다면)
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-old-category-visits')
  WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'cleanup-old-category-visits'
  );
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- 에러 무시
END $$;

-- 매일 새벽 2시에 자동 실행
SELECT cron.schedule(
  'cleanup-old-category-visits',
  '0 2 * * *',
  'SELECT cleanup_old_category_visits();'
);

-- ============================================
-- 7. 확인 쿼리
-- ============================================

-- 테이블 구조 확인
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'category_visits'
ORDER BY ordinal_position;

-- 인덱스 확인
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'category_visits'
ORDER BY indexname;

-- 트리거 확인
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'category_visits';

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

-- visited_date 컬럼 확인 (샘플 데이터)
SELECT
  id,
  category_name,
  visited_at,
  visited_date
FROM category_visits
ORDER BY visited_at DESC
LIMIT 10;

-- 테스트: RPC 함수 실행
SELECT * FROM get_recent_category_visits(auth.uid(), 30, 10);
