#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

console.log('\n🔍 Checking .env.local for newlines in API keys...\n');

try {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');

  let hasIssue = false;

  lines.forEach((line, idx) => {
    if (line.includes('SUPABASE_ANON_KEY') || line.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      const [key, value] = line.split('=');

      if (value) {
        // Remove quotes if present
        const cleanValue = value.replace(/(^["'])|(["']$)/g, '');

        // Check for newlines or other whitespace
        if (cleanValue.includes('\n') || cleanValue.includes('\r')) {
          console.log(`❌ Line ${idx + 1}: ${key} contains newline characters!`);
          hasIssue = true;
        } else if (cleanValue !== cleanValue.trim()) {
          console.log(`⚠️  Line ${idx + 1}: ${key} has leading/trailing whitespace`);
          hasIssue = true;
        } else {
          console.log(`✅ Line ${idx + 1}: ${key} looks good`);
        }

        // Show first/last 20 chars
        console.log(
          `   Value: ${cleanValue.substring(0, 20)}...${cleanValue.substring(cleanValue.length - 20)}`
        );
        console.log(`   Length: ${cleanValue.length} characters\n`);
      }
    }
  });

  if (!hasIssue) {
    console.log('✅ No issues found in .env.local\n');
  } else {
    console.log('❌ Issues found! API keys need to be fixed.\n');
  }
} catch (error) {
  console.error('❌ Error reading .env.local:', error.message);
  process.exit(1);
}
