#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * Check if environment variables are loaded correctly
 */

require('dotenv').config({ path: '.env.local' });

console.log('\n📋 Environment Variables Check:\n');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY:',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? 'SET (' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...)'
    : 'NOT SET'
);
console.log(
  'SUPABASE_SERVICE_ROLE_KEY:',
  process.env.SUPABASE_SERVICE_ROLE_KEY
    ? 'SET (' + process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...)'
    : 'NOT SET'
);

// Check if it's the new project
if (
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('abroivxthindezdtdzmj')
) {
  console.log('\n✅ Using NEW Supabase project (abroivxthindezdtdzmj)\n');
} else if (
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('bpvfkkrlyrjkwgwmfrci')
) {
  console.log('\n❌ Still using OLD Supabase project (bpvfkkrlyrjkwgwmfrci)\n');
  console.log('Action needed: Update .env.local with new project credentials\n');
} else {
  console.log('\n⚠️  Cannot determine which Supabase project is configured\n');
}
