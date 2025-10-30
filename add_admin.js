const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bpvfkkrlyrjkwgwmfrci.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3MTYsImV4cCI6MjA3Njk1NDcxNn0.luCRwnwQVctX3ewuSjhkQJ6veanWqa2NgivpDI7_Gl4'
);

(async () => {
  // 1. user_id 찾기
  console.log('Finding user...');
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'ohyus1197@gmail.com')
    .single();

  if (userError || !userData) {
    console.log('User not found:', userError);
    return;
  }

  console.log('User ID:', userData.id);

  // 2. admins 테이블에 추가
  console.log('Adding to admins table...');
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .insert({
      user_id: userData.id,
      role: 'super_admin',
      department: 'Management'
    })
    .select();

  if (adminError) {
    console.log('Admin insert error:', adminError);
  } else {
    console.log('✅ Successfully added as super_admin!');
    console.log('Admin data:', adminData);
  }
})();
