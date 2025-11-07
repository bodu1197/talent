const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkActiveServices() {
  console.log('Checking active services...\n')

  // 전체 서비스 수
  const { count: totalCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })

  console.log(`Total services: ${totalCount}`)

  // 상태별 서비스 수
  const statuses = ['active', 'pending', 'inactive', 'rejected', 'draft']

  for (const status of statuses) {
    const { count } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)

    console.log(`  - ${status}: ${count}`)
  }

  // active 서비스 샘플 조회
  console.log('\nActive services (sample):')
  const { data: activeServices, error } = await supabase
    .from('services')
    .select(`
      id,
      title,
      status,
      seller:sellers(id, business_name)
    `)
    .eq('status', 'active')
    .limit(5)

  if (error) {
    console.error('Error:', error)
  } else {
    activeServices.forEach(service => {
      console.log(`  - ${service.title} (${service.seller?.business_name || 'No seller'})`)
    })
  }
}

checkActiveServices()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
