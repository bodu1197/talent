-- 서비스 위치 기반 주변 서비스 검색 RPC 함수
-- 기존 get_nearby_experts (판매자 위치 기반)를 대체

-- Haversine 공식으로 두 좌표 간 거리 계산 (km)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  R CONSTANT DECIMAL := 6371; -- 지구 반지름 (km)
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := RADIANS(lat2 - lat1);
  dlon := RADIANS(lon2 - lon1);
  a := SIN(dlat / 2) * SIN(dlat / 2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(dlon / 2) * SIN(dlon / 2);
  c := 2 * ATAN2(SQRT(a), SQRT(1 - a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 주변 서비스 검색 함수 (서비스 위치 기반)
CREATE OR REPLACE FUNCTION get_nearby_services(
  user_lat DECIMAL,
  user_lon DECIMAL,
  category_slug_filter TEXT DEFAULT NULL,
  radius_km INT DEFAULT 10,
  limit_count INT DEFAULT 20
)
RETURNS TABLE (
  service_id UUID,
  service_title VARCHAR,
  service_description TEXT,
  service_price DECIMAL,
  thumbnail_url TEXT,
  category_slug VARCHAR,
  category_name VARCHAR,
  seller_id UUID,
  seller_nickname VARCHAR,
  seller_profile_image TEXT,
  seller_rating DECIMAL,
  seller_review_count INT,
  location_address VARCHAR,
  location_region VARCHAR,
  distance_km DECIMAL,
  delivery_method VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS service_id,
    s.title AS service_title,
    s.description AS service_description,
    s.price AS service_price,
    s.thumbnail_url,
    c.slug AS category_slug,
    c.name AS category_name,
    sel.id AS seller_id,
    sel.nickname AS seller_nickname,
    sel.profile_image_url AS seller_profile_image,
    sel.rating AS seller_rating,
    sel.review_count AS seller_review_count,
    s.location_address,
    s.location_region,
    calculate_distance(user_lat, user_lon, s.location_latitude, s.location_longitude) AS distance_km,
    s.delivery_method
  FROM services s
  JOIN sellers sel ON s.seller_id = sel.id
  LEFT JOIN categories c ON s.category_id = c.id
  WHERE
    s.status = 'active'
    AND s.location_latitude IS NOT NULL
    AND s.location_longitude IS NOT NULL
    AND (s.delivery_method = 'offline' OR s.delivery_method = 'both')
    AND calculate_distance(user_lat, user_lon, s.location_latitude, s.location_longitude) <= radius_km
    AND (category_slug_filter IS NULL OR c.slug = category_slug_filter)
  ORDER BY distance_km ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- 함수 설명 추가
COMMENT ON FUNCTION get_nearby_services IS '사용자 위치 기반 주변 오프라인 서비스 검색';
COMMENT ON FUNCTION calculate_distance IS 'Haversine 공식으로 두 좌표 간 거리(km) 계산';
