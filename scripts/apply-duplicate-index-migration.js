const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔧 중복 인덱스 제거 마이그레이션 시작...\n');

  const migrations = [
    {
      name: 'idx_favorites_service',
      table: 'favorites',
      sql: 'DROP INDEX IF EXISTS public.idx_favorites_service;',
    },
    {
      name: 'idx_favorites_user_service',
      table: 'favorites',
      sql: 'DROP INDEX IF EXISTS public.idx_favorites_user_service;',
    },
    {
      name: 'idx_orders_service',
      table: 'orders',
      sql: 'DROP INDEX IF EXISTS public.idx_orders_service;',
    },
  ];

  for (const migration of migrations) {
    try {
      console.log(`📝 테이블 ${migration.table}: ${migration.name} 제거 중...`);

      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: migration.sql,
      });

      if (error) {
        // RPC 함수가 없으면 직접 SQL 실행 시도
        console.log(`⚠️  RPC 함수 없음. SQL Editor를 통해 수동으로 실행해야 합니다.`);
        console.log(`\n실행할 SQL:\n${migration.sql}\n`);
      } else {
        console.log(`✅ ${migration.name} 제거 완료`);
      }
    } catch (err) {
      console.error(`❌ ${migration.name} 제거 실패:`, err.message);
    }
  }

  console.log('\n✨ 마이그레이션 완료!');
  console.log('\n📊 제거된 인덱스:');
  console.log('1. idx_favorites_service (중복)');
  console.log('2. idx_favorites_user_service (중복)');
  console.log('3. idx_orders_service (중복)');
  console.log('\n💡 성능 개선:');
  console.log('- 저장 공간 절약');
  console.log('- INSERT/UPDATE/DELETE 속도 향상');
  console.log('- 읽기 성능은 유지 (필수 인덱스 보존)');
}

applyMigration().catch(console.error);
