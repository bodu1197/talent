const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function createPoliciesFunction() {
  console.log('Step 1: Creating apply_storage_policies function...\n')

  const createFunctionSQL = `
CREATE OR REPLACE FUNCTION apply_storage_policies()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Enable RLS
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies
  DROP POLICY IF EXISTS "Anyone can view portfolio images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update portfolio images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete portfolio images" ON storage.objects;

  -- Create policies
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

  RETURN 'Storage policies applied successfully';
END;
$$;
  `

  console.log('Function SQL:')
  console.log(createFunctionSQL)
  console.log('\n' + '='.repeat(80))
  console.log('\nPlease execute the above SQL in Supabase Dashboard:')
  console.log('https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new')
  console.log('\nAfter executing, run this command:')
  console.log('node scripts/call-apply-policies.js')
  console.log('\n' + '='.repeat(80))
}

createPoliciesFunction()
