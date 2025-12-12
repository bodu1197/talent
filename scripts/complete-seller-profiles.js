const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 통계
const stats = {
  totalSellers: 0,
  updated: 0,
  failed: 0,
  errors: []
};

// 랜덤 전화번호 생성
function generatePhone() {
  const prefix = '010';
  const middle = Math.floor(crypto.randomInt(9000) + 1000); // 1000-9999
  const last = Math.floor(crypto.randomInt(9000) + 1000); // 1000-9999
  return `${prefix}-${middle}-${last}`;
}

// 랜덤 경력 생성 (1-15년)
function generateExperience() {
  return Math.floor(crypto.randomInt(15)) + 1;
}

// 카카오톡 ID 생성
function generateKakaoId(businessName) {
  const slug = businessName
    .replace(/\s+/g, '')
    .replace(/스튜디오/g, '')
    .toLowerCase();
  return `kakao_${slug}_${Math.floor(crypto.randomInt(999) + 1)}`;
}

// 웹사이트 생성
function generateWebsite(businessName) {
  const slug = businessName
    .replace(/\s+/g, '-')
    .replace(/스튜디오/g, 'studio')
    .toLowerCase();
  return `https://www.${slug}.com`;
}

// 자격증 생성
function generateCertificates(businessName) {
  const categoryName = businessName.replace(' 스튜디오', '');
  return [
    `${categoryName} 전문가 자격증`,
    `${categoryName} 실무 교육 수료증`,
    `서비스 품질 관리 인증`
  ];
}

// 영업 시간 생성
function _generateBusinessHours() {
  return {
    weekdays: '09:00-18:00',
    saturday: '10:00-15:00',
    sunday: '휴무'
  };
}

// 단일 판매자 프로필 업데이트
async function updateSellerProfile(seller, index, total) {
  console.log(`[${index + 1}/${total}] 판매자 프로필 업데이트 중: ${seller.business_name}...`);

  try {
    // business_name이 null인 경우 스킵
    if (!seller.business_name) {
      console.log(`  ⏭️  business_name이 null이므로 스킵\n`);
      return;
    }

    const phone = generatePhone();
    const kakaoId = generateKakaoId(seller.business_name);
    const website = generateWebsite(seller.business_name);
    const experience = generateExperience();
    const certificates = generateCertificates(seller.business_name);
    const contactHours = '평일 09:00-18:00, 토요일 10:00-15:00';

    // 더 상세한 bio 생성
    const enhancedBio = `${seller.business_name}입니다. ${experience}년의 풍부한 경력을 바탕으로 최고의 서비스를 제공합니다.

고객 만족을 최우선으로 생각하며, 전문성과 신뢰를 바탕으로 한 서비스를 약속드립니다.
다수의 프로젝트 경험을 통해 쌓은 노하우로 고객님의 니즈에 맞는 맞춤형 솔루션을 제공합니다.

[주요 경력]
- ${experience}년 이상의 실무 경험
- 100+ 프로젝트 성공적 완료
- 고객 만족도 평균 4.8/5.0

[보유 자격증]
${certificates.map(c => `- ${c}`).join('\n')}

[연락 가능 시간]
${contactHours}

언제든지 편하게 문의해 주세요!`;

    const { error} = await supabase
      .from('sellers')
      .update({
        bio: enhancedBio,
        phone: phone,
        show_phone: true,
        kakao_id: kakaoId,
        website: website,
        experience: experience.toString() + '년',
        contact_hours: contactHours
      })
      .eq('id', seller.id);

    if (error) throw error;

    console.log(`  ✓ 프로필 업데이트 완료 (경력: ${experience}년, 연락처: ${phone})\n`);
    stats.updated++;

  } catch (error) {
    console.error(`  ❌ 에러: ${error.message}\n`);
    stats.failed++;
    stats.errors.push({
      seller: seller.business_name || 'NULL',
      error: error.message
    });
  }
}

// 메인 함수
async function main() {
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 판매자 프로필 완성 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const startTime = Date.now();

  try {
    // 모든 판매자 가져오기
    console.log('\n📂 판매자 로딩 중...\n');
    const { data: sellers, error } = await supabase
      .from('sellers')
      .select('id, business_name, bio')
      .order('created_at', { ascending: true });

    if (error) throw error;

    stats.totalSellers = sellers.length;
    console.log(`✓ 총 ${sellers.length}명의 판매자 발견\n`);

    // 각 판매자 프로필 업데이트
    for (let i = 0; i < sellers.length; i++) {
      await updateSellerProfile(sellers[i], i, sellers.length);

      // Rate limit 방지
      if ((i + 1) % 10 === 0) {
        console.log(`⏸️  10명 업데이트 완료, 잠시 대기...\n`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // 최종 결과
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`📊 최종 통계:`);
    console.log(`   총 판매자: ${stats.totalSellers}명`);
    console.log(`   업데이트 성공: ${stats.updated}명`);
    console.log(`   업데이트 실패: ${stats.failed}명`);
    console.log(`   소요 시간: ${duration}분`);
    console.log('');

    if (stats.errors.length > 0) {
      console.log(`❌ 에러 목록 (${stats.errors.length}개):`);
      stats.errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.seller}: ${err.error}`);
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
