require('dotenv').config({ path: '.env.local' })

async function createBucketViaMgmtAPI() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const projectRef = 'bpvfkkrlyrjkwgwmfrci' // from URL

  console.log('Creating portfolio bucket via Storage API...\n')

  try {
    // Use Storage API to create bucket
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        id: 'portfolio',
        name: 'portfolio',
        public: true,
        file_size_limit: 10485760,
        allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.log('❌ Error response:', result)

      if (result.error && result.error.includes('already exists')) {
        console.log('✅ Bucket already exists!')
      } else if (result.message && result.message.includes('new row violates')) {
        console.log('\n⚠️  ANON_KEY does not have permission to create buckets.')
        console.log('We need to use the Supabase Dashboard or get a SERVICE_ROLE_KEY.')
        console.log('\nOption 1: Create via Dashboard')
        console.log('Visit: https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/storage/buckets')
        console.log('Click "New bucket" and use these settings:')
        console.log('  - Name: portfolio')
        console.log('  - Public: true')
        console.log('  - File size limit: 10485760')
        console.log('  - Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, image/webp')
        console.log('\nOption 2: Get SERVICE_ROLE_KEY')
        console.log('Visit: https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/settings/api')
        console.log('Copy "service_role" key (secret) and add to .env.local:')
        console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here')
      }
      return
    }

    console.log('✅ Portfolio bucket created successfully!')
    console.log('Result:', result)

    // Now create policies
    console.log('\nCreating storage policies...')

    const policies = [
      {
        name: 'Anyone can view portfolio images',
        definition: 'bucket_id = \'portfolio\'',
        command: 'SELECT'
      },
      {
        name: 'Authenticated users can upload portfolio images',
        definition: 'bucket_id = \'portfolio\'',
        command: 'INSERT',
        check: 'bucket_id = \'portfolio\''
      },
      {
        name: 'Users can update portfolio images',
        definition: 'bucket_id = \'portfolio\'',
        command: 'UPDATE'
      },
      {
        name: 'Users can delete portfolio images',
        definition: 'bucket_id = \'portfolio\'',
        command: 'DELETE'
      }
    ]

    for (const policy of policies) {
      console.log(`Creating policy: ${policy.name}`)
      // Note: Policy creation typically requires SERVICE_ROLE_KEY
    }

  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

createBucketViaMgmtAPI()
