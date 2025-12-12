require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const _supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  const serviceId = '6e7a8d72-ffa6-4816-a7fd-3a546594907d';

  console.log('========================================');
  console.log('Seller ID 관계 분석');
  console.log('========================================\n');

  // 1. 서비스 정보 (seller 조인)
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select(`
      id,
      title,
      seller_id
    `)
    .eq('id', serviceId)
    .single();

  if (serviceError || !service) {
    console.log('❌ 서비스 조회 실패:', serviceError);
    return;
  }

  // Seller 정보 별도 조회
  const { data: seller } = await supabase
    .from('sellers')
    .select('id, user_id, display_name, business_name')
    .eq('id', service.seller_id)
    .single();

  console.log('📦 서비스 정보:');
  console.log(`  - Service ID: ${service.id}`);
  console.log(`  - Service seller_id: ${service.seller_id}`);
  if (seller) {
    console.log(`  - Seller (from sellers table):`);
    console.log(`    - Seller ID: ${seller.id}`);
    console.log(`    - User ID: ${seller.user_id}`);
    console.log(`    - Display Name: ${seller.display_name || seller.business_name}\n`);
  }

  // 2. 주문 데이터의 seller_id 확인
  const { data: orders } = await supabase
    .from('orders')
    .select('id, seller_id, status')
    .eq('service_id', serviceId);

  console.log('📋 주문의 seller_id:');
  orders?.forEach((order, index) => {
    console.log(`  주문 ${index + 1}: ${order.seller_id} (상태: ${order.status})`);
  });

  console.log('\n');

  // 3. 비교
  const serviceSellerId = service.seller_id;
  const orderSellerId = orders?.[0]?.seller_id;

  console.log('🔍 비교:');
  console.log(`  - Service의 seller_id: ${serviceSellerId}`);
  console.log(`  - Orders의 seller_id: ${orderSellerId}`);
  console.log(`  - 일치 여부: ${serviceSellerId === orderSellerId ? '❌ 불일치' : '✅ 일치'}\n`);

  // 4. 현재 코드가 사용하는 쿼리 재현
  console.log('📊 현재 코드 재현:');
  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', service.seller_id)  // service.seller_id 사용
    .eq('status', 'completed');

  console.log(`  - service.seller_id로 조회한 completed 주문: ${orderCount || 0}건`);

  const { count: orderCount2 } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', orderSellerId)  // orders 테이블의 실제 seller_id 사용
    .eq('status', 'completed');

  console.log(`  - 실제 주문의 seller_id로 조회한 completed 주문: ${orderCount2 || 0}건\n`);

  // 5. sellers 테이블에서 두 ID 모두 확인
  console.log('🔎 Sellers 테이블 확인:');

  const { data: seller1 } = await supabase
    .from('sellers')
    .select('*')
    .eq('id', serviceSellerId)
    .single();

  const { data: seller2 } = await supabase
    .from('sellers')
    .select('*')
    .eq('id', orderSellerId)
    .maybeSingle();

  console.log(`  - Service seller_id (${serviceSellerId}):`);
  console.log(`    존재: ${seller1 ? '✅' : '❌'}`);
  if (seller1) {
    console.log(`    User ID: ${seller1.user_id}`);
    console.log(`    Display Name: ${seller1.display_name || seller1.business_name}`);
  }

  console.log(`\n  - Order seller_id (${orderSellerId}):`);
  console.log(`    존재: ${seller2 ? '✅' : '❌'}`);
  if (seller2) {
    console.log(`    User ID: ${seller2.user_id}`);
    console.log(`    Display Name: ${seller2.display_name || seller2.business_name}`);
  }

  console.log('\n========================================');
  console.log('결론:');
  console.log(`  - 서비스와 주문의 seller_id가 ${serviceSellerId === orderSellerId ? '일치하지 않음' : '일치함'}`);
  console.log(`  - ${orderSellerId}는 sellers 테이블에 ${seller2 ? '존재함' : '존재하지 않음 (user_id일 가능성)'}`);
  console.log('========================================');
})();
