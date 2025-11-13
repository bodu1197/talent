const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Supabase 연결 정보
const connectionString = 'postgresql://postgres.bpvfkkrlyrjkwgwmfrci:chl1197dbA!@@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres'

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function fetchFunctionDefinitions() {
  try {
    console.log('\n🔍 함수 정의 가져오기')
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

    console.log(`📋 조회할 함수: ${functionNames.length}개\n`)

    let allDefinitions = '-- 현재 함수 정의\n'
    allDefinitions += '-- 생성일: ' + new Date().toISOString() + '\n\n'
    allDefinitions += '='.repeat(70) + '\n\n'

    for (const funcName of functionNames) {
      console.log(`\n📄 ${funcName}`)
      console.log('-'.repeat(70))

      // 함수 정의 가져오기
      const result = await client.query(`
        SELECT
          p.proname as function_name,
          pg_get_functiondef(p.oid) as definition,
          p.prosecdef as is_security_definer,
          p.proconfig as function_settings
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.proname = $1;
      `, [funcName])

      if (result.rows.length > 0) {
        const func = result.rows[0]

        console.log(`✅ 함수 발견`)
        console.log(`   SECURITY DEFINER: ${func.is_security_definer}`)
        console.log(`   설정: ${func.function_settings || '없음'}`)

        allDefinitions += `-- ${funcName}\n`
        allDefinitions += `-- SECURITY DEFINER: ${func.is_security_definer}\n`
        allDefinitions += `-- 현재 설정: ${func.function_settings || '없음'}\n\n`
        allDefinitions += func.definition + '\n\n'
        allDefinitions += '='.repeat(70) + '\n\n'
      } else {
        console.log(`❌ 함수를 찾을 수 없습니다`)
        allDefinitions += `-- ${funcName}: NOT FOUND\n\n`
      }
    }

    // 파일로 저장
    const outputPath = path.join(__dirname, 'function-definitions.sql')
    fs.writeFileSync(outputPath, allDefinitions, 'utf8')

    console.log('\n' + '='.repeat(70))
    console.log(`✅ 함수 정의가 저장되었습니다: ${outputPath}`)
    console.log('='.repeat(70))

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message)
    if (error.detail) console.error('상세:', error.detail)
    process.exit(1)
  } finally {
    await client.end()
  }
}

fetchFunctionDefinitions()
