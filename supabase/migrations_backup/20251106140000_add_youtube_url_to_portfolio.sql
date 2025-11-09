-- seller_portfolio 테이블에 youtube_url 컬럼 추가
ALTER TABLE public.seller_portfolio
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- 코멘트 추가
COMMENT ON COLUMN public.seller_portfolio.youtube_url IS 'YouTube 영상 URL';
