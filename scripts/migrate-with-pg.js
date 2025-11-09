const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Supabase connection details
// Format: postgresql://postgres.PROJECT_REF:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
// We'll use transaction pooler mode with service role key as password

const connectionString = 'postgresql://postgres.bpvfkkrlyrjkwgwmfrci:chl1197dbA!@@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres'

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function runMigration() {
  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...')
    await client.connect()
    console.log('✅ Connected successfully!\n')

    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251109010000_refactor_chat_rooms_for_any_users.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('📄 Executing migration SQL...')
    console.log('=' .repeat(80))
    console.log(sql.substring(0, 500) + '...\n')
    console.log('=' .repeat(80))
    console.log()

    // Execute the SQL
    await client.query(sql)

    console.log('\n✅ Migration executed successfully!')
    console.log('🎉 Chat rooms table has been refactored to support any user-to-user chat!\n')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error('\nFull error:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
