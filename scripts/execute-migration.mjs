import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeDirectSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({ query: sql })
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status}: ${text}`)
  }

  return response.json()
}

async function runMigrationStepByStep() {
  console.log('🚀 Starting chat_rooms migration (step by step)...\n')

  try {
    // Step 1: Create new table
    console.log('Step 1: Creating chat_rooms_new table...')
    const { data: createData, error: createError } = await supabase
      .from('chat_rooms_new')
      .select('*')
      .limit(0)

    // If table doesn't exist, we need to create it via raw query
    console.log('Creating table structure via SQL...')

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS chat_rooms_new (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user1_id UUID NOT NULL,
        user2_id UUID NOT NULL,
        service_id UUID,
        last_message_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT unique_users CHECK (user1_id < user2_id),
        UNIQUE(user1_id, user2_id)
      );
    `

    console.log('SQL:', createTableSQL)
    console.log('\n⚠️  Since we cannot execute raw DDL via Supabase JS client,')
    console.log('we need to use PostgreSQL connection or Supabase Dashboard.')
    console.log('\nBut we can try using the service role to create via schema...\n')

    // Alternative approach: Use the pg library directly
    console.log('Attempting alternative PostgreSQL connection...')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Try using node-postgres for direct connection
async function runWithPostgres() {
  console.log('🚀 Attempting migration with direct PostgreSQL connection...\n')

  // Database connection string format:
  // postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres

  console.log('⚠️  To run this migration, you need the database password.')
  console.log('Please provide one of the following:\n')
  console.log('Option 1: Run via Supabase CLI (recommended):')
  console.log('  cd C:\\Users\\ohyus\\talent')
  console.log('  npx supabase db push\n')
  console.log('Option 2: Run SQL directly in Supabase Dashboard:')
  console.log('  https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new\n')
  console.log('Option 3: Provide database password for direct connection')
  console.log('  (Can be found in Supabase Dashboard > Project Settings > Database > Connection String)\n')

  const migrationPath = join(__dirname, '../supabase/migrations/20251109010000_refactor_chat_rooms_for_any_users.sql')
  const sql = readFileSync(migrationPath, 'utf8')

  console.log('📄 SQL to execute:')
  console.log('=' .repeat(80))
  console.log(sql)
  console.log('=' .repeat(80))
}

runWithPostgres()
