/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const _supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const _supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    // 마이그레이션 파일 읽기
    const migrationPath = path.join(
      __dirname,
      '..',
      'supabase',
      'migrations',
      '20251113100000_create_auto_buyer_trigger.sql'
    );
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('마이그레이션 실행 중...');

    // SQL 실행
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('마이그레이션 실패:', error);
      process.exit(1);
    }

    console.log('✅ 마이그레이션 성공!');
    console.log('결과:', data);
  } catch (error) {
    console.error('에러 발생:', error);
    console.error('오류:', err);
    process.exit(1);
  }
}

applyMigration();
