const { Client } = require('pg')
const fs = require('fs')

// Supabase connection details
// Using service role key as password (this sometimes works)
const client = new Client({
  host: 'aws-1-ap-northeast-2.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.bpvfkkrlyrjkwgwmfrci',
  password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8',
  ssl: {
    rejectUnauthorized: false
  }
})

async function executeSQL() {
  try {
    console.log('Connecting to Supabase database...\n')
    await client.connect()
    console.log('✅ Connected!\n')

    const sql = fs.readFileSync('apply-storage-policies.sql', 'utf8')

    console.log('Executing SQL...\n')

    const result = await client.query(sql)

    console.log('✅ SQL executed successfully!')
    console.log('Result:', result)

  } catch (error) {
    console.log('❌ Error:', error.message)

    if (error.message.includes('password authentication failed')) {
      console.log('\n⚠️  Password authentication failed.')
      console.log('The SERVICE_ROLE_KEY cannot be used as database password.')
      console.log('\nTrying alternative method...\n')

      // Try alternative connection
      await tryAlternativeMethod()
    }
  } finally {
    await client.end()
  }
}

async function tryAlternativeMethod() {
  console.log('Trying with different port and connection string...\n')

  const altClient = new Client({
    host: 'aws-1-ap-northeast-2.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8',
    ssl: { rejectUnauthorized: false }
  })

  try {
    await altClient.connect()
    console.log('✅ Connected with alternative method!\n')

    const sql = fs.readFileSync('apply-storage-policies.sql', 'utf8')
    await altClient.query(sql)

    console.log('✅ SQL executed successfully!')
  } catch (error) {
    console.log('❌ Alternative method also failed:', error.message)
    console.log('\n' + '='.repeat(80))
    console.log('FINAL SOLUTION: Manual execution required')
    console.log('='.repeat(80))
    console.log('\n1. Open: https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new')
    console.log('2. Copy the content of: apply-storage-policies.sql')
    console.log('3. Paste and click "Run"\n')
  } finally {
    await altClient.end()
  }
}

executeSQL()
