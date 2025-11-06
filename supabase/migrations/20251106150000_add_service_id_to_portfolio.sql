-- seller_portfolio 테이블에 service_id 컬럼 추가
ALTER TABLE public.seller_portfolio
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE SET NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_seller_portfolio_service_id ON public.seller_portfolio(service_id);

-- 코멘트 추가
COMMENT ON COLUMN public.seller_portfolio.service_id IS '연동된 서비스 ID (선택)';
