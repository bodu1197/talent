/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const serviceId = '53eb9742-f04a-4b2b-bc3c-68447414a3af';

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 서비스 상세 페이지 데이터 테스트');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`Service ID: ${serviceId}\n`);

  // 서비스 상세 페이지에서 사용하는 쿼리와 동일하게 테스트
  const { data: service, error } = await supabase
    .from('services')
    .select(
      `
      *,
      seller:sellers(
        id,
        business_name,
        contact_hours,
        tax_invoice_available,
        user_id,
        bio,
        phone,
        created_at
      ),
      service_categories(
        category:categories(id, name, slug)
      )
    `
    )
    .eq('id', serviceId)
    .single();

  if (error) {
    console.log('❌ 에러 발생:');
    console.log(JSON.stringify(error, null, 2));
    return;
  }

  if (!service) {
    console.log('❌ 서비스를 찾을 수 없습니다\n');
    return;
  }

  console.log('✓ 서비스 데이터 로드 성공\n');
  console.log('서비스 정보:');
  console.log(`  제목: ${service.title}`);
  console.log(`  가격: ${service.price?.toLocaleString()}원`);
  console.log(`  상태: ${service.status}`);
  console.log(`  배송일: ${service.delivery_days}일`);

  console.log('\n판매자 정보:');
  if (service.seller) {
    console.log(`  ID: ${service.seller.id}`);
    console.log(`  상호명: ${service.seller.business_name}`);
    console.log(`  User ID: ${service.seller.user_id}`);
  } else {
    console.log('  ❌ 판매자 정보 없음');
  }

  console.log('\n카테고리:');
  if (service.service_categories && service.service_categories.length > 0) {
    service.service_categories.forEach((sc) => {
      console.log(`  - ${sc.category?.name} (${sc.category?.slug})`);
    });
  } else {
    console.log('  ❌ 카테고리 없음');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main();
