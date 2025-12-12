require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 서울 주요 지역 좌표 (25명 분산)
const LOCATIONS = [
  // 강남구 (4명)
  { region: '강남구', lat: 37.5172, lng: 127.0473, address: '서울특별시 강남구 역삼동 123-45' },
  { region: '강남구', lat: 37.5045, lng: 127.0245, address: '서울특별시 강남구 삼성동 55-12' },
  { region: '강남구', lat: 37.4979, lng: 127.0276, address: '서울특별시 강남구 대치동 891' },
  { region: '강남구', lat: 37.5112, lng: 127.0598, address: '서울특별시 강남구 청담동 78-3' },
  // 서초구 (3명)
  { region: '서초구', lat: 37.4837, lng: 127.0324, address: '서울특별시 서초구 서초동 1305-7' },
  { region: '서초구', lat: 37.4923, lng: 127.0093, address: '서울특별시 서초구 반포동 19-4' },
  { region: '서초구', lat: 37.4765, lng: 127.0456, address: '서울특별시 서초구 잠원동 22' },
  // 마포구 (3명)
  { region: '마포구', lat: 37.5665, lng: 126.9018, address: '서울특별시 마포구 서교동 358-11' },
  { region: '마포구', lat: 37.5536, lng: 126.9219, address: '서울특별시 마포구 상수동 72-1' },
  { region: '마포구', lat: 37.5573, lng: 126.9253, address: '서울특별시 마포구 합정동 411-2' },
  // 종로구 (3명)
  { region: '종로구', lat: 37.5730, lng: 126.9794, address: '서울특별시 종로구 종로3가 51' },
  { region: '종로구', lat: 37.5796, lng: 126.9770, address: '서울특별시 종로구 삼청동 35-4' },
  { region: '종로구', lat: 37.5701, lng: 126.9925, address: '서울특별시 종로구 대학로 116' },
  // 송파구 (3명)
  { region: '송파구', lat: 37.5145, lng: 127.1059, address: '서울특별시 송파구 잠실동 40-1' },
  { region: '송파구', lat: 37.5048, lng: 127.1153, address: '서울특별시 송파구 문정동 618' },
  { region: '송파구', lat: 37.5116, lng: 127.0866, address: '서울특별시 송파구 석촌동 286' },
  // 영등포구 (3명)
  { region: '영등포구', lat: 37.5264, lng: 126.8964, address: '서울특별시 영등포구 여의도동 23' },
  { region: '영등포구', lat: 37.5169, lng: 126.9073, address: '서울특별시 영등포구 영등포동 618-14' },
  { region: '영등포구', lat: 37.5254, lng: 126.9279, address: '서울특별시 영등포구 당산동 121-4' },
  // 성동구 (3명)
  { region: '성동구', lat: 37.5634, lng: 127.0369, address: '서울특별시 성동구 성수동 656-270' },
  { region: '성동구', lat: 37.5477, lng: 127.0440, address: '서울특별시 성동구 왕십리동 16-17' },
  { region: '성동구', lat: 37.5475, lng: 127.0564, address: '서울특별시 성동구 행당동 286-4' },
  // 용산구 (3명)
  { region: '용산구', lat: 37.5326, lng: 126.9910, address: '서울특별시 용산구 한남동 657-9' },
  { region: '용산구', lat: 37.5340, lng: 126.9656, address: '서울특별시 용산구 이태원동 34-67' },
  { region: '용산구', lat: 37.5283, lng: 126.9646, address: '서울특별시 용산구 한강로동 256' },
];

// 판매자 이름
const SELLER_NAMES = [
  '김미연 원장', '이서현 실장', '박지우 대표', '최수민 아티스트', '정하윤 디자이너',
  '강예은 스타일리스트', '조민서 뷰티샵', '윤지아 스튜디오', '임채원 살롱', '한소율 메이크업',
  '신예진 네일아트', '오다은 헤어샵', '서민지 스타일링', '권수아 뷰티', '황나은 컨설팅',
  '문지현 원장', '송유진 실장', '류하은 대표', '백서윤 아티스트', '남채린 디자이너',
  '장소희 스타일리스트', '전유나 뷰티샵', '홍지원 스튜디오', '유서연 살롱', '안미래 메이크업',
];

