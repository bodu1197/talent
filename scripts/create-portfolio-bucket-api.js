require('dotenv').config({ path: '.env.local' })

async function createBucketViaSQL() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Creating portfolio bucket via SQL...\n')

  // SQL to create bucket and policies
  const sql = `
-- portfolio 스토리지 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio',
  'portfolio',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

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
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      const error = await response.text()
      console.log('❌ Error:', error)
      console.log('\nTrying alternative method with fetch to postgrest...')

      // Try alternative: use Supabase client to run query
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

      // Split SQL into individual statements and run them
      const statements = sql.split(';').filter(s => s.trim())

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            console.log('Statement error:', error.message)
          }
        }
      }

      return
    }

    const result = await response.json()
    console.log('✅ Portfolio bucket created successfully!')
    console.log('Result:', result)
  } catch (error) {
    console.log('❌ Fetch error:', error.message)
    console.log('\nPlease run this SQL manually in Supabase Dashboard SQL Editor:')
    console.log('https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new')
    console.log('\n--- SQL TO RUN ---')
    console.log(sql)
  }
}

createBucketViaSQL()
