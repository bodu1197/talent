require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  console.log('🔍 Checking database data...\n');

  // Check sellers
  const { data: sellers, error: sellersError } = await supabase
    .from('sellers')
    .select('id, user_id')
    .limit(5);

  console.log('📊 Sellers:');
  console.log(JSON.stringify(sellers, null, 2));
  if (sellersError) console.log('Error:', sellersError);

  // Check services
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('id, title, seller_id, status, deleted_at')
    .eq('status', 'active')
    .is('deleted_at', null)
    .limit(10);

  console.log('\n📊 Services (active, not deleted):');
  console.log(JSON.stringify(services, null, 2));
  if (servicesError) console.log('Error:', servicesError);

  // Check if there's a mismatch
  if (sellers && sellers.length > 0 && services && services.length > 0) {
    const sellerIds = new Set(sellers.map(s => s.id));
    const servicesMatchingSellers = services.filter(svc => sellerIds.has(svc.seller_id));

    console.log('\n🔗 Services matching sellers:', servicesMatchingSellers.length);
    console.log('Seller IDs:', Array.from(sellerIds));
    console.log('Service seller_ids:', services.map(s => s.seller_id));
  }
}

checkData().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
