#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Fix old Supabase project URLs (abroivxthindezdtdzmj -> bpvfkkrlyrjkwgwmfrci)
 *
 * Safe development script for migrating to new Supabase project
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const OLD_PROJECT_ID = 'abroivxthindezdtdzmj';
const NEW_PROJECT_ID = 'bpvfkkrlyrjkwgwmfrci';

async function fixOldUrls() {
  console.log('🔍 Checking for old Supabase URLs...\n');

  // Step 1: Find affected records
  const { data: affectedProfiles, error: fetchError } = await supabase
    .from('profiles')
    .select('id, profile_image')
    .like('profile_image', `%${OLD_PROJECT_ID}%`);

  if (fetchError) {
    console.error('❌ Error fetching profiles:', fetchError);
    process.exit(1);
  }

  if (!affectedProfiles || affectedProfiles.length === 0) {
    console.log('✅ No old URLs found!');
    return;
  }

  console.log(`📋 Found ${affectedProfiles.length} profiles with old project URLs:\n`);

  affectedProfiles.forEach((profile, index) => {
    const fixedUrl = profile.profile_image.replace(OLD_PROJECT_ID, NEW_PROJECT_ID);
    console.log(`${index + 1}. ID: ${profile.id}`);
    console.log(`   Before: ${profile.profile_image}`);
    console.log(`   After:  ${fixedUrl}\n`);
  });

  // Step 2: Update records
  console.log('🔧 Updating records...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const profile of affectedProfiles) {
    const fixedUrl = profile.profile_image.replace(OLD_PROJECT_ID, NEW_PROJECT_ID);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_image: fixedUrl })
      .eq('id', profile.id);

    if (updateError) {
      console.error(`❌ Failed to update ${profile.id}:`, updateError);
      errorCount++;
    } else {
      console.log(`✅ Updated ${profile.id}`);
      successCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors:  ${errorCount}`);

  // Step 3: Verify
  const { data: remaining, error: verifyError } = await supabase
    .from('profiles')
    .select('id')
    .like('profile_image', `%${OLD_PROJECT_ID}%`);

  if (verifyError) {
    console.error('❌ Error verifying:', verifyError);
  } else {
    console.log(`\n🔍 Remaining old URLs: ${remaining?.length || 0}`);
  }
}

fixOldUrls()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
