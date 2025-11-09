const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Get database connection from Supabase dashboard
const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required. Get it from Supabase dashboard > Settings > Database');
  console.error('Add it to .env.local as DATABASE_URL=postgresql://...');
  process.exit(1);
}

async function applyMigration() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20241109100000_fix_notification_system.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration...');

    // Execute the entire migration as a transaction
    await client.query('BEGIN');

    try {
      // Split and execute statements
      const statements = sql
        .split(/;\s*$/gm)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          console.log('Executing:', statement.substring(0, 80) + '...');
          await client.query(statement);
        }
      }

      await client.query('COMMIT');
      console.log('Migration applied successfully!');

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();