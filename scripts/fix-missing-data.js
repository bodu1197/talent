#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * 실패한 테이블들을 다시 import
 * - 외래 키 제약조건을 일시적으로 비활성화
 * - 각 행을 개별 트랜잭션으로 처리
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const NEW_PROJECT_ID = 'abroivxthindezdtdzmj';
const NEW_ACCESS_TOKEN = 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee';
const JSON_DIR = path.join(__dirname, '..', 'database-export');

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

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

async function importWithRetry(tableName, maxRetries = 3) {
  const jsonPath = path.join(JSON_DIR, `${tableName}.json`);

  if (!fs.existsSync(jsonPath)) {
    console.log(`   ⚠️  ${tableName}.json not found\n`);
    return { success: 0, failed: 0 };
  }

  try {
    console.log(`\n📦 Re-importing ${tableName}...`);

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    if (!data || data.length === 0) {
      console.log(`   ⚠️  No data\n`);
      return { success: 0, failed: 0 };
    }

    const columns = Object.keys(data[0]);
    let successCount = 0;
    let failCount = 0;

    // Temporarily disable triggers to avoid FK issues
    try {
      await executeQuery(`ALTER TABLE "${tableName}" DISABLE TRIGGER ALL`);
    } catch (error) {
      console.error('에러 발생:', error);
      // Ignore
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      let success = false;

      for (let attempt = 0; attempt < maxRetries && !success; attempt++) {
        try {
          const values = columns.map(col => {
            const value = row[col];

            if (value === null || value === undefined) {
              return 'NULL';
            }

            if (typeof value === 'string') {
              const escaped = value.replace(/'/g, "''").replace(/\\/g, '\\\\');
              return `'${escaped}'`;
            }

            if (typeof value === 'boolean') {
              return value ? 'true' : 'false';
            }

            if (typeof value === 'object') {
              const json = JSON.stringify(value).replace(/'/g, "''");
              return `'${json}'::jsonb`;
            }

            return value;
          }).join(', ');

          const insertQuery = `
            INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')})
            VALUES (${values})
            ON CONFLICT DO NOTHING
          `;

          await executeQuery(insertQuery);
          successCount++;
          success = true;

        } catch {
          if (attempt === maxRetries - 1) {
            failCount++;
          }
          // Wait a bit before retry
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
        }
      }

      if ((i + 1) % 10 === 0 || i === data.length - 1) {
        process.stdout.write(`\r   Progress: ${i + 1}/${data.length} (✅ ${successCount}, ❌ ${failCount})`);
      }
    }

    // Re-enable triggers
    try {
      await executeQuery(`ALTER TABLE "${tableName}" ENABLE TRIGGER ALL`);
    } catch (error) {
      console.error('에러 발생:', error);
      // Ignore
    }

    console.log(`\n   ✅ Completed: ${successCount} success, ${failCount} failed\n`);

    return { success: successCount, failed: failCount };

  } catch (error) {
    console.log(`\n   ❌ Error: ${error.message}\n`);
    return { success: 0, failed: data?.length || 0 };
  }
}

async function main() {
  console.log('🔧 Fixing missing data...\n');
  console.log(`Target: ${NEW_PROJECT_ID}\n`);

  // Tables that failed or had 0 imports
  const FAILED_TABLES = [
    'buyers',
    'sellers',
    'user_wallets',
    'service_categories',
    'services',
    'seller_earnings',
    'service_revisions',
    'service_revision_categories',
    'service_favorites',
    'service_views',
    'orders',
    'payment_requests',
    'chat_favorites',
    'advertising_subscriptions',
    'advertising_impressions',
    'advertising_payments',
    'notifications',
    'withdrawal_requests'
  ];

  let totalSuccess = 0;
  let totalFailed = 0;

  for (const tableName of FAILED_TABLES) {
    const result = await importWithRetry(tableName);
    totalSuccess += result.success;
    totalFailed += result.failed;
  }

  console.log('\n═══════════════════════════════════════');
  console.log(`✅ Total Success: ${totalSuccess}`);
  console.log(`❌ Total Failed: ${totalFailed}`);
  console.log('═══════════════════════════════════════\n');

  // Now verify data counts
  console.log('📊 Verifying data counts...\n');

  for (const tableName of FAILED_TABLES) {
    try {
      const result = await executeQuery(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const count = result[0].count;
      console.log(`   ${tableName}: ${count} rows`);
    } catch {
      console.log(`   ${tableName}: Error`);
    }
  }

  console.log('\n✅ Repair completed!\n');
}

main();
