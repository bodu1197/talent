const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyPolicies() {
  console.log('Applying storage policies via SQL...\n')

  const sql = `
-- portfolio 버킷 정책: 모든 사용자가 읽기 가능
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Anyone can view portfolio images'
  ) THEN
    CREATE POLICY "Anyone can view portfolio images"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'portfolio');
  END IF;
END $$;

-- portfolio 버킷 정책: 인증된 사용자가 업로드 가능
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Authenticated users can upload portfolio images'
  ) THEN
    CREATE POLICY "Authenticated users can upload portfolio images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'portfolio');
  END IF;
END $$;

-- portfolio 버킷 정책: 인증된 사용자가 수정 가능
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Users can update portfolio images'
  ) THEN
    CREATE POLICY "Users can update portfolio images"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'portfolio');
  END IF;
END $$;

-- portfolio 버킷 정책: 인증된 사용자가 삭제 가능
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Users can delete portfolio images'
  ) THEN
    CREATE POLICY "Users can delete portfolio images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'portfolio');
  END IF;
END $$;
`

  try {
    // Execute SQL using rpc
    const { data, error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      console.log('❌ RPC method not available. Trying direct SQL execution...')
      console.log('Error:', error.message)
      console.log('\nPlease run this SQL manually in Supabase Dashboard SQL Editor:')
      console.log('https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new')
      console.log('\n--- SQL TO RUN ---')
      console.log(sql)
      console.log('--- END SQL ---\n')
    } else {
      console.log('✅ Policies applied successfully!')
      console.log('Result:', data)
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
    console.log('\nPlease run this SQL manually in Supabase Dashboard SQL Editor:')
    console.log('https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new')
    console.log('\n--- SQL TO RUN ---')
    console.log(sql)
    console.log('--- END SQL ---\n')
  }
}

applyPolicies()
