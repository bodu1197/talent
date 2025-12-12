require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const _supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('Finding advertised services and their categories...\n');

  // 1. Get active advertising subscriptions
  const { data: subscriptions, error: subError } = await supabase
    .from('advertising_subscriptions')
    .select('id, service_id')
    .eq('status', 'active')
    .limit(1);

  if (subError || !subscriptions || subscriptions.length === 0) {
    console.error('No active subscriptions found');
    process.exit(1);
  }

  const serviceId = subscriptions[0].service_id;
  console.log('Found advertised service:', serviceId);

  // 2. Get service details
  const { data: service } = await supabase
    .from('services')
    .select('id, title, slug')
    .eq('id', serviceId)
    .single();

  console.log('Service details:');
  console.log('  - Title:', service.title);
  console.log('  - Slug:', service.slug);

  // 3. Get service categories
  const { data: serviceCategories } = await supabase
    .from('service_categories')
    .select('category_id')
    .eq('service_id', serviceId);

  if (!serviceCategories || serviceCategories.length === 0) {
    console.error('No categories found for this service');
    process.exit(1);
  }

  console.log('\nCategories:');
  for (const sc of serviceCategories) {
    const { data: category } = await supabase
      .from('categories')
      .select('id, name, slug, level')
      .eq('id', sc.category_id)
      .single();

    console.log(`  - ${category.name} (${category.slug}) - Level ${category.level}`);
    console.log(`    URL: http://localhost:3000/categories/${category.slug}`);
  }
})();
