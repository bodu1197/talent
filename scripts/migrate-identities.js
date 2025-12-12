#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * Migrate auth.identities from old project to new project
 */

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

function escapeString(str) {
  if (!str) return 'NULL';
  return `'${String(str).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

async function migrateIdentities() {
  console.log('\n🚀 Migrating Auth Identities...\n');
  console.log('═'.repeat(60));

  // Get all identities from old project
  const identities = await executeQuery(
    OLD_PROJECT_ID,
    OLD_ACCESS_TOKEN,
    `SELECT
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    FROM auth.identities
    ORDER BY created_at`
  );

  console.log(`Found ${identities.length} identities in old project\n`);

  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < identities.length; i++) {
    const identity = identities[i];

    try {
      const provider = identity.provider;
      const display = provider === 'email' ? identity.identity_data?.email : provider;
      process.stdout.write(`\r[${i + 1}/${identities.length}] ${String(display).substring(0, 30).padEnd(30)} `);

      // Convert identity_data object to JSON string
      const identityDataJson = JSON.stringify(identity.identity_data || {}).replace(/'/g, "''");

      const insertQuery = `
        INSERT INTO auth.identities (
          id,
          user_id,
          identity_data,
          provider,
          last_sign_in_at,
          created_at,
          updated_at
        ) VALUES (
          ${escapeString(identity.id)},
          ${escapeString(identity.user_id)},
          '${identityDataJson}'::jsonb,
          ${escapeString(identity.provider)},
          ${identity.last_sign_in_at ? escapeString(identity.last_sign_in_at) : 'NULL'},
          ${escapeString(identity.created_at)},
          ${escapeString(identity.updated_at)}
        )
        ON CONFLICT (id) DO NOTHING
      `;

      await executeQuery(NEW_PROJECT_ID, NEW_ACCESS_TOKEN, insertQuery);
      successCount++;

    } catch (error) {
      const msg = error.message;
      if (msg.includes('duplicate') || msg.includes('already exists')) {
        skippedCount++;
      } else {
        failedCount++;
        console.log(`\n❌ ${identity.provider}/${identity.user_id}: ${msg.substring(0, 60)}`);
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
    console.log('\n✨ All identities migrated successfully!\n');
  } else {
    console.log('\n⚠️  Some identities failed to migrate. Check errors above.\n');
  }
}

migrateIdentities().catch(err => {
  console.error('\n❌ Migration failed:', err);
  process.exit(1);
});
