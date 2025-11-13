const { Client } = require('pg')

// Supabase 연결 정보
const connectionString = 'postgresql://postgres.bpvfkkrlyrjkwgwmfrci:chl1197dbA!@@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres'

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function checkSecurityAdvisor() {
  try {
    console.log('\n🔐 Supabase Security Advisor 점검 시작')
    console.log('='.repeat(70))

    await client.connect()
    console.log('✅ 데이터베이스 연결 성공!\n')

    // 1. RLS가 활성화되지 않은 public 테이블 확인
    console.log('\n📊 1. RLS (Row Level Security) 활성화 상태 확인')
    console.log('-'.repeat(70))

    const rlsCheck = await client.query(`
      SELECT
        schemaname,
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `)

    console.log('\n테이블별 RLS 상태:')
    console.table(rlsCheck.rows)

    const tablesWithoutRLS = rlsCheck.rows.filter(r => !r.rls_enabled)
    if (tablesWithoutRLS.length > 0) {
      console.log('\n⚠️  RLS가 비활성화된 테이블:')
      tablesWithoutRLS.forEach(t => {
        console.log(`   - ${t.tablename}`)
      })
    } else {
      console.log('\n✅ 모든 테이블에 RLS가 활성화되어 있습니다.')
    }

    // 2. RLS 정책이 없는 테이블 확인
    console.log('\n\n📊 2. RLS 정책 존재 여부 확인')
    console.log('-'.repeat(70))

    const policyCheck = await client.query(`
      SELECT
        t.tablename,
        COUNT(p.policyname) as policy_count
      FROM pg_tables t
      LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
      WHERE t.schemaname = 'public'
      GROUP BY t.tablename
      ORDER BY COUNT(p.policyname), t.tablename;
    `)

    console.log('\n테이블별 RLS 정책 개수:')
    console.table(policyCheck.rows)

    const tablesWithoutPolicies = policyCheck.rows.filter(r => r.policy_count === '0')
    if (tablesWithoutPolicies.length > 0) {
      console.log('\n⚠️  RLS 정책이 없는 테이블:')
      tablesWithoutPolicies.forEach(t => {
        console.log(`   - ${t.tablename}`)
      })
    } else {
      console.log('\n✅ 모든 테이블에 RLS 정책이 설정되어 있습니다.')
    }

    // 3. 외래키가 있지만 인덱스가 없는 컬럼 확인
    console.log('\n\n📊 3. 외래키 인덱스 누락 확인')
    console.log('-'.repeat(70))

    const indexCheck = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name;
    `)

    console.log('\n외래키 관계:')
    console.table(indexCheck.rows)

    // 4. 인덱스 목록 확인
    console.log('\n\n📊 4. 인덱스 목록')
    console.log('-'.repeat(70))

    const indexList = await client.query(`
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `)

    console.log('\n생성된 인덱스:')
    console.table(indexList.rows.map(r => ({
      table: r.tablename,
      index: r.indexname,
      definition: r.indexdef.substring(0, 80) + '...'
    })))

    // 5. 테이블 통계 (행 수, 크기)
    console.log('\n\n📊 5. 테이블 통계')
    console.log('-'.repeat(70))

    const tableStats = await client.query(`
      SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `)

    console.log('\n테이블별 크기 및 행 수:')
    console.table(tableStats.rows)

    // 6. 보안 권고사항 요약
    console.log('\n\n🔐 보안 권고사항 요약')
    console.log('='.repeat(70))

    let issueCount = 0

    if (tablesWithoutRLS.length > 0) {
      console.log(`\n⚠️  [높음] RLS 비활성화된 테이블: ${tablesWithoutRLS.length}개`)
      issueCount++
    }

    if (tablesWithoutPolicies.length > 0) {
      console.log(`\n⚠️  [높음] RLS 정책 없는 테이블: ${tablesWithoutPolicies.length}개`)
      issueCount++
    }

    if (issueCount === 0) {
      console.log('\n✅ 심각한 보안 문제가 발견되지 않았습니다!')
    } else {
      console.log(`\n⚠️  총 ${issueCount}개의 보안 문제가 발견되었습니다.`)
    }

    console.log('\n' + '='.repeat(70))
    console.log('✅ Security Advisor 점검 완료!')

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message)
    if (error.detail) console.error('상세:', error.detail)
    process.exit(1)
  } finally {
    await client.end()
  }
}

checkSecurityAdvisor()
