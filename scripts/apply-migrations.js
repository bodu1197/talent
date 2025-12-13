/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const fs = require('fs');
const https = require('https');
const path = require('path');

const _SUPABASE_URL = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: 'bpvfkkrlyrjkwgwmfrci.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Success:', res.statusCode);
          console.log('Response:', data);
          resolve(data);
        } else {
          console.error('❌ Error:', res.statusCode);
          console.error('Response:', data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request Error:', e.message);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    console.log('🚀 Starting migration execution...\n');

    // Read migration files
    const migration1Path = path.join(
      __dirname,
      '..',
      'supabase',
      'migrations',
      '20251114000000_create_revision_history.sql'
    );
    const migration2Path = path.join(
      __dirname,
      '..',
      'supabase',
      'migrations',
      '20251114010000_create_notifications.sql'
    );

    console.log('📖 Reading migration files...');
    const sql1 = fs.readFileSync(migration1Path, 'utf8');
    const sql2 = fs.readFileSync(migration2Path, 'utf8');

    console.log('✅ Migration files loaded\n');

    // Execute migration 1
    console.log('🔄 Executing migration 1: create_revision_history.sql');
    await executeSql(sql1);
    console.log('✅ Migration 1 completed\n');

    // Execute migration 2
    console.log('🔄 Executing migration 2: create_notifications.sql');
    await executeSql(sql2);
    console.log('✅ Migration 2 completed\n');

    console.log('🎉 All migrations executed successfully!');
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  }
}

main();
