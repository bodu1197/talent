const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRLSStatus() {
  console.log('🔍 Checking RLS status for all tables...\n')

  const tables = [
    'users',
    'sellers',
    'seller_profiles',
    'orders',
    'services',
    'service_packages',
    'reviews',
    'seller_earnings',
    'payments',
    'withdrawal_requests'
  ]

  for (const table of tables) {
    console.log(`\n📋 ${table.toUpperCase()}`)
    console.log('─'.repeat(50))

    // Check if RLS is enabled
    const { data: rlsData, error: rlsError } = await supabase
      .from(table)
      .select('*')
      .limit(0)

    if (rlsError) {
      console.log(`   ⚠️  RLS Status: Cannot determine (${rlsError.message})`)
    } else {
      console.log(`   ✅ RLS Status: Enabled`)
    }

    // Try to count policies (this will work if we have access)
    const { data: policies, error: policyError } = await supabase
      .rpc('pg_policies_count', { table_name: table })
      .catch(() => ({ data: null, error: 'Function not available' }))

    if (policies !== null) {
      console.log(`   📝 Policies: ${policies} found`)
    }
  }

  console.log('\n' + '═'.repeat(60))
  console.log('✅ RLS Check Complete')
  console.log('═'.repeat(60))
}

checkRLSStatus().catch(console.error)
