-- 라이더 위치 추적을 위한 컬럼 추가
-- 우버잇츠 스타일 실시간 위치 기반 매칭 시스템

-- 1. helper_profiles 테이블에 위치 관련 컬럼 추가
ALTER TABLE helper_profiles
ADD COLUMN IF NOT EXISTS current_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS current_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS last_location_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- 2. 위치 기반 인덱스 생성 (거리 계산 최적화)
CREATE INDEX IF NOT EXISTS idx_helper_profiles_location
ON helper_profiles (current_lat, current_lng)
WHERE is_online = true AND is_active = true;

-- 3. 활성 온라인 라이더 인덱스
CREATE INDEX IF NOT EXISTS idx_helper_profiles_online_active
ON helper_profiles (is_online, is_active, last_location_at)
WHERE is_online = true AND is_active = true;

-- 4. 주변 라이더 수 조회용 함수 (Haversine 공식)
CREATE OR REPLACE FUNCTION get_nearby_helpers_count(
  p_lat DECIMAL(10, 8),
  p_lng DECIMAL(11, 8),
  p_radius_km DECIMAL DEFAULT 5.0,
  p_stale_minutes INTEGER DEFAULT 10
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  helper_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO helper_count
  FROM helper_profiles hp
  WHERE hp.is_online = true
    AND hp.is_active = true
    AND hp.current_lat IS NOT NULL
    AND hp.current_lng IS NOT NULL
    AND hp.last_location_at >= NOW() - (p_stale_minutes || ' minutes')::INTERVAL
    AND (
      hp.subscription_status = 'active'
      OR (hp.subscription_status = 'trial' AND hp.subscription_expires_at > NOW())
    )
    -- Haversine formula for distance in km
    AND (
      6371 * acos(
        cos(radians(p_lat)) * cos(radians(hp.current_lat)) *
        cos(radians(hp.current_lng) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(hp.current_lat))
      )
    ) <= p_radius_km;

  RETURN helper_count;
END;
$$;

-- 5. 주변 라이더 목록 조회용 함수 (거리순 정렬)
CREATE OR REPLACE FUNCTION get_nearby_helpers(
  p_lat DECIMAL(10, 8),
  p_lng DECIMAL(11, 8),
  p_radius_km DECIMAL DEFAULT 5.0,
  p_stale_minutes INTEGER DEFAULT 10,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  helper_id UUID,
  user_id UUID,
  grade TEXT,
  average_rating DECIMAL,
  total_completed INTEGER,
  distance_km DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    hp.id as helper_id,
    hp.user_id,
    hp.grade,
    hp.average_rating,
    hp.total_completed,
    ROUND(
      (6371 * acos(
        cos(radians(p_lat)) * cos(radians(hp.current_lat)) *
        cos(radians(hp.current_lng) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(hp.current_lat))
      ))::DECIMAL, 2
    ) as distance_km
  FROM helper_profiles hp
  WHERE hp.is_online = true
    AND hp.is_active = true
    AND hp.current_lat IS NOT NULL
    AND hp.current_lng IS NOT NULL
    AND hp.last_location_at >= NOW() - (p_stale_minutes || ' minutes')::INTERVAL
    AND (
      hp.subscription_status = 'active'
      OR (hp.subscription_status = 'trial' AND hp.subscription_expires_at > NOW())
    )
    AND (
      6371 * acos(
        cos(radians(p_lat)) * cos(radians(hp.current_lat)) *
        cos(radians(hp.current_lng) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(hp.current_lat))
      )
    ) <= p_radius_km
  ORDER BY distance_km ASC
  LIMIT p_limit;
END;
$$;

-- 6. 심부름 거리순 조회용 함수 (라이더 입장)
CREATE OR REPLACE FUNCTION get_nearby_errands(
  p_lat DECIMAL(10, 8),
  p_lng DECIMAL(11, 8),
  p_radius_km DECIMAL DEFAULT 10.0,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  errand_id UUID,
  title TEXT,
  category TEXT,
  total_price DECIMAL,
  pickup_lat DECIMAL,
  pickup_lng DECIMAL,
  pickup_address TEXT,
  distance_km DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id as errand_id,
    e.title,
    e.category,
    e.total_price,
    e.pickup_lat,
    e.pickup_lng,
    e.pickup_address,
    ROUND(
      (6371 * acos(
        cos(radians(p_lat)) * cos(radians(e.pickup_lat)) *
        cos(radians(e.pickup_lng) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(e.pickup_lat))
      ))::DECIMAL, 2
    ) as distance_km
  FROM errands e
  WHERE e.status = 'OPEN'
    AND e.pickup_lat IS NOT NULL
    AND e.pickup_lng IS NOT NULL
    AND (
      6371 * acos(
        cos(radians(p_lat)) * cos(radians(e.pickup_lat)) *
        cos(radians(e.pickup_lng) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(e.pickup_lat))
      )
    ) <= p_radius_km
  ORDER BY distance_km ASC
  LIMIT p_limit;
END;
$$;

-- 7. 코멘트 추가
COMMENT ON COLUMN helper_profiles.current_lat IS '라이더 현재 위도 (5분 주기 업데이트)';
COMMENT ON COLUMN helper_profiles.current_lng IS '라이더 현재 경도 (5분 주기 업데이트)';
COMMENT ON COLUMN helper_profiles.last_location_at IS '마지막 위치 업데이트 시간';
COMMENT ON COLUMN helper_profiles.is_online IS '라이더 온라인 상태 (활동 중 여부)';
