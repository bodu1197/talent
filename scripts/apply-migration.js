const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

async function applyMigration() {
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251109110000_fix_chat_rooms_service_uniqueness.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Connecting to Supabase...');

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // Split SQL into individual statements (basic split by semicolon)
    const statements = sql
      .split(/;\s*$/gm)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        console.log(statement.substring(0, 100) + '...');

        // Execute SQL using rpc
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });

        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          // Continue with other statements even if one fails
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      }
    }

    console.log('Migration completed!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();