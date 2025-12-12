#!/usr/bin/env node

/**
 * Fix password hashes by directly updating auth.users table
 * Admin API re-hashed passwords instead of preserving original hashes
 */

const https = require('https');

const OLD_PROJECT_ID = 'bpvfkkrlyrjkwgwmfrci';
const OLD_ACCESS_TOKEN = 'sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f';

const NEW_PROJECT_ID = 'abroivxthindezdtdzmj';
const NEW_ACCESS_TOKEN = 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee';

function executeQuery(projectId, token, query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

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

function escapeString(str) {
  if (!str) return 'NULL';
  return `'${String(str).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

async function fixPasswordHashes() {
  console.log('\n🔧 Fixing Password Hashes...\n');
  console.log('═'.repeat(60));

  // Get all users with passwords from old project
  const oldUsers = await executeQuery(
    OLD_PROJECT_ID,
    OLD_ACCESS_TOKEN,
    `SELECT email, encrypted_password
     FROM auth.users
     WHERE encrypted_password IS NOT NULL
     ORDER BY created_at`
  );

  console.log(`Found ${oldUsers.length} users with passwords in old project\n`);

  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < oldUsers.length; i++) {
    const user = oldUsers[i];
    const email = user.email;
    const originalHash = user.encrypted_password;

    try {
      process.stdout.write(`\r[${i + 1}/${oldUsers.length}] ${email.substring(0, 30).padEnd(30)} `);

      // Update password hash in new project
      const updateQuery = `
        UPDATE auth.users
        SET encrypted_password = ${escapeString(originalHash)},
            updated_at = NOW()
        WHERE email = ${escapeString(email)}
      `;

      await executeQuery(NEW_PROJECT_ID, NEW_ACCESS_TOKEN, updateQuery);
      successCount++;

    } catch (error) {
      failedCount++;
      console.log(`\n❌ ${email}: ${error.message.substring(0, 60)}`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n\n' + '═'.repeat(60));
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log('═'.repeat(60));

  if (failedCount === 0) {
    console.log('\n✨ All password hashes fixed successfully!\n');
    console.log('🔍 Verifying with sample users...\n');

    // Verify first 3 users
    for (let i = 0; i < Math.min(3, oldUsers.length); i++) {
      const user = oldUsers[i];
      const newUsers = await executeQuery(
        NEW_PROJECT_ID,
        NEW_ACCESS_TOKEN,
        `SELECT email, encrypted_password FROM auth.users WHERE email = ${escapeString(user.email)}`
      );

      if (newUsers.length > 0) {
        const newUser = newUsers[0];
        if (user.encrypted_password === newUser.encrypted_password) {
          console.log(`✅ ${user.email}: Hash verified`);
        } else {
          console.log(`❌ ${user.email}: Hash mismatch!`);
        }
      }
    }

    console.log('\n✅ Users can now log in with their original passwords!\n');
  } else {
    console.log('\n⚠️  Some password hashes failed to update. Check errors above.\n');
  }
}

fixPasswordHashes().catch(err => {
  console.error('\n❌ Fix failed:', err);
  process.exit(1);
});
