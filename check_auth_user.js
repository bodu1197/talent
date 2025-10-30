const { createClient } = require('@supabase/supabase-js');

// Service role key로 auth.users 접근
const supabase = createClient(
  'https://bpvfkkrlyrjkwgwmfrci.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3MTYsImV4cCI6MjA3Njk1NDcxNn0.luCRwnwQVctX3ewuSjhkQJ6veanWqa2NgivpDI7_Gl4'
);

(async () => {
  console.log('Checking all tables for user...');

  // auth.users는 직접 조회 불가능하므로 public.users를 확인
  const { data: allUsers, error } = await supabase
    .from('users')
    .select('id, email, name')
    .limit(10);

  console.log('First 10 users in public.users:');
  console.log(allUsers);

  if (error) {
    console.log('Error:', error);
  }

  // ohyus1197@gmail.com 검색
  const { data: targetUser, error: searchError } = await supabase
    .from('users')
    .select('id, email, name')
    .ilike('email', '%ohyus1197%');

  console.log('\nSearching for ohyus1197:');
  console.log(targetUser);
})();
