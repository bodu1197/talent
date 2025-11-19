require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('Checking advertising subscriptions...\n');

  const { data, error } = await supabase
    .from('advertising_subscriptions')
    .select('id, seller_id, service_id, status, total_impressions, total_clicks, created_at')
    .in('status', ['active', 'pending_payment']);

  if (error) {
    console.error('Error:', JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log('Active/Pending advertising subscriptions:');
  console.log(JSON.stringify(data, null, 2));
  console.log('\n📊 Total count:', data?.length || 0);

  if (data && data.length > 0) {
    console.log('\n✅ Found advertising subscriptions!');
    console.log('Statistics summary:');
    data.forEach((sub, index) => {
      console.log(`  ${index + 1}. Subscription ${sub.id.substring(0, 8)}...`);
      console.log(`     - Status: ${sub.status}`);
      console.log(`     - Impressions: ${sub.total_impressions}`);
      console.log(`     - Clicks: ${sub.total_clicks}`);
    });
  } else {
    console.log('\n⚠️  No active advertising subscriptions found!');
  }
})();
