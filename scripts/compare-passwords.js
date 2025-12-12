#!/usr/bin/env node

const https = require('https');

const OLD_PROJECT_ID = 'bpvfkkrlyrjkwgwmfrci';
const OLD_ACCESS_TOKEN = 'sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f';

const NEW_PROJECT_ID = 'abroivxthindezdtdzmj';
const NEW_ACCESS_TOKEN = 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee';

function executeQuery(projectId, token, _query) {
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

async function comparePasswords() {
  console.log('\n🔍 Comparing Password Hashes...\n');

  // Get first 3 users from OLD project
  const oldUsers = await executeQuery(
    OLD_PROJECT_ID,
    OLD_ACCESS_TOKEN,
    `SELECT id, email, encrypted_password FROM auth.users ORDER BY created_at LIMIT 3`
  );

  console.log('Checking 3 sample users:\n');

  for (const oldUser of oldUsers) {
    console.log(`\n📧 ${oldUser.email}`);
    console.log(`   Old ID: ${oldUser.id}`);

    // Get same user from NEW project
    const newUsers = await executeQuery(
      NEW_PROJECT_ID,
      NEW_ACCESS_TOKEN,
      `SELECT id, email, encrypted_password FROM auth.users WHERE email = '${oldUser.email}'`
    );

    if (newUsers.length === 0) {
      console.log('   ❌ User not found in new project!');
      continue;
    }

    const newUser = newUsers[0];
    console.log(`   New ID: ${newUser.id}`);

    // Compare password hashes
    const oldHash = oldUser.encrypted_password || '';
    const newHash = newUser.encrypted_password || '';

    console.log(`\n   Old hash: ${oldHash.substring(0, 60)}...`);
    console.log(`   New hash: ${newHash.substring(0, 60)}...`);

    if (oldHash === newHash) {
      console.log('   ✅ Hashes MATCH');
    } else {
      console.log('   ❌ Hashes DO NOT MATCH');
      console.log('   🔍 This means Admin API re-hashed the password instead of using the original hash!');
    }

    // Check hash format
    if (oldHash.startsWith('$2a$') || oldHash.startsWith('$2b$') || oldHash.startsWith('$2y$')) {
      console.log('   ✅ Old hash is valid bcrypt format');
    } else {
      console.log('   ❌ Old hash is NOT valid bcrypt format');
    }

    if (newHash.startsWith('$2a$') || newHash.startsWith('$2b$') || newHash.startsWith('$2y$')) {
      console.log('   ✅ New hash is valid bcrypt format');
    } else {
      console.log('   ❌ New hash is NOT valid bcrypt format');
    }
  }

  console.log('\n');
}

comparePasswords().catch(err => {
  console.error('\n❌ Comparison failed:', err);
  process.exit(1);
});
