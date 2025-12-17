#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Fix duplicate 'profiles/profiles/' paths in profile_image URLs
 *
 * Safe development script for fixing storage path duplications
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

async function fixDuplicatePaths() {
  console.log('🔍 Checking for duplicate profile paths...\n');

  // Step 1: Find affected records
  const { data: affectedProfiles, error: fetchError } = await supabase
    .from('profiles')
    .select('id, profile_image')
    .like('profile_image', '%/profiles/profiles/%');

  if (fetchError) {
    console.error('❌ Error fetching profiles:', fetchError);
    process.exit(1);
  }

  if (!affectedProfiles || affectedProfiles.length === 0) {
    console.log('✅ No duplicate paths found!');
    return;
  }

  console.log(`📋 Found ${affectedProfiles.length} profiles with duplicate paths:\n`);

  affectedProfiles.forEach((profile, index) => {
    const fixedUrl = profile.profile_image.replace('/profiles/profiles/', '/profiles/');
    console.log(`${index + 1}. ID: ${profile.id}`);
    console.log(`   Before: ${profile.profile_image}`);
    console.log(`   After:  ${fixedUrl}\n`);
  });

  // Step 2: Update records
  console.log('🔧 Updating records...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const profile of affectedProfiles) {
    const fixedUrl = profile.profile_image.replace('/profiles/profiles/', '/profiles/');

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
    .like('profile_image', '%/profiles/profiles/%');

  if (verifyError) {
    console.error('❌ Error verifying:', verifyError);
  } else {
    console.log(`\n🔍 Remaining duplicates: ${remaining?.length || 0}`);
  }
}

fixDuplicatePaths()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
