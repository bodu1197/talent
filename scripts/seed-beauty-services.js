/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 서울 주요 지역 좌표
const LOCATIONS = [
  { region: '강남구', lat: 37.5172, lng: 127.0473, address: '서울특별시 강남구 역삼동' },
  { region: '서초구', lat: 37.4837, lng: 127.0324, address: '서울특별시 서초구 서초동' },
  { region: '마포구', lat: 37.5665, lng: 126.9018, address: '서울특별시 마포구 서교동' },
  { region: '종로구', lat: 37.5730, lng: 126.9794, address: '서울특별시 종로구 종로3가' },
  { region: '송파구', lat: 37.5145, lng: 127.1059, address: '서울특별시 송파구 잠실동' },
  { region: '영등포구', lat: 37.5264, lng: 126.8964, address: '서울특별시 영등포구 여의도동' },
  { region: '성동구', lat: 37.5634, lng: 127.0369, address: '서울특별시 성동구 성수동' },
  { region: '용산구', lat: 37.5326, lng: 126.9910, address: '서울특별시 용산구 한남동' },
];

// 뷰티/패션 서비스 데이터
const BEAUTY_SERVICES = {
  'makeup': [
    { title: '웨딩 메이크업 전문', description: '10년 경력 웨딩 메이크업 아티스트입니다. 신부님의 아름다움을 최대한 끌어올려 드립니다. 드레스 스타일에 맞춘 맞춤 메이크업을 제공합니다.', price: 200000 },
    { title: '데일리 메이크업 레슨', description: '자연스러운 데일리 메이크업을 배워보세요. 본인에게 맞는 색조와 기법을 알려드립니다.', price: 80000 },
    { title: '파티 & 이벤트 메이크업', description: '특별한 날을 위한 화려한 메이크업. 연예인 담당 메이크업 아티스트가 직접 진행합니다.', price: 150000 },
    { title: '증명사진 메이크업', description: '면접, 여권, 프로필 사진을 위한 깔끔한 메이크업을 제공합니다.', price: 50000 },
  ],
  'hair': [
    { title: '출장 헤어 스타일링', description: '결혼식, 졸업식, 파티 등 특별한 날 출장 헤어 스타일링 서비스를 제공합니다.', price: 100000 },
    { title: '남성 헤어컷 & 스타일링', description: '트렌디한 남성 헤어스타일을 제안합니다. 두상과 얼굴형에 맞는 커트를 진행합니다.', price: 30000 },
    { title: '탈모 관리 상담', description: '두피 분석 및 맞춤형 탈모 관리 프로그램을 제공합니다. 20년 경력 두피 전문가.', price: 50000 },
    { title: '웨딩 헤어 스타일링', description: '신부님의 드레스와 컨셉에 맞는 우아한 헤어스타일을 연출해 드립니다.', price: 180000 },
  ],
  'nail': [
    { title: '젤네일 아트 (손)', description: '트렌디한 젤네일 아트를 제공합니다. 시즌별 다양한 디자인 제안. 고급 젤 제품 사용.', price: 60000 },
    { title: '패디큐어 & 발관리', description: '지친 발에 휴식을! 각질 제거부터 네일 아트까지 풀코스 발관리.', price: 70000 },
    { title: '웨딩 네일 패키지', description: '손톱, 발톱 모두 완벽하게! 신부님을 위한 프리미엄 웨딩 네일 패키지.', price: 150000 },
    { title: '네일 연장 & 보수', description: '자연스러운 길이감! 젤 연장 및 파손된 네일 보수 서비스.', price: 80000 },
  ],
  'skin': [
    { title: '피부 관리 1:1 코칭', description: '피부 타입 분석 후 맞춤형 스킨케어 루틴을 제안합니다. 화장품 추천 포함.', price: 50000 },
    { title: '페이셜 마사지 & 관리', description: '림프 마사지와 함께하는 프리미엄 페이셜 케어. 피부 탄력과 혈색을 되찾으세요.', price: 80000 },
    { title: '여드름 집중 관리', description: '여드름, 모공, 피지 고민 해결! 피부과 근무 경력 에스테티션의 전문 관리.', price: 90000 },
    { title: '브라이달 피부 관리', description: '결혼 전 3개월 집중 피부 관리 프로그램. 광채나는 피부로 가꿔드립니다.', price: 300000 },
  ],
  'styling': [
    { title: '퍼스널 컬러 진단', description: '나에게 어울리는 컬러를 찾아드립니다. 계절 타입 분석 및 베스트/워스트 컬러 제안.', price: 80000 },
    { title: '옷장 정리 & 스타일링', description: '옷장 속 옷으로 새로운 스타일링! 불필요한 옷 정리 및 코디 제안.', price: 100000 },
    { title: '쇼핑 동행 스타일링', description: '함께 쇼핑하며 스타일을 완성해드립니다. 체형과 예산에 맞는 쇼핑 가이드.', price: 150000 },
    { title: '면접 & 비즈니스 스타일링', description: '첫인상이 중요한 순간! 면접, 프레젠테이션을 위한 전문 스타일링.', price: 120000 },
  ],
};

