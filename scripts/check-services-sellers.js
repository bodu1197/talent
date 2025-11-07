const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkServicesSellers() {
  console.log('Checking services and their sellers...\n')

  // 서비스와 seller_id 조회
  const { data: services, error } = await supabase
    .from('services')
    .select('id, title, seller_id, status')
    .eq('status', 'active')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`Found ${services.length} active services:\n`)

  for (const service of services) {
    console.log(`Service: ${service.title}`)
    console.log(`  ID: ${service.id}`)
    console.log(`  Seller ID: ${service.seller_id || 'NULL'}`)

    if (service.seller_id) {
      // seller 정보 조회
      const { data: seller } = await supabase
        .from('sellers')
        .select('id, business_name, user_id')
        .eq('id', service.seller_id)
        .maybeSingle()

      if (seller) {
        console.log(`  Seller: ${seller.business_name} (user_id: ${seller.user_id})`)
      } else {
        console.log(`  ❌ Seller not found!`)
      }
    } else {
      console.log(`  ❌ No seller_id!`)
    }
    console.log('')
  }
}

checkServicesSellers()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
