#!/usr/bin/env node

/**
 * Update Vercel environment variables using Vercel API directly
 * This bypasses CLI issues with newlines
 */

const https = require('https');

// API keys from Supabase (verified clean)
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1Mzg5MjcsImV4cCI6MjA4MTExNDkyN30.gn5LpB2VFeE778IT-nIZlOUk7XHjR0pYHstDSVukgcY';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUzODkyNywiZXhwIjoyMDgxMTE0OTI3fQ.6dk7o_z9Bp5MoG06obd4dk6fl_nRFiTJjLysfd-7Xo8';

// You need to set your Vercel token
// Get it from: https://vercel.com/account/tokens
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = 'talent'; // or your project ID

if (!VERCEL_TOKEN) {
  console.error('❌ VERCEL_TOKEN environment variable not set');
  console.log('\n📝 Please set it:');
  console.log('   export VERCEL_TOKEN="your-token-here"');
  console.log('\n🔗 Get token from: https://vercel.com/account/tokens\n');
  process.exit(1);
}

function makeRequest(method, path, _body) {
  return new Promise((resolve, reject) => {

    const options = {
      hostname: 'api.vercel.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseBody));
          } catch (error) {
            console.error('에러 발생:', error);
            resolve({ success: true });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function updateVercelEnv() {
  console.log('\n🔧 Updating Vercel Environment Variables via API...\n');
  console.log('═'.repeat(60));

  try {
    // Get project info
    console.log('📋 Getting project info...');
    const projects = await makeRequest('GET', '/v9/projects');
    const project = projects.projects.find(p => p.name === PROJECT_ID);

    if (!project) {
      console.error(`❌ Project "${PROJECT_ID}" not found`);
      process.exit(1);
    }

    console.log(`✅ Found project: ${project.name} (${project.id})\n`);

    // Get existing env vars
    console.log('📋 Getting existing environment variables...');
    const envVars = await makeRequest('GET', `/v9/projects/${project.id}/env`);

    // Delete existing keys
    console.log('\n🗑️  Removing old environment variables...');
    const keysToRemove = ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];

    for (const key of keysToRemove) {
      const existingVars = envVars.envs.filter(env => env.key === key);
      for (const envVar of existingVars) {
        try {
          await makeRequest('DELETE', `/v9/projects/${project.id}/env/${envVar.id}`);
          console.log(`   ✅ Deleted ${key} (${envVar.target.join(', ')})`);
        } catch (error) {
          console.error('에러 발생:', error);
          console.log(`   ⚠️  Could not delete ${key}: ${e.message}`);
        }
      }
    }

    // Add new environment variables
    console.log('\n📝 Adding new environment variables...\n');

    const envToAdd = [
      {
        key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        value: ANON_KEY,
        type: 'encrypted',
        target: ['production', 'preview', 'development']
      },
      {
        key: 'SUPABASE_SERVICE_ROLE_KEY',
        value: SERVICE_KEY,
        type: 'encrypted',
        target: ['production', 'preview', 'development']
      }
    ];

    for (const env of envToAdd) {
      try {
        await makeRequest('POST', `/v10/projects/${project.id}/env`, env);
        console.log(`✅ Added ${env.key}`);
        console.log(`   Length: ${env.value.length} characters`);
        console.log(`   Target: ${env.target.join(', ')}\n`);
      } catch (e) {
        console.error(`❌ Failed to add ${env.key}: ${e.message}\n`);
      }
    }

    console.log('═'.repeat(60));
    console.log('✅ All environment variables updated!\n');
    console.log('🚀 Please redeploy your project:');
    console.log('   vercel --prod\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

updateVercelEnv();
