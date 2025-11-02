-- 서비스 조회수 로그 테이블
CREATE TABLE IF NOT EXISTS public.service_view_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_service_view_logs_service_id ON public.service_view_logs(service_id);
CREATE INDEX IF NOT EXISTS idx_service_view_logs_created_at ON public.service_view_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_service_view_logs_service_created ON public.service_view_logs(service_id, created_at DESC);

-- RLS 활성화
ALTER TABLE public.service_view_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 누구나 조회 로그 생성 가능 (익명 사용자도)
CREATE POLICY "Anyone can insert view logs"
    ON public.service_view_logs
    FOR INSERT
    WITH CHECK (true);

-- RLS 정책: 서비스 소유자는 자신의 서비스 조회 로그 볼 수 있음
CREATE POLICY "Service owners can view their logs"
    ON public.service_view_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.services
            JOIN public.sellers ON sellers.id = services.seller_id
            WHERE services.id = service_view_logs.service_id
            AND sellers.user_id = auth.uid()
        )
    );

-- RLS 정책: 관리자는 모든 조회 로그 볼 수 있음
CREATE POLICY "Admins can view all logs"
    ON public.service_view_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- 서비스 조회수 자동 증가 함수
CREATE OR REPLACE FUNCTION increment_service_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.services
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = NEW.service_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거: 조회 로그 삽입 시 서비스 조회수 자동 증가
CREATE TRIGGER trigger_increment_view_count
    AFTER INSERT ON public.service_view_logs
    FOR EACH ROW
    EXECUTE FUNCTION increment_service_view_count();
