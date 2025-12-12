const fs = require('fs');
const https = require('https');

const _SUPABASE_URL = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

// Read the migration SQL
const migrationSQL = fs.readFileSync('combined_profile_migration.sql', 'utf8');

console.log('🚀 Applying profile unification migrations to Supabase...\n');
console.log('📄 Migration file: combined_profile_migration.sql');
console.log(`📊 SQL size: ${migrationSQL.length} characters\n`);

// Split into individual statements for better error reporting
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 10 && !s.match(/^--/));

console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

async function _executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });

    const options = {
      hostname: 'bpvfkkrlyrjkwgwmfrci.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Length': data.length,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: body });
        } else {
          reject({ success: false, error: body, status: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject({ success: false, error: error.message });
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('⚠️  Note: Supabase REST API may not support exec RPC.');
  console.log('If this fails, please use Supabase Dashboard SQL Editor:\n');
  console.log(`🔗 https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new\n`);
  console.log('='

.repeat(60));
  console.log('\n📋 COPY THIS SQL TO SUPABASE SQL EDITOR:\n');
  console.log('='.repeat(60));
  console.log(migrationSQL);
  console.log('='.repeat(60));
  console.log('\n✅ SQL is ready to copy!\n');
  console.log('Next steps:');
  console.log('1. Open: https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new');
  console.log('2. Copy the SQL above');
  console.log('3. Paste and click "Run"');
  console.log('4. Come back here and type "done" when complete\n');
}

main();
