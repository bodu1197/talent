-- portfolio 스토리지 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio',
  'portfolio',
  true,
  10485760, -- 10MB
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
