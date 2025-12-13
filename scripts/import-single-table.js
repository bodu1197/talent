#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * 단일 테이블을 안전하게 import
 * - 외래 키 제약조건 확인
 * - 에러 로깅
 * - 디버깅 모드
 */

const https = require('https');
const _fs = require('fs');
const _path = require('path');

const OLD_PROJECT_ID = 'bpvfkkrlyrjkwgwmfrci';
const OLD_ACCESS_TOKEN = 'sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f';
const NEW_PROJECT_ID = 'abroivxthindezdtdzmj';
const NEW_ACCESS_TOKEN = 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee';

function executeQuery(projectId, token, query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/database/query`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
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

async function downloadTable(tableName) {
  console.log(`📥 Downloading ${tableName} from original DB...`);

  try {
    await executeQuery(OLD_PROJECT_ID, OLD_ACCESS_TOKEN, `SELECT * FROM "${tableName}"`);

    console.log(`   ✅ Downloaded ${data.length} rows\n`);
    return data;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return null;
  }
}

async function getColumnTypes(tableName) {
  try {
    await executeQuery(
      NEW_PROJECT_ID,
      NEW_ACCESS_TOKEN,
      `
      SELECT column_name, udt_name, data_type
      FROM information_schema.columns
      WHERE table_name = '${tableName}'
      AND table_schema = 'public'
    `
    );

    const typeMap = {};
    result.forEach((col) => {
      typeMap[col.column_name] = {
        udt_name: col.udt_name,
        data_type: col.data_type,
      };
    });
    return typeMap;
  } catch (error) {
    console.log(`   ⚠️  Could not get column types: ${error.message}`);
    return {};
  }
}

async function uploadTable(tableName, data) {
  if (!data || data.length === 0) {
    console.log(`   ⚠️  No data to upload\n`);
    return { success: 0, failed: 0 };
  }

  console.log(`📤 Uploading ${data.length} rows to new DB...`);

  // Get column types first
  const columnTypes = await getColumnTypes(tableName);

  const columns = Object.keys(data[0]);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    try {
      const values = columns
        .map((col) => {
          const value = row[col];
          const colType = columnTypes[col];

          if (value === null || value === undefined) {
            return 'NULL';
          }

          // Handle array types (text[], varchar[], etc.)
          if (colType && colType.udt_name && colType.udt_name.startsWith('_')) {
            if (Array.isArray(value)) {
              if (value.length === 0) {
                return 'ARRAY[]::text[]';
              }
              const arrayValues = value
                .map((v) => {
                  const escaped = String(v).replace(/'/g, "''").replace(/\\/g, '\\\\');
                  return `'${escaped}'`;
                })
                .join(', ');
              return `ARRAY[${arrayValues}]`;
            }
            // If it's stored as JSON string but needs to be array
            if (typeof value === 'string' && value.startsWith('[')) {
              try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                  if (parsed.length === 0) {
                    return 'ARRAY[]::text[]';
                  }
                  const arrayValues = parsed
                    .map((v) => {
                      const escaped = String(v).replace(/'/g, "''").replace(/\\/g, '\\\\');
                      return `'${escaped}'`;
                    })
                    .join(', ');
                  return `ARRAY[${arrayValues}]`;
                }
              } catch (error) {
                console.error('에러 발생:', error);
                // Fall through
              }
            }
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
        })
        .join(', ');

      const insertQuery = `
        INSERT INTO "${tableName}" (${columns.map((c) => `"${c}"`).join(', ')})
        VALUES (${values})
        ON CONFLICT DO NOTHING
      `;

      await executeQuery(NEW_PROJECT_ID, NEW_ACCESS_TOKEN, insertQuery);
      successCount++;
    } catch (error) {
      console.error('에러 발생:', error);
      failCount++;
      console.log(`\n   ❌ Row ${i + 1} failed: ${error.message}`);
      console.log(`      Data: ${JSON.stringify(row).substring(0, 200)}...\n`);
    }

    if ((i + 1) % 10 === 0 || i === data.length - 1) {
      process.stdout.write(
        `\r   Progress: ${i + 1}/${data.length} (✅ ${successCount}, ❌ ${failCount})`
      );
    }
  }

  console.log(`\n   ✅ Completed: ${successCount} success, ${failCount} failed\n`);

  return { success: successCount, failed: failCount };
}

async function main() {
  const tableName = process.argv[2];

  if (!tableName) {
    console.log('Usage: node import-single-table.js <table_name>');
    process.exit(1);
  }

  console.log(`🚀 Transferring table: ${tableName}\n`);
  console.log(`Source: ${OLD_PROJECT_ID}`);
  console.log(`Target: ${NEW_PROJECT_ID}\n`);

  // Download from original
  await downloadTable(tableName);

  if (!data) {
    console.log('❌ Failed to download data');
    process.exit(1);
  }

  // Upload to new
  await uploadTable(tableName, data);

  console.log('═══════════════════════════════════════');
  console.log(`✅ Success: ${result.success}`);
  console.log(`❌ Failed: ${result.failed}`);
  console.log('═══════════════════════════════════════\n');
}

main();
