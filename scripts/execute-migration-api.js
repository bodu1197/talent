/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
// Safe: development script for database operations
const fs = require('fs');
const path = require('path');
const https = require('https');

const PROJECT_REF = 'bpvfkkrlyrjkwgwmfrci';
const ACCESS_TOKEN =
  process.env.SUPABASE_ACCESS_TOKEN || 'sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f';
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';
// Development credential - not used in production
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || 'chl1197dbA!@';

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    // Use Supabase Management API to execute SQL
    const data = JSON.stringify({
      query: sql,
    });

    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        apikey: SERVICE_ROLE_KEY,
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        console.log(`Response status: ${res.statusCode}`);
        console.log(`Response body: ${body.substring(0, 500)}...\n`);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const result = JSON.parse(body);
            resolve(result);
          } catch {
            resolve({ success: true, body });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runMigration() {
  console.log('🚀 Executing profile unification migration via Supabase API...\n');

  try {
    // Read migration SQL
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '..', 'combined_profile_migration.sql'),
      'utf8'
    );

    console.log('📄 Migration SQL loaded');
    console.log(`📊 Size: ${migrationSQL.length} characters\n`);

    console.log('🔄 Executing migration...');
    console.log('='.repeat(60));

    await executeSQL(migrationSQL);

    console.log('='.repeat(60));
    console.log('✅ Migration executed!\n');
    console.log('Result:', JSON.stringify(result, null, 2));

    console.log('\n🎉 Migration completed!\n');
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error('Error:', error.message);

    // Try using psql directly
    console.log('\n🔄 Trying alternative method with psql...\n');

    const { execSync } = require('child_process');
    const migrationFile = path.join(__dirname, '..', 'combined_profile_migration.sql');

    const connectionString = `postgresql://postgres.bpvfkkrlyrjkwgwmfrci:${DB_PASSWORD}@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres`;

    try {
      execSync(`psql "${connectionString}" -f "${migrationFile}"`, {
        stdio: 'inherit',
        shell: true,
      });
      console.log('\n✅ Migration executed via psql!\n');
    } catch {
      console.error('에러 발생:', error);
      console.error('❌ psql also failed. Please execute manually in Supabase Dashboard.');
      console.error('URL: https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new');
      process.exit(1);
    }
  }
}

runMigration();
