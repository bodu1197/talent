const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Supabase 연결 정보
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.bpvfkkrlyrjkwgwmfrci:chl1197dbA!@@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function fetchRLSPolicies() {
  try {
    console.log('\n🔍 Errand 관련 RLS 정책 및 테이블 정보 가져오기');
    console.log('='.repeat(70));

    await client.connect();
    console.log('✅ 데이터베이스 연결 성공!\n');

    // Errand 관련 테이블들의 정책 가져오기
    const tables = ['errands', 'errand_applications', 'errand_stops', 'helper_profiles'];

    console.log(`📋 조회할 테이블: ${tables.length}개\n`);

    for (const tableName of tables) {
      console.log(`\n📄 ${tableName}`);
      console.log('-'.repeat(70));

      // 1. RLS 활성화 상태 확인
      const rlsStatus = await client.query(
        `
        SELECT relrowsecurity, relforcerowsecurity
        FROM pg_class
        WHERE relname = $1 AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      `,
        [tableName]
      );

      if (rlsStatus.rows.length > 0) {
        const row = rlsStatus.rows[0];
        console.log(`  RLS 활성화: ${row.relrowsecurity ? '✅ YES' : '❌ NO'}`);
        console.log(`  Force RLS: ${row.relforcerowsecurity ? '✅ YES' : '❌ NO'}`);
      } else {
        console.log(`  테이블을 찾을 수 없음`);
        continue;
      }

      // 2. RLS 정책 가져오기
      await client.query(
        `
        SELECT
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = $1
        ORDER BY cmd, policyname;
      `,
        [tableName]
      );

      if (result.rows.length > 0) {
        console.log(`  정책 수: ${result.rows.length}개\n`);

        for (const policy of result.rows) {
          console.log(`   📌 ${policy.policyname}`);
          console.log(`      Command: ${policy.cmd}`);
          console.log(`      Roles: ${policy.roles}`);
          console.log(`      USING: ${policy.qual || 'N/A'}`);
          console.log(`      WITH CHECK: ${policy.with_check || 'N/A'}`);
          console.log();
        }
      } else {
        console.log(`  ⚠️  정책이 없습니다! RLS가 활성화되어 있다면 모든 쿼리가 차단됩니다.`);
      }

      // 3. 테이블 컬럼 정보
      console.log(`  컬럼 정보:`);
      const columns = await client.query(
        `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
        LIMIT 10
      `,
        [tableName]
      );

      for (const col of columns.rows) {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      }
      console.log(`   ... (총 ${columns.rows.length}개 컬럼)`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ 조회 완료');
    console.log('='.repeat(70));
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    if (error.detail) console.error('상세:', error.detail);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fetchRLSPolicies();
