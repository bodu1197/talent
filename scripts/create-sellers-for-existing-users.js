require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 통계
const stats = {
  totalCategories: 0,
  sellersCreated: 0,
  sellersFailed: 0,
  servicesCreated: 0,
  errors: []
};

// 딜레이 함수
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. 최하위 카테고리 로드
async function loadLeafCategories() {
  console.log('\n📂 최하위 카테고리 로딩 중...\n');

  const { data: allCategories, error: allError } = await supabase
    .from('categories')
    .select('id, name, parent_id, slug')
    .order('id');

  if (allError) throw allError;

  // 최하위 카테고리 (자식이 없는 카테고리)
  const childIds = new Set(allCategories.map(c => c.parent_id).filter(Boolean));
  const leafCategories = allCategories.filter(c => !childIds.has(c.id));

  console.log(`✓ 최하위 카테고리 ${leafCategories.length}개 로드됨\n`);
  stats.totalCategories = leafCategories.length;

  return leafCategories;
}

// 2. Auth 사용자 목록 가져오기
async function getAllAuthUsers() {
  console.log('\n📂 Auth 사용자 로딩 중...\n');

  const { data: { users }, error } = await supabase.auth.admin.listUsers({
    perPage: 1000
  });

  if (error) throw error;

  // seller_로 시작하는 이메일만 필터
  const sellerUsers = users.filter(u => u.email?.startsWith('seller_'));

  console.log(`✓ 판매자 계정 ${sellerUsers.length}개 발견\n`);

  return sellerUsers;
}

// 3. Seller 생성
async function createSeller(userId, categoryId, categoryName, categorySlug) {
  const businessName = `${categoryName} 스튜디오`;
  const bio = `${categoryName} 분야의 전문가입니다. 고객 만족을 최우선으로 생각하며, 최고의 품질을 제공합니다.`;

  const { data, error} = await supabase
    .from('sellers')
    .insert({
      user_id: userId,
      business_name: businessName,
      bio: bio,
      status: 'active',
      is_active: true,
      verification_status: 'pending',
      is_verified: false
    })
    .select()
    .single();

  if (error) throw error;

  return data.id;
}

// 4. Services 생성
async function createServices(sellerId, categoryId, categoryName, count = 10) {
  const services = [];

  for (let i = 1; i <= count; i++) {
    const price = Math.floor(Math.random() * 49 + 1) * 10000; // 10,000 ~ 500,000
    const deliveryDays = Math.floor(Math.random() * 30) + 1; // 1-30일
    const revisionCount = Math.floor(Math.random() * 6); // 0-5회

    services.push({
      seller_id: sellerId,
      category_id: categoryId,
      title: `${categoryName} 전문가의 고품질 서비스 #${i}`,
      description: `전문적인 ${categoryName} 서비스를 제공합니다. 10년 이상의 경력으로 최고의 품질을 보장합니다. 고객님의 만족을 위해 최선을 다하겠습니다.`,
      price: price,
      thumbnail_url: `https://picsum.photos/seed/${categoryId}_${i}/400/300`,
      delivery_days: deliveryDays,
      revision_count: revisionCount,
      status: 'active'
    });
  }

  const { error } = await supabase
    .from('services')
    .insert(services)
    .select();

  if (error) throw error;

  return data.length;
}

// 5. 단일 카테고리 처리
async function processCategory(category, user, index, total) {
  console.log(`[${index + 1}/${total}] ${category.name} 처리 중 (User: ${user.id.substring(0, 8)}...)...`);

  try {
    // 이미 판매자가 있는지 확인
    const { data: existingSeller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingSeller) {
      console.log(`  ⏭️  이미 판매자 존재: ${existingSeller.id}`);
      return;
    }

    // Seller 생성
    const sellerId = await createSeller(
      user.id,
      category.id,
      category.name,
      category.slug
    );
    console.log(`  ✓ 판매자 생성 (ID: ${sellerId})`);
    stats.sellersCreated++;

    // Services 생성
    const serviceCount = await createServices(
      sellerId,
      category.id,
      category.name,
      10
    );
    console.log(`  ✓ 서비스 ${serviceCount}개 생성\n`);
    stats.servicesCreated += serviceCount;

  } catch (error) {
    console.error(`  ❌ 에러: ${error.message}`);
    if (error.details) console.error(`  상세: ${error.details}`);
    if (error.hint) console.error(`  힌트: ${error.hint}`);
    stats.sellersFailed++;
    stats.errors.push({
      category: category.name,
      user: user.email,
      error: error.message,
      details: error.details || '',
      hint: error.hint || ''
    });
  }
}

// 6. 배치 처리
async function processBatch(categories, users, batchSize = 50) {
  const totalBatches = Math.ceil(Math.min(categories.length, users.length) / batchSize);
  const itemsToProcess = Math.min(categories.length, users.length);

  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, itemsToProcess);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📦 배치 ${i + 1}/${totalBatches} (${start + 1}~${end})`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    for (let j = start; j < end; j++) {
      await processCategory(categories[j], users[j], j, itemsToProcess);
      await delay(50); // Rate limit 방지
    }

    // 배치 간 딜레이
    if (i < totalBatches - 1) {
      console.log(`\n⏸️  배치 간 대기 중... (1초)\n`);
      await delay(1000);
    }
  }
}

// 7. 메인 함수
async function main() {
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 기존 사용자에 대한 판매자 및 서비스 생성 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const startTime = Date.now();

  try {
    // 1. 카테고리 로드
    const categories = await loadLeafCategories();

    // 2. 사용자 로드
    const users = await getAllAuthUsers();

    if (users.length === 0) {
      console.log('\n❌ 판매자 계정을 찾을 수 없습니다.');
      return;
    }

    // 3. 배치 처리
    await processBatch(categories, users, 50);

    // 4. 최종 결과
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`📊 최종 통계:`);
    console.log(`   총 카테고리: ${stats.totalCategories}개`);
    console.log(`   판매자 생성: ${stats.sellersCreated}개`);
    console.log(`   판매자 실패: ${stats.sellersFailed}개`);
    console.log(`   서비스 생성: ${stats.servicesCreated}개`);
    console.log(`   소요 시간: ${duration}분`);
    console.log('');

    if (stats.errors.length > 0) {
      console.log(`❌ 에러 목록 (${stats.errors.length}개):`);
      stats.errors.slice(0, 10).forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.category} (${err.user}): ${err.error}`);
      });
      if (stats.errors.length > 10) {
        console.log(`   ... 및 ${stats.errors.length - 10}개 더`);
      }
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ 치명적 에러:', error);
    process.exit(1);
  }
}

// 실행
main();
