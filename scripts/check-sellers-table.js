const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSellersTable() {
  console.log('Checking sellers table...\n')

  // 전체 sellers
  const { data: sellers, error } = await supabase
    .from('sellers')
    .select('*')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`Found ${sellers.length} sellers:\n`)

  sellers.forEach(seller => {
    console.log(`Seller ID: ${seller.id}`)
    console.log(`  Business Name: ${seller.business_name || 'NULL'}`)
    console.log(`  User ID: ${seller.user_id}`)
    console.log(`  Status: ${seller.status || 'NULL'}`)
    console.log('')
  })

  // 특정 seller_id 조회
  const targetSellerId = '60d6e3d2-37b1-4ca7-8604-0aa1a7a5b98d'
  console.log(`\nLooking for seller: ${targetSellerId}`)

  const { data: targetSeller, error: targetError } = await supabase
    .from('sellers')
    .select('*')
    .eq('id', targetSellerId)
    .maybeSingle()

  if (targetError) {
    console.error('Error:', targetError)
  } else if (targetSeller) {
    console.log('✓ Found!')
    console.log(JSON.stringify(targetSeller, null, 2))
  } else {
    console.log('✗ Not found!')
  }
}

checkSellersTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
