require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function deleteAuthUser(userId) {
  const _response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY
    }
  });

  if (!response.ok && response.status !== 404) {
    const _data = await response.json();
    throw new Error(data.msg || 'Failed to delete user');
  }
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️  @talent-demo.com 회원 삭제');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. 전체 사용자 조회
    const { data: { users } } = await supabase.auth.admin.listUsers();
    console.log(`전체 사용자: ${users.length}명\n`);

    // 2. @talent-demo.com 사용자 필터링
    const demoUsers = users.filter(u => u.email?.endsWith('@talent-demo.com'));
    const realUsers = users.filter(u => !u.email?.endsWith('@talent-demo.com'));

    console.log(`실제 회원 (보존): ${realUsers.length}명`);
    realUsers.forEach(u => {
      console.log(`  - ${u.email}`);
    });

    console.log(`\n삭제 대상 (@talent-demo.com): ${demoUsers.length}명\n`);

    if (demoUsers.length === 0) {
      console.log('삭제할 사용자가 없습니다.\n');
      return;
    }

    // 3. 삭제 대상 사용자의 판매자 및 서비스 삭제
    const demoUserIds = demoUsers.map(u => u.id);

    console.log('🗑️  판매자 및 서비스 삭제 중...\n');

    // 판매자 찾기
    const { data: sellers } = await supabase
      .from('sellers')
      .select('id')
      .in('user_id', demoUserIds);

    if (sellers && sellers.length > 0) {
      const sellerIds = sellers.map(s => s.id);

      // 서비스 삭제
      const { data: deletedServices } = await supabase
        .from('services')
        .delete()
        .in('seller_id', sellerIds)
        .select();

      console.log(`✓ ${deletedServices?.length || 0}개의 서비스 삭제 완료`);

      // 판매자 삭제
      const { data: deletedSellers } = await supabase
        .from('sellers')
        .delete()
        .in('id', sellerIds)
        .select();

      console.log(`✓ ${deletedSellers?.length || 0}명의 판매자 삭제 완료\n`);
    }

    // 4. public.users 테이블에서도 삭제
    console.log('🗑️  public.users 테이블 정리 중...\n');

    const { data: deletedPublicUsers } = await supabase
      .from('users')
      .delete()
      .in('id', demoUserIds)
      .select();

    console.log(`✓ ${deletedPublicUsers?.length || 0}명의 public.users 삭제 완료\n`);

    // 5. Auth 사용자 삭제
    console.log('🗑️  Auth 사용자 삭제 중...\n');

    let deletedCount = 0;
    let failedCount = 0;

    for (const user of demoUsers) {
      try {
        await deleteAuthUser(user.id);
        deletedCount++;
        if (deletedCount % 50 === 0) {
          console.log(`  ${deletedCount}명 삭제 완료...`);
        }
      } catch (error) {
        console.error(`  ❌ ${user.email} 삭제 실패: ${error.message}`);
        failedCount++;
      }
    }

    console.log(`\n✓ ${deletedCount}명의 Auth 사용자 삭제 완료`);
    if (failedCount > 0) {
      console.log(`❌ ${failedCount}명의 Auth 사용자 삭제 실패\n`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 삭제 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`📊 최종 결과:`);
    console.log(`   남은 실제 회원: ${realUsers.length}명`);
    console.log(`   삭제된 사용자: ${deletedCount}명`);
    console.log('');
    console.log('남은 실제 회원:');
    realUsers.forEach((u, idx) => {
      console.log(`  ${idx + 1}. ${u.email}`);
    });
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ 치명적 에러:', error);
    process.exit(1);
  }
}

main();
