const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bpvfkkrlyrjkwgwmfrci.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3MTYsImV4cCI6MjA3Njk1NDcxNn0.luCRwnwQVctX3ewuSjhkQJ6veanWqa2NgivpDI7_Gl4'
);

(async () => {
  // 직접 SQL 실행
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      INSERT INTO public.admins (user_id, role, department)
      SELECT id, 'super_admin', 'Management'
      FROM auth.users
      WHERE email = 'ohyus1197@gmail.com'
      ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin'
      RETURNING *;
    `
  });

  if (error) {
    console.log('Error:', error);
    console.log('\n❌ RPC function not available. Please run this SQL in Supabase Studio:');
    console.log(`
INSERT INTO public.admins (user_id, role, department)
SELECT id, 'super_admin', 'Management'
FROM auth.users
WHERE email = 'ohyus1197@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
    `);
  } else {
    console.log('✅ Successfully added super_admin:', data);
  }
})();
