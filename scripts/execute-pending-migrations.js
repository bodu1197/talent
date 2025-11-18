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

async function executeMigration(migrationFile, migrationName) {
  try {
    console.log(`\n📄 실행 중: ${migrationName}`)
    console.log('=' .repeat(60))

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile)
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log(`📖 SQL 파일 읽기 완료: ${migrationFile}`)
    console.log(`📏 SQL 길이: ${sql.length} characters`)

    await client.query(sql)

    console.log(`✅ ${migrationName} 마이그레이션 완료!`)
    return true
  } catch (error) {
    console.error(`❌ ${migrationName} 마이그레이션 실패:`)
    console.error(`   에러 코드: ${error.code}`)
    console.error(`   에러 메시지: ${error.message}`)

    // 상세 에러 정보 출력
    if (error.position) {
      console.error(`   에러 위치: ${error.position}`)
    }
    if (error.detail) {
      console.error(`   상세 정보: ${error.detail}`)
    }
    if (error.hint) {
      console.error(`   힌트: ${error.hint}`)
    }

    return false
  }
}

async function main() {
  try {
    console.log('\n🚀 Supabase 마이그레이션 실행 시작')
    console.log('=' .repeat(60))
    console.log('📍 프로젝트: bpvfkkrlyrjkwgwmfrci')
    console.log('🌏 리전: Seoul (ap-northeast-2)')

    console.log('\n🔌 Supabase PostgreSQL 연결 중...')
    await client.connect()
    console.log('✅ 데이터베이스 연결 성공!\n')

    // 현재 연결 정보 확인
    const { rows } = await client.query('SELECT current_database(), current_user, version()')
    console.log('📊 연결 정보:')
    console.log(`   데이터베이스: ${rows[0].current_database}`)
    console.log(`   사용자: ${rows[0].current_user}`)
    console.log(`   PostgreSQL 버전: ${rows[0].version.split(',')[0]}`)

    // 마이그레이션 실행
    const migrations = [
      {
        file: '20251114060000_optimize_rls_policies_performance.sql',
        name: 'RLS 정책 성능 최적화 (26개 정책 → 18개)'
      }
    ]

    let successCount = 0
    let failCount = 0

    for (const migration of migrations) {
      const success = await executeMigration(migration.file, migration.name)
      if (success) {
        successCount++
      } else {
        failCount++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 마이그레이션 실행 결과')
    console.log('='.repeat(60))
    console.log(`✅ 성공: ${successCount}개`)
    console.log(`❌ 실패: ${failCount}개`)

    if (failCount === 0) {
      console.log('\n🎉 모든 마이그레이션이 성공적으로 완료되었습니다!')
    } else {
      console.log('\n⚠️  일부 마이그레이션이 실패했습니다. 위의 에러 메시지를 확인하세요.')
      process.exit(1)
    }

  } catch (error) {
    console.error('\n💥 치명적 오류 발생:')
    console.error(`   ${error.message}`)

    if (error.code === 'ENOTFOUND') {
      console.error('\n❗ 네트워크 연결 오류:')
      console.error('   - 인터넷 연결을 확인하세요')
      console.error('   - VPN 연결을 확인하세요')
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n❗ 데이터베이스 연결 거부:')
      console.error('   - Supabase 프로젝트가 활성화되어 있는지 확인하세요')
    } else if (error.message.includes('password authentication failed')) {
      console.error('\n❗ 인증 실패:')
      console.error('   - 데이터베이스 비밀번호를 확인하세요')
    }

    process.exit(1)
  } finally {
    await client.end()
    console.log('\n🔌 데이터베이스 연결 종료')
  }
}

main()
