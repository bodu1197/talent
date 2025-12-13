/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 ohy7@gmail.com 판매자 서비스 생성');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. ohy7@gmail.com 사용자 찾기
    console.log('📂 사용자 조회 중...\n');
    const {
      data: { users },
    } = await supabase.auth.admin.listUsers();
    const ohy7User = users.find((u) => u.email === 'ohy7@gmail.com');

    if (!ohy7User) {
      throw new Error('ohy7@gmail.com 사용자를 찾을 수 없습니다');
    }

    console.log(`✓ 사용자 발견: ${ohy7User.email} (ID: ${ohy7User.id})\n`);

    // 2. 판매자 확인
    const { data: seller } = await supabase
      .from('sellers')
      .select('id, business_name')
      .eq('user_id', ohy7User.id)
      .single();

    if (!seller) {
      throw new Error('판매자 정보를 찾을 수 없습니다');
    }

    console.log(`✓ 판매자 발견: ${seller.business_name} (ID: ${seller.id})\n`);

    // 3. 카테고리 찾기
    const { data: aiCategory } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', 'ai-ad-material-design')
      .single();

    const { data: rhymixCategory } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', 'rhymix')
      .single();

    if (!aiCategory || !rhymixCategory) {
      throw new Error('카테고리를 찾을 수 없습니다');
    }

    console.log(`✓ AI 광고 소재 디자인 카테고리 발견 (ID: ${aiCategory.id})`);
    console.log(`✓ Rhymix 카테고리 발견 (ID: ${rhymixCategory.id})\n`);

    // 4. AI 광고 소재 디자인 서비스 20개 생성
    console.log('🎨 AI 광고 소재 디자인 서비스 생성 중...\n');
    let aiServicesCreated = 0;

    for (let i = 1; i <= 20; i++) {
      const price = Math.floor(crypto.randomInt(49) + 1) * 10000;
      const deliveryDays = Math.floor(crypto.randomInt(30)) + 1;
      const revisionCount = Math.floor(crypto.randomInt(6));

      // 서비스 생성
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .insert({
          seller_id: seller.id,
          title: `${aiCategory.name} 전문 서비스 #${i}`,
          description: `고품질 ${aiCategory.name} 서비스를 제공합니다. AI 기술을 활용한 최신 광고 소재를 제작합니다.`,
          price: price,
          thumbnail_url: `https://picsum.photos/seed/ai_${seller.id}_${i}/400/300`,
          delivery_days: deliveryDays,
          revision_count: revisionCount,
          status: 'active',
        })
        .select()
        .single();

      if (serviceError) throw serviceError;

      // 카테고리 연결
      const { error: categoryError } = await supabase.from('service_categories').insert({
        service_id: service.id,
        category_id: aiCategory.id,
        is_primary: true,
      });

      if (categoryError) throw categoryError;

      aiServicesCreated++;
      if (aiServicesCreated % 5 === 0) {
        console.log(`  ✓ ${aiServicesCreated}/20 서비스 생성 완료...`);
      }
    }

    console.log(`\n✓ AI 광고 소재 디자인 서비스 ${aiServicesCreated}개 생성 완료\n`);

    // 5. Rhymix 서비스 20개 생성
    console.log('🔧 Rhymix 서비스 생성 중...\n');
    let rhymixServicesCreated = 0;

    for (let i = 1; i <= 20; i++) {
      const price = Math.floor(crypto.randomInt(49) + 1) * 10000;
      const deliveryDays = Math.floor(crypto.randomInt(30)) + 1;
      const revisionCount = Math.floor(crypto.randomInt(6));

      // 서비스 생성
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .insert({
          seller_id: seller.id,
          title: `${rhymixCategory.name} 전문 서비스 #${i}`,
          description: `전문적인 ${rhymixCategory.name} 개발 및 커스터마이징 서비스를 제공합니다.`,
          price: price,
          thumbnail_url: `https://picsum.photos/seed/rhymix_${seller.id}_${i}/400/300`,
          delivery_days: deliveryDays,
          revision_count: revisionCount,
          status: 'active',
        })
        .select()
        .single();

      if (serviceError) throw serviceError;

      // 카테고리 연결
      const { error: categoryError } = await supabase.from('service_categories').insert({
        service_id: service.id,
        category_id: rhymixCategory.id,
        is_primary: true,
      });

      if (categoryError) throw categoryError;

      rhymixServicesCreated++;
      if (rhymixServicesCreated % 5 === 0) {
        console.log(`  ✓ ${rhymixServicesCreated}/20 서비스 생성 완료...`);
      }
    }

    console.log(`\n✓ Rhymix 서비스 ${rhymixServicesCreated}개 생성 완료\n`);

    // 6. 최종 결과
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`📊 생성된 서비스:`);
    console.log(`   ${aiCategory.name}: ${aiServicesCreated}개`);
    console.log(`   ${rhymixCategory.name}: ${rhymixServicesCreated}개`);
    console.log(`   총: ${aiServicesCreated + rhymixServicesCreated}개`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('\n❌ 에러:', error);
    process.exit(1);
  }
}

main();
