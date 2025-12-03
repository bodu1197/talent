-- =============================================
-- 위치 기반 기능을 위한 DB 스키마 변경
-- =============================================

-- 1. categories 테이블에 service_type 컬럼 추가
-- online: 온라인 전용 (디자인, 개발, 영상 등)
-- offline: 오프라인 전용 (생활서비스, 이벤트, 뷰티 등)
-- both: 둘 다 가능 (상담/코칭)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS service_type VARCHAR(10) DEFAULT 'online';

-- service_type 값 제한
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_service_type_check'
  ) THEN
    ALTER TABLE categories ADD CONSTRAINT categories_service_type_check
      CHECK (service_type IN ('online', 'offline', 'both'));
  END IF;
END $$;

-- 2. 기존 카테고리에 service_type 값 설정
-- 오프라인 카테고리
UPDATE categories SET service_type = 'offline'
WHERE slug IN (
  'life-service',      -- 생활 서비스
  'living',            -- 생활 서비스 (대체 slug)
  'event',             -- 이벤트
  'beauty-fashion',    -- 뷰티/패션
  'beauty',            -- 뷰티 (대체 slug)
  'custom-order',      -- 주문제작
  'hobby-handmade',    -- 취미/핸드메이드
  'hobby',             -- 취미 (대체 slug)
  'errands'            -- 심부름
);

-- 둘 다 가능 카테고리
UPDATE categories SET service_type = 'both'
WHERE slug IN (
  'counseling-coaching',  -- 상담/코칭
  'counseling',           -- 상담 (대체 slug)
  'lesson',               -- 레슨/교육
  'education'             -- 교육 (대체 slug)
);

-- 나머지는 기본값 'online' 유지 (디자인, 개발, 영상, 마케팅, AI 등)

-- 3. sellers 테이블에 위치 필드 추가
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS location_address VARCHAR(200);
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8);
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8);
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS location_region VARCHAR(50);  -- 구/군 단위 (예: 강남구)
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ;

-- 4. services 테이블에 delivery_method 추가 (둘 다 가능 카테고리용)
ALTER TABLE services ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(20) DEFAULT 'online';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'services_delivery_method_check'
  ) THEN
    ALTER TABLE services ADD CONSTRAINT services_delivery_method_check
      CHECK (delivery_method IN ('online', 'offline', 'both'));
  END IF;
END $$;

-- 5. 위치 인덱스 생성 (거리 계산 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_sellers_location
ON sellers(location_latitude, location_longitude)
WHERE location_latitude IS NOT NULL AND location_longitude IS NOT NULL;

-- 지역별 필터링용 인덱스
CREATE INDEX IF NOT EXISTS idx_sellers_location_region
ON sellers(location_region)
WHERE location_region IS NOT NULL;

-- 6. Haversine 거리 계산 함수 생성
-- 두 좌표 간 거리 계산 (km 단위)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  R CONSTANT DECIMAL := 6371; -- 지구 반경 (km)
  dLat DECIMAL;
  dLon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  -- NULL 체크
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;

  dLat := RADIANS(lat2 - lat1);
  dLon := RADIANS(lon2 - lon1);
  a := SIN(dLat/2)^2 + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dLon/2)^2;
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  RETURN ROUND((R * c)::DECIMAL, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7. 카테고리별 주변 전문가 수 조회 함수
CREATE OR REPLACE FUNCTION get_nearby_experts_count(
  user_lat DECIMAL,
  user_lon DECIMAL,
  radius_km INTEGER DEFAULT 10
) RETURNS TABLE(
  category_id UUID,
  category_slug TEXT,
  category_name TEXT,
  expert_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.slug,
    c.name,
    COUNT(DISTINCT sel.id)::BIGINT as expert_count
  FROM categories c
  LEFT JOIN services s ON EXISTS (
    SELECT 1 FROM service_categories sc
    WHERE sc.service_id = s.id AND sc.category_id = c.id
  )
  LEFT JOIN sellers sel ON s.seller_id = sel.id
    AND sel.location_latitude IS NOT NULL
    AND sel.location_longitude IS NOT NULL
    AND calculate_distance(user_lat, user_lon, sel.location_latitude, sel.location_longitude) <= radius_km
  WHERE c.parent_id IS NULL  -- 1차 카테고리만
    AND c.service_type IN ('offline', 'both')  -- 오프라인 카테고리만
    AND (s.status = 'active' OR s.status IS NULL)
  GROUP BY c.id, c.slug, c.name
  ORDER BY expert_count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 8. 주변 전문가 목록 조회 함수
CREATE OR REPLACE FUNCTION get_nearby_experts(
  user_lat DECIMAL,
  user_lon DECIMAL,
  category_slug_filter TEXT DEFAULT NULL,
  radius_km INTEGER DEFAULT 10,
  limit_count INTEGER DEFAULT 20
) RETURNS TABLE(
  seller_id UUID,
  display_name TEXT,
  profile_image TEXT,
  distance_km DECIMAL,
  location_region TEXT,
  avg_rating DECIMAL,
  review_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sel.id as seller_id,
    sel.display_name,
    sel.profile_image,
    calculate_distance(user_lat, user_lon, sel.location_latitude, sel.location_longitude) as distance_km,
    sel.location_region,
    COALESCE(AVG(r.rating), 0)::DECIMAL as avg_rating,
    COUNT(r.id)::BIGINT as review_count
  FROM sellers sel
  JOIN services s ON s.seller_id = sel.id AND s.status = 'active'
  LEFT JOIN service_categories sc ON sc.service_id = s.id
  LEFT JOIN categories c ON c.id = sc.category_id
  LEFT JOIN reviews r ON r.seller_id = sel.id
  WHERE sel.location_latitude IS NOT NULL
    AND sel.location_longitude IS NOT NULL
    AND calculate_distance(user_lat, user_lon, sel.location_latitude, sel.location_longitude) <= radius_km
    AND (category_slug_filter IS NULL OR c.slug = category_slug_filter)
  GROUP BY sel.id, sel.display_name, sel.profile_image, sel.location_latitude, sel.location_longitude, sel.location_region
  ORDER BY distance_km ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '위치 기반 기능 마이그레이션 완료!';
  RAISE NOTICE '- categories.service_type 추가됨';
  RAISE NOTICE '- sellers 위치 필드 추가됨';
  RAISE NOTICE '- services.delivery_method 추가됨';
  RAISE NOTICE '- calculate_distance 함수 생성됨';
  RAISE NOTICE '- get_nearby_experts_count 함수 생성됨';
  RAISE NOTICE '- get_nearby_experts 함수 생성됨';
END $$;
