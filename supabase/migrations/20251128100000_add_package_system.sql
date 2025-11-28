-- =============================================
-- 패키지 시스템 추가 (STANDARD, DELUXE, PREMIUM)
-- 실행일: 2024-11-28
-- =============================================

-- 1. services 테이블에 has_packages 컬럼 추가
ALTER TABLE services
ADD COLUMN IF NOT EXISTS has_packages BOOLEAN DEFAULT false;

-- 2. service_packages 테이블 생성
CREATE TABLE IF NOT EXISTS service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  package_type TEXT NOT NULL CHECK (package_type IN ('standard', 'deluxe', 'premium')),
  price NUMERIC NOT NULL,
  delivery_days INTEGER NOT NULL,
  revision_count INTEGER DEFAULT 0,
  features TEXT[] DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 1,
  is_express_available BOOLEAN DEFAULT false,
  express_days INTEGER,
  express_price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 인덱스 생성
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_packages_unique_type
ON service_packages(service_id, package_type) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_service_packages_service_active
ON service_packages(service_id, is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_services_has_packages
ON services(has_packages) WHERE has_packages = true;

-- 4. RLS 활성화 및 정책 생성
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_packages_select_policy ON service_packages
FOR SELECT USING (true);

CREATE POLICY service_packages_insert_policy ON service_packages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM services
    WHERE services.id = service_packages.service_id
    AND services.seller_id = auth.uid()
  )
);

CREATE POLICY service_packages_update_policy ON service_packages
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM services
    WHERE services.id = service_packages.service_id
    AND services.seller_id = auth.uid()
  )
);

CREATE POLICY service_packages_delete_policy ON service_packages
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM services
    WHERE services.id = service_packages.service_id
    AND services.seller_id = auth.uid()
  )
);

COMMENT ON TABLE service_packages IS '서비스 패키지 (STANDARD, DELUXE, PREMIUM)';
COMMENT ON COLUMN services.has_packages IS '패키지 사용 여부';
