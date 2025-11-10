require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBuyerOrders() {
  console.log('Checking buyer orders setup...\n')

  // Get current user (assuming you're logged in)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.log('Not authenticated.')
    return
  }

  console.log('Current user ID:', user.id)

  // Check buyers table
  const { data: buyer } = await supabase
    .from('buyers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  console.log('\nBuyer record:', buyer)

  // Check orders with buyer.id
  if (buyer) {
    const { data: ordersByBuyerId } = await supabase
      .from('orders')
      .select('id, order_number, buyer_id, status')
      .eq('buyer_id', buyer.id)

    console.log('\nOrders with buyer_id = buyers.id:', ordersByBuyerId?.length || 0)
  }

  // Check orders with user.id
  const { data: ordersByUserId } = await supabase
    .from('orders')
    .select('id, order_number, buyer_id, status')
    .eq('buyer_id', user.id)

  console.log('Orders with buyer_id = users.id:', ordersByUserId?.length || 0)

  if (ordersByUserId && ordersByUserId.length > 0) {
    console.log('\nSample order:', ordersByUserId[0])
  }

  // Check what buyer_id actually references
  const { data: sampleOrders } = await supabase
    .from('orders')
    .select('buyer_id')
    .limit(3)

  console.log('\nSample buyer_ids from orders:', sampleOrders?.map(o => o.buyer_id))
}

checkBuyerOrders()
