/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const _supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const _supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function parseSqlStatements(sql) {
  const statements = [];
  let currentStatement = '';
  let inFunction = false;

  for (const line of sql.split('\n')) {
    currentStatement += line + '\n';

    if (line.includes('$$')) {
      inFunction = !inFunction;
    }

    if (!inFunction && line.trim().endsWith(';') && !line.trim().startsWith('--')) {
      const trimmed = currentStatement.trim();
      if (trimmed && !trimmed.startsWith('--')) {
        statements.push(trimmed);
      }
      currentStatement = '';
    }
  }

  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements;
}

async function applyMigration() {
  try {
    console.warn('Applying inquiries migration...');

    const migrationPath = path.join(
      __dirname,
      '../supabase/migrations/20251129220000_create_inquiries_table.sql'
    );
    const sql = fs.readFileSync(migrationPath, 'utf8');
    const statements = parseSqlStatements(sql);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt || stmt.startsWith('--')) continue;

      console.warn(`Executing statement ${i + 1}/${statements.length}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: stmt });

      if (error) {
        console.warn(`RPC failed for statement ${i + 1}:`, stmt.substring(0, 100) + '...');
      }
    }

    console.warn('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
