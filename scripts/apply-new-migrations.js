/* eslint-disable no-console */
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

// Supabase Configuration from previous script
const SUPABASE_PROJECT_REF = 'abroivxthindezdtdzmj';
const SUPABASE_ACCESS_TOKEN = 'sbp_753b67c2411cad6320ef44d6626ac13ee2ba6296';

const MIGRATIONS = [
  'supabase/migrations/20251219_create_chatbot_tables.sql',
  'supabase/migrations/20251219_create_dispute_tables.sql',
  'supabase/migrations/20251219_expand_ai_knowledge_base.sql',
  'supabase/migrations/20251219_add_dispute_faq.sql'
];

function runQuery(sql, filename) {
  return new Promise((resolve, reject) => {
    const requestData = JSON.stringify({ query: sql });

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`✅ Applied: ${filename}`);
          resolve(data);
        } else {
          console.error(`❌ Failed: ${filename} (${res.statusCode})`);
          console.error(data);
          reject(new Error(`Failed with status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Request Error: ${filename}`, e.message);
      reject(e);
    });

    req.write(requestData);
    req.end();
  });
}

async function applyMigrations() {
  console.log('🚀 Starting migration application via Supabase Management API...\n');

  for (const migrationFile of MIGRATIONS) {
    const filePath = path.join(process.cwd(), migrationFile);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${migrationFile}`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    try {
      await runQuery(sql, migrationFile);
      // Add a small delay between requests to be safe
      await new Promise(r => setTimeout(r, 1000));
    } catch {
      console.error('Migration stopped due to error.');
      process.exit(1);
    }
  }

  console.log('\n🎉 All migrations completed successfully!');
}

applyMigrations();
