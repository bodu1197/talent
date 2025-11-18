const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase PostgreSQL connection
const connectionString = 'postgresql://postgres.bpvfkkrlyrjkwgwmfrci:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres';

async function applyMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...\n');
    await client.connect();
    console.log('✅ Connected!\n');

    const migrations = [
      'supabase/migrations/20251114080000_create_profiles_table.sql',
      'supabase/migrations/20251114090000_unify_seller_profile_with_profiles.sql'
    ];

    for (const migrationFile of migrations) {
      console.log(`${'='.repeat(60)}`);
      console.log(`📄 Applying: ${path.basename(migrationFile)}`);
      console.log('='.repeat(60));

      const sql = fs.readFileSync(migrationFile, 'utf8');

      try {
        await client.query(sql);
        console.log('✅ Migration applied successfully!\n');
      } catch (err) {
        console.error('❌ Migration failed:', err.message);
        console.error('Details:', err);
        throw err;
      }
    }

    console.log('\n🎉 All migrations completed successfully!');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Check if pg is installed
try {
  require.resolve('pg');
  applyMigrations();
} catch (e) {
  console.log('📦 Installing pg package...\n');
  const { execSync } = require('child_process');
  execSync('npm install pg', { stdio: 'inherit' });
  console.log('\n✅ pg installed! Running migrations...\n');
  applyMigrations();
}
