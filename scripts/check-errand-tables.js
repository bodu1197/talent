#!/usr/bin/env node
/**
 * Check errand-related tables and their RLS policies
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const _supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const _supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('=== Checking errand tables ===\n');

  // 1. Check errands table
  console.log('1. errands table:');
  const { data: errands, error: errandsError } = await supabase
    .from('errands')
    .select('*')
    .limit(1);

  if (errandsError) {
    console.log('  Error:', errandsError.message);
  } else {
    console.log('  Table exists, columns:', errands[0] ? Object.keys(errands[0]) : 'no rows');
  }

  // 2. Check errand_applications table
  console.log('\n2. errand_applications table:');
  const { data: applications, error: appError } = await supabase
    .from('errand_applications')
    .select('*')
    .limit(1);

  if (appError) {
    console.log('  Error:', appError.message);
    console.log('  Full error:', JSON.stringify(appError, null, 2));
  } else {
    console.log('  Table exists, columns:', applications[0] ? Object.keys(applications[0]) : 'no rows');
  }

  // 3. Check helper_profiles table
  console.log('\n3. helper_profiles table:');
  const { data: helpers, error: helpersError } = await supabase
    .from('helper_profiles')
    .select('*')
    .limit(1);

  if (helpersError) {
    console.log('  Error:', helpersError.message);
  } else {
    console.log('  Table exists, columns:', helpers[0] ? Object.keys(helpers[0]) : 'no rows');
  }

  // 4. Try to INSERT into errand_applications using service key
  console.log('\n4. Testing INSERT into errand_applications (dry run):');

  // First get a valid errand_id and helper_id
  const { data: errandData } = await supabase
    .from('errands')
    .select('id')
    .eq('status', 'OPEN')
    .limit(1)
    .single();

  const { data: helperData } = await supabase
    .from('helper_profiles')
    .select('id')
    .limit(1)
    .single();

  if (errandData && helperData) {
    console.log('  Found errand:', errandData.id);
    console.log('  Found helper:', helperData.id);

    // Try to get errand_applications columns
    const { error: appColsError } = await supabase
      .from('errand_applications')
      .select()
      .limit(0);

    console.log('  errand_applications structure check - error:', appColsError?.message || 'OK');
  } else {
    console.log('  No errands or helpers found for testing');
  }

  // 5. Check if there are existing applications
  console.log('\n5. Counting errand_applications:');
  const { count, error: countError } = await supabase
    .from('errand_applications')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.log('  Error:', countError.message);
  } else {
    console.log('  Total applications:', count);
  }
}

main().catch(console.error);
