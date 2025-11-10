require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixFK() {
  console.log('Fixing withdrawal_requests foreign key constraint...\n')

  const sql = `
-- Drop the incorrect foreign key constraint
ALTER TABLE withdrawal_requests
DROP CONSTRAINT IF EXISTS withdrawal_requests_seller_id_fkey;

-- Add the correct foreign key constraint referencing sellers.id
ALTER TABLE withdrawal_requests
ADD CONSTRAINT withdrawal_requests_seller_id_fkey
FOREIGN KEY (seller_id)
REFERENCES sellers(id)
ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_seller_id
ON withdrawal_requests(seller_id);
`

  try {
    // Try using rpc if available
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql })

    if (error) {
      console.error('Error via RPC:', error.message)
      console.log('\n⚠️  Please execute the following SQL in Supabase Dashboard:')
      console.log('https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new')
      console.log('\n' + sql)
      return
    }

    console.log('✓ FK constraint fixed successfully!')

  } catch (err) {
    console.error('Unexpected error:', err)
    console.log('\n⚠️  Please execute the SQL manually in Supabase Dashboard:')
    console.log('https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new')
    console.log('\n' + sql)
  }
}

fixFK()
