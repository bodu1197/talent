const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkData() {
  console.log('=== 1. 모든 카테고리 확인 ===');
  const { data: allCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  console.log(`총 카테고리 수: ${allCategories?.length || 0}개`);
  allCategories?.slice(0, 10).forEach(c => {
    console.log(`- ${c.name} (slug: ${c.slug}, id: ${c.id})`);
  });

  console.log('\n=== 2. 활성 광고 서비스 확인 ===');
  const { data: ads } = await supabase
    .from('advertising_subscriptions')
    .select(`
      id,
      service_id,
      services (
        id,
        title,
        service_categories (
          category_id,
          categories (
            id,
            name,
            slug
          )
        )
      )
    `)
    .eq('status', 'active');

  console.log(`활성 광고 수: ${ads?.length || 0}개\n`);
  ads?.forEach((ad, idx) => {
    const service = ad.services;
    console.log(`${idx + 1}. ${service.title}`);
    service.service_categories?.forEach(sc => {
      console.log(`   카테고리: ${sc.categories?.name} (${sc.categories?.slug})`);
    });
  });

  console.log('\n=== 3. IT/프로그래밍 카테고리 서비스 확인 ===');

  // IT 카테고리 찾기
  const itCategory = allCategories?.find(c =>
    c.slug === 'it-programming' || c.name.includes('IT') || c.name.includes('프로그래밍')
  );

  if (itCategory) {
    console.log(`IT 카테고리 찾음: ${itCategory.name} (ID: ${itCategory.id})`);

    // 이 카테고리의 서비스 찾기
    const { data: itServices } = await supabase
      .from('service_categories')
      .select(`
        service_id,
        services (
          id,
          title,
          status
        )
      `)
      .eq('category_id', itCategory.id);

    console.log(`IT 카테고리 서비스 수: ${itServices?.length || 0}개`);
    itServices?.slice(0, 5).forEach(s => {
      console.log(`- ${s.services?.title} (status: ${s.services?.status})`);
    });
  }

  console.log('\n=== 4. 디자인 카테고리 서비스 확인 ===');

  const designCategory = allCategories?.find(c =>
    c.slug === 'design' || c.name.includes('디자인')
  );

  if (designCategory) {
    console.log(`디자인 카테고리 찾음: ${designCategory.name} (ID: ${designCategory.id})`);

    const { data: designServices } = await supabase
      .from('service_categories')
      .select(`
        service_id,
        services (
          id,
          title,
          status
        )
      `)
      .eq('category_id', designCategory.id);

    console.log(`디자인 카테고리 서비스 수: ${designServices?.length || 0}개`);
    designServices?.slice(0, 5).forEach(s => {
      console.log(`- ${s.services?.title} (status: ${s.services?.status})`);
    });
  }
}

checkData().catch(console.error);
