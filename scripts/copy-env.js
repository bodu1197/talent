#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', '.env.local.new');
const dest = path.join(__dirname, '..', '.env.local');
const backup = path.join(__dirname, '..', '.env.local.backup');

try {
  // 백업
  if (fs.existsSync(dest)) {
    console.log('📦 기존 .env.local 백업 중...');
    fs.copyFileSync(dest, backup);
    console.log('   ✅ 백업 완료: .env.local.backup\n');
  }

  // 복사
  console.log('📝 .env.local.new → .env.local 복사 중...');
  fs.copyFileSync(source, dest);
  console.log('   ✅ 복사 완료!\n');

  // 확인
  const content = fs.readFileSync(dest, 'utf8');
  const hasNewSupabase = content.includes('abroivxthindezdtdzmj');

  if (hasNewSupabase) {
    console.log('✅ 새 Supabase 프로젝트로 업데이트 완료!\n');
    console.log('확인:');
    const lines = content.split('\n').filter(line => line.includes('SUPABASE'));
    lines.forEach(line => console.log('  ' + line));
  } else {
    console.log('⚠️  업데이트 확인 필요\n');
  }

} catch (error) {
  console.error('❌ 오류:', error.message);
  process.exit(1);
}
