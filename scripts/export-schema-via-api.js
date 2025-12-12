/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const _supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const _supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Known tables from the codebase (we'll extract their structure)
const knownTables = [
  'users',
  'sellers',
  'seller_categories',
  'favorites',
  'seller_additional_info',
  'reviews',
  'orders',
  'order_items',
  'withdrawals',
  'chats',
  'chat_messages'
];

async function exportSchema() {
  console.log('Exporting schema via Supabase API...\n');

  let schema = `-- Supabase Schema Export
-- Generated: ${new Date().toISOString()}
-- Project: bpvfkkrlyrjkwgwmfrci
-- Database: postgres

`;

  for (const tableName of knownTables) {
    try {
      console.log(`Fetching structure for table: ${tableName}`);

      // Get a sample row to understand the structure
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`  ⚠️  Could not fetch ${tableName}: ${error.message}`);
        schema += `\n-- Table: ${tableName} (Could not fetch: ${error.message})\n`;
        continue;
      }

      schema += `\n-- Table: ${tableName}\n`;

      if (data && data.length > 0) {
        const sampleRow = data[0];
        const columns = Object.keys(sampleRow);

        schema += `-- Columns detected from API response:\n`;
        columns.forEach(col => {
          const value = sampleRow[col];
          let type = 'unknown';

          if (value === null) {
            type = 'nullable';
          } else if (typeof value === 'string') {
            if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
              type = 'timestamp with time zone';
            } else if (value.length > 255) {
              type = 'text';
            } else {
              type = 'varchar';
            }
          } else if (typeof value === 'number') {
            if (Number.isInteger(value)) {
              type = 'integer or bigint';
            } else {
              type = 'numeric or double precision';
            }
          } else if (typeof value === 'boolean') {
            type = 'boolean';
          } else if (typeof value === 'object' && value !== null) {
            type = 'jsonb';
          }

          schema += `--   ${col}: ${type}\n`;
        });

        // Try to get count
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!countError && count !== null) {
          schema += `-- Row count: ${count}\n`;
        }
      } else {
        schema += `-- Table is empty\n`;
      }

      console.log(`  ✅ Exported ${tableName}`);

    } catch (error) {
      console.log(`  ❌ Error with ${tableName}:`, error.message);
      schema += `\n-- Table: ${tableName} (Error: ${error.message})\n`;
    }
  }

  // Save to file
  fs.writeFileSync('supabase_schema_export.sql', schema);
  console.log('\n✅ Schema export completed: supabase_schema_export.sql');
}

exportSchema();
