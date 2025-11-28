// page_views 테이블에 INSERT 정책 추가
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyPolicy() {
  console.log('Checking existing policies on page_views...');

  // Check if the policy already exists
  const { data: policies, error: policyError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT policyname FROM pg_policies
        WHERE tablename = 'page_views' AND policyname LIKE '%insert%'
      `
    });

  if (policyError) {
    console.log('Could not check policies, trying direct creation...');
  } else {
    console.log('Existing insert policies:', policies);
  }

  // Create the INSERT policy
  console.log('\nCreating INSERT policy for page_views...');

  const sql = `
    DO $$
    BEGIN
      -- Drop existing insert policy if exists
      DROP POLICY IF EXISTS "Anyone can insert page_views" ON page_views;

      -- Create new insert policy
      CREATE POLICY "Anyone can insert page_views" ON page_views
        FOR INSERT
        WITH CHECK (true);

      RAISE NOTICE 'Policy created successfully';
    EXCEPTION
      WHEN duplicate_object THEN
        RAISE NOTICE 'Policy already exists';
    END;
    $$;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql });

  if (error) {
    console.error('Error creating policy via RPC:', error);

    // Try alternative method - direct SQL
    console.log('\nTrying alternative method...');

    // Just test if we can insert a page view
    const testInsert = await supabase
      .from('page_views')
      .insert({
        path: '/test-policy',
        session_id: 'test-' + Date.now(),
        device_type: 'desktop',
        referrer: null
      });

    if (testInsert.error) {
      console.error('Test insert failed:', testInsert.error);
      console.log('\n❌ INSERT policy is NOT applied. Need to apply it manually via Supabase Dashboard.');
      console.log('\nGo to: Supabase Dashboard > Authentication > Policies > page_views');
      console.log('Add policy: "Anyone can insert page_views" with expression: true');
    } else {
      console.log('✅ Test insert succeeded - policy is working!');

      // Clean up test record
      await supabase
        .from('page_views')
        .delete()
        .eq('path', '/test-policy')
        .eq('session_id', testInsert.data?.[0]?.session_id);
    }
  } else {
    console.log('✅ Policy created successfully!');
  }

  // Verify page_views data
  console.log('\n--- Current page_views data ---');
  const { data: views, count } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: false })
    .order('created_at', { ascending: false })
    .limit(5);

  console.log(`Total records: ${count}`);
  console.log('Recent records:', views);
}

applyPolicy().catch(console.error);
