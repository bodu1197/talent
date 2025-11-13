const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('📖 마이그레이션 파일 읽는 중...\n')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251114000000_create_revision_history.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('SQL 내용:\n')
    console.log(sql)
    console.log('\n---\n')

    console.log('⚠️  exec_sql RPC 함수가 없어서 직접 실행할 수 없습니다.')
    console.log('\n💡 다음 두 가지 방법 중 하나를 선택하세요:\n')
    console.log('1. Supabase Dashboard SQL Editor에서 위 SQL을 복사해서 실행')
    console.log(`   https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new\n`)
    console.log('2. psql을 사용해서 직접 연결 후 실행')
    console.log('   psql "postgresql://postgres:[password]@db.bpvfkkrlyrjkwgwmfrci.supabase.co:5432/postgres"\n')

    // SQL 파일을 temp 위치에 복사해서 쉽게 접근 가능하도록
    const tempSqlPath = path.join(__dirname, 'temp_migration.sql')
    fs.writeFileSync(tempSqlPath, sql, 'utf8')
    console.log(`✅ SQL 파일 저장됨: ${tempSqlPath}`)
    console.log('   이 파일을 Supabase Dashboard에 복사-붙여넣기 하세요.\n')

  } catch (err) {
    console.error('❌ 오류:', err)
    process.exit(1)
  }
}

applyMigration()
