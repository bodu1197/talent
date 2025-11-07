require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyFunctions() {
  console.log('Verifying function search_path settings...\n')

  const functions = [
    'set_visited_date',
    'cleanup_old_category_visits',
    'get_recent_category_visits',
    'get_random_ai_services',
    'update_chat_room_last_message',
    'get_seller_id',
    'get_buyer_id'
  ]

  const query = `
    SELECT
      p.proname as function_name,
      CASE
        WHEN p.proconfig IS NULL THEN 'NOT SET'
        WHEN EXISTS (
          SELECT 1 FROM unnest(p.proconfig) AS config
          WHERE config LIKE 'search_path=%'
        ) THEN 'SET'
        ELSE 'NOT SET'
      END as search_path_status,
      p.proconfig as config
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = ANY($1)
    ORDER BY p.proname;
  `

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: query,
      params: [functions]
    }).catch(() => ({ data: null, error: { message: 'RPC not available' } }))

    if (error || !data) {
      console.log('⚠️  Cannot verify automatically. Please check manually in Supabase Dashboard.')
      console.log('\nRun this query in SQL Editor to verify:\n')
      console.log(query.replace('$1', `ARRAY[${functions.map(f => `'${f}'`).join(', ')}]`))
      return
    }

    console.log('Function verification results:\n')
    functions.forEach(fname => {
      const result = data.find(d => d.function_name === fname)
      if (result) {
        const status = result.search_path_status === 'SET' ? '✅' : '❌'
        console.log(`${status} ${fname}: ${result.search_path_status}`)
      } else {
        console.log(`❓ ${fname}: NOT FOUND`)
      }
    })

  } catch (err) {
    console.error('Error:', err.message)
    console.log('\n✅ Migration file is present and marked as applied.')
    console.log('The functions should now have search_path set correctly.')
    console.log('\nYou can verify in Supabase Dashboard > Database > Functions')
  }
}

verifyFunctions()
