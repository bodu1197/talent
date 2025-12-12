/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function insertTestStores() {
  const testStores = [
    // 서울 강남구 - 치킨집
    {
      name: '황금올리브 강남점',
      category: 'chicken',
      description: '바삭한 후라이드 치킨 전문점',
      phone: '02-1234-5678',
      address: '서울특별시 강남구 역삼동 123-45',
      detail_address: '1층',
      latitude: 37.5012,
      longitude: 127.0396,
      min_order_amount: 15000,
      delivery_fee: 3000,
      estimated_prep_time: 25,
      rating: 4.7,
      review_count: 245,
      order_count: 1520,
      is_open: true,
      is_verified: true,
      is_active: true,
    },
    // 서울 마포구 - 중국집
    {
      name: '행복반점 마포점',
      category: 'chinese',
      description: '정통 중화요리 전문점, 짜장면 맛집',
      phone: '02-9876-5432',
      address: '서울특별시 마포구 합정동 456-78',
      detail_address: '지하 1층',
      latitude: 37.5496,
      longitude: 126.9139,
      min_order_amount: 12000,
      delivery_fee: 2500,
      estimated_prep_time: 30,
      rating: 4.5,
      review_count: 189,
      order_count: 890,
      is_open: true,
      is_verified: true,
      is_active: true,
    },
    // 대전 서구 - 피자집
    {
      name: '도미노피자 대전둔산점',
      category: 'pizza',
      description: '프리미엄 피자 전문점',
      phone: '042-111-2222',
      address: '대전광역시 서구 둔산동 1234',
      detail_address: '2층',
      latitude: 36.3515,
      longitude: 127.3786,
      min_order_amount: 18000,
      delivery_fee: 2000,
      estimated_prep_time: 35,
      rating: 4.6,
      review_count: 312,
      order_count: 2100,
      is_open: true,
      is_verified: true,
      is_active: true,
    },
    // 대전 유성구 - 한식집
    {
      name: '시골밥상 유성점',
      category: 'korean',
      description: '엄마 손맛 그대로, 정갈한 한식',
      phone: '042-333-4444',
      address: '대전광역시 유성구 봉명동 567',
      detail_address: '1층',
      latitude: 36.3622,
      longitude: 127.3456,
      min_order_amount: 10000,
      delivery_fee: 3000,
      estimated_prep_time: 20,
      rating: 4.8,
      review_count: 156,
      order_count: 680,
      is_open: true,
      is_verified: true,
      is_active: true,
    },
  ];

  console.log('테스트 식당 데이터 입력 시작...');

  for (const store of testStores) {
    const { error } = await supabase.from('food_stores').insert(store).select();

    if (error) {
      console.error(`❌ ${store.name} 입력 실패:`, error.message);
    } else {
      console.log(`✅ ${store.name} 입력 완료 (ID: ${data[0].id})`);
    }
  }

  console.log('\n테스트 데이터 입력 완료!');
}

insertTestStores();
