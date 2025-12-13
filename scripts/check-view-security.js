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

async function checkViewSecurity() {
  try {
    console.log('\n🔐 뷰 보안 속성 확인');
    console.log('='.repeat(70));

    await client.connect();
    console.log('✅ 데이터베이스 연결 성공!\n');

    // order_revision_stats 뷰 확인
    console.log('📊 order_revision_stats 뷰 정보');
    console.log('-'.repeat(70));

    const viewInfo = await client.query(`
      SELECT
        viewname,
        viewowner,
        definition
      FROM pg_views
      WHERE schemaname = 'public'
        AND viewname = 'order_revision_stats';
    `);

    if (viewInfo.rows.length > 0) {
      console.log('\n뷰 정의:');
      console.log(viewInfo.rows[0].definition);
      console.log(`\n소유자: ${viewInfo.rows[0].viewowner}`);
    }

    // 뷰의 보안 속성 확인
    const securityInfo = await client.query(`
      SELECT
        c.relname as view_name,
        c.reloptions,
        CASE
          WHEN c.reloptions IS NULL THEN 'SECURITY INVOKER (default)'
          WHEN 'security_invoker=true' = ANY(c.reloptions) THEN 'SECURITY INVOKER'
          WHEN 'security_invoker=false' = ANY(c.reloptions) THEN 'SECURITY DEFINER'
          ELSE 'SECURITY INVOKER (default)'
        END as security_type
      FROM pg_class c
      WHERE c.relname = 'order_revision_stats'
        AND c.relkind = 'v';
    `);

    if (securityInfo.rows.length > 0) {
      console.log('\n보안 속성:');
      console.table(securityInfo.rows);

      const secType = securityInfo.rows[0].security_type;
      if (secType.includes('DEFINER')) {
        console.log('\n⚠️  경고: 이 뷰는 SECURITY DEFINER로 설정되어 있습니다!');
        console.log('💡 해결: SECURITY INVOKER로 변경해야 합니다.');
      } else {
        console.log('\n✅ 이 뷰는 안전합니다 (SECURITY INVOKER)');
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ 뷰 보안 속성 확인 완료!');
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    if (error.detail) console.error('상세:', error.detail);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkViewSecurity();
