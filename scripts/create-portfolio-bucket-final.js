const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function createPortfolioBucket() {
  console.log('Creating portfolio storage bucket...\n')

  // Check if bucket already exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.log('❌ Error listing buckets:', listError.message)
    return
  }

  const existingBucket = buckets.find(b => b.id === 'portfolio')
  if (existingBucket) {
    console.log('✅ Portfolio bucket already exists!')
    console.log('Bucket info:', existingBucket)
    return
  }

  // Create portfolio bucket
  const { data, error } = await supabase.storage.createBucket('portfolio', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  })

  if (error) {
    console.log('❌ Error creating bucket:', error.message)
    return
  }

  console.log('✅ Portfolio bucket created successfully!')
  console.log('Data:', data)

  // Note: Storage policies are automatically created by Supabase
  // But we can verify them
  console.log('\n✅ Bucket creation complete!')
  console.log('You can now upload images to the portfolio bucket.')
}

createPortfolioBucket()
