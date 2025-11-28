const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path:'.env.local'});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPageViews() {
  const { data, error } = await supabase
    .from('page_views')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Recent page views (last 10):');
  console.log('================================');

  for (const pv of data) {
    console.log('Path:', pv.path);
    console.log('Device:', pv.device_type);
    console.log('Time:', pv.created_at);
    console.log('---');
  }

  // Count by device type
  const { data: deviceCounts, error: deviceError } = await supabase
    .from('page_views')
    .select('device_type');

  if (!deviceError && deviceCounts) {
    const counts = { desktop: 0, mobile: 0, tablet: 0, bot: 0 };
    deviceCounts.forEach(row => {
      const type = row.device_type?.toLowerCase() || 'desktop';
      if (type in counts) counts[type]++;
      else counts.desktop++;
    });

    console.log('\nDevice type counts (all time):');
    console.log('Desktop:', counts.desktop);
    console.log('Mobile:', counts.mobile);
    console.log('Tablet:', counts.tablet);
    console.log('Bot:', counts.bot);
  }
}

checkPageViews();
