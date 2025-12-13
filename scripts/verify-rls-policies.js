/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const { Client } = require('pg');

// Supabase 연결 정보
const connectionString =
  'postgresql://postgres.bpvfkkrlyrjkwgwmfrci:chl1197dbA!@@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function verifyRLSPolicies() {
  try {
    console.log('\n🔐 RLS 정책 검증');
    console.log('='.repeat(70));

    await client.connect();
    console.log('✅ 데이터베이스 연결 성공!\n');

    const tables = ['disputes', 'seller_earnings', 'settlements'];

    for (const tableName of tables) {
      console.log(`\n📋 ${tableName.toUpperCase()} 테이블 정책`);
      console.log('-'.repeat(70));

      // 정책 목록 조회
      const policies = await client.query(
        `
        SELECT
          policyname,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = $1
        ORDER BY policyname;
      `,
        [tableName]
      );

      if (policies.rows.length > 0) {
        console.log(`\n✅ ${policies.rows.length}개의 RLS 정책이 적용되었습니다:\n`);
        policies.rows.forEach((policy, index) => {
          console.log(`${index + 1}. ${policy.policyname}`);
          console.log(`   - 명령어: ${policy.cmd}`);
          console.log(`   - 조건: ${policy.qual || '(없음)'}`);
          console.log(`   - 체크: ${policy.with_check || '(없음)'}`);
          console.log('');
        });
      } else {
        console.log(`\n❌ RLS 정책이 없습니다!`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ RLS 정책 검증 완료!');
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    if (error.detail) console.error('상세:', error.detail);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyRLSPolicies();
