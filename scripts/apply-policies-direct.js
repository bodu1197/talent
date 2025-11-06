const { Client } = require('pg')

// Supabase connection string
// Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
const connectionString = 'postgresql://postgres.bpvfkkrlyrjkwgwmfrci:[YOUR_DB_PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'

// If you have the database password, replace [YOUR_DB_PASSWORD] above
// Or we can use SERVICE_ROLE_KEY with supabase-js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function applyPolicies() {
  console.log('Applying storage policies via SQL...\n')

  const policies = [
    {
      name: 'Enable RLS',
      sql: 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Drop old policies',
      sql: `
        DROP POLICY IF EXISTS "Anyone can view portfolio images" ON storage.objects;
        DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;
        DROP POLICY IF EXISTS "Users can update portfolio images" ON storage.objects;
        DROP POLICY IF EXISTS "Users can delete portfolio images" ON storage.objects;
      `
    },
    {
      name: 'Anyone can view',
      sql: `
        CREATE POLICY "Anyone can view portfolio images"
          ON storage.objects
          FOR SELECT
          TO public
          USING (bucket_id = 'portfolio');
      `
    },
    {
      name: 'Authenticated upload',
      sql: `
        CREATE POLICY "Authenticated users can upload portfolio images"
          ON storage.objects
          FOR INSERT
          TO authenticated
          WITH CHECK (bucket_id = 'portfolio');
      `
    },
    {
      name: 'Authenticated update',
      sql: `
        CREATE POLICY "Users can update portfolio images"
          ON storage.objects
          FOR UPDATE
          TO authenticated
          USING (bucket_id = 'portfolio');
      `
    },
    {
      name: 'Authenticated delete',
      sql: `
        CREATE POLICY "Users can delete portfolio images"
          ON storage.objects
          FOR DELETE
          TO authenticated
          USING (bucket_id = 'portfolio');
      `
    }
  ]

  // Try using Supabase edge function or direct SQL execution
  for (const policy of policies) {
    console.log(`\nExecuting: ${policy.name}`)

    try {
      // Use Supabase's postgres connection via rpc
      const { data, error } = await supabase.rpc('exec', {
        sql: policy.sql
      })

      if (error) {
        console.log(`  ⚠️  Error (trying alternative):`, error.message)

        // Alternative: try without rpc
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ query: policy.sql })
        })

        if (!response.ok) {
          console.log(`  ❌ Failed: ${response.status}`)
        } else {
          console.log(`  ✅ Success`)
        }
      } else {
        console.log(`  ✅ Success`)
      }
    } catch (error) {
      console.log(`  ❌ Error:`, error.message)
    }
  }

  console.log('\n\n=== Alternative: Use Supabase Dashboard ===')
  console.log('If the above failed, please execute this SQL manually:')
  console.log('URL: https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new\n')

  const fullSQL = policies.map(p => p.sql).join('\n\n')
  console.log(fullSQL)
}

applyPolicies()
