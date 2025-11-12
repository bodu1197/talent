const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 광고 시스템 마이그레이션 시작...\n');

  const migrationFile = path.join(__dirname, '../supabase/migrations/20251112120000_create_advertising_system.sql');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  // SQL을 개별 문장으로 분리 (세미콜론 기준, 하지만 함수 내부는 제외)
  const statements = sql
    .split(/;\s*$/gm)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^COMMENT ON/));

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // 주요 작업만 표시
    if (statement.includes('CREATE TABLE')) {
      const tableName = statement.match(/CREATE TABLE (\w+)/)?.[1];
      console.log(`📦 테이블 생성 중: ${tableName}...`);
    } else if (statement.includes('CREATE INDEX')) {
      const indexName = statement.match(/CREATE (?:UNIQUE )?INDEX (\w+)/)?.[1];
      console.log(`🔍 인덱스 생성 중: ${indexName}...`);
    } else if (statement.includes('CREATE TRIGGER')) {
      const triggerName = statement.match(/CREATE TRIGGER (\w+)/)?.[1];
      console.log(`⚡ 트리거 생성 중: ${triggerName}...`);
    } else if (statement.includes('CREATE POLICY')) {
      const policyName = statement.match(/CREATE POLICY "([^"]+)"/)?.[1];
      console.log(`🔒 RLS 정책 생성 중: ${policyName}...`);
    }

    try {
      // Supabase는 RPC를 통해 SQL 실행
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

      if (error) {
        // 이미 존재하는 객체는 무시
        if (error.message.includes('already exists') || error.message.includes('does not exist')) {
          console.log(`  ⚠️  이미 존재하거나 건너뜀`);
        } else {
          console.log(`  ❌ 에러: ${error.message}`);
          errorCount++;
        }
      } else {
        successCount++;
      }
    } catch (err) {
      console.log(`  ❌ 실행 실패: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n✅ 마이그레이션 완료!');
  console.log(`성공: ${successCount}개, 실패: ${errorCount}개\n`);

  // 생성된 테이블 확인
  console.log('📋 생성된 테이블 확인 중...');
  const tables = [
    'advertising_credits',
    'advertising_subscriptions',
    'advertising_payments',
    'advertising_impressions',
    'credit_transactions'
  ];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`  ❌ ${table}: 테이블 없음 또는 접근 불가`);
    } else {
      console.log(`  ✅ ${table}: 0개 레코드`);
    }
  }
}

applyMigration().catch(err => {
  console.error('마이그레이션 실패:', err);
  process.exit(1);
});
