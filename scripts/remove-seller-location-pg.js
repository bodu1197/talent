// PostgreSQL 직접 연결로 판매자 위치 필드 삭제
// 실행: SUPABASE_DB_PASSWORD=your_password node scripts/remove-seller-location-pg.js

const { Client } = require('pg');

const sql = `
-- 1. get_nearby_experts 함수 삭제 (판매자 위치 기반 - 더 이상 사용 안함)
DROP FUNCTION IF EXISTS get_nearby_experts(DECIMAL, DECIMAL, VARCHAR, INT, INT);

-- 2. sellers 테이블에서 위치 컬럼 삭제
ALTER TABLE sellers DROP COLUMN IF EXISTS location_address;
ALTER TABLE sellers DROP COLUMN IF EXISTS location_latitude;
ALTER TABLE sellers DROP COLUMN IF EXISTS location_longitude;
ALTER TABLE sellers DROP COLUMN IF EXISTS location_region;

-- 3. 인덱스 삭제 (존재하면)
DROP INDEX IF EXISTS idx_sellers_location;
`;

async function applyMigration() {
  const password = process.env.SUPABASE_DB_PASSWORD;

  if (!password) {
    console.error('SUPABASE_DB_PASSWORD 환경변수가 필요합니다.');
    process.exit(1);
  }

  const client = new Client({
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.jdubrjczdyqqtsppojgu',
    password: password,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('DB 연결 성공');

    const _result = await client.query(sql);
    console.log('✅ 판매자 위치 필드 삭제 완료!');

    // 확인
    const check = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'sellers'
        AND column_name LIKE 'location%';
    `);
    console.log('남은 location 컬럼:', check.rows);

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await client.end();
  }
}

applyMigration();
