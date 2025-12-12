const { createClient } = require('@supabase/supabase-js');

const _supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addRoleToProfiles() {
  console.log('Adding role column to profiles table...');

  const sql = `
    -- Add role column to profiles table
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin'));
        CREATE INDEX idx_profiles_role ON profiles(role);
        COMMENT ON COLUMN profiles.role IS 'User role: buyer, seller, or admin';
      END IF;
    END $$;

    -- Update existing profiles to set appropriate roles based on sellers table
    UPDATE profiles p
    SET role = 'seller'
    FROM sellers s
    WHERE p.user_id = s.user_id
    AND p.role = 'buyer';
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('Error adding role column:', error);
    console.log('Trying alternative approach with direct query...');

    // Alternative: Use PostgreSQL connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: `postgresql://postgres.bpvfkkrlyrjkwgwmfrci:${process.env.SUPABASE_DB_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
    });

    try {
      await pool.query(`
        ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin'))
      `);
      console.log('✓ Role column added');

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role)
      `);
      console.log('✓ Index created');

      await pool.query(`
        UPDATE profiles p
        SET role = 'seller'
        FROM sellers s
        WHERE p.user_id = s.user_id
        AND p.role = 'buyer'
      `);
      console.log('✓ Existing sellers updated');

      await pool.end();
      console.log('\n✅ Migration completed successfully!');
    } catch (pgError) {
      console.error('PostgreSQL error:', pgError);
      await pool.end();
      process.exit(1);
    }
  } else {
    console.log('✅ Migration completed successfully!');
  }
}

addRoleToProfiles();
