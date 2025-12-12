#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * Supabase 전체 데이터베이스 export 스크립트
 *
 * 이 스크립트는 다음을 export합니다:
 * 1. 모든 테이블의 데이터 (JSON 형식)
 * 2. 전체 스키마 (SQL 형식)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_PROJECT_ID = 'bpvfkkrlyrjkwgwmfrci';
const SUPABASE_ACCESS_TOKEN = 'sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f';
const OUTPUT_DIR = path.join(__dirname, '..', 'database-export');

// Output 디렉토리 생성
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${SUPABASE_PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
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
            reject(new Error(`Failed to parse response: ${e.message}`));
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

async function exportAllTables() {
  console.log('📋 Fetching table list...');

  // 1. 모든 public 테이블 목록 가져오기
  const tables = await executeQuery(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  console.log(`✅ Found ${tables.length} tables\n`);

  // 2. 각 테이블의 데이터 export
  for (const { table_name } of tables) {
    try {
      console.log(`📦 Exporting ${table_name}...`);

      // 테이블의 row 수 확인
      const countResult = await executeQuery(`SELECT COUNT(*) as count FROM "${table_name}"`);
      const rowCount = parseInt(countResult[0].count);

      if (rowCount === 0) {
        console.log(`   ⚠️  Empty table, skipping\n`);
        continue;
      }

      // 데이터 export
      await executeQuery(`SELECT * FROM "${table_name}"`);

      const outputPath = path.join(OUTPUT_DIR, `${table_name}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

      console.log(`   ✅ Exported ${rowCount} rows\n`);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }

  console.log('✅ All tables exported!\n');
}

async function exportSchema() {
  console.log('📋 Exporting complete schema...');

  try {
    // pg_dump 스타일의 전체 스키마 export
    const schema = await executeQuery(`
      SELECT
        'CREATE TABLE ' || table_name || E' (\n' ||
        string_agg(
          '  ' || column_name || ' ' ||
          CASE
            WHEN data_type = 'USER-DEFINED' THEN udt_name
            WHEN data_type = 'ARRAY' THEN udt_name
            ELSE data_type
          END ||
          CASE
            WHEN character_maximum_length IS NOT NULL
            THEN '(' || character_maximum_length || ')'
            ELSE ''
          END ||
          CASE
            WHEN is_nullable = 'NO' THEN ' NOT NULL'
            ELSE ''
          END ||
          CASE
            WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default
            ELSE ''
          END,
          E',\n'
        ) || E'\n);' as create_statement
      FROM information_schema.columns
      WHERE table_schema = 'public'
      GROUP BY table_name
      ORDER BY table_name
    `);

    const schemaSQL = schema.map(row => row.create_statement).join('\n\n');
    const outputPath = path.join(OUTPUT_DIR, 'full-schema.sql');
    fs.writeFileSync(outputPath, schemaSQL);

    console.log('✅ Schema exported to full-schema.sql\n');
  } catch (error) {
    console.error(`❌ Error exporting schema: ${error.message}\n`);
  }
}

async function exportForeignKeys() {
  console.log('📋 Exporting foreign keys...');

  try {
    const fks = await executeQuery(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `);

    const outputPath = path.join(OUTPUT_DIR, 'foreign-keys.json');
    fs.writeFileSync(outputPath, JSON.stringify(fks, null, 2));

    console.log(`✅ Exported ${fks.length} foreign keys\n`);
  } catch (error) {
    console.error(`❌ Error exporting foreign keys: ${error.message}\n`);
  }
}

async function main() {
  console.log('🚀 Starting Supabase database export...\n');
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  try {
    await exportAllTables();
    await exportSchema();
    await exportForeignKeys();

    console.log('✅ Export completed successfully!');
    console.log(`\n📁 Files saved to: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

main();
