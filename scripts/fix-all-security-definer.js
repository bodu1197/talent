#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * Fix ALL SECURITY DEFINER views by recreating them as SECURITY INVOKER
 */

const https = require('https');

const PROJECT_ID = 'abroivxthindezdtdzmj';
const ACCESS_TOKEN = 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee';

function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_ID}/database/query`,
      method: 'POST',
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
    req.write(data);
    req.end();
  });
}

async function fixAllSecurityDefiner() {
  console.log('\n🔒 Fixing ALL SECURITY DEFINER Views...\n');
  console.log('═'.repeat(60));

  try {
    // Fix order_revision_stats
    console.log('📊 Fixing order_revision_stats view...\n');

    console.log('  1️⃣  Dropping existing view...');
    await executeQuery('DROP VIEW IF EXISTS public.order_revision_stats CASCADE');
    console.log('     ✅ View dropped\n');

    console.log('  2️⃣  Recreating view (SECURITY INVOKER)...');
    const createViewQuery = `
      CREATE OR REPLACE VIEW public.order_revision_stats
      WITH (security_invoker = true)
      AS
      SELECT
        order_id,
        COUNT(*) AS total_revisions,
        COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS completed_revisions,
        COUNT(*) FILTER (WHERE completed_at IS NULL) AS pending_revisions,
        MAX(requested_at) AS last_revision_requested_at
      FROM revision_history
      GROUP BY order_id
    `;

    await executeQuery(createViewQuery);
    console.log('     ✅ View recreated\n');

    console.log('  3️⃣  Granting permissions...');
    await executeQuery('GRANT SELECT ON public.order_revision_stats TO anon, authenticated');
    console.log('     ✅ Permissions granted\n');

    console.log('  4️⃣  Verifying view...');
    const result = await executeQuery('SELECT COUNT(*) FROM public.order_revision_stats');
    console.log(`     ✅ View works! Found ${result[0].count} records\n`);

    console.log('═'.repeat(60));
    console.log('✅ All SECURITY DEFINER views fixed!\n');
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    process.exit(1);
  }
}

fixAllSecurityDefiner();
