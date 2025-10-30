const https = require('https')

const SUPABASE_URL = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3MTYsImV4cCI6MjA3Njk1NDcxNn0.luCRwnwQVctX3ewuSjhkQJ6veanWqa2NgivpDI7_Gl4'

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql })

    const options = {
      hostname: 'bpvfkkrlyrjkwgwmfrci.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Length': data.length
      }
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body))
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`))
        }
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function fixCategories() {
  console.log('🔧 Fixing categories via SQL file upload to Supabase...\n')
  console.log('⚠️  Since we cannot execute SQL directly via API without service_role key,')
  console.log('    please run the SQL manually in Supabase Dashboard:\n')
  console.log('https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new\n')
  console.log('Copy and paste the content from fix-categories.sql file\n')
  console.log('Or you can provide the SUPABASE_SERVICE_ROLE_KEY in .env.local')
}

fixCategories()