// 카테고리별 서비스 데이터
const SERVICES_DATA = {
  'nail-art': [
    { title: '프리미엄 젤네일 아트', description: '트렌디한 젤네일 아트를 제공합니다. 시즌별 최신 디자인, 고급 젤 제품 사용. 15년 경력의 네일 아티스트가 직접 시술합니다. 원하시는 디자인 사진을 가져오시면 100% 재현해 드립니다.', price: 70000 },
    { title: '웨딩 네일 풀패키지', description: '신부님을 위한 프리미엄 웨딩 네일! 손톱, 발톱 모두 완벽하게 케어해 드립니다. 드레스와 부케에 어울리는 맞춤 디자인 제안. 본식 당일 리터치 서비스 포함.', price: 180000 },
    { title: '캐릭터 & 아트 네일', description: '귀여운 캐릭터부터 화려한 아트까지! SNS 핫한 디자인 전문. 디즈니, 산리오, 짱구 등 인기 캐릭터 재현 가능. 사진 첨부 시 견적 무료.', price: 90000 },
    { title: '스파 패디큐어 & 발관리', description: '지친 발에 럭셔리한 휴식을 선사합니다. 각질 제거, 보습 케어, 발 마사지, 네일 아트까지 풀코스. 피로 해소에 효과적인 아로마 오일 사용.', price: 85000 },
    { title: '젤 연장 & 보수 전문', description: '자연스럽고 튼튼한 젤 연장! 짧은 손톱도 아름다운 길이감을 연출해 드립니다. 파손된 네일 긴급 보수도 가능. 당일 예약 환영.', price: 95000 },
  ],
  'makeup': [
    { title: '웨딩 메이크업 & 헤어', description: '인생에서 가장 아름다운 날을 위한 특별한 메이크업. 15년 경력 웨딩 메이크업 아티스트가 신부님의 아름다움을 최대한 끌어올려 드립니다. 리허설 메이크업 포함.', price: 280000 },
    { title: '데일리 메이크업 레슨', description: '나에게 맞는 데일리 메이크업을 배워보세요! 피부 톤, 눈 모양에 맞는 메이크업 기법 전수. 1:1 맞춤 레슨으로 누구나 예뻐질 수 있습니다. 화장품 추천 리스트 제공.', price: 100000 },
    { title: '파티 & 이벤트 메이크업', description: '특별한 날을 더욱 빛나게! 연예인 담당 메이크업 아티스트의 프리미엄 메이크업. 시상식, 생일파티, 데이트 등 어떤 자리에서도 주인공이 되세요.', price: 180000 },
    { title: '증명사진 & 프로필 메이크업', description: '면접, 여권, 프로필 사진을 위한 깔끔한 메이크업. 사진에 잘 받는 음영과 컬러로 자신감 있는 이미지를 연출해 드립니다. 헤어 스타일링 기본 포함.', price: 70000 },
    { title: 'SFX 특수 메이크업', description: '할로윈, 코스프레, 영상 촬영을 위한 특수 메이크업! 좀비, 상처, 판타지 캐릭터까지 무엇이든 가능합니다. 포트폴리오 상담 후 진행.', price: 150000 },
  ],
  'hair-styling': [
    { title: '출장 헤어 스타일링', description: '결혼식, 졸업식, 파티 등 특별한 날 원하시는 장소로 출장 방문합니다. 업스타일, 다운스타일, 반머리 등 다양한 스타일 가능. 액세서리 제공.', price: 120000 },
    { title: '웨딩 헤어 스타일링', description: '신부님의 드레스와 컨셉에 맞는 우아한 헤어스타일을 연출해 드립니다. 본식 + 리허설 패키지 할인. 헤어 액세서리 무료 대여.', price: 200000 },
    { title: '남성 헤어컷 & 스타일링', description: '트렌디한 남성 헤어스타일을 제안합니다. 두상과 얼굴형에 맞는 맞춤 커트. 투블럭, 리젠트, 포마드 스타일링까지 토탈 케어.', price: 40000 },
    { title: '두피 & 탈모 관리 프로그램', description: '두피 분석 및 맞춤형 탈모 관리 프로그램. 20년 경력 두피 전문가가 직접 상담하고 관리합니다. 홈케어 제품 추천 포함.', price: 80000 },
    { title: '펌 & 염색 전문샵', description: '손상 최소화! 프리미엄 펌 & 염색 서비스. 에어리펌, 히피펌, 볼륨펌 등 최신 트렌드 스타일. 발색 좋은 고급 염색약 사용.', price: 130000 },
  ],
  'styling-consulting': [
    { title: '옷장 정리 & 스타일링', description: '옷장 속 옷으로 새로운 스타일링! 불필요한 옷 정리, 기존 옷 활용 코디 제안. 계절별 캡슐 워드로브 구성 방법까지 알려드립니다.', price: 150000 },
    { title: '쇼핑 동행 스타일링', description: '함께 쇼핑하며 나만의 스타일을 완성해드립니다. 체형과 예산에 맞는 쇼핑 가이드. 백화점, SPA 브랜드, 빈티지샵 등 원하는 곳 어디든!', price: 180000 },
    { title: '면접 & 비즈니스 스타일링', description: '첫인상이 중요한 순간! 면접, 프레젠테이션, 비즈니스 미팅을 위한 전문 스타일링. 업종에 맞는 이미지 컨설팅 포함.', price: 130000 },
    { title: '데이트 & 소개팅 스타일링', description: '소중한 만남을 위한 특별한 준비! 퍼스널 컬러, 체형에 맞는 데이트룩 제안. 액세서리, 향수까지 토탈 스타일링.', price: 100000 },
    { title: '시즌별 코디 컨설팅', description: '봄/여름/가을/겨울 계절에 맞는 코디 가이드. 트렌드 분석 + 개인 스타일 제안. 온라인 팔로업 1개월 무료.', price: 120000 },
  ],
  'personal-color': [
    { title: '퍼스널 컬러 진단 (프리미엄)', description: '나에게 어울리는 컬러를 찾아드립니다. 봄웜/여름쿨/가을웜/겨울쿨 상세 진단. 베스트/워스트 컬러 팔레트 제공. 메이크업, 헤어, 패션 컬러 가이드 포함.', price: 120000 },
    { title: '웜톤 컬러 컨설팅', description: '웜톤 확정자를 위한 심화 컨설팅! 봄웜/가을웜 세부 진단. 웜톤에 어울리는 립, 아이섀도우, 의류 색상 상세 가이드.', price: 90000 },
    { title: '쿨톤 컬러 컨설팅', description: '쿨톤 확정자를 위한 심화 컨설팅! 여름쿨/겨울쿨 세부 진단. 쿨톤에 어울리는 메이크업, 패션 컬러 집중 분석.', price: 90000 },
    { title: '퍼스널 컬러 메이크업', description: '퍼스널 컬러에 맞는 메이크업을 직접 배워보세요. 진단 + 메이크업 레슨 + 화장품 추천 리스트까지 원스톱 서비스.', price: 150000 },
    { title: '헤어 컬러 컨설팅', description: '퍼스널 컬러에 맞는 최적의 헤어 컬러를 찾아드립니다. 염색 색상 추천, 헤어 살롱 동행 서비스 가능. 홈케어 방법 안내.', price: 80000 },
  ],
};

