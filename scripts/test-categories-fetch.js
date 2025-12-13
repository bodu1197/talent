#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */

/**
 * Test categories fetching using the same method as the app
 */

require('dotenv').config({ path: '.env.local' });

async function testCategoriesFetch() {
  console.log('\n🔍 Testing Categories Fetch...\n');

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  console.log('Using Supabase URL:', supabaseUrl);
  console.log('Using Anon Key:', supabaseKey.substring(0, 20) + '...\n');

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test 1: Fetch all active categories
  console.log('Test 1: Fetching all active categories...');
  const { data: categories, error } = await supabase
    .from('categories')
    .select(
      'id, name, slug, icon, description, parent_id, level, service_count, is_ai, is_active, display_order'
    )
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('❌ Error fetching categories:', error);
    return;
  }

  if (!categories || categories.length === 0) {
    console.log('⚠️  No categories found');
    return;
  }

  console.log(`✅ Found ${categories.length} categories\n`);

  // Test 2: Count root categories
  const rootCategories = categories.filter((c) => c.parent_id === null);
  console.log(`   Root categories: ${rootCategories.length}`);
  console.log(`   Child categories: ${categories.length - rootCategories.length}\n`);

  // Test 3: Show first 5 root categories
  console.log('First 5 root categories:');
  rootCategories.slice(0, 5).forEach((cat) => {
    console.log(`   - ${cat.name} (${cat.slug})`);
  });

  console.log('\n✅ Categories are accessible from the app!\n');
}

testCategoriesFetch().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
