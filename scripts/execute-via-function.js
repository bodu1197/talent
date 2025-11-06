const { Client } = require('pg')

const client = new Client({
  host: 'aws-1-ap-northeast-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.bpvfkkrlyrjkwgwmfrci',
  password: 'chl1197dbA!@',
  ssl: { rejectUnauthorized: false }
})

async function executeViaFunction() {
  try {
    console.log('Connecting to database...\n')
    await client.connect()
    console.log('✅ Connected!\n')

    // Step 1: Create function with SECURITY DEFINER
    console.log('Step 1: Creating function with SECURITY DEFINER...')

    const createFunctionSQL = `
CREATE OR REPLACE FUNCTION public.apply_storage_policies()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  -- Enable RLS
  EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';

  -- Drop existing policies
  DROP POLICY IF EXISTS "Anyone can view portfolio images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update portfolio images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete portfolio images" ON storage.objects;

  -- Create policies
  EXECUTE 'CREATE POLICY "Anyone can view portfolio images" ON storage.objects FOR SELECT TO public USING (bucket_id = ''portfolio'')';

  EXECUTE 'CREATE POLICY "Authenticated users can upload portfolio images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''portfolio'')';

  EXECUTE 'CREATE POLICY "Users can update portfolio images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = ''portfolio'')';

  EXECUTE 'CREATE POLICY "Users can delete portfolio images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''portfolio'')';

  RETURN 'Storage policies applied successfully!';
END;
$$;
    `

    await client.query(createFunctionSQL)
    console.log('✅ Function created!\n')

    // Step 2: Call the function
    console.log('Step 2: Calling function to apply policies...')

    const result = await client.query('SELECT public.apply_storage_policies()')

    console.log('✅ Success:', result.rows[0].apply_storage_policies)
    console.log('\n🎉 Storage policies have been applied!')
    console.log('You can now upload portfolio images.\n')

  } catch (error) {
    console.log('❌ Error:', error.message)
    console.log('\nFull error:', error)
  } finally {
    await client.end()
  }
}

executeViaFunction()
