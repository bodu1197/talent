require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  console.log('URL:', supabaseUrl ? 'Found' : 'Missing')
  console.log('Key:', supabaseKey ? 'Found' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('Checking orders table schema...\n')

  // Get sample order
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error:', error)
    return
  }

  if (orders && orders.length > 0) {
    console.log('Sample order structure:')
    console.log(JSON.stringify(orders[0], null, 2))
    console.log('\nColumn names:', Object.keys(orders[0]))
  } else {
    console.log('No orders found in database')
  }

  // Check if there are any orders with service_id
  const { data: ordersWithService, count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  console.log(`\nTotal orders in database: ${count}`)
}

checkSchema()
