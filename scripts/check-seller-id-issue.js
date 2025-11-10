require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSellerIdIssue() {
  console.log('Checking seller_id mapping issue...\n')

  // Get a sample order
  const { data: orders } = await supabase
    .from('orders')
    .select('seller_id')
    .eq('status', 'paid')
    .limit(1)

  if (!orders || orders.length === 0) {
    console.log('No paid orders found')
    return
  }

  const sellerId = orders[0].seller_id
  console.log(`Sample order seller_id: ${sellerId}\n`)

  // Check if this ID exists in sellers table
  const { data: sellerBySellerId } = await supabase
    .from('sellers')
    .select('*')
    .eq('id', sellerId)
    .maybeSingle()

  console.log('Is seller_id in sellers.id?', sellerBySellerId ? 'YES' : 'NO')
  if (sellerBySellerId) {
    console.log('Seller:', sellerBySellerId)
  }

  // Check if this ID exists in sellers.user_id
  const { data: sellerByUserId } = await supabase
    .from('sellers')
    .select('*')
    .eq('user_id', sellerId)
    .maybeSingle()

  console.log('\nIs seller_id in sellers.user_id?', sellerByUserId ? 'YES' : 'NO')
  if (sellerByUserId) {
    console.log('Seller:', sellerByUserId)
  }

  // Check users table
  const { data: user } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('id', sellerId)
    .maybeSingle()

  console.log('\nIs seller_id in users.id?', user ? 'YES' : 'NO')
  if (user) {
    console.log('User:', user)
  }

  console.log('\n=== CONCLUSION ===')
  if (sellerBySellerId) {
    console.log('✓ orders.seller_id → sellers.id (CORRECT)')
  } else if (sellerByUserId) {
    console.log('✗ orders.seller_id → sellers.user_id (WRONG - should be sellers.id)')
  } else if (user) {
    console.log('✗ orders.seller_id → users.id (WRONG - should be sellers.id)')
  }
}

checkSellerIdIssue()
