-- =============================================
-- 카테고리 방문 기록 테이블 및 RPC 함수 생성
-- =============================================

-- 1. category_visits 테이블 생성 (없으면)
CREATE TABLE IF NOT EXISTS public.category_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_category_visits_user_id ON public.category_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_category_visits_category_id ON public.category_visits(category_id);
CREATE INDEX IF NOT EXISTS idx_category_visits_visited_at ON public.category_visits(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_category_visits_user_visited ON public.category_visits(user_id, visited_at DESC);

-- 3. RLS 활성화
ALTER TABLE public.category_visits ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성 (기존 정책이 있으면 삭제 후 재생성)
DROP POLICY IF EXISTS "Users can view own category visits" ON public.category_visits;
DROP POLICY IF EXISTS "Users can insert own category visits" ON public.category_visits;
DROP POLICY IF EXISTS "Users can update own category visits" ON public.category_visits;
DROP POLICY IF EXISTS "Users can delete own category visits" ON public.category_visits;

CREATE POLICY "Users can view own category visits"
  ON public.category_visits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own category visits"
  ON public.category_visits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own category visits"
  ON public.category_visits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own category visits"
  ON public.category_visits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. RPC 함수 생성: get_recent_category_visits
-- 최근 N일 내 방문한 카테고리를 방문 횟수 순으로 반환
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
  ORDER BY visit_count DESC, MAX(cv.visited_at) DESC
  LIMIT p_limit;
END;
$$;

-- 6. RPC 함수 권한 설정
GRANT EXECUTE ON FUNCTION public.get_recent_category_visits(UUID, INT, INT) TO authenticated;

-- 7. 코멘트 추가
COMMENT ON TABLE public.category_visits IS '사용자의 카테고리 방문 기록을 저장하는 테이블';
COMMENT ON FUNCTION public.get_recent_category_visits IS '최근 N일 내 방문한 카테고리를 방문 횟수 순으로 반환하는 함수';
