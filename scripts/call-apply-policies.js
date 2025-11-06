const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function callFunction() {
  console.log('Calling apply_storage_policies function...\n')

  const { data, error } = await supabase.rpc('apply_storage_policies')

  if (error) {
    console.log('❌ Error:', error.message)
    console.log('\nMake sure you created the function first by running:')
    console.log('node scripts/create-and-apply-policies.js')
  } else {
    console.log('✅ Success:', data)
    console.log('\nStorage policies have been applied!')
    console.log('You can now test portfolio upload.')
  }
}

callFunction()
