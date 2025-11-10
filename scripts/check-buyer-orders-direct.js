require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBuyerOrders() {
  console.log('Checking buyer orders setup...\n')

  // Get a sample order
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, buyer_id, seller_id, status')
    .limit(3)

  console.log('Sample orders:')
  orders?.forEach(order => {
    console.log(`  Order: ${order.order_number}, buyer_id: ${order.buyer_id}, seller_id: ${order.seller_id}`)
  })

  if (orders && orders.length > 0) {
    const buyerId = orders[0].buyer_id

    // Check if buyer_id exists in buyers table
    const { data: buyerRecord } = await supabase
      .from('buyers')
      .select('*')
      .eq('id', buyerId)
      .maybeSingle()

    console.log('\nDoes buyer_id match buyers.id?', buyerRecord ? 'YES' : 'NO')

    // Check if buyer_id exists in users table
    const { data: userRecord } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', buyerId)
      .maybeSingle()

    console.log('Does buyer_id match users.id?', userRecord ? 'YES' : 'NO')

    if (userRecord) {
      console.log('User info:', userRecord)

      // Find buyer record with this user_id
      const { data: buyerByUserId } = await supabase
        .from('buyers')
        .select('*')
        .eq('user_id', userRecord.id)
        .maybeSingle()

      if (buyerByUserId) {
        console.log('\n=== CORRECT BUYER ID ===')
        console.log('buyers.id:', buyerByUserId.id)
        console.log('buyers.user_id:', buyerByUserId.user_id)
        console.log('\nFor queries, should use:', userRecord.id, '(users.id)')
      }
    }
  }

  // Check all buyers
  const { data: buyers } = await supabase
    .from('buyers')
    .select('id, user_id')

  console.log('\n=== All buyers ===')
  buyers?.forEach(buyer => {
    console.log(`  buyers.id: ${buyer.id}, user_id: ${buyer.user_id}`)
  })
}

checkBuyerOrders()
