const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function checkSetup() {
  console.log('Checking portfolio setup...\n')

  // Check seller_portfolio table
  const { data: portfolioData, error: portfolioError } = await supabase
    .from('seller_portfolio')
    .select('*')
    .limit(1)

  if (portfolioError) {
    console.log('❌ seller_portfolio table:', portfolioError.message)
  } else {
    console.log('✅ seller_portfolio table exists')
  }

  // Check portfolio storage bucket
  const { data: buckets, error: bucketsError } = await supabase
    .storage
    .listBuckets()

  if (bucketsError) {
    console.log('❌ Storage buckets error:', bucketsError.message)
  } else {
    const portfolioBucket = buckets.find(b => b.id === 'portfolio')
    if (portfolioBucket) {
      console.log('✅ portfolio storage bucket exists')
    } else {
      console.log('❌ portfolio storage bucket not found')
    }
  }
}

checkSetup()
