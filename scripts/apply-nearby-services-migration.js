// Supabase Management API를 사용한 마이그레이션 적용
// 실행: node scripts/apply-nearby-services-migration.js

const sql = `
-- 서비스 위치 기반 주변 서비스 검색 RPC 함수

-- Haversine 공식으로 두 좌표 간 거리 계산 (km)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  R CONSTANT DECIMAL := 6371;
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

COMMENT ON FUNCTION get_nearby_services IS '사용자 위치 기반 주변 오프라인 서비스 검색';
COMMENT ON FUNCTION calculate_distance IS 'Haversine 공식으로 두 좌표 간 거리(km) 계산';
`;

async function applyMigration() {
  const projectRef = 'jdubrjczdyqqtsppojgu';
  const apiKey = process.env.SUPABASE_ACCESS_TOKEN;

  if (!apiKey) {
    console.error('SUPABASE_ACCESS_TOKEN 환경변수가 필요합니다.');
    console.log('https://supabase.com/dashboard/account/tokens 에서 토큰 생성 후 실행:');
    console.log('SUPABASE_ACCESS_TOKEN=your_token node scripts/apply-nearby-services-migration.js');
    process.exit(1);
  }

  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });

    await response.json();

    if (response.ok) {
      console.log('✅ 마이그레이션 성공!');
      console.log(result);
    } else {
      console.error('❌ 마이그레이션 실패:', result);
    }
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

applyMigration();
