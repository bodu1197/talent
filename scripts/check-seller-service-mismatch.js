require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 판매자-서비스 불일치 확인');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 판매자 목록
  const { data: sellers } = await supabase
    .from('sellers')
    .select('id, business_name, user_id');

  console.log(`전체 판매자: ${sellers?.length}명\n`);
  const sellerIds = sellers?.map(s => s.id) || [];

  sellers?.forEach(s => {
    console.log(`- ${s.business_name} (ID: ${s.id})`);
  });

  // 서비스 목록
  const { data: services } = await supabase
    .from('services')
    .select('id, title, seller_id');

  console.log(`\n전체 서비스: ${services?.length}개\n`);

  // seller_id가 실제 판매자 목록에 없는 서비스 찾기
  const orphanedServices = services?.filter(s => !sellerIds.includes(s.seller_id)) || [];

  console.log(`판매자가 없는 서비스: ${orphanedServices.length}개\n`);

  if (orphanedServices.length > 0) {
    console.log('삭제된 판매자의 서비스 목록 (처음 10개):');
    orphanedServices.slice(0, 10).forEach((s, i) => {
      console.log(`${i + 1}. ${s.title}`);
      console.log(`   seller_id: ${s.seller_id} (존재하지 않음)\n`);
    });
  }

  // 판매자별 서비스 개수
  console.log('\n판매자별 서비스 개수:');
  for (const seller of sellers || []) {
    const serviceCount = services?.filter(s => s.seller_id === seller.id).length || 0;
    console.log(`- ${seller.business_name}: ${serviceCount}개`);
  }
}

main();
