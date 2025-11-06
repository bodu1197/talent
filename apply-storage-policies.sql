-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete portfolio images" ON storage.objects;

-- Create policy 1: Anyone can view
CREATE POLICY "Anyone can view portfolio images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'portfolio');

-- Create policy 2: Authenticated users can upload
CREATE POLICY "Authenticated users can upload portfolio images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio');

-- Create policy 3: Authenticated users can update
CREATE POLICY "Users can update portfolio images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'portfolio');

-- Create policy 4: Authenticated users can delete
CREATE POLICY "Users can delete portfolio images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio');
