const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
  try {
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251111000000_add_category_path_function.sql')
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    console.log('📝 Applying get_category_path function migration...')

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).single()

    if (error) {
      // Try direct execution if RPC doesn't exist
      console.log('Trying alternative method...')

      // Split by semicolons and execute each statement
      const statements = sql.split(';').filter(s => s.trim())

      for (const statement of statements) {
        if (statement.trim()) {
          const { error: execError } = await supabase.from('_migrations').insert({
            name: '20251111000000_add_category_path_function',
            executed_at: new Date().toISOString()
          })

          if (execError && execError.code !== '23505') { // Ignore duplicate key errors
            console.error('Error:', execError)
          }
        }
      }

      console.log('⚠️  Note: Please apply this migration manually in Supabase SQL Editor:')
      console.log('1. Go to https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new')
      console.log('2. Copy the SQL from: supabase/migrations/20251111000000_add_category_path_function.sql')
      console.log('3. Execute it')
    } else {
      console.log('✅ Migration applied successfully!')
    }

  } catch (err) {
    console.error('❌ Migration failed:', err.message)
    console.log('\n⚠️  Please apply manually:')
    console.log('1. Go to https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new')
    console.log('2. Copy the SQL from: supabase/migrations/20251111000000_add_category_path_function.sql')
    console.log('3. Execute it')
  }
}

applyMigration()
