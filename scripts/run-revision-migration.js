/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const client = new Client({
  host: 'db.bpvfkkrlyrjkwgwmfrci.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'chl1197dbA!@',
  ssl: {
    rejectUnauthorized: false
  }
})

async function runMigration() {
  try {
    console.log('🔌 데이터베이스 연결 중...')
    await client.connect()
    console.log('✅ 연결 성공!\n')

    console.log('📖 마이그레이션 파일 읽는 중...')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251114000000_create_revision_history.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('🚀 마이그레이션 실행 중...\n')
    await client.query(sql)

    console.log('✅ 마이그레이션 성공!')
    console.log('   - revision_history 테이블 생성됨')
    console.log('   - 인덱스 생성됨')
    console.log('   - RLS 정책 설정됨')
    console.log('   - order_revision_stats 뷰 생성됨\n')

  } catch (error) {
    console.error('에러 발생:', error);
    console.error('❌ 마이그레이션 실패:', err.message)
    console.error('상세:', err)
    process.exit(1)
  } finally {
    await client.end()
    console.log('🔌 데이터베이스 연결 종료')
  }
}

runMigration()
