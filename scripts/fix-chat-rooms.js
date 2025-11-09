const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function applyMigration() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log('Step 1: Dropping existing unique constraint...');
  let { error } = await supabase.rpc('exec_sql', {
    sql_query: 'ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_buyer_id_seller_id_key;'
  });
  if (error) console.error('Step 1 error:', error);
  else console.log('✅ Step 1 completed');

  console.log('Step 2: Adding new unique constraint with service_id...');
  ({ error } = await supabase.rpc('exec_sql', {
    sql_query: 'ALTER TABLE chat_rooms ADD CONSTRAINT chat_rooms_buyer_seller_service_unique UNIQUE NULLS NOT DISTINCT (buyer_id, seller_id, service_id);'
  }));
  if (error) console.error('Step 2 error:', error);
  else console.log('✅ Step 2 completed');

  console.log('Step 3: Creating index on service_id...');
  ({ error } = await supabase.rpc('exec_sql', {
    sql_query: 'CREATE INDEX IF NOT EXISTS idx_chat_rooms_service_id ON chat_rooms(service_id) WHERE service_id IS NOT NULL;'
  }));
  if (error) console.error('Step 3 error:', error);
  else console.log('✅ Step 3 completed');

  console.log('\n✅ Migration completed!');
}

applyMigration();
