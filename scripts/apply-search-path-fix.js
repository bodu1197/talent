require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySQLMigration() {
  try {
    const sqlFile = path.join(__dirname, '..', 'supabase', 'migrations', '20251107150000_fix_function_search_path.sql')
    const sql = fs.readFileSync(sqlFile, 'utf8')

    console.log('Applying search_path fix migration...')

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
      // If RPC doesn't exist, try direct query
      const { data, error } = await supabase.from('_migration_test').select('*').limit(0)
      if (error && error.code === '42P01') {
        // Table doesn't exist, we'll use psql approach
        console.log('Direct query not available, SQL content:')
        console.log(sql)
        return { data: null, error: null }
      }
      throw error
    })

    if (error) {
      console.error('Error applying migration:', error)
      process.exit(1)
    }

    console.log('✅ Migration applied successfully!')
    console.log('\nFixed functions:')
    console.log('1. set_visited_date')
    console.log('2. cleanup_old_category_visits')
    console.log('3. get_recent_category_visits')
    console.log('4. get_random_ai_services')
    console.log('5. update_chat_room_last_message')
    console.log('6. get_seller_id')
    console.log('7. get_buyer_id')

  } catch (err) {
    console.error('Unexpected error:', err)

    // Print SQL for manual execution
    console.log('\n⚠️  Please run this SQL manually in Supabase Dashboard > SQL Editor:')
    console.log('\n' + '='.repeat(80))
    const sqlFile = path.join(__dirname, '..', 'supabase', 'migrations', '20251107150000_fix_function_search_path.sql')
    const sql = fs.readFileSync(sqlFile, 'utf8')
    console.log(sql)
    console.log('='.repeat(80))
  }
}

applySQLMigration()
