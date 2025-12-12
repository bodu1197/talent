#!/usr/bin/env node

/**
 * 완전한 데이터베이스 스키마 export
 * pg_dump 스타일로 CREATE TABLE, CREATE INDEX 등 생성
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_PROJECT_ID = 'bpvfkkrlyrjkwgwmfrci';
const SUPABASE_ACCESS_TOKEN = 'sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f';
const OUTPUT_FILE = path.join(__dirname, '..', 'complete-schema.sql');

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const _data = JSON.stringify({ query });

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

async function main() {
  console.log('🚀 Exporting complete database schema...\n');

  let sqlOutput = `-- Dolpagu Complete Database Schema Export
-- Generated: ${new Date().toISOString()}
-- Source Project: bpvfkkrlyrjkwgwmfrci
--
-- This file contains the complete database schema including:
-- - Tables, Columns, Constraints
-- - Indexes
-- - Functions
-- - Triggers
-- - Views
-- - RLS Policies
--
-- Import order: Run this entire file in SQL Editor of new Supabase project

BEGIN;

`;

  try {
    // 1. Get all tables with full CREATE TABLE statements
    console.log('📋 Extracting table schemas...');

    const tables = await executeQuery(`
      SELECT
        c.relname as table_name,
        'CREATE TABLE ' || quote_ident(n.nspname) || '.' || quote_ident(c.relname) || E' (\n' ||
        string_agg(
          '  ' || quote_ident(a.attname) || ' ' ||
          pg_catalog.format_type(a.atttypid, a.atttypmod) ||
          CASE
            WHEN a.attnotnull THEN ' NOT NULL'
            ELSE ''
          END ||
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
            AND con.contype IN ('p', 'u', 'c')
          ),
          ''
        ) ||
        E'\n);' as create_statement
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
      LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
      GROUP BY n.nspname, c.relname, c.oid
      ORDER BY c.relname
    `);

    sqlOutput += `-- ============================================\n`;
    sqlOutput += `-- Tables\n`;
    sqlOutput += `-- ============================================\n\n`;

    for (const { table_name, create_statement } of tables) {
      sqlOutput += `${create_statement}\n\n`;
      console.log(`  ✅ ${table_name}`);
    }

    // 2. Foreign Keys (separate from table creation)
    console.log('\n📋 Extracting foreign keys...');

    const fks = await executeQuery(`
      SELECT
        'ALTER TABLE ' || quote_ident(tc.table_schema) || '.' || quote_ident(tc.table_name) ||
        ' ADD CONSTRAINT ' || quote_ident(tc.constraint_name) ||
        ' FOREIGN KEY (' || string_agg(quote_ident(kcu.column_name), ', ') || ')' ||
        ' REFERENCES ' || quote_ident(ccu.table_schema) || '.' || quote_ident(ccu.table_name) ||
        ' (' || (
          SELECT string_agg(quote_ident(column_name), ', ')
          FROM information_schema.key_column_usage
          WHERE constraint_name = tc.constraint_name
          AND table_schema = ccu.table_schema
          AND table_name = ccu.table_name
        ) || ')' ||
        CASE rc.delete_rule
          WHEN 'CASCADE' THEN ' ON DELETE CASCADE'
          WHEN 'SET NULL' THEN ' ON DELETE SET NULL'
          WHEN 'SET DEFAULT' THEN ' ON DELETE SET DEFAULT'
          ELSE ''
        END ||
        ';' as fk_statement
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
      GROUP BY tc.table_schema, tc.table_name, tc.constraint_name,
               ccu.table_schema, ccu.table_name, rc.delete_rule
      ORDER BY tc.table_name
    `);

    sqlOutput += `\n-- ============================================\n`;
    sqlOutput += `-- Foreign Keys\n`;
    sqlOutput += `-- ============================================\n\n`;

    for (const { fk_statement } of fks) {
      sqlOutput += `${fk_statement}\n`;
    }
    console.log(`  ✅ ${fks.length} foreign keys`);

    // 3. Indexes
    console.log('\n📋 Extracting indexes...');

    const indexes = await executeQuery(`
      SELECT indexdef || ';' as index_statement
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename, indexname
    `);

    sqlOutput += `\n-- ============================================\n`;
    sqlOutput += `-- Indexes\n`;
    sqlOutput += `-- ============================================\n\n`;

    for (const { index_statement } of indexes) {
      sqlOutput += `${index_statement}\n`;
    }
    console.log(`  ✅ ${indexes.length} indexes`);

    // 4. Functions
    console.log('\n📋 Extracting functions...');

    const functions = await executeQuery(`
      SELECT pg_get_functiondef(p.oid) || ';' as function_def
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.prokind = 'f'
      ORDER BY p.proname
    `);

    sqlOutput += `\n-- ============================================\n`;
    sqlOutput += `-- Functions\n`;
    sqlOutput += `-- ============================================\n\n`;

    for (const { function_def } of functions) {
      sqlOutput += `${function_def}\n\n`;
    }
    console.log(`  ✅ ${functions.length} functions`);

    // 5. Triggers
    console.log('\n📋 Extracting triggers...');

    const triggers = await executeQuery(`
      SELECT
        'CREATE TRIGGER ' || quote_ident(t.tgname) ||
        ' ' || CASE WHEN t.tgtype & 2 = 2 THEN 'BEFORE' ELSE 'AFTER' END ||
        ' ' || CASE
          WHEN t.tgtype & 4 = 4 THEN 'INSERT'
          WHEN t.tgtype & 8 = 8 THEN 'DELETE'
          WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
        END ||
        ' ON ' || quote_ident(c.relname) ||
        ' FOR EACH ' || CASE WHEN t.tgtype & 1 = 1 THEN 'ROW' ELSE 'STATEMENT' END ||
        ' EXECUTE FUNCTION ' || p.proname || '();' as trigger_statement
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_proc p ON t.tgfoid = p.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public'
        AND NOT t.tgisinternal
      ORDER BY c.relname, t.tgname
    `);

    sqlOutput += `\n-- ============================================\n`;
    sqlOutput += `-- Triggers\n`;
    sqlOutput += `-- ============================================\n\n`;

    for (const { trigger_statement } of triggers) {
      sqlOutput += `${trigger_statement}\n`;
    }
    console.log(`  ✅ ${triggers.length} triggers`);

    // 6. Enable RLS on tables
    console.log('\n📋 Enabling RLS...');

    const rlsTables = await executeQuery(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    sqlOutput += `\n-- ============================================\n`;
    sqlOutput += `-- Enable Row Level Security\n`;
    sqlOutput += `-- ============================================\n\n`;

    for (const { tablename } of rlsTables) {
      sqlOutput += `ALTER TABLE ${tablename} ENABLE ROW LEVEL SECURITY;\n`;
    }
    console.log(`  ✅ RLS enabled for ${rlsTables.length} tables`);

    // 7. RLS Policies
    console.log('\n📋 Extracting RLS policies...');

    const policies = await executeQuery(`
      SELECT
        'CREATE POLICY ' || quote_ident(policyname) ||
        ' ON ' || quote_ident(tablename) ||
        CASE WHEN cmd IS NOT NULL THEN ' FOR ' || cmd ELSE '' END ||
        CASE WHEN permissive = 'PERMISSIVE' THEN ' TO public' ELSE '' END ||
        CASE WHEN qual IS NOT NULL THEN ' USING (' || qual || ')' ELSE '' END ||
        CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check || ')' ELSE '' END ||
        ';' as policy_statement
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `);

    sqlOutput += `\n-- ============================================\n`;
    sqlOutput += `-- RLS Policies\n`;
    sqlOutput += `-- ============================================\n\n`;

    for (const { policy_statement } of policies) {
      sqlOutput += `${policy_statement}\n`;
    }
    console.log(`  ✅ ${policies.length} RLS policies`);

    sqlOutput += `\nCOMMIT;\n`;

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, sqlOutput);

    console.log(`\n✅ Complete schema exported to: ${OUTPUT_FILE}`);
    console.log(`\n📝 To import:`);
    console.log(`   1. Copy the contents of complete-schema.sql`);
    console.log(`   2. Paste into SQL Editor of new Supabase project`);
    console.log(`   3. Click "Run"`);

  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

main();
