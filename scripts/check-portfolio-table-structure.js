require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkStructure() {
  console.log('Checking seller_portfolio table structure...\n')

  // Try to get one row to see the structure
  const { data, error } = await supabase
    .from('seller_portfolio')
    .select('*')
    .limit(1)

  if (error) {
    console.log('❌ Error:', error.message)
    return
  }

  console.log('✅ Table accessible')
  console.log('Current rows:', data ? data.length : 0)

  if (data && data.length > 0) {
    console.log('\nSample row structure:')
    console.log(JSON.stringify(data[0], null, 2))
  } else {
    console.log('\nNo rows yet - trying to see structure with columns')
    // Try inserting and rolling back to see structure
    const { error: testError } = await supabase
      .from('seller_portfolio')
      .insert({
        seller_id: 'test',
        title: 'test',
        description: 'test'
      })

    if (testError) {
      console.log('Expected error (shows required fields):', testError.message)
    }
  }
}

checkStructure()
