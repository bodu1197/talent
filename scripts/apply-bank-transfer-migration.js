/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function applyMigration() {
  const client = new Client({
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.pxtwaffiawzcfgjsljkl',
    password: process.env.SUPABASE_DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('✓ Connected to database\n');

    // Add columns to advertising_payments
    console.log('Adding fields to advertising_payments...');
    await client.query(`
      ALTER TABLE advertising_payments
      ADD COLUMN IF NOT EXISTS depositor_phone TEXT,
      ADD COLUMN IF NOT EXISTS depositor_email TEXT,
      ADD COLUMN IF NOT EXISTS business_registration_number TEXT,
      ADD COLUMN IF NOT EXISTS tax_invoice_requested BOOLEAN DEFAULT false;
    `);
    console.log('✓ Added fields to advertising_payments\n');

    // Add package_type to advertising_subscriptions
    console.log('Adding package_type to advertising_subscriptions...');
    await client.query(`
      ALTER TABLE advertising_subscriptions
      ADD COLUMN IF NOT EXISTS package_type TEXT;
    `);
    console.log('✓ Added package_type column\n');

    // Add constraint separately (in case column already exists)
    try {
      await client.query(`
        ALTER TABLE advertising_subscriptions
        DROP CONSTRAINT IF EXISTS advertising_subscriptions_package_type_check;
      `);
      await client.query(`
        ALTER TABLE advertising_subscriptions
        ADD CONSTRAINT advertising_subscriptions_package_type_check
        CHECK (package_type IN ('basic', 'standard', 'premium'));
      `);
      console.log('✓ Added package_type constraint\n');
    } catch (error) {
      console.error('에러 발생:', error);
      console.log('Note: Constraint may already exist, continuing...\n');
    }

    // Update existing rows
    console.log('Updating existing rows with package_type...');
    await client.query(`
      UPDATE advertising_subscriptions
      SET package_type = CASE
        WHEN monthly_price <= 100000 THEN 'basic'
        WHEN monthly_price <= 200000 THEN 'standard'
        ELSE 'premium'
      END
      WHERE package_type IS NULL;
    `);
    console.log(`✓ Updated ${result.rowCount} rows\n`);

    console.log('=== Migration completed successfully! ===');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

applyMigration();
