require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  // 특정 서비스의 찜 개수 확인
  const serviceId = 'f7f8fb66-2c50-40b2-967d-342bb8c13074';

  const { data: service } = await supabase
    .from('services')
    .select('id, title, wishlist_count')
    .eq('id', serviceId)
    .single();

  console.log('Service:', service);

  // 실제 service_favorites 테이블의 개수
  const { data: favorites, count } = await supabase
    .from('service_favorites')
    .select('*', { count: 'exact' })
    .eq('service_id', serviceId);

  console.log('\nActual favorites count in table:', count);
  console.log('wishlist_count in services table:', service?.wishlist_count);

  if (count !== service?.wishlist_count) {
    console.log('\n⚠️  Mismatch detected! Updating...');
    const { error } = await supabase
      .from('services')
      .update({ wishlist_count: count })
      .eq('id', serviceId);

    if (error) {
      console.error('Update failed:', error);
    } else {
      console.log('✅ Updated wishlist_count to', count);
    }
  } else {
    console.log('\n✅ Counts match!');
  }
}

check().catch(console.error);
