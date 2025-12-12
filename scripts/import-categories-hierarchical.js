#!/usr/bin/env node

/**
 * Categories 테이블을 계층 구조 순서대로 import
 * Level NULL → Level 1 → Level 2 → Level 3 순서
 */

const https = require('https');

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
        'Authorization': `Bearer ${token}`,
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

async function getColumnTypes(tableName) {
  try {
    await executeQuery(NEW_PROJECT_ID, NEW_ACCESS_TOKEN, `
      SELECT column_name, udt_name, data_type
      FROM information_schema.columns
      WHERE table_name = '${tableName}'
      AND table_schema = 'public'
    `);

    const typeMap = {};
    result.forEach(col => {
      typeMap[col.column_name] = {
        udt_name: col.udt_name,
        data_type: col.data_type
      };
    });
    return typeMap;
  } catch (error) {
    console.error('에러 발생:', error);
    return {};
  }
}

async function importByLevel(level) {
  const levelText = level === null ? 'Level NULL (Root)' : `Level ${level}`;
  console.log(`\n📦 Importing categories (${levelText})...`);

  try {
    const query = level === null
      ? 'SELECT * FROM categories WHERE parent_id IS NULL ORDER BY name'
      : `SELECT * FROM categories WHERE level = ${level} ORDER BY name`;

    await executeQuery(OLD_PROJECT_ID, OLD_ACCESS_TOKEN, query);

    if (!data || data.length === 0) {
      console.log(`   ⚪ No data\n`);
      return { success: 0, failed: 0 };
    }

    console.log(`   📥 Downloaded ${data.length} rows`);

    const columnTypes = await getColumnTypes('categories');
    const columns = Object.keys(data[0]);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        const values = columns.map(col => {
          const value = row[col];
          const colType = columnTypes[col];

          if (value === null || value === undefined) {
            return 'NULL';
          }

          if (colType && colType.udt_name && colType.udt_name.startsWith('_')) {
            if (Array.isArray(value)) {
              if (value.length === 0) {
                return 'ARRAY[]::text[]';
              }
              const arrayValues = value.map(v => {
                const escaped = String(v).replace(/'/g, "''").replace(/\\/g, '\\\\');
                return `'${escaped}'`;
              }).join(', ');
              return `ARRAY[${arrayValues}]`;
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
        }).join(', ');

        const insertQuery = `
          INSERT INTO "categories" (${columns.map(c => `"${c}"`).join(', ')})
          VALUES (${values})
          ON CONFLICT (id) DO NOTHING
        `;

        await executeQuery(NEW_PROJECT_ID, NEW_ACCESS_TOKEN, insertQuery);
        successCount++;

      } catch (error) {
        console.error('에러 발생:', error);
        failCount++;
      }

      if ((i + 1) % 10 === 0 || i === data.length - 1) {
        process.stdout.write(`\r   Progress: ${i + 1}/${data.length} (✅ ${successCount}, ❌ ${failCount})`);
      }
    }

    console.log(`\n   ✅ Completed: ${successCount} success, ${failCount} failed\n`);

    return { success: successCount, failed: failCount };

  } catch (error) {
    console.log(`\n   ❌ Error: ${error.message}\n`);
    return { success: 0, failed: 0 };
  }
}

async function main() {
  console.log('🚀 Importing categories in hierarchical order...\n');
  console.log(`Source: ${OLD_PROJECT_ID}`);
  console.log(`Target: ${NEW_PROJECT_ID}`);

  let totalSuccess = 0;
  let totalFailed = 0;

  // Import in order: NULL → 1 → 2 → 3
  for (const level of [null, 1, 2, 3]) {
    await importByLevel(level);
    totalSuccess += result.success;
    totalFailed += result.failed;
  }

  console.log('═══════════════════════════════════════');
  console.log(`✅ Total Success: ${totalSuccess}`);
  console.log(`❌ Total Failed: ${totalFailed}`);
  console.log('═══════════════════════════════════════\n');

  // Verify final count
  try {
    await executeQuery(NEW_PROJECT_ID, NEW_ACCESS_TOKEN,
      'SELECT COUNT(*) as count FROM categories'
    );
    console.log(`📊 Final count in new DB: ${result[0].count} categories\n`);
  } catch (error) {
    console.error('에러 발생:', error);
    console.log(`⚠️  Could not verify count\n`);
  }
}

main();
