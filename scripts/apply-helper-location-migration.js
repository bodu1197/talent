const { Client } = require('pg');

// Supabase PostgreSQL connection (Session mode - port 5432)
const connectionString = 'postgresql://postgres.bpvfkkrlyrjkwgwmfrci:Skyj2124!@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres';

async function applyMigration() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  console.log('🚀 라이더 위치 추적 마이그레이션 시작...\n');

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!\n');

    // 1. 위치 컬럼 추가
    console.log('1. helper_profiles에 위치 컬럼 추가 중...');

    try {
      await client.query(`
        ALTER TABLE helper_profiles
        ADD COLUMN IF NOT EXISTS current_lat DECIMAL(10, 8),
        ADD COLUMN IF NOT EXISTS current_lng DECIMAL(11, 8),
        ADD COLUMN IF NOT EXISTS last_location_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
      `);
      console.log('✅ 위치 컬럼 추가 완료\n');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('  - 컬럼이 이미 존재합니다\n');
      } else {
        throw err;
      }
    }

    // 2. 인덱스 생성
    console.log('2. 위치 인덱스 생성 중...');

    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_helper_profiles_location
        ON helper_profiles (current_lat, current_lng)
        WHERE is_online = true AND is_active = true;
      `);
      console.log('  - idx_helper_profiles_location 생성 완료');
    } catch (err) {
      console.log('  - idx_helper_profiles_location:', err.message);
    }

    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_helper_profiles_online_active
        ON helper_profiles (is_online, is_active, last_location_at)
        WHERE is_online = true AND is_active = true;
      `);
      console.log('  - idx_helper_profiles_online_active 생성 완료\n');
    } catch (err) {
      console.log('  - idx_helper_profiles_online_active:', err.message, '\n');
    }

    // 3. 주변 라이더 수 조회 함수
    console.log('3. get_nearby_helpers_count 함수 생성 중...');

    await client.query(`
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
    `);
    console.log('✅ get_nearby_helpers_count 함수 생성 완료\n');

    // 4. 주변 라이더 목록 조회 함수
    console.log('4. get_nearby_helpers 함수 생성 중...');

    await client.query(`
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
    `);
    console.log('✅ get_nearby_helpers 함수 생성 완료\n');

    // 5. 주변 심부름 조회 함수 (라이더용)
    console.log('5. get_nearby_errands 함수 생성 중...');

    await client.query(`
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
    `);
    console.log('✅ get_nearby_errands 함수 생성 완료\n');

    // 6. 코멘트 추가
    console.log('6. 컬럼 코멘트 추가 중...');

    await client.query(`
      COMMENT ON COLUMN helper_profiles.current_lat IS '라이더 현재 위도 (5분 주기 업데이트)';
      COMMENT ON COLUMN helper_profiles.current_lng IS '라이더 현재 경도 (5분 주기 업데이트)';
      COMMENT ON COLUMN helper_profiles.last_location_at IS '마지막 위치 업데이트 시간';
      COMMENT ON COLUMN helper_profiles.is_online IS '라이더 온라인 상태 (활동 중 여부)';
    `);
    console.log('✅ 코멘트 추가 완료\n');

    console.log('═'.repeat(50));
    console.log('🎉 마이그레이션 완료!');
    console.log('═'.repeat(50));
    console.log('\n추가된 컬럼:');
    console.log('  - current_lat: 라이더 현재 위도');
    console.log('  - current_lng: 라이더 현재 경도');
    console.log('  - last_location_at: 마지막 위치 업데이트 시간');
    console.log('  - is_online: 라이더 온라인 상태');
    console.log('\n추가된 함수:');
    console.log('  - get_nearby_helpers_count: 주변 라이더 수 조회');
    console.log('  - get_nearby_helpers: 주변 라이더 목록 조회 (거리순)');
    console.log('  - get_nearby_errands: 주변 심부름 목록 조회 (거리순)');

  } catch (err) {
    console.error('\n❌ 마이그레이션 오류:', err.message);
    console.error('상세:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Check if pg is installed
try {
  require.resolve('pg');
  applyMigration();
} catch (e) {
  console.log('📦 Installing pg package...\n');
  const { execSync } = require('child_process');
  execSync('npm install pg', { stdio: 'inherit' });
  console.log('\n✅ pg installed! Running migrations...\n');
  applyMigration();
}
