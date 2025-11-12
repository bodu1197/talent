const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  try {
    console.log('🚀 Starting chat_rooms migration...\n')

    // Step 1: Create new table
    console.log('Step 1: Creating chat_rooms_new table...')
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS chat_rooms_new (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          service_id UUID REFERENCES services(id) ON DELETE SET NULL,
          last_message_at TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT unique_users CHECK (user1_id < user2_id),
          UNIQUE(user1_id, user2_id)
        );
      `
    })

    if (createError && !createError.message.includes('already exists')) {
      console.error('❌ Failed to create table:', createError)
      throw createError
    }
    console.log('✅ Table created\n')

    // Step 2: Copy data
    console.log('Step 2: Copying data from old table...')
    const { error: copyError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO chat_rooms_new (id, user1_id, user2_id, service_id, last_message_at, created_at, updated_at)
        SELECT
          cr.id,
          LEAST(cr.buyer_id, s.user_id) as user1_id,
          GREATEST(cr.buyer_id, s.user_id) as user2_id,
          cr.service_id,
          cr.last_message_at,
          cr.created_at,
          cr.updated_at
        FROM chat_rooms cr
        JOIN sellers s ON s.id = cr.seller_id
        ON CONFLICT (id) DO NOTHING;
      `
    })

    if (copyError) {
      console.error('❌ Failed to copy data:', copyError)
      throw copyError
    }
    console.log('✅ Data copied\n')

    // Step 3: Drop old table and rename
    console.log('Step 3: Replacing old table...')
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TABLE IF EXISTS chat_rooms CASCADE;
        ALTER TABLE chat_rooms_new RENAME TO chat_rooms;
      `
    })

    if (dropError) {
      console.error('❌ Failed to replace table:', dropError)
      throw dropError
    }
    console.log('✅ Table replaced\n')

    // Step 4: Create indexes
    console.log('Step 4: Creating indexes...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_chat_rooms_user1_id ON chat_rooms(user1_id);
        CREATE INDEX IF NOT EXISTS idx_chat_rooms_user2_id ON chat_rooms(user2_id);
        CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_message_at ON chat_rooms(last_message_at DESC);
      `
    })

    if (indexError) {
      console.error('❌ Failed to create indexes:', indexError)
      throw indexError
    }
    console.log('✅ Indexes created\n')

    // Step 5: Enable RLS
    console.log('Step 5: Enabling RLS...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;`
    })

    if (rlsError) {
      console.error('❌ Failed to enable RLS:', rlsError)
      throw rlsError
    }
    console.log('✅ RLS enabled\n')

    // Step 6: Create RLS policies
    console.log('Step 6: Creating RLS policies...')
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can view their own chat rooms" ON chat_rooms;
        DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;
        DROP POLICY IF EXISTS "Users can update their chat rooms" ON chat_rooms;

        CREATE POLICY "Users can view their own chat rooms"
          ON chat_rooms FOR SELECT
          USING (auth.uid() = user1_id OR auth.uid() = user2_id);

        CREATE POLICY "Users can create chat rooms"
          ON chat_rooms FOR INSERT
          WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

        CREATE POLICY "Users can update their chat rooms"
          ON chat_rooms FOR UPDATE
          USING (auth.uid() = user1_id OR auth.uid() = user2_id);
      `
    })

    if (policyError) {
      console.error('❌ Failed to create policies:', policyError)
      throw policyError
    }
    console.log('✅ RLS policies created\n')

    console.log('🎉 Migration completed successfully!')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
