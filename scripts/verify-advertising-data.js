/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const fetch = require('node-fetch');

const SUPABASE_URL = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

async function checkAdvertisingData() {
  console.log('=== 1. Active Advertising Subscriptions ===');

  // Check active ads
  const adsResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/advertising_subscriptions?status=eq.active&select=id,service_id,status,created_at`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );
  const ads = await adsResponse.json();
  console.log(`활성 광고: ${ads.length}개`);
  console.log(JSON.stringify(ads, null, 2));

  if (ads.length === 0) {
    console.log('\n❌ 활성 광고가 없습니다! 이것이 문제의 원인입니다.');
    return;
  }

  console.log('\n=== 2. Advertised Services ===');
  const serviceIds = ads.map((ad) => ad.service_id);

  // Check the services
  const servicesResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/services?id=in.(${serviceIds.join(',')})&select=id,title,status`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );
  const services = await servicesResponse.json();
  console.log(`광고 중인 서비스: ${services.length}개`);
  services.forEach((s) => {
    console.log(`- ${s.title} (status: ${s.status})`);
  });

  console.log('\n=== 3. Services in "IT/프로그래밍" Category ===');

  // Get IT category
  const categoryResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/categories?slug=eq.it-programming&select=id,name`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );
  const categories = await categoryResponse.json();

  if (categories.length > 0) {
    const category = categories[0];
    console.log(`카테고리: ${category.name} (ID: ${category.id})`);

    // Get service_categories links
    const linksResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/service_categories?category_id=eq.${category.id}&select=service_id`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    const links = await linksResponse.json();
    console.log(`카테고리 내 서비스 링크: ${links.length}개`);

    const categoryServiceIds = links.map((l) => l.service_id);
    const advertisedInCategory = categoryServiceIds.filter((id) => serviceIds.includes(id));
    console.log(`이 카테고리에 광고 중인 서비스: ${advertisedInCategory.length}개`);

    if (advertisedInCategory.length > 0) {
      console.log('광고 중인 서비스 ID:', advertisedInCategory);
    }
  }
}

checkAdvertisingData().catch(console.error);
