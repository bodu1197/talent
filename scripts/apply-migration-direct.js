const https = require('https')
const fs = require('fs')
const path = require('path')

// Development credential for local testing
const _DB_PASSWORD = 'chl1197dbA!@'
const PROJECT_REF = 'bpvfkkrlyrjkwgwmfrci'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'

async function executeSql(_sql) {
  return new Promise((resolve, reject) => {
// const _data = JSON.stringify({ query: sql }) // Removed unused variable

    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      }
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: body })
        } else {
          resolve({ success: false, error: body, statusCode: res.statusCode })
        }
      })
    })

    req.on('error', (e) => reject(e))
    req.write(data)
    req.end()
  })
}

async function runMigration() {
  try {
    console.log('📖 마이그레이션 파일 읽는 중...\n')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251113100000_create_auto_buyer_trigger.sql')
    const sqlContent = fs.readFileSync(migrationPath, 'utf8')

    console.log('🚀 SQL 실행 중...\n')
    console.log(sqlContent)
    console.log('\n---\n')

    const result = await executeSql(sqlContent)

    if (result.success) {
      console.log('✅ 마이그레이션 성공!')
      console.log('결과:', result.data)
    } else {
      console.log('❌ 실행 실패 (Status:', result.statusCode, ')')
      console.log('에러:', result.error)
      console.log('\n💡 Supabase Dashboard에서 수동으로 실행하세요:')
      console.log(`https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`)
    }

  } catch (error) {
    console.error('에러 발생:', error);
    console.error('❌ 오류:', err.message)
    console.log('\n💡 Supabase Dashboard SQL Editor에서 수동 실행을 권장합니다.')
    process.exit(1)
  }
}

runMigration()
