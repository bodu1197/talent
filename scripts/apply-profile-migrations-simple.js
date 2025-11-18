const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

console.log(`
============================================================
MANUAL MIGRATION INSTRUCTIONS
============================================================

Please follow these steps to apply the migrations:

1. Go to: https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new

2. Copy and paste the SQL from these files:

   File 1: supabase/migrations/20251114080000_create_profiles_table.sql
   File 2: supabase/migrations/20251114090000_unify_seller_profile_with_profiles.sql

3. Execute each migration in order

============================================================
OR use this combined SQL:
============================================================
`);

const migration1 = fs.readFileSync(
  path.join(process.cwd(), 'supabase/migrations/20251114080000_create_profiles_table.sql'),
  'utf8'
);

const migration2 = fs.readFileSync(
  path.join(process.cwd(), 'supabase/migrations/20251114090000_unify_seller_profile_with_profiles.sql'),
  'utf8'
);

const combinedSQL = `
-- ============================================
-- COMBINED MIGRATION
-- Profile Unification
-- ============================================

${migration1}

${migration2}
`;

// Save combined SQL
const outputPath = path.join(process.cwd(), 'combined_profile_migration.sql');
fs.writeFileSync(outputPath, combinedSQL);

console.log(`\n✅ Combined SQL saved to: combined_profile_migration.sql`);
console.log(`\nYou can now:`);
console.log(`1. Open the file and copy its contents`);
console.log(`2. Go to Supabase SQL Editor`);
console.log(`3. Paste and run\n`);

// Also print the SQL for direct copy-paste
console.log(`\n${'='.repeat(60)}`);
console.log('COPY THIS SQL AND RUN IN SUPABASE SQL EDITOR:');
console.log('='.repeat(60));
console.log(combinedSQL);
console.log('='.repeat(60));
