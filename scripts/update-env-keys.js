#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

// Correct API keys from Supabase API
const correctAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1Mzg5MjcsImV4cCI6MjA4MTExNDkyN30.gn5LpB2VFeE778IT-nIZlOUk7XHjR0pYHstDSVukgcY';
const correctServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUzODkyNywiZXhwIjoyMDgxMTE0OTI3fQ.6dk7o_z9Bp5MoG06obd4dk6fl_nRFiTJjLysfd-7Xo8';

try {
  console.log('📝 Updating .env.local with correct API keys...\n');

  let content = fs.readFileSync(envPath, 'utf8');

  // Replace ANON key
  content = content.replace(
    /NEXT_PUBLIC_SUPABASE_ANON_KEY="[^"]+"/,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY="${correctAnonKey}"`
  );

  // Replace SERVICE_ROLE key
  content = content.replace(
    /SUPABASE_SERVICE_ROLE_KEY="[^"]+"/,
    `SUPABASE_SERVICE_ROLE_KEY="${correctServiceKey}"`
  );

  // Write back
  fs.writeFileSync(envPath, content, 'utf8');

  console.log('✅ Updated .env.local successfully!\n');
  console.log('New keys:');
  console.log(`  ANON: ${correctAnonKey.substring(0, 30)}...`);
  console.log(`  SERVICE: ${correctServiceKey.substring(0, 30)}...\n`);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
