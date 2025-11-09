-- 서비스 조회 기록 테이블 (최근 본 서비스)
CREATE TABLE IF NOT EXISTS public.service_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- 인덱스로 성능 최적화
    CONSTRAINT service_views_user_service_key UNIQUE (user_id, service_id)
);

-- 서비스 찜 테이블
CREATE TABLE IF NOT EXISTS public.service_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- 중복 방지
    CONSTRAINT service_favorites_user_service_key UNIQUE (user_id, service_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_service_views_user_id ON public.service_views(user_id);
CREATE INDEX IF NOT EXISTS idx_service_views_service_id ON public.service_views(service_id);
CREATE INDEX IF NOT EXISTS idx_service_views_viewed_at ON public.service_views(viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_favorites_user_id ON public.service_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_service_favorites_service_id ON public.service_favorites(service_id);
CREATE INDEX IF NOT EXISTS idx_service_favorites_created_at ON public.service_favorites(created_at DESC);

-- RLS 활성화
ALTER TABLE public.service_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_favorites ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 조회 기록
CREATE POLICY "Users can view own service views"
    ON public.service_views
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own service views"
    ON public.service_views
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own service views"
    ON public.service_views
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own service views"
    ON public.service_views
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS 정책: 찜
CREATE POLICY "Users can view own favorites"
    ON public.service_favorites
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
    ON public.service_favorites
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
    ON public.service_favorites
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 코멘트
COMMENT ON TABLE public.service_views IS '로그인 사용자의 서비스 조회 기록 (최근 본 서비스)';
COMMENT ON TABLE public.service_favorites IS '로그인 사용자의 찜한 서비스';
