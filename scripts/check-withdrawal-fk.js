require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkWithdrawalFK() {
  console.log('Checking withdrawal_requests foreign key...\n')

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.log('Not authenticated. Using seller ID from orders...')

    // Get seller info from orders table (we know orders exist)
    const { data: order } = await supabase
      .from('orders')
      .select('seller_id')
      .eq('status', 'paid')
      .limit(1)
      .single()

    if (order) {
      const sellerId = order.seller_id
      console.log('Order seller_id (users.id):', sellerId)

      // Check if this matches sellers.id
      const { data: sellerById } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', sellerId)
        .maybeSingle()

      console.log('\nDoes order.seller_id match sellers.id?', sellerById ? 'YES' : 'NO')

      // Check if it matches sellers.user_id
      const { data: sellerByUserId } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', sellerId)
        .maybeSingle()

      console.log('Does order.seller_id match sellers.user_id?', sellerByUserId ? 'YES' : 'NO')

      if (sellerByUserId) {
        console.log('\n=== CORRECT SELLER ID FOR WITHDRAWAL ===')
        console.log('sellers.id:', sellerByUserId.id)
        console.log('sellers.user_id:', sellerByUserId.user_id)
        console.log('\nFor withdrawal_requests, use:', sellerByUserId.id)
      }
    }
  }

  // Check withdrawal_requests table structure
  const { data: withdrawals } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .limit(1)

  console.log('\n=== withdrawal_requests table sample ===')
  if (withdrawals && withdrawals.length > 0) {
    console.log(withdrawals[0])
  } else {
    console.log('No withdrawal requests found')
  }

  // Try to get schema info
  console.log('\n=== Testing FK constraint ===')
  console.log('withdrawal_requests.seller_id should reference sellers.id')

  const { data: sellers } = await supabase
    .from('sellers')
    .select('id, user_id, display_name')

  console.log('\nAll sellers:')
  sellers?.forEach(seller => {
    console.log(`  - ID: ${seller.id}, User ID: ${seller.user_id}, Name: ${seller.display_name}`)
  })
}

checkWithdrawalFK()
