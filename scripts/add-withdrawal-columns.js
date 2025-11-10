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

async function addColumns() {
  console.log('Adding columns to withdrawal_requests table...\n')

  const sql = `
-- Add missing columns to withdrawal_requests table

-- Add completed_at column for tracking when withdrawal was processed
ALTER TABLE withdrawal_requests
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Add rejected_reason column for storing rejection reason
ALTER TABLE withdrawal_requests
ADD COLUMN IF NOT EXISTS rejected_reason TEXT;

-- Update existing records to set completed_at if status is completed
UPDATE withdrawal_requests
SET completed_at = created_at
WHERE status = 'completed' AND completed_at IS NULL;
`

  console.log('⚠️  Please execute the following SQL in Supabase Dashboard:')
  console.log('https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new')
  console.log('\n' + sql)
}

addColumns()
