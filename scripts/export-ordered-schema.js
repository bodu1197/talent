#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * 올바른 순서로 데이터베이스 스키마 export
 * 1. Extensions
 * 2. Enums
 * 3. Tables
 * 4. Foreign Keys
 * 5. Indexes
 * 6. Functions
 * 7. Triggers
 * 8. Views
 * 9. RLS Enable
 * 10. RLS Policies
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_PROJECT_ID = 'bpvfkkrlyrjkwgwmfrci';
const SUPABASE_ACCESS_TOKEN = 'sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f';
const OUTPUT_DIR = path.join(__dirname, '..', 'schema-parts');

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
        Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
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

async function main() {
  console.log('🚀 Exporting ordered database schema...\n');

  try {
    // 1. Enums
    console.log('📋 1/10 Exporting enum types...');
    const enums = await executeQuery(`
      SELECT
        'CREATE TYPE ' || t.typname || ' AS ENUM (' ||
        string_agg('''' || e.enumlabel || '''', ', ' ORDER BY e.enumsortorder) ||
        ');' as enum_def
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname
    `);

    let sql1 = `-- 1. Enum Types\n\n`;
    for (const { enum_def } of enums) {
      sql1 += `${enum_def}\n`;
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, '01_enums.sql'), sql1);
    console.log(`   ✅ ${enums.length} enums\n`);

    // 2. Tables (without foreign keys)
    console.log('📋 2/10 Exporting tables...');
    const tables = await executeQuery(`
      SELECT
        'CREATE TABLE ' || quote_ident(c.relname) || E' (\n' ||
        string_agg(
          '  ' || quote_ident(a.attname) || ' ' ||
          pg_catalog.format_type(a.atttypid, a.atttypmod) ||
          CASE WHEN a.attnotnull THEN ' NOT NULL' ELSE '' END ||
          CASE
            WHEN pg_get_expr(d.adbin, d.adrelid) IS NOT NULL
            THEN ' DEFAULT ' || pg_get_expr(d.adbin, d.adrelid)
            ELSE ''
          END,
          E',\n'
          ORDER BY a.attnum
        ) ||
        COALESCE(
          E',\n' || (
            SELECT string_agg(
              '  ' || pg_get_constraintdef(con.oid),
              E',\n'
            )
            FROM pg_constraint con
            WHERE con.conrelid = c.oid
            AND con.contype IN ('p', 'u', 'c')  -- Primary, Unique, Check (no Foreign)
          ),
          ''
        ) ||
        E'\n);' as create_statement,
        c.relname as table_name
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
      LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
      GROUP BY c.relname, c.oid
      ORDER BY c.relname
    `);

    let sql2 = `-- 2. Tables (without foreign keys)\n\n`;
    for (const { create_statement } of tables) {
      sql2 += `${create_statement}\n\n`;
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, '02_tables.sql'), sql2);
    console.log(`   ✅ ${tables.length} tables\n`);

    // 3. Foreign Keys
    console.log('📋 3/10 Exporting foreign keys...');
    const fks = await executeQuery(`
      SELECT
        'ALTER TABLE ' || quote_ident(tc.table_name) ||
        ' ADD CONSTRAINT ' || quote_ident(tc.constraint_name) ||
        ' FOREIGN KEY (' || kcu.column_name || ')' ||
        ' REFERENCES ' || quote_ident(ccu.table_name) ||
        ' (' || ccu.column_name || ')' ||
        CASE rc.delete_rule
          WHEN 'CASCADE' THEN ' ON DELETE CASCADE'
          WHEN 'SET NULL' THEN ' ON DELETE SET NULL'
          WHEN 'SET DEFAULT' THEN ' ON DELETE SET DEFAULT'
          ELSE ''
        END ||
        ';' as fk_statement,
        tc.table_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = tc.constraint_name
        AND rc.constraint_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `);

    let sql3 = `-- 3. Foreign Keys\n\n`;
    for (const { fk_statement } of fks) {
      sql3 += `${fk_statement}\n`;
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, '03_foreign_keys.sql'), sql3);
    console.log(`   ✅ ${fks.length} foreign keys\n`);

    // 4. Indexes
    console.log('📋 4/10 Exporting indexes...');
    const indexes = await executeQuery(`
      SELECT indexdef || ';' as index_statement
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename, indexname
    `);

    let sql4 = `-- 4. Indexes\n\n`;
    for (const { index_statement } of indexes) {
      sql4 += `${index_statement}\n`;
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, '04_indexes.sql'), sql4);
    console.log(`   ✅ ${indexes.length} indexes\n`);

    // 5. Functions
    console.log('📋 5/10 Exporting functions...');
    const functions = await executeQuery(`
      SELECT pg_get_functiondef(p.oid) || ';' as function_def
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.prokind = 'f'
      ORDER BY p.proname
    `);

    let sql5 = `-- 5. Functions\n\n`;
    for (const { function_def } of functions) {
      sql5 += `${function_def}\n\n`;
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, '05_functions.sql'), sql5);
    console.log(`   ✅ ${functions.length} functions\n`);

    // 6. Triggers
    console.log('📋 6/10 Exporting triggers...');
    const triggers = await executeQuery(`
      SELECT
        pg_get_triggerdef(t.oid) || ';' as trigger_def
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public'
        AND NOT t.tgisinternal
      ORDER BY c.relname, t.tgname
    `);

    let sql6 = `-- 6. Triggers\n\n`;
    for (const { trigger_def } of triggers) {
      sql6 += `${trigger_def}\n`;
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, '06_triggers.sql'), sql6);
    console.log(`   ✅ ${triggers.length} triggers\n`);

    // 7. Views
    console.log('📋 7/10 Exporting views...');
    const views = await executeQuery(`
      SELECT
        'CREATE OR REPLACE VIEW ' || table_name || ' AS ' ||
        view_definition || ';' as view_def
      FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    let sql7 = `-- 7. Views\n\n`;
    for (const { view_def } of views) {
      sql7 += `${view_def}\n\n`;
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, '07_views.sql'), sql7);
    console.log(`   ✅ ${views.length} views\n`);

    // 8. Enable RLS
    console.log('📋 8/10 Enabling RLS...');
    const rlsTables = await executeQuery(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    let sql8 = `-- 8. Enable Row Level Security\n\n`;
    for (const { tablename } of rlsTables) {
      sql8 += `ALTER TABLE ${tablename} ENABLE ROW LEVEL SECURITY;\n`;
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, '08_enable_rls.sql'), sql8);
    console.log(`   ✅ ${rlsTables.length} tables\n`);

    // 9. RLS Policies
    console.log('📋 9/10 Exporting RLS policies...');
    const policies = await executeQuery(`
      SELECT
        'CREATE POLICY ' || quote_ident(policyname) ||
        ' ON ' || quote_ident(tablename) ||
        CASE WHEN cmd IS NOT NULL THEN ' FOR ' || cmd ELSE '' END ||
        ' TO public' ||
        CASE WHEN qual IS NOT NULL THEN ' USING (' || qual || ')' ELSE '' END ||
        CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check || ')' ELSE '' END ||
        ';' as policy_statement
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `);

    let sql9 = `-- 9. RLS Policies\n\n`;
    for (const { policy_statement } of policies) {
      sql9 += `${policy_statement}\n`;
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, '09_rls_policies.sql'), sql9);
    console.log(`   ✅ ${policies.length} policies\n`);

    // 10. Create import guide
    console.log('📋 10/10 Creating import script...');
    const importScript = `#!/usr/bin/env node

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

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

    const options = {
      hostname: 'api.supabase.com',
      path: \`/v1/projects/\${NEW_PROJECT_ID}/database/query\`,
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${NEW_ACCESS_TOKEN}\`,
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
          reject(new Error(\`HTTP \${res.statusCode}: \${body}\`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🚀 Importing schema to new Supabase project...\\n');
  console.log(\`Project ID: \${NEW_PROJECT_ID}\\n\`);

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
      console.log(\`⚠️  \${file} not found, skipping...\\n\`);
      continue;
    }

    console.log(\`📦 Applying \${file}...\`);

    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      await executeQuery(sql);
      console.log(\`   ✅ Success\\n\`);

      // Delay between files
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(\`   ❌ Error: \${error.message}\\n\`);
      console.log('⚠️  Continuing with next file...\\n');
    }
  }

  console.log('✅ Schema import completed!\\n');
}

main();
`;

    fs.writeFileSync(path.join(__dirname, 'import-ordered-schema.js'), importScript);
    console.log('   ✅ Import script created\n');

    console.log('✅ All schema parts exported!\n');
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    console.log('\n📝 To import:');
    console.log('   node scripts/import-ordered-schema.js [PROJECT_ID] [ACCESS_TOKEN]');
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

main();
