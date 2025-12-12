/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
// Safe: development script for database operations
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase PostgreSQL connection string
const connectionString = `postgresql://postgres.bpvfkkrlyrjkwgwmfrci:${process.env.SUPABASE_DB_PASSWORD}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`;

async function runMigration() {
  console.log('🚀 Starting profile unification migration...\n');

  // Check if pg is installed
  try {
    require.resolve('pg');
  } catch (error) {
    console.error('에러 발생:', error);
    console.log('📦 Installing pg package...\n');
    const { execSync } = require('child_process');
    execSync('npm install pg', { stdio: 'inherit' });
    console.log('\n✅ pg installed!\n');
  }

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read migration SQL
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '..', 'combined_profile_migration.sql'),
      'utf8'
    );

    console.log('📄 Executing migration SQL...');
    console.log('='  .repeat(60));

    // Execute the migration
    await client.query(migrationSQL);

    console.log('='  .repeat(60));
    console.log('✅ Migration executed successfully!\n');

    // Verify the results
    console.log('🔍 Verifying migration results...\n');

    // Check profiles table
    const { rows: profilesCount } = await client.query(
      'SELECT COUNT(*) as count FROM public.profiles'
    );
    console.log(`✅ profiles table created: ${profilesCount[0].count} profiles found`);

    // Check seller_profiles view
    const { rows: viewCount } = await client.query(
      'SELECT COUNT(*) as count FROM public.seller_profiles'
    );
    console.log(`✅ seller_profiles view created: ${viewCount[0].count} sellers found`);

    // Check if sellers columns were dropped
    const { rows: sellerColumns } = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'sellers'
        AND column_name IN ('display_name', 'profile_image')
    `);

    if (sellerColumns.length === 0) {
      console.log('✅ sellers.display_name and sellers.profile_image columns dropped');
    } else {
      console.log(`⚠️  Warning: Some columns still exist: ${sellerColumns.map(c => c.column_name).join(', ')}`);
    }

    // Sample data check
    const { rows: sampleProfiles } = await client.query(`
      SELECT user_id, name, profile_image
      FROM public.profiles
      LIMIT 3
    `);
    console.log('\n📋 Sample profiles:');
    sampleProfiles.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (${p.user_id.substring(0, 8)}...)`);
    });

    console.log('\n🎉 Migration completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error('Error:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Connection closed.');
  }
}

runMigration();
