#!/usr/bin/env node
/**
 * Apply errand_applications RLS policy migration
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const _supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const _supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1];
if (!projectRef) {
  console.error('Cannot extract project ref from URL');
  process.exit(1);
}

async function _executeStatementViaRest(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        Prefer: 'return=representation',
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('=== Applying errand_applications RLS Migration ===\n');
  console.log('Project:', projectRef);

  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/20251205000000_add_errand_applications_rls.sql'
  );

  if (!fs.existsSync(migrationPath)) {
    console.error('Migration file not found:', migrationPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');
  console.log('Migration file loaded:', migrationPath);
  console.log('Size:', sql.length, 'bytes\n');

  console.log('📋 SQL to execute:');
  console.log('─'.repeat(60));
  console.log(sql.substring(0, 500) + '...\n');
  console.log('─'.repeat(60));

  console.log('\n⚠️  This migration needs to be run manually in Supabase Dashboard.');
  console.log('\n📋 Steps:');
  console.log('   1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
  console.log('   2. Copy and paste the SQL below');
  console.log('   3. Click "Run" to execute\n');

  console.log('═'.repeat(60));
  console.log('COPY THIS SQL:');
  console.log('═'.repeat(60));
  console.log(sql);
  console.log('═'.repeat(60));
}

main().catch(console.error);
