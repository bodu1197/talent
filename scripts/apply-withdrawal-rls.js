require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

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

async function applyRLS() {
  console.log('Applying RLS policies for withdrawal_requests...\n')

  const sql = `
-- Enable RLS on withdrawal_requests table
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Sellers can create withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Sellers can view own withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Sellers can update own pending withdrawals" ON withdrawal_requests;
DROP POLICY IF EXISTS "Admins can view all withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Admins can update all withdrawal requests" ON withdrawal_requests;

-- Policy: Sellers can insert their own withdrawal requests
CREATE POLICY "Sellers can create withdrawal requests"
ON withdrawal_requests
FOR INSERT
TO authenticated
WITH CHECK (
  seller_id IN (
    SELECT id FROM sellers WHERE user_id = auth.uid()
  )
);

-- Policy: Sellers can view their own withdrawal requests
CREATE POLICY "Sellers can view own withdrawal requests"
ON withdrawal_requests
FOR SELECT
TO authenticated
USING (
  seller_id IN (
    SELECT id FROM sellers WHERE user_id = auth.uid()
  )
);

-- Policy: Sellers can update their own pending withdrawal requests (e.g., cancel)
CREATE POLICY "Sellers can update own pending withdrawals"
ON withdrawal_requests
FOR UPDATE
TO authenticated
USING (
  seller_id IN (
    SELECT id FROM sellers WHERE user_id = auth.uid()
  )
  AND status = 'pending'
)
WITH CHECK (
  seller_id IN (
    SELECT id FROM sellers WHERE user_id = auth.uid()
  )
);

-- Policy: Admins can view all withdrawal requests
CREATE POLICY "Admins can view all withdrawal requests"
ON withdrawal_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Policy: Admins can update all withdrawal requests (approve/reject)
CREATE POLICY "Admins can update all withdrawal requests"
ON withdrawal_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
`

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql })

    if (error) {
      console.error('Error applying RLS:', error)

      // Try direct SQL execution
      console.log('\nTrying alternative method...')
      const queries = sql.split(';').filter(q => q.trim())

      for (const query of queries) {
        if (query.trim()) {
          console.log(`Executing: ${query.trim().substring(0, 50)}...`)
          const { error: execError } = await supabase.from('withdrawal_requests').select('count').limit(0)
          if (execError) {
            console.error('Error:', execError.message)
          }
        }
      }

      console.log('\n⚠️  Please execute the following SQL in Supabase Dashboard:')
      console.log('https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new')
      console.log('\n' + sql)
      return
    }

    console.log('✓ RLS policies applied successfully!')

  } catch (err) {
    console.error('Unexpected error:', err)
    console.log('\n⚠️  Please execute the SQL manually in Supabase Dashboard')
    console.log(sql)
  }
}

applyRLS()
