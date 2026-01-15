import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role 클라이언트 생성
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// POST /api/admin/migrate-location
// 라이더 위치 추적용 DB 마이그레이션 실행
export async function POST(request: Request) {
  try {
    // 간단한 보안 체크 (실제 환경에서는 더 강력한 인증 필요)
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== 'dolpagu-migration-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();
    const results: string[] = ['1. 위치 컬럼 추가 시도...'];

    // 개별 컬럼 추가 시도
    const columns = [
      { name: 'current_lat', type: 'DECIMAL(10, 8)' },
      { name: 'current_lng', type: 'DECIMAL(11, 8)' },
      { name: 'last_location_at', type: 'TIMESTAMPTZ' },
      { name: 'is_online', type: 'BOOLEAN DEFAULT false' },
    ];

    for (const col of columns) {
      try {
        // 컬럼 존재 여부 확인
        const { data: existing } = await supabase.from('helper_profiles').select(col.name).limit(1);

        if (existing !== null) {
          results.push(`  - ${col.name}: 이미 존재`);
          continue;
        }
      } catch {
        // 컬럼이 없으면 추가
        results.push(`  - ${col.name}: 추가 필요 (수동 실행 필요)`);
      }
    }

    // 2. Supabase Client로는 직접 DDL 실행 불가
    // SQL Editor에서 직접 실행해야 함
    results.push('\n⚠️ Supabase Dashboard SQL Editor에서 다음 SQL을 실행해주세요:');
    results.push(`
-- 1. 컬럼 추가
ALTER TABLE helper_profiles
ADD COLUMN IF NOT EXISTS current_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS current_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS last_location_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_helper_profiles_location
ON helper_profiles (current_lat, current_lng)
WHERE is_online = true AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_helper_profiles_online_active
ON helper_profiles (is_online, is_active, last_location_at)
WHERE is_online = true AND is_active = true;

-- 3. get_nearby_helpers_count 함수
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
    AND (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(p_lat)) * cos(radians(hp.current_lat)) *
          cos(radians(hp.current_lng) - radians(p_lng)) +
          sin(radians(p_lat)) * sin(radians(hp.current_lat))
        ))
      )
    ) <= p_radius_km;

  RETURN helper_count;
END;
$$;

-- 4. get_nearby_helpers 함수
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
    hp.grade::TEXT,
    hp.average_rating,
    hp.total_completed,
    ROUND(
      (6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(p_lat)) * cos(radians(hp.current_lat)) *
          cos(radians(hp.current_lng) - radians(p_lng)) +
          sin(radians(p_lat)) * sin(radians(hp.current_lat))
        ))
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
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(p_lat)) * cos(radians(hp.current_lat)) *
          cos(radians(hp.current_lng) - radians(p_lng)) +
          sin(radians(p_lat)) * sin(radians(hp.current_lat))
        ))
      )
    ) <= p_radius_km
  ORDER BY distance_km ASC
  LIMIT p_limit;
END;
$$;

-- 5. get_nearby_errands 함수
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
    e.category::TEXT,
    e.total_price,
    e.pickup_lat,
    e.pickup_lng,
    e.pickup_address,
    ROUND(
      (6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(p_lat)) * cos(radians(e.pickup_lat)) *
          cos(radians(e.pickup_lng) - radians(p_lng)) +
          sin(radians(p_lat)) * sin(radians(e.pickup_lat))
        ))
      ))::DECIMAL, 2
    ) as distance_km
  FROM errands e
  WHERE e.status = 'OPEN'
    AND e.pickup_lat IS NOT NULL
    AND e.pickup_lng IS NOT NULL
    AND (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(p_lat)) * cos(radians(e.pickup_lat)) *
          cos(radians(e.pickup_lng) - radians(p_lng)) +
          sin(radians(p_lat)) * sin(radians(e.pickup_lat))
        ))
      )
    ) <= p_radius_km
  ORDER BY distance_km ASC
  LIMIT p_limit;
END;
$$;

-- 6. 코멘트
COMMENT ON COLUMN helper_profiles.current_lat IS '라이더 현재 위도';
COMMENT ON COLUMN helper_profiles.current_lng IS '라이더 현재 경도';
COMMENT ON COLUMN helper_profiles.last_location_at IS '마지막 위치 업데이트 시간';
COMMENT ON COLUMN helper_profiles.is_online IS '라이더 온라인 상태';
    `);

    return NextResponse.json({
      success: true,
      message: 'SQL Editor에서 위 SQL을 실행해주세요',
      results,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: '마이그레이션 실패', details: String(error) },
      { status: 500 }
    );
  }
}
