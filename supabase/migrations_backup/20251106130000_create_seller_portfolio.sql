-- seller_portfolio 테이블 생성
CREATE TABLE IF NOT EXISTS public.seller_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  project_url TEXT,
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_seller_portfolio_seller_id ON public.seller_portfolio(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_portfolio_category_id ON public.seller_portfolio(category_id);
CREATE INDEX IF NOT EXISTS idx_seller_portfolio_created_at ON public.seller_portfolio(created_at DESC);

-- RLS 활성화
ALTER TABLE public.seller_portfolio ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 조회 가능
CREATE POLICY "Anyone can view portfolio"
  ON public.seller_portfolio
  FOR SELECT
  TO public
  USING (true);

-- RLS 정책: 판매자는 자신의 포트폴리오 생성 가능
CREATE POLICY "Sellers can insert own portfolio"
  ON public.seller_portfolio
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sellers
      WHERE sellers.id = seller_portfolio.seller_id
      AND sellers.user_id = auth.uid()
    )
  );

-- RLS 정책: 판매자는 자신의 포트폴리오 수정 가능
CREATE POLICY "Sellers can update own portfolio"
  ON public.seller_portfolio
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sellers
      WHERE sellers.id = seller_portfolio.seller_id
      AND sellers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sellers
      WHERE sellers.id = seller_portfolio.seller_id
      AND sellers.user_id = auth.uid()
    )
  );

-- RLS 정책: 판매자는 자신의 포트폴리오 삭제 가능
CREATE POLICY "Sellers can delete own portfolio"
  ON public.seller_portfolio
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sellers
      WHERE sellers.id = seller_portfolio.seller_id
      AND sellers.user_id = auth.uid()
    )
  );

-- 코멘트
COMMENT ON TABLE public.seller_portfolio IS '판매자 포트폴리오';
COMMENT ON COLUMN public.seller_portfolio.seller_id IS '판매자 ID';
COMMENT ON COLUMN public.seller_portfolio.title IS '포트폴리오 제목';
COMMENT ON COLUMN public.seller_portfolio.description IS '포트폴리오 설명';
COMMENT ON COLUMN public.seller_portfolio.category_id IS '카테고리 ID';
COMMENT ON COLUMN public.seller_portfolio.thumbnail_url IS '썸네일 이미지 URL';
COMMENT ON COLUMN public.seller_portfolio.image_urls IS '포트폴리오 이미지 URL 배열';
COMMENT ON COLUMN public.seller_portfolio.project_url IS '프로젝트 URL';
COMMENT ON COLUMN public.seller_portfolio.tags IS '태그 배열';
COMMENT ON COLUMN public.seller_portfolio.view_count IS '조회수';
