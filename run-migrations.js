const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.log('필요한 환경 변수:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_KEY (또는 NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log('🚀 마이그레이션 시작...\n');

  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

  // 마이그레이션 파일 읽기
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log(`📁 발견된 마이그레이션 파일: ${migrationFiles.length}개\n`);

  for (const file of migrationFiles) {
    console.log(`📄 ${file} 실행 중...`);

    const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    // SQL 파일을 문장별로 분리 (세미콜론으로 구분)
    const statements = sqlContent
      .split(/;\s*$/gm)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt + ';');

    console.log(`  - ${statements.length}개의 SQL 문장 발견`);

    // Supabase SQL Editor에서 실행하도록 안내
    console.log('\n⚠️  주의: Supabase는 직접 SQL 실행을 지원하지 않습니다.');
    console.log('다음 단계를 따라주세요:\n');
    console.log('1. Supabase 대시보드로 이동: https://app.supabase.com');
    console.log('2. 프로젝트 선택 > SQL Editor 메뉴 클릭');
    console.log('3. 아래 파일의 내용을 복사하여 실행:');
    console.log(`   - ${path.join(migrationsDir, file)}`);
    console.log('\n또는 Supabase CLI를 사용하여 실행:');
    console.log(`supabase db push --db-url "postgresql://postgres.[프로젝트ID]:[비밀번호]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"`);

    break; // 첫 번째 파일만 안내
  }

  console.log('\n----------------------------------------');
  console.log('💡 팁: 마이그레이션 실행 순서');
  console.log('1. 001_initial_schema.sql - 기본 테이블 생성');
  console.log('2. 002_additional_tables.sql - 추가 테이블 생성');
  console.log('3. 003_rls_policies.sql - RLS 정책 설정 (생성 예정)');
  console.log('4. 004_storage_buckets.sql - Storage 버킷 생성 (생성 예정)');
}

// 테이블 확인 함수
async function checkTables() {
  console.log('\n📊 현재 테이블 상태 확인...\n');

  const tables = [
    'users', 'seller_profiles', 'admins',
    'categories', 'services', 'ai_services',
    'orders', 'payments', 'refunds',
    'reviews', 'conversations', 'messages',
    'favorites', 'reports', 'disputes'
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error && error.code === '42P01') {
        console.log(`❌ ${table}: 존재하지 않음`);
      } else if (error) {
        console.log(`⚠️  ${table}: 접근 오류 - ${error.message}`);
      } else {
        console.log(`✅ ${table}: 존재 (${count || 0}개 레코드)`);
      }
    } catch (e) {
      console.log(`❌ ${table}: 오류 - ${e.message}`);
    }
  }
}

// 메인 실행
async function main() {
  await checkTables();
  console.log('\n========================================\n');
  await runMigrations();
}

main().catch(console.error);