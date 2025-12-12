// Supabase REST API를 통해 마이그레이션 적용

const path = require('path');
const https = require('https');

const _SUPABASE_URL = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

function executeSQL(_sql) {
  return new Promise((resolve, reject) => {

    const options = {
      hostname: 'bpvfkkrlyrjkwgwmfrci.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, body });
        } else {
          resolve({ success: false, error: body, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.write(data);
    req.end();
  });
}

async function applyMigration() {
  console.log('🚀 Supabase REST API를 통해 마이그레이션 적용 시작...\n');

  const _migrationFile = path.join(__dirname, '../supabase/migrations/20251112120000_create_advertising_system.sql');
// const _sql = fs.readFileSync(migrationFile, 'utf8'); // Removed unused variable

  // SQL을 실행 가능한 단위로 분리
  const statements = sql
    .split(/;\s*$/gm)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^COMMENT ON/));

  console.log(`📝 총 ${statements.length}개의 SQL 명령어 실행 예정...\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // 주요 명령어만 표시
    let description = '';
    if (statement.includes('CREATE TABLE')) {
      description = '테이블: ' + statement.match(/CREATE TABLE (\w+)/)?.[1];
    } else if (statement.includes('CREATE INDEX')) {
      description = '인덱스: ' + statement.match(/CREATE (?:UNIQUE )?INDEX (\w+)/)?.[1];
    } else if (statement.includes('CREATE TRIGGER')) {
      description = '트리거: ' + statement.match(/CREATE TRIGGER (\w+)/)?.[1];
    } else if (statement.includes('CREATE POLICY')) {
      description = 'RLS: ' + statement.match(/CREATE POLICY "([^"]+)"/)?.[1];
    } else if (statement.includes('ALTER TABLE') && statement.includes('ENABLE ROW LEVEL SECURITY')) {
      description = 'RLS 활성화: ' + statement.match(/ALTER TABLE (\w+)/)?.[1];
    } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
      description = '함수: ' + statement.match(/CREATE OR REPLACE FUNCTION (\w+)/)?.[1];
    }

    if (description) {
      process.stdout.write(`[${i + 1}/${statements.length}] ${description}... `);
    }

    try {
      const result = await executeSQL(statement + ';');

      if (result.success) {
        if (description) console.log('✅');
        successCount++;
      } else {
        // 이미 존재하는 객체는 무시
        if (result.error.includes('already exists') ||
            result.error.includes('does not exist') ||
            result.statusCode === 404) {
          if (description) console.log('⚠️  (이미 존재)');
          skipCount++;
        } else {
          if (description) console.log(`❌ ${result.error}`);
          errorCount++;
        }
      }
    } catch (error) {
      if (description) console.log(`❌ ${error.message}`);
      errorCount++;
    }

    // API 과부하 방지
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`⚠️  건너뜀: ${skipCount}개`);
  console.log(`❌ 실패: ${errorCount}개`);
  console.log('='.repeat(50));

  if (successCount > 0 || skipCount > 0) {
    console.log('\n🎉 마이그레이션이 Supabase에 적용되었습니다!');
  } else {
    console.log('\n⚠️  exec_sql 함수가 없을 수 있습니다. Supabase Dashboard를 사용하세요.');
  }
}

applyMigration().catch(err => {
  console.error('\n❌ 실패:', err.message);
  process.exit(1);
});
