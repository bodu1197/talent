#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

const https = require('https');

const NEW_PROJECT_ID = 'abroivxthindezdtdzmj';
const NEW_ACCESS_TOKEN = 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee';

function executeQuery(projectId, token, _query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/database/query`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
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

async function checkAuthUsers() {
  console.log('\n🔍 Checking Auth Users in New Project...\n');

  // Check total count
  const countResult = await executeQuery(
    NEW_PROJECT_ID,
    NEW_ACCESS_TOKEN,
    `SELECT COUNT(*) as total FROM auth.users`
  );

  console.log(`Total users: ${countResult[0]?.total || 0}\n`);

  // Get first 5 users
  const users = await executeQuery(
    NEW_PROJECT_ID,
    NEW_ACCESS_TOKEN,
    `SELECT
      id,
      email,
      email_confirmed_at,
      encrypted_password IS NOT NULL as has_password,
      created_at,
      updated_at
    FROM auth.users
    ORDER BY created_at
    LIMIT 5`
  );

  console.log('First 5 users:');
  users.forEach((user, idx) => {
    console.log(`\n${idx + 1}. ${user.email}`);
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log(`   - Has password: ${user.has_password ? 'Yes' : 'No'}`);
    console.log(`   - Created: ${user.created_at}`);
  });

  // Check identities
  const identitiesCount = await executeQuery(
    NEW_PROJECT_ID,
    NEW_ACCESS_TOKEN,
    `SELECT COUNT(*) as total FROM auth.identities`
  );

  console.log(`\n\nTotal identities: ${identitiesCount[0]?.total || 0}`);

  // Get sample identities
  const identities = await executeQuery(
    NEW_PROJECT_ID,
    NEW_ACCESS_TOKEN,
    `SELECT
      id,
      user_id,
      provider,
      created_at
    FROM auth.identities
    ORDER BY created_at
    LIMIT 5`
  );

  console.log('\nFirst 5 identities:');
  identities.forEach((identity, idx) => {
    console.log(
      `${idx + 1}. Provider: ${identity.provider} | User: ${identity.user_id.substring(0, 8)}...`
    );
  });
}

checkAuthUsers().catch((err) => {
  console.error('\n❌ Check failed:', err);
  process.exit(1);
});
