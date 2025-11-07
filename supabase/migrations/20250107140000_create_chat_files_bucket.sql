-- 채팅 파일 업로드를 위한 Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- uploads 버킷에 대한 정책 설정
-- 인증된 사용자는 누구나 업로드 가능
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- 누구나 파일 읽기 가능 (공개)
CREATE POLICY "Anyone can view uploaded files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- 본인이 업로드한 파일만 삭제 가능
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
