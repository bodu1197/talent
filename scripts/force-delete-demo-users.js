/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️  강제 삭제: @talent-demo.com 회원');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Auth 사용자 조회
    const { data: { users } } = await supabase.auth.admin.listUsers();
    console.log(`전체 사용자: ${users.length}명\n`);

    // 2. @talent-demo.com 사용자 필터링
    const demoUsers = users.filter(u => u.email?.endsWith('@talent-demo.com'));

    console.log(`삭제 대상: ${demoUsers.length}명\n`);

    if (demoUsers.length === 0) {
      console.log('삭제할 사용자가 없습니다.\n');
      return;
    }

    // 3. 하나씩 삭제
    let successCount = 0;
    let failCount = 0;

    for (const user of demoUsers) {
      try {
        const { error } = await supabase.auth.admin.deleteUser(user.id);

        if (error) {
          console.error(`  ❌ ${user.email}: ${error.message}`);
          failCount++;
        } else {
          successCount++;
          if (successCount % 10 === 0) {
            console.log(`  ✓ ${successCount}명 삭제 완료...`);
          }
        }
      } catch (err) {
        console.error(`  ❌ ${user.email}: ${err.message}`);
        failCount++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   성공: ${successCount}명`);
    console.log(`   실패: ${failCount}명`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 4. 재확인
    const { data: { users: remainingUsers } } = await supabase.auth.admin.listUsers();
    console.log(`남은 전체 사용자: ${remainingUsers.length}명\n`);

    remainingUsers.forEach((u, idx) => {
      console.log(`  ${idx + 1}. ${u.email}`);
    });
    console.log('');

  } catch (error) {
    console.error('\n❌ 에러:', error);
    process.exit(1);
  }
}

main();
