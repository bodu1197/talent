-- 기존 테이블 삭제 (재생성)
DROP TABLE IF EXISTS public.category_visits CASCADE;

-- 카테고리 방문 기록 테이블 생성 (로그인 사용자만)
CREATE TABLE public.category_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    category_slug TEXT NOT NULL,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_category_visits_user_id ON public.category_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_category_visits_category_id ON public.category_visits(category_id);
CREATE INDEX IF NOT EXISTS idx_category_visits_visited_at ON public.category_visits(visited_at DESC);

-- RLS 활성화
ALTER TABLE public.category_visits ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 인증된 사용자만 자신의 방문 기록 조회 가능
CREATE POLICY "Authenticated users can view own visits"
    ON public.category_visits
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS 정책: 인증된 사용자만 자신의 방문 기록 삽입 가능
CREATE POLICY "Authenticated users can insert own visits"
    ON public.category_visits
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 코멘트
COMMENT ON TABLE public.category_visits IS '로그인 사용자의 카테고리 방문 기록';
