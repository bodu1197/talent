#!/usr/bin/env node

/**
 * Migrate auth.users from old project to new project
 * Uses Supabase Admin API to preserve password hashes
 */

const https = require('https');

const OLD_PROJECT_ID = 'bpvfkkrlyrjkwgwmfrci';
const OLD_ACCESS_TOKEN = 'sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f';

const NEW_PROJECT_REF = 'abroivxthindezdtdzmj';
const NEW_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUzODkyNywiZXhwIjoyMDgxMTE0OTI3fQ.6dk7o_z9Bp5MoG06obd4dk6fl_nRFiTJjLysfd-7Xo8';

function executeQuery(projectId, token, query) {
  return new Promise((resolve, reject) => {

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            console.error('에러 발생:', error);
            resolve({ success: true });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function createUser(projectRef, serviceKey, userData) {
  return new Promise((resolve, reject) => {

    const options = {
      hostname: `${projectRef}.supabase.co`,
      path: '/auth/v1/admin/users',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceKey
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            console.error('에러 발생:', error);
            resolve({ success: true });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function migrateUsers() {
  console.log('\n🚀 Migrating Auth Users...\n');
  console.log('═'.repeat(60));

  // Get all users from old project
  const users = await executeQuery(
    OLD_PROJECT_ID,
    OLD_ACCESS_TOKEN,
    `SELECT
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      phone,
      phone_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      banned_until,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      last_sign_in_at
    FROM auth.users
    ORDER BY created_at`
  );

  console.log(`Found ${users.length} users in old project\n`);

  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    try {
      process.stdout.write(`\r[${i + 1}/${users.length}] ${user.email.substring(0, 30).padEnd(30)} `);

      // Prepare user data for Admin API
      const _userData = {
        id: user.id,
        email: user.email,
        email_confirm: user.email_confirmed_at ? true : false,
        user_metadata: user.raw_user_meta_data || {},
        app_metadata: user.raw_app_meta_data || {},
        created_at: user.created_at
      };

      // Add phone if exists
      if (user.phone) {
        userData.phone = user.phone;
        userData.phone_confirm = user.phone_confirmed_at ? true : false;
      }

      // Add password hash if exists (email provider)
      if (user.encrypted_password) {
        userData.password = user.encrypted_password;
        userData.password_hash_algorithm = 'bcrypt';
      }

      await createUser(NEW_PROJECT_REF, NEW_SERVICE_KEY, userData);
      successCount++;

    } catch (error) {
      const msg = error.message;
      if (msg.includes('duplicate') || msg.includes('already exists') || msg.includes('User already registered')) {
        skippedCount++;
      } else {
        failedCount++;
        console.log(`\n❌ ${user.email}: ${msg.substring(0, 60)}`);
      }
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n\n' + '═'.repeat(60));
  console.log(`✅ Success: ${successCount}`);
  console.log(`⏭️  Skipped: ${skippedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log('═'.repeat(60));

  if (failedCount === 0) {
    console.log('\n✨ All users migrated successfully!\n');
  } else {
    console.log('\n⚠️  Some users failed to migrate. Check errors above.\n');
  }
}

migrateUsers().catch(err => {
  console.error('\n❌ Migration failed:', err);
  process.exit(1);
});
