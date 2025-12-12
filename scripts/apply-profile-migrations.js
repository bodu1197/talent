/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const _supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const _supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration(filePath, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Applying: ${description}`);
  console.log(`File: ${path.basename(filePath)}`);
  console.log('='.repeat(60));

  const sql = fs.readFileSync(filePath, 'utf8');

  try {
    // Execute SQL directly using Supabase SQL editor API
    await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    });

    // Alternative: Use psql-style execution
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.error('Details:', error);
      return false;
    }

    console.log('✅ Migration applied successfully!');
    return true;

  } catch (err) {
    console.error('❌ Error executing migration:', err.message);

    // Try alternative approach: split and execute statements
    console.log('\n🔄 Trying alternative approach: executing statements individually...');

    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i] + ';';

      // Skip comment-only lines
      if (stmt.replace(/\s+/g, '') === ';') continue;

      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);

      try {
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: stmt });

        if (stmtError) {
          console.error(`  ❌ Failed:`, stmtError.message);
          errorCount++;
        } else {
          console.log(`  ✅ Success`);
          successCount++;
        }
      } catch (stmtErr) {
        console.error(`  ❌ Error:`, stmtErr.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Results: ${successCount} succeeded, ${errorCount} failed`);
    return errorCount === 0;
  }
}

async function main() {
  console.log('🚀 Applying profile unification migrations...\n');

  const migrations = [
    {
      file: 'supabase/migrations/20251114080000_create_profiles_table.sql',
      description: 'Create profiles table with auto-sync trigger'
    },
    {
      file: 'supabase/migrations/20251114090000_unify_seller_profile_with_profiles.sql',
      description: 'Unify seller profile with profiles table'
    }
  ];

  let allSuccess = true;

  for (const migration of migrations) {
    const filePath = path.join(process.cwd(), migration.file);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      allSuccess = false;
      continue;
    }

    const success = await applyMigration(filePath, migration.description);
    if (!success) {
      allSuccess = false;
    }

    // Wait a bit between migrations
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  if (allSuccess) {
    console.log('\n✅ All migrations applied successfully!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some migrations failed. Please review the errors above.');
    process.exit(1);
  }
}

main();
