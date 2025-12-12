/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data: { users } } = await supabase.auth.admin.listUsers();

  console.log(`\n전체 사용자: ${users.length}명\n`);

  users.forEach((u, idx) => {
    const created = new Date(u.created_at).toISOString().split('T')[0];
    console.log(`${idx + 1}. ${u.email} (생성일: ${created})`);
  });
}

main();
