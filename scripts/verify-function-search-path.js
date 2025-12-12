const { Client } = require('pg')

// Supabase 연결 정보
const connectionString = 'postgresql://postgres.bpvfkkrlyrjkwgwmfrci:chl1197dbA!@@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres'

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function verifyFunctionSearchPath() {
  try {
    console.log('\n🔐 함수 search_path 설정 확인')
    console.log('='.repeat(70))

    await client.connect()
    console.log('✅ 데이터베이스 연결 성공!\n')

    const functionNames = [
      'create_notification',
      'notify_order_status_change',
      'notify_new_order',
      'handle_new_user',
      'aggregate_hourly_stats',
      'aggregate_daily_stats',
      'aggregate_monthly_stats'
    ]

    console.log('📊 함수 보안 설정 확인')
    console.log('-'.repeat(70))

    const _result = await client.query(`
      SELECT
        p.proname as function_name,
        p.prosecdef as is_security_definer,
        p.proconfig as function_settings,
        CASE
          WHEN p.proconfig IS NOT NULL
            AND 'search_path=public, pg_temp' = ANY(p.proconfig)
          THEN '✅ 안전'
          WHEN p.proconfig IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM unnest(p.proconfig) AS config
              WHERE config LIKE 'search_path=%'
            )
          THEN '⚠️  search_path 설정됨 (다른 값)'
          ELSE '❌ search_path 미설정'
        END as security_status
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.proname = ANY($1)
      ORDER BY p.proname;
    `, [functionNames])

    console.log('\n함수별 보안 설정:')
    console.table(result.rows)

    // 결과 분석
    const unsafeCount = result.rows.filter(r => r.security_status.includes('❌')).length
    const warningCount = result.rows.filter(r => r.security_status.includes('⚠️')).length
    const safeCount = result.rows.filter(r => r.security_status.includes('✅')).length

    console.log('\n' + '='.repeat(70))
    console.log('📊 보안 점검 결과')
    console.log('='.repeat(70))
    console.log(`✅ 안전한 함수: ${safeCount}개`)
    console.log(`⚠️  경고 함수: ${warningCount}개`)
    console.log(`❌ 취약한 함수: ${unsafeCount}개`)

    if (unsafeCount === 0 && warningCount === 0) {
      console.log('\n✅ 모든 함수가 안전하게 설정되었습니다!')
      console.log('💡 모든 SECURITY DEFINER 함수에 search_path가 명시되어 있습니다.')
    } else {
      console.log('\n⚠️  일부 함수에 문제가 있습니다.')
      if (unsafeCount > 0) {
        console.log('❌ search_path가 설정되지 않은 함수가 있습니다.')
      }
      if (warningCount > 0) {
        console.log('⚠️  search_path가 권장 설정과 다릅니다.')
      }
    }

    // 상세 설정 출력
    console.log('\n상세 설정:')
    for (const row of result.rows) {
      console.log(`\n📄 ${row.function_name}`)
      console.log(`   SECURITY DEFINER: ${row.is_security_definer}`)
      console.log(`   설정: ${row.function_settings || '없음'}`)
      console.log(`   상태: ${row.security_status}`)
    }

    console.log('\n' + '='.repeat(70))
    console.log('✅ 함수 search_path 설정 확인 완료!')

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message)
    if (error.detail) console.error('상세:', error.detail)
    process.exit(1)
  } finally {
    await client.end()
  }
}

verifyFunctionSearchPath()
