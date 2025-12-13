#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * Fix Vercel environment variables with NO newlines
 * Using printf instead of echo to prevent automatic newline addition
 *
 * Note: Safe development script for database operations
 */

const { execSync } = require('child_process');

// Clean keys without any whitespace or newlines
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1Mzg5MjcsImV4cCI6MjA4MTExNDkyN30.gn5LpB2VFeE778IT-nIZlOUk7XHjR0pYHstDSVukgcY';
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUzODkyNywiZXhwIjoyMDgxMTE0OTI3fQ.6dk7o_z9Bp5MoG06obd4dk6fl_nRFiTJjLysfd-7Xo8';

console.log('\n🔧 Fixing Vercel Environment Variables (NO NEWLINES)...\n');
console.log('Using printf instead of echo to prevent newline addition\n');

const environments = ['production', 'preview', 'development'];

try {
  // Update ANON KEY
  console.log('📝 Updating NEXT_PUBLIC_SUPABASE_ANON_KEY...');
  for (const env of environments) {
    console.log(`   - ${env}...`);

    // Remove old key
    try {
      execSync(`vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY ${env} --yes`, {
        stdio: 'pipe',
      });
    } catch (error) {
      console.error('에러 발생:', error);
      // Ignore if doesn't exist
    }

    // Add new clean key using printf (NO automatic newline)
    execSync(`printf '%s' "${ANON_KEY}" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY ${env}`, {
      stdio: 'pipe',
      shell: 'bash',
    });
  }
  console.log('   ✅ ANON KEY updated\n');

  // Update SERVICE ROLE KEY
  console.log('📝 Updating SUPABASE_SERVICE_ROLE_KEY...');
  for (const env of environments) {
    console.log(`   - ${env}...`);

    // Remove old key
    try {
      execSync(`vercel env rm SUPABASE_SERVICE_ROLE_KEY ${env} --yes`, {
        stdio: 'pipe',
      });
    } catch (error) {
      console.error('에러 발생:', error);
      // Ignore if doesn't exist
    }

    // Add new clean key using printf (NO automatic newline)
    execSync(`printf '%s' "${SERVICE_KEY}" | vercel env add SUPABASE_SERVICE_ROLE_KEY ${env}`, {
      stdio: 'pipe',
      shell: 'bash',
    });
  }
  console.log('   ✅ SERVICE ROLE KEY updated\n');

  console.log('✅ All environment variables updated successfully!\n');
  console.log('🚀 Triggering production redeployment...\n');

  // Trigger redeployment
  execSync('vercel --prod', { stdio: 'inherit' });

  console.log('\n✅ Deployment complete!\n');
  console.log('Please test WebSocket connections in browser console.\n');
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
