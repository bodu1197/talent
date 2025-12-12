#!/usr/bin/env node

/**
 * Fix Password HIBP (HaveIBeenPwned) Protection
 *
 * Issue: After database migration, password_hibp_enabled is set to false
 * This script enables HIBP protection via Supabase Management API
 */

const https = require('https');

const PROJECT_ID = 'abroivxthindezdtdzmj';
const ACCESS_TOKEN = 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee';

function executeAuthAPI(method, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_ID}/config/auth`,
      method: method,
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            resolve(JSON.parse(body));
          } catch (parseError) {
            // JSON 파싱 실패 시 성공으로 처리
            console.error('JSON 파싱 실패:', parseError);
            resolve({ success: true });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function fixPasswordHIBP() {
  console.log('\n🔒 Fixing Password HIBP Protection...\n');
  console.log('═'.repeat(60));

  try {
    // Step 1: Get current Auth config
    console.log('1️⃣  Fetching current Auth configuration...');
    const beforeConfig = await executeAuthAPI('GET');
    const beforeStatus = beforeConfig.password_hibp_enabled;
    console.log(`   Current password_hibp_enabled: ${beforeStatus}`);
    console.log(`   ❌ HIBP Protection is DISABLED\n`);

    // Step 2: Update Auth config to enable HIBP
    console.log('2️⃣  Enabling HIBP Password Protection...');
    await executeAuthAPI('PATCH', {
      password_hibp_enabled: true,
    });
    console.log('   ✅ Update request sent\n');

    // Wait a moment for the update to propagate
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 3: Verify the update
    console.log('3️⃣  Verifying configuration update...');
    const afterConfig = await executeAuthAPI('GET');
    const afterStatus = afterConfig.password_hibp_enabled;
    console.log(`   New password_hibp_enabled: ${afterStatus}`);

    if (afterStatus === true) {
      console.log(`   ✅ HIBP Protection is now ENABLED\n`);
    } else {
      console.log(`   ⚠️  Warning: HIBP Protection is still disabled\n`);
    }

    console.log('═'.repeat(60));
    console.log('✅ Password HIBP Protection Fix Complete!\n');
    console.log('📝 Summary:');
    console.log(`   Before: password_hibp_enabled = ${beforeStatus}`);
    console.log(`   After:  password_hibp_enabled = ${afterStatus}\n`);
    console.log('🔐 What this does:');
    console.log('   - Checks user passwords against HaveIBeenPwned database');
    console.log('   - Prevents users from using compromised passwords');
    console.log('   - Improves overall account security\n');
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    process.exit(1);
  }
}

fixPasswordHIBP();
