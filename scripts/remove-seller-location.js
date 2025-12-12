/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
// Supabase Management API를 사용한 판매자 위치 필드 삭제
// 실행: SUPABASE_ACCESS_TOKEN=your_token node scripts/remove-seller-location.js

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

-- 4. 확인 쿼리
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'sellers'
  AND column_name LIKE 'location%';
`;

async function applyMigration() {
  const projectRef = 'jdubrjczdyqqtsppojgu';
  const apiKey = process.env.SUPABASE_ACCESS_TOKEN;

  if (!apiKey) {
    console.error('SUPABASE_ACCESS_TOKEN 환경변수가 필요합니다.');
    console.log('실행 방법:');
    console.log('SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/remove-seller-location.js');
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
      console.log('✅ 판매자 위치 필드 삭제 완료!');
      console.log('결과:', JSON.stringify(result, null, 2));
    } else {
      console.error('❌ 마이그레이션 실패:', result);
    }
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

applyMigration();
