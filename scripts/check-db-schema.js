require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('프로덕션 DB 스키마 확인...\n');

  // 1. advertising_impressions 테이블 테스트 삽입
  console.log('1️⃣ advertising_impressions 테이블 테스트 삽입...');

  const { data: testSub } = await supabase
    .from('advertising_subscriptions')
    .select('id, service_id')
    .eq('status', 'active')
    .limit(1)
    .single();

  if (!testSub) {
    console.log('❌ 활성 광고 구독이 없습니다.');
    return;
  }

  console.log('사용할 구독:', testSub.id);

  const { data: insertResult, error: insertError } = await supabase
    .from('advertising_impressions')
    .insert({
      subscription_id: testSub.id,
      service_id: testSub.service_id,
      category_id: 'test-category-id',
      position: 1,
      page_number: 1,
    })
    .select();

  if (insertError) {
    console.log('❌ 삽입 실패:', JSON.stringify(insertError, null, 2));

    // 테이블 구조 확인
    console.log('\n2️⃣ 테이블 구조 확인 중...');

    // 실제 카테고리 ID 가져오기
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);

    console.log('실제 카테고리 예시:', categories);

  } else {
    console.log('✅ 삽입 성공:', insertResult);

    // 테스트 데이터 삭제
    await supabase
      .from('advertising_impressions')
      .delete()
      .eq('id', insertResult[0].id);

    console.log('✅ 테스트 데이터 삭제 완료');
  }

  // 3. 외래 키 제약 조건 확인
  console.log('\n3️⃣ 서비스-카테고리 관계 확인...');

  const { data: serviceCategories } = await supabase
    .from('service_categories')
    .select('service_id, category_id')
    .eq('service_id', testSub.service_id);

  console.log('서비스 카테고리:', serviceCategories);
})();
