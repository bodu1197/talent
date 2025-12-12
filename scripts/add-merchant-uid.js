/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const { createClient } = require('@supabase/supabase-js');

const _supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMerchantUid() {
  console.log('Adding merchant_uid column to orders table...');

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS merchant_uid TEXT UNIQUE;
      CREATE INDEX IF NOT EXISTS idx_orders_merchant_uid ON orders(merchant_uid);
    `,
  });

  if (error) {
    // RPC가 없으면 직접 실행 시도
    console.log('RPC not available, trying direct query...');

    // Supabase JS는 직접 DDL을 실행할 수 없으므로 안내 출력
    console.log('\n=== Supabase SQL Editor에서 직접 실행하세요 ===\n');
    console.log(`
ALTER TABLE orders ADD COLUMN IF NOT EXISTS merchant_uid TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_orders_merchant_uid ON orders(merchant_uid);
    `);
    console.log('\n1. https://supabase.com/dashboard 로그인');
    console.log('2. 프로젝트 선택 → SQL Editor');
    console.log('3. 위 SQL 복사해서 실행');
    return;
  }

  console.log('Done!');
}

addMerchantUid();
