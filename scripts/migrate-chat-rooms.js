const https = require('https')

const SUPABASE_URL = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'

function executeSQL(query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'bpvfkkrlyrjkwgwmfrci.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation'
      }
    }

    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ SQL executed successfully')
          resolve(data)
        } else {
          console.error(`❌ HTTP ${res.statusCode}:`, data)
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        }
      })
    })

    req.on('error', (error) => {
      console.error('❌ Request error:', error)
      reject(error)
    })

    req.write(JSON.stringify({ sql_query: query }))
    req.end()
  })
}

async function runMigration() {
  try {
    console.log('🚀 Starting chat_rooms migration using HTTP API...\n')

    // Step 1: Create new table
    console.log('Step 1: Creating chat_rooms_new table...')
    await executeSQL(`
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
    `)

    // Step 2: Copy data
    console.log('\nStep 2: Copying data from old table...')
    await executeSQL(`
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
    `)

    // Step 3: Drop old table and rename
    console.log('\nStep 3: Replacing old table...')
    await executeSQL(`DROP TABLE IF EXISTS chat_rooms CASCADE;`)
    await executeSQL(`ALTER TABLE chat_rooms_new RENAME TO chat_rooms;`)

    // Step 4: Create indexes
    console.log('\nStep 4: Creating indexes...')
    await executeSQL(`CREATE INDEX IF NOT EXISTS idx_chat_rooms_user1_id ON chat_rooms(user1_id);`)
    await executeSQL(`CREATE INDEX IF NOT EXISTS idx_chat_rooms_user2_id ON chat_rooms(user2_id);`)
    await executeSQL(`CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_message_at ON chat_rooms(last_message_at DESC);`)

    // Step 5: Enable RLS
    console.log('\nStep 5: Enabling RLS...')
    await executeSQL(`ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;`)

    // Step 6: Drop old policies
    console.log('\nStep 6: Creating RLS policies...')
    try {
      await executeSQL(`DROP POLICY IF EXISTS "Users can view their own chat rooms" ON chat_rooms;`)
      await executeSQL(`DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;`)
      await executeSQL(`DROP POLICY IF EXISTS "Users can update their chat rooms" ON chat_rooms;`)
    } catch (e) {
      console.log('(Old policies may not exist, continuing...)')
    }

    // Create new policies
    await executeSQL(`
      CREATE POLICY "Users can view their own chat rooms"
        ON chat_rooms FOR SELECT
        USING (auth.uid() = user1_id OR auth.uid() = user2_id);
    `)
    await executeSQL(`
      CREATE POLICY "Users can create chat rooms"
        ON chat_rooms FOR INSERT
        WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
    `)
    await executeSQL(`
      CREATE POLICY "Users can update their chat rooms"
        ON chat_rooms FOR UPDATE
        USING (auth.uid() = user1_id OR auth.uid() = user2_id);
    `)

    console.log('\n🎉 Migration completed successfully!\n')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigration()
