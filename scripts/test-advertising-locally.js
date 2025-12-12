/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
// 로컬에서 광고 우선순위 로직 테스트
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testCategoryServices(categorySlug) {
  console.log(`\n=== Testing Category: ${categorySlug} ===`);

  // 1. Get category ID
  const { data: category } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', categorySlug)
    .single();

  if (!category) {
    console.log('❌ Category not found');
    return;
  }

  console.log(`카테고리: ${category.name} (${category.id})`);

  // 2. Get advertising service IDs
  const { data: advertisingData } = await supabase
    .from('advertising_subscriptions')
    .select('service_id')
    .eq('status', 'active');

  const advertisedServiceIds = advertisingData?.map(ad => ad.service_id) || [];
  console.log(`활성 광고 수: ${advertisedServiceIds.length}개`);

  // 3. Get service_categories links
  const { data: serviceLinks } = await supabase
    .from('service_categories')
    .select('service_id')
    .eq('category_id', category.id);

  if (!serviceLinks || serviceLinks.length === 0) {
    console.log('❌ No services in this category');
    return;
  }

  const serviceIds = serviceLinks.map(sl => sl.service_id);
  console.log(`카테고리 내 서비스 수: ${serviceIds.length}개`);

  // 4. Get services
  const { data: services } = await supabase
    .from('services')
    .select('id, title, status')
    .in('id', serviceIds)
    .eq('status', 'active');

  console.log(`활성 서비스 수: ${services?.length || 0}개`);

  // 5. Check which are advertised
  const advertisedInCategory = services?.filter(s => advertisedServiceIds.includes(s.id)) || [];
  const regularInCategory = services?.filter(s => !advertisedServiceIds.includes(s.id)) || [];

  console.log(`\n광고 서비스: ${advertisedInCategory.length}개`);
  advertisedInCategory.forEach(s => console.log(`  - ${s.title}`));

  console.log(`\n일반 서비스: ${regularInCategory.length}개`);
  regularInCategory.slice(0, 3).forEach(s => console.log(`  - ${s.title}`));
  if (regularInCategory.length > 3) {
    console.log(`  ... 외 ${regularInCategory.length - 3}개`);
  }

  // 6. Simulate the server logic
  const allServices = [...services];
  allServices.forEach(service => {
    service.is_advertised = advertisedServiceIds.includes(service.id);
  });

  console.log(`\n🎯 is_advertised 필드 추가 후:`);
  console.log(`  - is_advertised = true: ${allServices.filter(s => s.is_advertised).length}개`);
  console.log(`  - is_advertised = false/undefined: ${allServices.filter(s => !s.is_advertised).length}개`);

  // 7. Check if field exists
  const sampleService = allServices[0];
  console.log(`\n샘플 서비스 필드:`, Object.keys(sampleService));
  console.log(`is_advertised 값:`, sampleService.is_advertised);
}

// Test multiple categories
async function runTests() {
  await testCategoryServices('it-programming');
  await testCategoryServices('design');
  await testCategoryServices('writing-translation');
}

runTests().catch(console.error);
