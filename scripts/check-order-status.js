require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const _supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  const serviceId = '6e7a8d72-ffa6-4816-a7fd-3a546594907d';

  console.log('========================================');
  console.log('서비스 주문 데이터 분석');
  console.log('========================================\n');

  // 1. 서비스 정보 확인
  const { data: service } = await supabase
    .from('services')
    .select('id, title, seller_id')
    .eq('id', serviceId)
    .single();

  if (!service) {
    console.log('❌ 서비스를 찾을 수 없습니다.');
    return;
  }

  console.log('📦 서비스 정보:');
  console.log(`  - ID: ${service.id}`);
  console.log(`  - 제목: ${service.title}`);
  console.log(`  - 판매자 ID: ${service.seller_id}\n`);

  // 2. 이 서비스에 대한 모든 주문 확인
  const { data: orders, count: totalOrders } = await supabase
    .from('orders')
    .select('id, status, created_at, service_id', { count: 'exact' })
    .eq('service_id', serviceId);

  console.log(`📊 서비스의 총 주문 수: ${totalOrders || 0}건\n`);

  if (orders && orders.length > 0) {
    console.log('주문 목록:');
    orders.forEach((order, index) => {
      console.log(`  ${index + 1}. 주문 ID: ${order.id}`);
      console.log(`     상태: ${order.status}`);
      console.log(`     생성일: ${new Date(order.created_at).toLocaleString('ko-KR')}\n`);
    });
  }

  // 3. 판매자의 모든 주문 확인 (상태별)
  const { data: allSellerOrders } = await supabase
    .from('orders')
    .select('id, status, service_id, created_at')
    .eq('seller_id', service.seller_id);

  console.log(`\n👤 판매자의 전체 주문 수: ${allSellerOrders?.length || 0}건\n`);

  // 상태별 집계
  const statusCount = {};
  allSellerOrders?.forEach((order) => {
    statusCount[order.status] = (statusCount[order.status] || 0) + 1;
  });

  console.log('상태별 주문 수:');
  Object.entries(statusCount).forEach(([status, count]) => {
    console.log(`  - ${status}: ${count}건`);
  });

  // 4. completed 상태만 카운트
  const { count: completedCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', service.seller_id)
    .eq('status', 'completed');

  console.log(`\n✅ 'completed' 상태 주문: ${completedCount || 0}건`);

  // 5. 리뷰 확인
  const { data: reviews, count: reviewCount } = await supabase
    .from('reviews')
    .select('id, rating, content, created_at', { count: 'exact' })
    .eq('service_id', serviceId);

  console.log(`\n⭐ 리뷰 수: ${reviewCount || 0}건\n`);

  if (reviews && reviews.length > 0) {
    console.log('리뷰 목록:');
    reviews.forEach((review, index) => {
      console.log(`  ${index + 1}. 평점: ${review.rating}/5`);
      console.log(`     내용: ${review.content?.substring(0, 50)}...`);
      console.log(`     작성일: ${new Date(review.created_at).toLocaleString('ko-KR')}\n`);
    });
  }

  console.log('========================================');
  console.log('분석 결과:');
  console.log(`  - 서비스 주문: ${totalOrders || 0}건`);
  console.log(`  - 판매자 전체 주문: ${allSellerOrders?.length || 0}건`);
  console.log(`  - Completed 주문: ${completedCount || 0}건`);
  console.log(`  - 리뷰: ${reviewCount || 0}건`);
  console.log('========================================');
})();
