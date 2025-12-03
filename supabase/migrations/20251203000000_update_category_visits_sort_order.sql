-- =============================================
-- 카테고리 방문 RPC 함수 업데이트
-- 방문 횟수 순 → 마지막 접속 순으로 변경
-- =============================================

-- 기존 함수 삭제 (반환 타입 변경 시 필요)
DROP FUNCTION IF EXISTS public.get_recent_category_visits(UUID, INT, INT);

-- RPC 함수 재생성: get_recent_category_visits
-- 마지막 접속 순으로 정렬 (방문 횟수와 상관없이)
CREATE OR REPLACE FUNCTION public.get_recent_category_visits(
  p_user_id UUID,
  p_days INT DEFAULT 30,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  category_id UUID,
  category_name TEXT,
  category_slug TEXT,
  visit_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cv.category_id,
    cv.category_name,
    cv.category_slug,
    COUNT(*)::BIGINT as visit_count
  FROM public.category_visits cv
  WHERE cv.user_id = p_user_id
    AND cv.visited_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY cv.category_id, cv.category_name, cv.category_slug
  ORDER BY MAX(cv.visited_at) DESC  -- 마지막 접속 순으로 정렬
  LIMIT p_limit;
END;
$$;

-- 코멘트 업데이트
COMMENT ON FUNCTION public.get_recent_category_visits IS '최근 N일 내 방문한 카테고리를 마지막 접속 순으로 반환하는 함수';
