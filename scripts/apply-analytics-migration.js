const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

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

    const migrationPath = path.join(__dirname, '../supabase/migrations/20251113000000_create_analytics_tables.sql')
    console.log(`📄 Reading migration file: ${migrationPath}`)

    const sql = fs.readFileSync(migrationPath, 'utf8')
    console.log(`✅ Migration file loaded (${sql.length} characters)\n`)

    console.log('📄 Executing migration SQL...')
    await client.query(sql)

    console.log('\n✅ Analytics tables migration executed successfully!')
    console.log('   - page_views table created')
    console.log('   - visitor_stats_hourly table created')
    console.log('   - visitor_stats_daily table created')
    console.log('   - visitor_stats_monthly table created')
    console.log('   - RLS policies applied')
    console.log('   - Aggregate functions created')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error('   Error details:', error)
    process.exit(1)
  } finally {
    await client.end()
    console.log('\n🔌 Connection closed')
  }
}

runMigration()
