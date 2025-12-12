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

async function fetchRLSPolicies() {
  try {
    console.log('\n🔍 RLS 정책 정의 가져오기')
    console.log('='.repeat(70))

    await client.connect()
    console.log('✅ 데이터베이스 연결 성공!\n')

    // 문제가 있는 테이블들의 정책 가져오기
    const tables = [
      'settlements',
      'page_views',
      'visitor_stats_hourly',
      'visitor_stats_daily',
      'visitor_stats_monthly',
      'revision_history',
      'notifications',
      'disputes',
      'seller_earnings'
    ]

    console.log(`📋 조회할 테이블: ${tables.length}개\n`)

    let allPolicies = '-- RLS 정책 정의\n'
    allPolicies += '-- 생성일: ' + new Date().toISOString() + '\n\n'
    allPolicies += '='.repeat(70) + '\n\n'

    for (const tableName of tables) {
      console.log(`\n📄 ${tableName}`)
      console.log('-'.repeat(70))

      const _result = await client.query(`
        SELECT
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = $1
        ORDER BY policyname;
      `, [tableName])

      if (result.rows.length > 0) {
        console.log(`✅ ${result.rows.length}개 정책 발견`)

        allPolicies += `-- 테이블: ${tableName}\n`
        allPolicies += `-- 정책 수: ${result.rows.length}\n\n`

        for (const policy of result.rows) {
          console.log(`   - ${policy.policyname} (${policy.cmd})`)

          allPolicies += `정책명: ${policy.policyname}\n`
          allPolicies += `명령: ${policy.cmd}\n`
          allPolicies += `역할: ${policy.roles}\n`
          allPolicies += `USING: ${policy.qual || 'N/A'}\n`
          allPolicies += `WITH CHECK: ${policy.with_check || 'N/A'}\n`
          allPolicies += '\n'
        }

        allPolicies += '='.repeat(70) + '\n\n'
      } else {
        console.log(`❌ 정책을 찾을 수 없습니다`)
        allPolicies += `-- ${tableName}: NO POLICIES FOUND\n\n`
      }
    }

    // 파일로 저장
    const outputPath = path.join(__dirname, 'rls-policies.txt')
    fs.writeFileSync(outputPath, allPolicies, 'utf8')

    console.log('\n' + '='.repeat(70))
    console.log(`✅ RLS 정책 정의가 저장되었습니다: ${outputPath}`)
    console.log('='.repeat(70))

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message)
    if (error.detail) console.error('상세:', error.detail)
    process.exit(1)
  } finally {
    await client.end()
  }
}

fetchRLSPolicies()
