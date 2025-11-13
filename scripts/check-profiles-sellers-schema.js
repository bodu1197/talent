const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkSchema() {
  console.log('Checking profiles and sellers table schemas...\n');

  // Check profiles table
  console.log('=== PROFILES TABLE ===');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (profileError) {
    console.log('❌ Error fetching profiles:', profileError.message);
  } else if (profileData && profileData.length > 0) {
    console.log('Columns:', Object.keys(profileData[0]).join(', '));
    console.log('Sample data:', JSON.stringify(profileData[0], null, 2));
  } else {
    console.log('⚠️  profiles table is empty');
  }

  console.log('\n=== SELLERS TABLE ===');
  const { data: sellerData, error: sellerError } = await supabase
    .from('sellers')
    .select('*')
    .limit(1);

  if (sellerError) {
    console.log('❌ Error fetching sellers:', sellerError.message);
  } else if (sellerData && sellerData.length > 0) {
    console.log('Columns:', Object.keys(sellerData[0]).join(', '));
    console.log('Sample data:', JSON.stringify(sellerData[0], null, 2));
  } else {
    console.log('⚠️  sellers table is empty');
  }

  // Check auth.users metadata
  console.log('\n=== AUTH.USERS METADATA ===');
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError) {
    console.log('❌ Error fetching users:', usersError.message);
  } else if (users && users.length > 0) {
    console.log('First user metadata:', JSON.stringify(users[0].user_metadata, null, 2));
  } else {
    console.log('⚠️  No users found');
  }
}

checkSchema();
