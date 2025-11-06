const { Client } = require('pg')
const fs = require('fs')

// Supabase connection with actual password
const client = new Client({
  host: 'aws-1-ap-northeast-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.bpvfkkrlyrjkwgwmfrci',
  password: 'chl1197dbA!@',
  ssl: {
    rejectUnauthorized: false
  }
})

async function executeSQL() {
  try {
    console.log('Connecting to Supabase database...\n')
    await client.connect()
    console.log('✅ Connected to database!\n')

    const sql = fs.readFileSync('apply-storage-policies.sql', 'utf8')

    console.log('Executing storage policies SQL...\n')

    const result = await client.query(sql)

    console.log('✅ Storage policies applied successfully!')
    console.log('\nYou can now upload portfolio images!')
    console.log('Test by visiting: /mypage/seller/portfolio/new\n')

  } catch (error) {
    console.log('❌ Error:', error.message)
    console.log('Full error:', error)
  } finally {
    await client.end()
    console.log('\nDatabase connection closed.')
  }
}

executeSQL()