async function main() {
  console.log('🎨 뷰티/패션 서비스 데이터 생성 시작...\n');

  // 1. 뷰티/패션 카테고리 조회
  const { data: beautyCategory, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .or('slug.eq.beauty-fashion,slug.eq.beauty')
    .single();

  if (catError || !beautyCategory) {
    console.log('뷰티/패션 카테고리를 찾을 수 없습니다. 카테고리 목록:');
    const { data: allCats } = await supabase
      .from('categories')
      .select('id, name, slug, level')
      .eq('level', 1);
    console.log(allCats);
    return;
  }

  console.log('✅ 뷰티/패션 카테고리:', beautyCategory);

  // 2. 하위 카테고리 조회
  const { data: subCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('parent_id', beautyCategory.id);

  console.log('\n📂 하위 카테고리:', subCategories?.map(c => c.slug));

  // 3. 기존 판매자 조회 또는 생성
  let { data: sellers } = await supabase
    .from('sellers')
    .select('id, display_name, location_latitude, location_longitude, location_region')
    .not('location_latitude', 'is', null)
    .limit(8);

  if (!sellers || sellers.length === 0) {
    console.log('\n⚠️ 위치 정보가 있는 판매자가 없습니다. 테스트 판매자를 생성합니다...');

    // 기존 판매자 조회 (위치 없는)
    const { data: existingSellers } = await supabase
      .from('sellers')
      .select('id')
      .limit(8);

    if (existingSellers && existingSellers.length > 0) {
      // 기존 판매자에 위치 정보 추가
      for (let i = 0; i < Math.min(existingSellers.length, LOCATIONS.length); i++) {
        const loc = LOCATIONS[i];
        await supabase
          .from('sellers')
          .update({
            location_address: loc.address,
            location_latitude: loc.lat,
            location_longitude: loc.lng,
            location_region: loc.region,
            location_updated_at: new Date().toISOString(),
          })
          .eq('id', existingSellers[i].id);
        console.log(`  - 판매자 ${existingSellers[i].id} 위치 업데이트: ${loc.region}`);
      }

      // 다시 조회 - sellers 테이블에서 직접 조회
      const { data: updatedSellers, error: sellerErr } = await supabase
        .from('sellers')
        .select('id, location_latitude, location_longitude, location_region')
        .not('location_latitude', 'is', null)
        .limit(8);

      if (sellerErr) {
        console.log('판매자 조회 에러:', sellerErr);
      }
      sellers = updatedSellers;
      console.log('업데이트 후 판매자:', sellers?.length);
    }
  }

  if (!sellers || sellers.length === 0) {
    // 그래도 없으면 위치 없는 판매자라도 사용
    const { data: anySellers } = await supabase
      .from('sellers')
      .select('id, location_region')
      .limit(8);

    if (anySellers && anySellers.length > 0) {
      sellers = anySellers;
      console.log('⚠️ 위치 없는 판매자 사용:', sellers.length);
    } else {
      console.log('❌ 판매자가 없습니다. 먼저 판매자를 생성해주세요.');
      return;
    }
  }

  console.log(`\n👤 사용할 판매자 수: ${sellers.length}`);
  sellers.forEach(s => console.log(`  - ${s.id.slice(0, 8)}... (${s.location_region || '위치 없음'})`));

  // 4. 서비스 생성
  let createdCount = 0;
  const categoryMap = {};

  // 카테고리 slug -> id 매핑
  if (subCategories) {
    for (const cat of subCategories) {
      categoryMap[cat.slug] = cat.id;
    }
  }

  console.log('\n🛠️ 서비스 생성 중...');

  for (const [catSlug, services] of Object.entries(BEAUTY_SERVICES)) {
    const categoryId = categoryMap[catSlug];

    if (!categoryId) {
      console.log(`  ⚠️ 카테고리 '${catSlug}'를 찾을 수 없습니다. 스킵.`);
      continue;
    }

    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      const seller = sellers[i % sellers.length];

      // 서비스 생성
      const { data: newService, error: serviceError } = await supabase
        .from('services')
        .insert({
          title: service.title,
          description: service.description,
          price: service.price,
          price_type: 'fixed',
          seller_id: seller.id,
          status: 'active',
          delivery_method: 'offline',
          thumbnail: `https://picsum.photos/seed/${catSlug}${i}/400/300`,
        })
        .select('id')
        .single();

      if (serviceError) {
        console.log(`  ❌ 서비스 생성 실패: ${service.title}`, serviceError.message);
        continue;
      }

      // 서비스-카테고리 연결
      await supabase
        .from('service_categories')
        .insert({
          service_id: newService.id,
          category_id: categoryId,
        });

      // 상위 카테고리에도 연결
      await supabase
        .from('service_categories')
        .insert({
          service_id: newService.id,
          category_id: beautyCategory.id,
        });

      createdCount++;
      console.log(`  ✅ ${catSlug}: ${service.title} (${seller.location_region || '위치없음'})`);
    }
  }

  console.log(`\n🎉 완료! 총 ${createdCount}개의 서비스가 생성되었습니다.`);
  console.log(`\n테스트 URL: /categories/beauty-fashion?lat=37.5730&lng=126.9794`);
}

main().catch(console.error);
