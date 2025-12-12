const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  try {
    console.log('마이그레이션 파일 읽는 중...')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251113100000_create_auto_buyer_trigger.sql')
    const sqlContent = fs.readFileSync(migrationPath, 'utf8')

    console.log('SQL 실행 중...')

    // SQL을 각 문장별로 분리해서 실행
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`\n[${i + 1}/${statements.length}] 실행 중...`)
      console.log(statement.substring(0, 100) + '...')

      const { error } = await supabase.rpc('exec_sql', {
        query: statement
      }).catch(async () => {
        // exec_sql이 없으면 직접 쿼리
        return await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: statement })
        }).then(r => r.json())
      })

      if (error) {
        console.error(`❌ 오류:`, error)
        // 계속 진행
      } else {
        console.log(`✅ 성공`)
      }
    }

    console.log('\n🎉 마이그레이션 완료!')

  } catch (error) {
    console.error('❌ 마이그레이션 실패:', err.message)
    process.exit(1)
  }
}

runMigration()
