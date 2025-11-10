require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkWalletTransactions() {
  console.log('Checking wallet_transactions table...\n')

  // Get sample data
  const { data: transactions } = await supabase
    .from('wallet_transactions')
    .select('*')
    .limit(5)

  console.log('Sample transactions:')
  if (transactions && transactions.length > 0) {
    console.log(JSON.stringify(transactions, null, 2))
  } else {
    console.log('No transactions found')
  }

  // Get count
  const { count } = await supabase
    .from('wallet_transactions')
    .select('*', { count: 'exact', head: true })

  console.log(`\nTotal transactions: ${count}`)
}

checkWalletTransactions()
