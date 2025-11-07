-- 포트폴리오-서비스 다대다 관계를 위한 중간 테이블 생성
CREATE TABLE IF NOT EXISTS portfolio_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES seller_portfolio(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 동일한 포트폴리오-서비스 조합은 한 번만 허용
  UNIQUE(portfolio_id, service_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_portfolio_services_portfolio ON portfolio_services(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_services_service ON portfolio_services(service_id);

-- RLS 활성화
ALTER TABLE portfolio_services ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 읽을 수 있음
CREATE POLICY "Anyone can view portfolio-service links"
  ON portfolio_services FOR SELECT
  USING (true);

-- RLS 정책: 판매자는 자신의 포트폴리오와 서비스만 연결할 수 있음
CREATE POLICY "Sellers can link their own portfolios and services"
  ON portfolio_services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM seller_portfolio
      WHERE seller_portfolio.id = portfolio_services.portfolio_id
      AND seller_portfolio.seller_id IN (
        SELECT id FROM sellers WHERE user_id = auth.uid()
      )
    )
    AND EXISTS (
      SELECT 1 FROM services
      WHERE services.id = portfolio_services.service_id
      AND services.seller_id IN (
        SELECT id FROM sellers WHERE user_id = auth.uid()
      )
    )
  );

-- RLS 정책: 판매자는 자신의 연결만 삭제할 수 있음
CREATE POLICY "Sellers can unlink their own portfolios and services"
  ON portfolio_services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM seller_portfolio
      WHERE seller_portfolio.id = portfolio_services.portfolio_id
      AND seller_portfolio.seller_id IN (
        SELECT id FROM sellers WHERE user_id = auth.uid()
      )
    )
  );
