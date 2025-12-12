/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
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

// Auth 사용자 생성
async function createAuthUser(email, password, name) {
  try {
    const response = await fetch(AUTH_ADMIN_URL, {
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

    const data = await response.json();

    if (!response.ok) {
      if (data.msg && data.msg.includes('already been registered')) {
        return { exists: true, email };
      }
      throw new Error(data.msg || JSON.stringify(data));
    }

    return { user_id: data.id, email: data.email };
  } catch (error) {
    console.error('Auth user creation error:', error.message);
    throw error;
  }
}

// Seller 생성
async function createSeller(userId, categoryName) {
  const businessName = `${categoryName} 전문가`;
  const bio = `${categoryName} 분야의 전문가입니다. 고품질 서비스를 제공합니다.`;

  const { error } = await supabase
    .from('sellers')
    .insert({
      user_id: userId,
      business_name: businessName,
      bio: bio,
      status: 'active',
      is_active: true,
      verification_status: 'verified',
      is_verified: true
    })
    .select()
    .single();

  if (error) throw error;

  return data.id;
}

// Services 생성
async function createServices(sellerId, categoryId, categoryName) {
  let createdCount = 0;

  for (let i = 1; i <= 3; i++) {
    const price = Math.floor(crypto.randomInt(49) + 1) * 10000;
    const deliveryDays = Math.floor(crypto.randomInt(30)) + 1;
    const revisionCount = Math.floor(crypto.randomInt(6));

    // 1. 서비스 생성
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert({
        seller_id: sellerId,
        title: `${categoryName} 서비스 #${i}`,
        description: `전문적인 ${categoryName} 서비스를 제공합니다. 고객 만족을 최우선으로 합니다.`,
        price: price,
        thumbnail_url: `https://picsum.photos/seed/${categoryId}_${sellerId}_${i}/400/300`,
        delivery_days: deliveryDays,
        revision_count: revisionCount,
        status: 'active'
      })
      .select()
      .single();

    if (serviceError) throw serviceError;

    // 2. service_categories에 관계 추가
    const { error: categoryError } = await supabase
      .from('service_categories')
      .insert({
        service_id: service.id,
        category_id: categoryId,
        is_primary: true
      });

    if (categoryError) throw categoryError;

    createdCount++;
  }

  return createdCount;
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 IT 카테고리 판매자 및 서비스 생성 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const stats = {
    usersCreated: 0,
    sellersCreated: 0,
    servicesCreated: 0,
    errors: []
  };

  try {
    // 1. IT 최상위 카테고리 찾기
    console.log('📂 IT 카테고리 조회 중...\n');

    const { data: itCategory } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', 'it-programming')
      .single();

    if (!itCategory) {
      throw new Error('IT 카테고리를 찾을 수 없습니다');
    }

    console.log(`✓ IT 카테고리 발견: ${itCategory.name} (ID: ${itCategory.id})\n`);

    // 2. IT 하위 카테고리 중 10개 선택
    const { data: itSubCategories } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('parent_id', itCategory.id)
      .limit(10);

    console.log(`✓ IT 하위 카테고리 ${itSubCategories.length}개 발견\n`);

    // 3. 각 카테고리마다 판매자 1명, 서비스 3개 생성
    for (let i = 0; i < itSubCategories.length; i++) {
      const category = itSubCategories[i];
      const email = `it_seller_${category.slug}@talent-demo.com`;
      // Development credential for local testing
const password = 'Demo1234!@';
      const name = `${category.name} 전문가`;

      console.log(`[${i + 1}/${itSubCategories.length}] ${category.name} 처리 중...`);

      try {
        // 사용자 생성 또는 기존 사용자 찾기
        const authResult = await createAuthUser(email, password, name);
        let userId;

        if (authResult.exists) {
          console.log(`  ⏭️  사용자 이미 존재: ${email}`);

          // 기존 사용자 ID 찾기
          const { data: users } = await supabase.auth.admin.listUsers();
          const existingUser = users.users.find(u => u.email === email);

          if (!existingUser) {
            throw new Error('사용자를 찾을 수 없습니다');
          }

          userId = existingUser.id;
        } else {
          console.log(`  ✓ 사용자 생성: ${email}`);
          stats.usersCreated++;
          userId = authResult.user_id;
        }

        // 기존 판매자 확인
        const { data: existingSeller } = await supabase
          .from('sellers')
          .select('id')
          .eq('user_id', userId)
          .single();

        let sellerId;
        if (existingSeller) {
          console.log(`  ✓ 기존 판매자 사용 (ID: ${existingSeller.id})`);
          sellerId = existingSeller.id;
        } else {
          // Seller 생성
          sellerId = await createSeller(userId, category.name);
          console.log(`  ✓ 판매자 생성 (ID: ${sellerId})`);
          stats.sellersCreated++;
        }

        // Services 생성
        const serviceCount = await createServices(sellerId, category.id, category.name);
        console.log(`  ✓ 서비스 ${serviceCount}개 생성\n`);
        stats.servicesCreated += serviceCount;

      } catch (error) {
        console.error(`  ❌ 에러: ${error.message}\n`);
        stats.errors.push({
          category: category.name,
          error: error.message
        });
      }
    }

    // 4. 최종 결과
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`📊 최종 통계:`);
    console.log(`   사용자 생성: ${stats.usersCreated}명`);
    console.log(`   판매자 생성: ${stats.sellersCreated}명`);
    console.log(`   서비스 생성: ${stats.servicesCreated}개`);
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

main();
