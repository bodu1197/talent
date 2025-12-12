require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const _supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  const serviceId = '6e7a8d72-ffa6-4816-a7fd-3a546594907d';

  console.log('========================================');
  console.log('수정된 쿼리 테스트');
  console.log('========================================\n');

  // 서비스 정보 가져오기 (실제 페이지와 동일한 쿼리)
  const { data: service } = await supabase
    .from('services')
    .select(`
      id,
      title,
      seller:seller_profiles!seller_id(
        id,
        user_id,
        display_name,
        business_name
      )
    `)
    .eq('id', serviceId)
    .single();

  if (!service || !service.seller) {
    console.log('❌ 서비스 또는 판매자 정보를 찾을 수 없습니다.');
    return;
  }

  console.log('📦 서비스 정보:');
  console.log(`  - Service ID: ${service.id}`);
  console.log(`  - Title: ${service.title}`);
  console.log(`\n👤 판매자 정보:`);
  console.log(`  - Seller ID: ${service.seller.id}`);
  console.log(`  - User ID: ${service.seller.user_id}`);
  console.log(`  - Display Name: ${service.seller.display_name || service.seller.business_name}\n`);

  // 이전 방법 (잘못된 방법)
  console.log('❌ 이전 방법 (seller.id 사용):');
  const { count: oldCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', service.seller.id)
    .eq('status', 'completed');

  console.log(`  - seller.id로 조회한 completed 주문: ${oldCount || 0}건\n`);

  // 수정된 방법 (올바른 방법)
  console.log('✅ 수정된 방법 (seller.user_id 사용):');
  const { count: newCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', service.seller.user_id)
    .eq('status', 'completed');

  console.log(`  - seller.user_id로 조회한 completed 주문: ${newCount || 0}건\n`);

  // 모든 주문 상태별 집계
  const { data: allOrders } = await supabase
    .from('orders')
    .select('id, status')
    .eq('seller_id', service.seller.user_id);

  const statusCount = {};
  allOrders?.forEach((order) => {
    statusCount[order.status] = (statusCount[order.status] || 0) + 1;
  });

  console.log('📊 판매자의 모든 주문 (상태별):');
  Object.entries(statusCount).forEach(([status, count]) => {
    console.log(`  - ${status}: ${count}건`);
  });

  console.log('\n========================================');
  console.log('결과:');
  console.log(`  - 이전 방법: ${oldCount || 0}건 (❌ 잘못됨)`);
  console.log(`  - 수정 후: ${newCount || 0}건 (✅ 정확함)`);
  console.log(`  - 개선: +${(newCount || 0) - (oldCount || 0)}건`);
  console.log('========================================');
})();
