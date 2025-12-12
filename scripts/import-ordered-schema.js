#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * 새 Supabase 프로젝트에 스키마를 순서대로 import하는 스크립트
 *
 * 사용법:
 * node import-ordered-schema.js [PROJECT_ID] [ACCESS_TOKEN]
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const NEW_PROJECT_ID = process.argv[2] || 'abroivxthindezdtdzmj';
const NEW_ACCESS_TOKEN = process.argv[3] || 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee';
const SCHEMA_DIR = path.join(__dirname, '..', 'schema-parts');

function executeQuery(_query) {
  return new Promise((resolve, reject) => {

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${NEW_PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEW_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            console.error('에러 발생:', error);
            resolve({ success: true });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🚀 Importing schema to new Supabase project...\n');
  console.log(`Project ID: ${NEW_PROJECT_ID}\n`);

  const files = [
    '01_enums.sql',
    '02_tables.sql',
    '03_foreign_keys.sql',
    '04_indexes.sql',
    '05_functions.sql',
    '06_triggers.sql',
    '07_views.sql',
    '08_enable_rls.sql',
    '09_rls_policies.sql'
  ];

  for (const file of files) {
    const filePath = path.join(SCHEMA_DIR, file);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${file} not found, skipping...\n`);
      continue;
    }

    console.log(`📦 Applying ${file}...`);

    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      await executeQuery(sql);
      console.log(`   ✅ Success\n`);

      // Delay between files
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
      console.log('⚠️  Continuing with next file...\n');
    }
  }

  console.log('✅ Schema import completed!\n');
}

main();
