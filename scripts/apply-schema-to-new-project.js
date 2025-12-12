#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * 새 Supabase 프로젝트에 complete-schema.sql 적용
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const NEW_PROJECT_ID = process.argv[2] || 'abroivxthindezdtdzmj';
const NEW_ACCESS_TOKEN = process.argv[3] || 'sb_secret_yjCABwj3zJbfvFsJ4baU4A_4b3YUPvT';
const SCHEMA_FILE = path.join(__dirname, '..', 'complete-schema.sql');

function executeQuery(_query) {
  return new Promise((resolve, reject) => {

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${NEW_PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NEW_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
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
          } catch (parseError) {
            // JSON 파싱 실패 시 원본 응답 반환
            console.error('JSON 파싱 실패:', parseError);
            resolve({ success: true, raw: body });
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
  console.log('🚀 Applying schema to new Supabase project...\n');
  console.log(`Project ID: ${NEW_PROJECT_ID}\n`);

  try {
    // Read schema file
    console.log('📖 Reading schema file...');
    const schema = fs.readFileSync(SCHEMA_FILE, 'utf8');
    console.log(`   ✅ File size: ${Math.round(schema.length / 1024)} KB\n`);

    // Split into batches by section
    const sections = schema.split(/-- ={40,}/);

    console.log(`📦 Found ${sections.length} sections\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();

      if (!section || section.startsWith('--')) {
        continue;
      }

      // Extract section name from comment
      const lines = section.split('\n');
      const firstLine = lines[0] || '';
      const sectionName = firstLine.replace(/^--\s*/, '').trim() || `Section ${i + 1}`;

      console.log(`⚙️  Applying: ${sectionName}...`);

      try {
        await executeQuery(section);
        console.log(`   ✅ Success\n`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
        errorCount++;

        // Continue with other sections
      }

      // Add delay between sections to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log('═══════════════════════════════════════');
    console.log(`✅ Completed: ${successCount} sections succeeded`);
    console.log(`❌ Failed: ${errorCount} sections failed`);
    console.log('═══════════════════════════════════════\n');

    if (errorCount > 0) {
      console.log('⚠️  Some sections failed. You may need to:');
      console.log('   1. Manually run the failed SQL in Supabase SQL Editor');
      console.log('   2. Check for dependency issues');
      console.log('\n📁 Schema file: complete-schema.sql\n');
    } else {
      console.log('🎉 Schema successfully applied to new project!\n');
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
