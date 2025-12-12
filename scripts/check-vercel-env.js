#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

const fs = require('fs');

console.log('\n🔍 Checking Vercel environment variables...\n');

try {
  const content = fs.readFileSync('.env.vercel.local', 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    if (line.includes('SUPABASE_ANON_KEY') || line.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('='); // In case value contains =

      console.log(`Line ${idx + 1}: ${key}`);
      console.log(`  Value length: ${value ? value.length : 0}`);
      console.log(`  Has \\n: ${value ? value.includes('\n') : false}`);
      console.log(`  Has \\r: ${value ? value.includes('\r') : false}`);
      console.log(`  Has \\r\\n: ${value ? value.includes('\r\n') : false}`);
      console.log(`  First 40 chars: ${value ? value.substring(0, 40) : ''}`);
      console.log(`  Last 40 chars: ${value ? value.substring(Math.max(0, value.length - 40)) : ''}`);
      console.log(`  Hex of last 10 bytes: ${value ? Buffer.from(value.substring(Math.max(0, value.length - 10))).toString('hex') : ''}`);
      console.log();
    }
  });

  console.log('✅ Check complete\n');

} catch (error) {
  console.error('❌ Error reading .env.vercel.local:', error.message);
  process.exit(1);
}
