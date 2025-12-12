const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AUTH_ADMIN_URL = `${SUPABASE_URL}/auth/v1/admin/users`;

// 통계
const stats = {
  totalCategories: 0,
  usersCreated: 0,
  usersSkipped: 0,
  usersFailed: 0,
  sellersCreated: 0,
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

// 2. Auth 사용자 생성
async function createAuthUser(email, password, name) {
  try {
    await fetch(AUTH_ADMIN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: name
        }
      })
    });

    await response.json();

    if (!response.ok) {
      // 이미 존재하는 사용자인 경우
      if (data.msg && data.msg.includes('already been registered')) {
        return { exists: true, email };
      }
      throw new Error(data.msg || JSON.stringify(data));
    }

    return { user_id: data.id, email: data.email };
  
}

// 3. Seller 생성
async function createSeller(userId, categoryId, categoryName, categorySlug) {
  const businessName = `${categoryName} 스튜디오`;
  const description = `${categoryName} 분야의 전문가입니다. 고객 만족을 최우선으로 생각하며, 최고의 품질을 제공합니다.`;
  const profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(categoryName)}&background=0f3460&color=fff&size=200`;

  const { error } = await supabase
    .from('sellers')
    .insert({
      user_id: userId,
      business_name: businessName,
      description: description,
      profile_image_url: profileImage,
      status: 'active'
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
    const price = Math.floor(crypto.randomInt(49) + 1) * 10000; // 10,000 ~ 500,000
    const deliveryDays = Math.floor(crypto.randomInt(30)) + 1; // 1-30일
    const revisionCount = Math.floor(crypto.randomInt(6)); // 0-5회

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
async function processCategory(category, index, total) {
  const email = `seller_${category.slug}@talent-demo.com`;
  // Development credential for local testing
const password = 'Demo1234!@';
  const name = `${category.name} 전문가`;

  console.log(`[${index + 1}/${total}] ${category.name} 처리 중...`);

  try {
    // 사용자 생성
    const authResult = await createAuthUser(email, password, name);

    if (authResult.exists) {
      console.log(`  ⏭️  사용자 이미 존재: ${email}`);
      stats.usersSkipped++;

      // 기존 사용자는 건너뛰기 (이미 판매자가 생성되었을 가능성)
      return;
    } else {
      console.log(`  ✓ 사용자 생성: ${email}`);
      stats.usersCreated++;
    }

    await delay(100); // Rate limit 방지

    // Seller 생성 (에러 상세 출력)
    try {
      const sellerId = await createSeller(
        authResult.user_id,
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
    } catch (sellerError) {
      console.error(`  ❌ 판매자/서비스 생성 실패: ${sellerError.message}`);
      console.error(`  상세:`, JSON.stringify(sellerError, null, 2));
      throw sellerError;
    }

  } catch (error) {
    console.error(`  ❌ 에러: ${error.message}\n`);
    if (error.details) console.error(`  상세: ${error.details}`);
    if (error.hint) console.error(`  힌트: ${error.hint}`);
    stats.usersFailed++;
    stats.errors.push({
      category: category.name,
      error: error.message,
      details: error.details || '',
      hint: error.hint || ''
    });
  }
}

// 6. 배치 처리
async function processBatch(categories, batchSize = 50) {
  const totalBatches = Math.ceil(categories.length / batchSize);

  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, categories.length);
    const batch = categories.slice(start, end);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📦 배치 ${i + 1}/${totalBatches} (${start + 1}~${end})`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    for (let j = 0; j < batch.length; j++) {
      await processCategory(batch[j], start + j, categories.length);
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
  console.log('🚀 판매자 및 서비스 데이터 생성 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const startTime = Date.now();

  try {
    // 1. 카테고리 로드
    const categories = await loadLeafCategories();

    // 2. 배치 처리
    await processBatch(categories, 50);

    // 3. 최종 결과
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`📊 최종 통계:`);
    console.log(`   총 카테고리: ${stats.totalCategories}개`);
    console.log(`   사용자 생성: ${stats.usersCreated}개`);
    console.log(`   사용자 스킵: ${stats.usersSkipped}개`);
    console.log(`   사용자 실패: ${stats.usersFailed}개`);
    console.log(`   판매자 생성: ${stats.sellersCreated}개`);
    console.log(`   서비스 생성: ${stats.servicesCreated}개`);
    console.log(`   소요 시간: ${duration}분`);
    console.log('');

    if (stats.errors.length > 0) {
      console.log(`❌ 에러 목록 (${stats.errors.length}개):`);
      stats.errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.category}: ${err.error}`);
      });
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
