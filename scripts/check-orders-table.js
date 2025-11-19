require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('========================================');
  console.log('Orders 테이블 상세 분석');
  console.log('========================================\n');

  const serviceId = '6e7a8d72-ffa6-4816-a7fd-3a546594907d';

  // 주문 전체 정보 가져오기
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('service_id', serviceId);

  if (!orders || orders.length === 0) {
    console.log('❌ 주문이 없습니다.');
    return;
  }

  console.log(`총 ${orders.length}건의 주문 발견\n`);

  orders.forEach((order, index) => {
    console.log(`주문 ${index + 1}:`);
    console.log(JSON.stringify(order, null, 2));
    console.log('\n---\n');
  });

  // 리뷰 테이블도 확인
  console.log('========================================');
  console.log('Reviews 테이블 확인');
  console.log('========================================\n');

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('service_id', serviceId);

  console.log(`리뷰 수: ${reviews?.length || 0}건\n`);

  if (reviews && reviews.length > 0) {
    reviews.forEach((review, index) => {
      console.log(`리뷰 ${index + 1}:`);
      console.log(JSON.stringify(review, null, 2));
      console.log('\n---\n');
    });
  }
})();
