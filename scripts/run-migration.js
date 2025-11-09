const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('Reading migration file...')
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251109010000_refactor_chat_rooms_for_any_users.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('Executing migration SQL...')
    console.log('SQL Preview:', sql.substring(0, 200) + '...')

    // Execute the SQL using Supabase RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      console.error('Migration failed with RPC:', error)
      console.log('\nTrying alternative method with direct query...')

      // Try executing SQL statements one by one
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      console.log(`Found ${statements.length} SQL statements to execute`)

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';'
        console.log(`\nExecuting statement ${i + 1}/${statements.length}:`)
        console.log(statement.substring(0, 100) + '...')

        const { error: stmtError } = await supabase.rpc('exec_sql', {
          sql_query: statement
        })

        if (stmtError) {
          console.error(`Statement ${i + 1} failed:`, stmtError)
          throw stmtError
        }

        console.log(`✓ Statement ${i + 1} executed successfully`)
      }

      console.log('\n✅ All statements executed successfully!')
    } else {
      console.log('✅ Migration executed successfully!')
      console.log('Result:', data)
    }

  } catch (error) {
    console.error('❌ Error running migration:', error)
    process.exit(1)
  }
}

runMigration()
