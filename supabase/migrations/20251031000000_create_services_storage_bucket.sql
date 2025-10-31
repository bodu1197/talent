-- Create services storage bucket for service thumbnail images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'services',
  'services',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public services are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can upload service thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can update their service thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can delete their service thumbnails" ON storage.objects;

-- Policy: Anyone can view service thumbnails (public bucket)
CREATE POLICY "Public services are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'services');

-- Policy: Authenticated users (sellers) can upload service thumbnails
CREATE POLICY "Sellers can upload service thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'services'
  AND auth.role() = 'authenticated'
);

-- Policy: Authenticated users can update their own service thumbnails
CREATE POLICY "Sellers can update their service thumbnails"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'services'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'services'
  AND auth.role() = 'authenticated'
);

-- Policy: Authenticated users can delete their own service thumbnails
CREATE POLICY "Sellers can delete their service thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'services'
  AND auth.role() = 'authenticated'
);
