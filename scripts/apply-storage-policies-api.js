const fetch = require('node-fetch')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'

async function executeSql(sql) {
  console.log('Executing SQL via PostgREST...\n')

  // Try using pg_net or direct connection
  const queries = [
    // Policy 1: Anyone can view
    `CREATE POLICY IF NOT EXISTS "Anyone can view portfolio images"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'portfolio');`,

    // Policy 2: Authenticated can upload
    `CREATE POLICY IF NOT EXISTS "Authenticated users can upload portfolio images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'portfolio');`,

    // Policy 3: Authenticated can update
    `CREATE POLICY IF NOT EXISTS "Users can update portfolio images"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'portfolio');`,

    // Policy 4: Authenticated can delete
    `CREATE POLICY IF NOT EXISTS "Users can delete portfolio images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'portfolio');`
  ]

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i]
    console.log(`\nAttempting to create policy ${i + 1}/4...`)

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify({ query })
      })

      if (response.ok) {
        console.log(`✅ Policy ${i + 1} created`)
      } else {
        const error = await response.text()
        console.log(`⚠️  Policy ${i + 1} response:`, error)
      }
    } catch (error) {
      console.log(`⚠️  Policy ${i + 1} error:`, error.message)
    }
  }
}

async function checkIfPoliciesExist() {
  console.log('Checking existing policies...\n')

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/pg_policies?schemaname=eq.storage&tablename=eq.objects&select=policyname`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    })

    if (response.ok) {
      const policies = await response.json()
      console.log('Found policies:', policies.length)
      policies.forEach(p => console.log(`  - ${p.policyname}`))
    } else {
      console.log('Could not query policies (this is normal)')
    }
  } catch (error) {
    console.log('Could not query policies (this is normal)')
  }
}

async function main() {
  console.log('=== Applying Storage Policies for Portfolio Bucket ===\n')

  await executeSql()

  console.log('\n\n=== Since automatic execution may not work ===')
  console.log('Please manually execute this in Supabase SQL Editor:')
  console.log('https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new\n')
  console.log('Copy and paste this SQL:\n')
  console.log(`-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete portfolio images" ON storage.objects;

-- Create new policies
CREATE POLICY "Anyone can view portfolio images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'portfolio');

CREATE POLICY "Authenticated users can upload portfolio images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio');

CREATE POLICY "Users can update portfolio images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'portfolio');

CREATE POLICY "Users can delete portfolio images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio');
`)

  console.log('\n=== After running the SQL, test with: ===')
  console.log('node scripts/check-storage-policies.js\n')
}

main()
