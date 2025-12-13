/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const fs = require('fs');
const path = require('path');

async function executeSql(sql) {
  await fetch('https://api.supabase.com/v1/projects/bpvfkkrlyrjkwgwmfrci/database/query', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  await response.json();

  if (!response.ok || result.error) {
    throw new Error(result.error || result.message || 'Unknown error');
  }

  return result;
}

async function applyMigration() {
  console.log('🚀 광고 시스템 마이그레이션 시작...\n');

  const migrationFile = path.join(
    __dirname,
    '../supabase/migrations/20251112120000_create_advertising_system.sql'
  );
  const fullSql = fs.readFileSync(migrationFile, 'utf8');

  try {
    console.log('📦 전체 마이그레이션 실행 중...');
    await executeSql(fullSql);
    console.log('✅ 마이그레이션 완료!\n');

    // 테이블 확인
    console.log('📋 생성된 테이블 확인 중...');
    const tables = [
      'advertising_credits',
      'advertising_subscriptions',
      'advertising_payments',
      'advertising_impressions',
      'credit_transactions',
    ];

    for (const table of tables) {
      const result = await executeSql(`SELECT COUNT(*) FROM ${table};`);
      console.log(`  ✅ ${table}: ${result[0].count}개 레코드`);
    }
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error.message);
    process.exit(1);
  }
}

applyMigration();
