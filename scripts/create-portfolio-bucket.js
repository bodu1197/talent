require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function createBucket() {
  console.log('Creating portfolio storage bucket...\n')

  // Create portfolio bucket
  const { data, error } = await supabase
    .storage
    .createBucket('portfolio', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    })

  if (error) {
    console.log('❌ Error creating bucket:', error.message)
    return
  }

  console.log('✅ Portfolio bucket created successfully')
  console.log('Data:', data)
}

createBucket()