async function main() {
  console.log('🎨 뷰티/패션 테스트 데이터 전체 생성 시작...\n');

  // 1. 기존 판매자 확인
  const { data: existingSellers } = await supabase
    .from('sellers')
    .select('id, user_id')
    .limit(100);

  const existingCount = existingSellers?.length || 0;
  console.log(`👤 기존 판매자 수: ${existingCount}`);


  // 2. 기존 사용자 중 판매자 등록 안된 경우 처리
  console.log('\n🔧 기존 뷰티 테스트 사용자에서 판매자 등록...');

  // 이미 생성된 테스트 사용자들 조회
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const testUsers = authUsers?.users?.filter(u =>
    u.email?.includes('beauty-seller') && u.email?.includes('@test.dolpagu.com')
  ) || [];

  console.log(`  📧 뷰티 테스트 사용자 수: ${testUsers.length}`);

  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    const idx = parseInt(user.email.match(/beauty-seller-(\d+)/)?.[1] || '0') - 1;
    const name = SELLER_NAMES[idx] || `뷰티 전문가 ${idx + 1}`;
    const loc = LOCATIONS[idx % LOCATIONS.length];

    // 이미 판매자로 등록됐는지 확인
    const { data: existingSeller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingSeller) {
      console.log(`  ⏭️ 이미 판매자: ${user.email}`);
      continue;
    }

    // profiles 테이블에 이름 업데이트
    await supabase
      .from('profiles')
      .update({ name })
      .eq('user_id', user.id);

    // sellers 테이블에 판매자 생성
    const { error: sellerError } = await supabase
      .from('sellers')
      .insert({
        user_id: user.id,
        is_verified: true,
        verification_status: 'approved',
        is_active: true,
        status: 'active',
        location_address: loc.address,
        location_latitude: loc.lat,
        location_longitude: loc.lng,
        location_region: loc.region,
        location_updated_at: new Date().toISOString(),
      });

    if (sellerError) {
      console.log(`  ⚠️ 판매자 생성 실패 (${user.email}):`, sellerError.message);
    } else {
      console.log(`  ✅ 판매자 등록: ${name} (${loc.region})`);
    }
  }

  // 3. 기존 판매자 위치 업데이트 (위치 없는 경우)
  const { data: sellersWithoutLoc } = await supabase
    .from('sellers')
    .select('id')
    .is('location_latitude', null)
    .limit(25);

  if (sellersWithoutLoc && sellersWithoutLoc.length > 0) {
    console.log(`\n📍 ${sellersWithoutLoc.length}명의 판매자 위치 정보 업데이트 중...`);
    for (let i = 0; i < sellersWithoutLoc.length; i++) {
      const loc = LOCATIONS[i % LOCATIONS.length];
      await supabase
        .from('sellers')
        .update({
          location_address: loc.address,
          location_latitude: loc.lat,
          location_longitude: loc.lng,
          location_region: loc.region,
          location_updated_at: new Date().toISOString(),
        })
        .eq('id', sellersWithoutLoc[i].id);
    }
  }

  // 4. 모든 판매자 조회
  const { data: allSellers } = await supabase
    .from('sellers')
    .select('id, location_region')
    .not('location_latitude', 'is', null)
    .order('created_at')
    .limit(25);

  if (!allSellers || allSellers.length === 0) {
    console.log('❌ 판매자가 없습니다.');
    return;
  }

  console.log(`\n👤 총 판매자 수 (위치 정보 있음): ${allSellers.length}`);

  // 5. 카테고리 ID 조회
  console.log('\n📂 카테고리 조회 중...');
  const categoryIds = {};

  for (const slug of Object.keys(SERVICES_DATA)) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id, name, parent_id')
      .eq('slug', slug)
      .single();

    if (cat) {
      categoryIds[slug] = { id: cat.id, name: cat.name, parentId: cat.parent_id };
      console.log(`  ✅ ${slug}: ${cat.name}`);
    } else {
      console.log(`  ❌ ${slug}: 찾을 수 없음`);
    }
  }

  // 상위 카테고리 ID 조회 (beauty-fashion)
  const { data: beautyCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'beauty-fashion')
    .single();

  // 6. 서비스 생성
  console.log('\n🛠️ 서비스 생성 중...');
  let totalCreated = 0;
  let sellerIndex = 0;

  for (const [catSlug, services] of Object.entries(SERVICES_DATA)) {
    const catInfo = categoryIds[catSlug];
    if (!catInfo) {
      console.log(`  ⚠️ 카테고리 '${catSlug}' 스킵`);
      continue;
    }

    console.log(`\n  📁 ${catInfo.name} (${catSlug}):`);

    for (const service of services) {
      const seller = allSellers[sellerIndex % allSellers.length];
      sellerIndex++;

      // 중복 체크
      const { data: existing } = await supabase
        .from('services')
        .select('id')
        .eq('title', service.title)
        .eq('seller_id', seller.id)
        .single();

      if (existing) {
        console.log(`    ⏭️ 이미 존재: ${service.title}`);
        continue;
      }

      // 서비스 생성 (delivery_days 필수)
      const { data: newService, error: serviceError } = await supabase
        .from('services')
        .insert({
          title: service.title,
          description: service.description,
          price: service.price,
          seller_id: seller.id,
          status: 'active',
          delivery_method: 'offline',
          delivery_days: 1, // 당일 또는 1일 소요
          thumbnail_url: `https://picsum.photos/seed/${catSlug}${sellerIndex}/400/300`,
        })
        .select('id')
        .single();

      if (serviceError) {
        console.log(`    ❌ 생성 실패: ${service.title}`, serviceError.message);
        continue;
      }

      // 3차 카테고리 연결
      await supabase.from('service_categories').insert({
        service_id: newService.id,
        category_id: catInfo.id,
      });

      // 2차 카테고리 연결 (있으면)
      if (catInfo.parentId) {
        await supabase.from('service_categories').insert({
          service_id: newService.id,
          category_id: catInfo.parentId,
        });
      }

      // 1차 카테고리 연결 (beauty-fashion)
      if (beautyCategory) {
        await supabase.from('service_categories').insert({
          service_id: newService.id,
          category_id: beautyCategory.id,
        });
      }

      totalCreated++;
      console.log(`    ✅ ${service.title} (${seller.location_region})`);
    }
  }

  console.log(`\n🎉 완료! 총 ${totalCreated}개의 서비스가 생성되었습니다.`);
  console.log('\n📱 테스트 URL:');
  console.log('  - 뷰티/패션 전체: /categories/beauty-fashion?lat=37.5730&lng=126.9794');
  console.log('  - 네일아트: /categories/nail-art?lat=37.5730&lng=126.9794');
  console.log('  - 메이크업: /categories/makeup?lat=37.5730&lng=126.9794');
}

main().catch(console.error);
