const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkPolicies() {
  console.log('Checking storage policies...\n')

  // Check bucket
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    console.log('❌ Error listing buckets:', bucketsError.message)
    return
  }

  const portfolioBucket = buckets.find(b => b.id === 'portfolio')
  if (!portfolioBucket) {
    console.log('❌ Portfolio bucket not found')
    return
  }

  console.log('✅ Portfolio bucket exists')
  console.log('Bucket config:', {
    id: portfolioBucket.id,
    name: portfolioBucket.name,
    public: portfolioBucket.public,
    file_size_limit: portfolioBucket.file_size_limit,
    allowed_mime_types: portfolioBucket.allowed_mime_types
  })

  // Try to upload a test file
  console.log('\n--- Testing upload with service role key ---')
  const testContent = Buffer.from('test')
  const testPath = 'test/test.txt'

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('portfolio')
    .upload(testPath, testContent, {
      contentType: 'text/plain',
      upsert: true
    })

  if (uploadError) {
    console.log('❌ Upload test failed:', uploadError.message)
  } else {
    console.log('✅ Upload test successful:', uploadData.path)

    // Clean up test file
    await supabase.storage.from('portfolio').remove([testPath])
    console.log('✅ Test file removed')
  }

  // Query storage policies
  console.log('\n--- Checking storage policies in database ---')
  const { data: policies, error: policiesError } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('schemaname', 'storage')
    .eq('tablename', 'objects')

  if (policiesError) {
    console.log('❌ Error querying policies:', policiesError.message)
  } else if (policies && policies.length > 0) {
    console.log(`✅ Found ${policies.length} storage policies:`)
    policies
      .filter(p => p.policyname.toLowerCase().includes('portfolio'))
      .forEach(p => {
        console.log(`  - ${p.policyname} (${p.cmd})`)
      })
  } else {
    console.log('⚠️  No storage policies found (this might be normal)')
  }
}

checkPolicies()
