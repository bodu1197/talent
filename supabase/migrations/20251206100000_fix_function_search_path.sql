-- Supabase Linter 경고 수정: search_path 설정
-- Function Search Path Mutable 취약점 해결

-- 1. get_nearby_helpers_count 함수에 search_path 설정
CREATE OR REPLACE FUNCTION get_nearby_helpers_count(
  p_lat DECIMAL(10, 8),
  p_lng DECIMAL(11, 8),
  p_radius_km DECIMAL DEFAULT 5.0,
  p_stale_minutes INTEGER DEFAULT 10
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 2. get_nearby_helpers 함수에 search_path 설정
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
SECURITY DEFINER
SET search_path = public
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

-- 3. get_nearby_errands 함수에 search_path 설정
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
SECURITY DEFINER
SET search_path = public
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

-- 코멘트
COMMENT ON FUNCTION get_nearby_helpers_count IS 'Returns count of nearby active helpers within radius (with fixed search_path)';
COMMENT ON FUNCTION get_nearby_helpers IS 'Returns list of nearby active helpers sorted by distance (with fixed search_path)';
COMMENT ON FUNCTION get_nearby_errands IS 'Returns list of nearby open errands sorted by distance (with fixed search_path)';
