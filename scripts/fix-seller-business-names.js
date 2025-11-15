require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 판매자 business_name 복구');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 판매자 조회
  const { data: sellers } = await supabase
    .from('sellers')
    .select('id, business_name, user_id');

  console.log(`전체 판매자: ${sellers?.length}명\n`);

  for (const seller of sellers || []) {
    // user 정보 조회
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', seller.user_id)
      .single();

    const businessName = user?.name || user?.email?.split('@')[0] || '판매자';

    console.log(`판매자 ID: ${seller.id}`);
    console.log(`  기존: ${seller.business_name}`);
    console.log(`  수정: ${businessName}`);

    // business_name 업데이트
    const { error } = await supabase
      .from('sellers')
      .update({
        business_name: businessName
      })
      .eq('id', seller.id);

    if (error) {
      console.log(`  ❌ 업데이트 실패: ${error.message}\n`);
    } else {
      console.log(`  ✓ 업데이트 완료\n`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 완료!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main();
