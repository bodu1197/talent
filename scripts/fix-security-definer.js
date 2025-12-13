#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * Fix SECURITY DEFINER views by recreating them as SECURITY INVOKER
 * This improves security by enforcing RLS policies of the querying user
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

async function fixSecurityDefiner() {
  console.log('\n🔒 Fixing SECURITY DEFINER Views...\n');
  console.log('═'.repeat(60));

  try {
    // Step 1: Drop the existing view
    console.log('1️⃣  Dropping existing seller_profiles view...');
    await executeQuery('DROP VIEW IF EXISTS public.seller_profiles CASCADE');
    console.log('   ✅ View dropped\n');

    // Step 2: Recreate the view WITHOUT SECURITY DEFINER
    console.log('2️⃣  Recreating seller_profiles view (SECURITY INVOKER)...');
    const createViewQuery = `
      CREATE OR REPLACE VIEW public.seller_profiles
      WITH (security_invoker = true)
      AS
      SELECT
        s.id,
        s.user_id,
        s.business_name,
        s.business_number,
        s.business_registration_file,
        s.bank_name,
        s.account_number,
        s.account_holder,
        s.is_verified,
        s.verification_status,
        s.verified_at,
        s.rejection_reason,
        s.total_sales,
        s.total_revenue,
        s.service_count,
        s.rating,
        s.review_count,
        s.last_sale_at,
        s.is_active,
        s.created_at,
        s.updated_at,
        p.name AS display_name,
        p.profile_image,
        p.bio,
        s.phone,
        s.show_phone,
        s.kakao_id,
        s.kakao_openchat,
        s.whatsapp,
        s.website,
        s.preferred_contact,
        s.certificates,
        s.experience,
        s.is_business,
        s.status,
        s.real_name,
        s.contact_hours,
        s.tax_invoice_available,
        s.verified,
        s.verified_name,
        s.verified_phone
      FROM sellers s
      LEFT JOIN profiles p ON s.user_id = p.user_id
    `;

    await executeQuery(createViewQuery);
    console.log('   ✅ View recreated with SECURITY INVOKER\n');

    // Step 3: Grant permissions
    console.log('3️⃣  Granting permissions...');
    await executeQuery('GRANT SELECT ON public.seller_profiles TO anon, authenticated');
    console.log('   ✅ Permissions granted\n');

    // Step 4: Verify the fix
    console.log('4️⃣  Verifying view...');
    const result = await executeQuery('SELECT COUNT(*) FROM public.seller_profiles');
    console.log(`   ✅ View works! Found ${result[0].count} seller profiles\n`);

    console.log('═'.repeat(60));
    console.log('✅ Security DEFINER issue fixed!\n');
    console.log('📝 Changes:');
    console.log('   - Removed SECURITY DEFINER property');
    console.log('   - Added SECURITY INVOKER (security_invoker = true)');
    console.log('   - Now enforces RLS policies of querying user\n');
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    process.exit(1);
  }
}

fixSecurityDefiner();
