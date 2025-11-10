require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkOrderStatuses() {
  console.log('Checking order statuses...\n')

  // Get all orders with their status
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_number, status, payment_status, work_status, total_amount, seller_id, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`Total orders: ${orders.length}\n`)

  // Group by status
  const statusGroups = {}
  orders.forEach(order => {
    if (!statusGroups[order.status]) {
      statusGroups[order.status] = []
    }
    statusGroups[order.status].push(order)
  })

  console.log('Orders by status:')
  Object.keys(statusGroups).forEach(status => {
    console.log(`\n${status}: ${statusGroups[status].length} orders`)
    statusGroups[status].forEach(order => {
      console.log(`  - ${order.order_number} | Payment: ${order.payment_status} | Work: ${order.work_status} | Amount: ${order.total_amount} | Seller: ${order.seller_id.slice(0, 8)}`)
    })
  })

  // Check sellers table
  const { data: sellers } = await supabase
    .from('sellers')
    .select('id, user_id, display_name')

  console.log('\n\nSellers in database:')
  sellers?.forEach(seller => {
    const sellerOrders = orders.filter(o => o.seller_id === seller.id)
    console.log(`  - ${seller.display_name} (${seller.id.slice(0, 8)}): ${sellerOrders.length} orders`)
  })
}

checkOrderStatuses()
