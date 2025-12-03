-- 서비스에 위치 정보 컬럼 추가 (오프라인 서비스용)
-- services 테이블에 위치 데이터 저장

-- 위치 컬럼 추가
ALTER TABLE services ADD COLUMN IF NOT EXISTS location_address VARCHAR(200);
ALTER TABLE services ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8);
ALTER TABLE services ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8);
ALTER TABLE services ADD COLUMN IF NOT EXISTS location_region VARCHAR(50);

-- 서비스 제공 방식 컬럼 추가
ALTER TABLE services ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(20) DEFAULT 'online';

-- 위치 기반 검색을 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_services_location
ON services(location_latitude, location_longitude)
WHERE location_latitude IS NOT NULL AND location_longitude IS NOT NULL;

-- 서비스 제공 방식별 인덱스
CREATE INDEX IF NOT EXISTS idx_services_delivery_method
ON services(delivery_method);

COMMENT ON COLUMN services.location_address IS '서비스 제공 주소';
COMMENT ON COLUMN services.location_latitude IS '위도';
COMMENT ON COLUMN services.location_longitude IS '경도';
COMMENT ON COLUMN services.location_region IS '시군구 (예: 강남구)';
COMMENT ON COLUMN services.delivery_method IS '서비스 제공 방식 (online, offline, both)';
