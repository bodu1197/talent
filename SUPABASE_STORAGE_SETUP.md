# Supabase Storage 설정 가이드

이 프로젝트는 파일 업로드를 위해 Supabase Storage를 사용합니다. 다음 버킷들을 생성해야 합니다.

## 필수 버킷 목록

### 1. `profiles` 버킷
**용도**: 사용자 프로필 이미지, 판매자 프로필 이미지
**설정**:
- Public bucket: ✅ (체크)
- File size limit: 5MB
- Allowed MIME types: image/jpeg, image/png, image/gif

### 2. `services` 버킷
**용도**: 서비스 썸네일 이미지
**설정**:
- Public bucket: ✅ (체크)
- File size limit: 5MB
- Allowed MIME types: image/jpeg, image/png, image/gif

## 버킷 생성 방법

1. Supabase 대시보드 접속 (https://supabase.com/dashboard)
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Storage** 클릭
4. **New bucket** 버튼 클릭
5. 버킷 정보 입력:
   - **Name**: `profiles` 또는 `services`
   - **Public bucket**: ✅ 체크 (공개 접근 허용)
   - **File size limit**: 5242880 (5MB)
6. **Create bucket** 버튼 클릭
7. 위 과정을 반복하여 모든 필수 버킷 생성

## Storage Policies 설정

각 버킷에 대해 다음 정책을 설정해야 합니다:

### Upload 정책
```sql
-- profiles 버킷
CREATE POLICY "Anyone can upload to profiles"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profiles');

-- services 버킷
CREATE POLICY "Anyone can upload to services"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'services');
```

### Read 정책 (Public bucket인 경우 자동 설정됨)
```sql
-- profiles 버킷
CREATE POLICY "Anyone can read profiles"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- services 버킷
CREATE POLICY "Anyone can read services"
ON storage.objects FOR SELECT
USING (bucket_id = 'services');
```

## 확인 방법

1. Storage 메뉴에서 생성한 버킷 확인
2. 각 버킷 클릭 → **Policies** 탭에서 정책 확인
3. 애플리케이션에서 파일 업로드 테스트

## 문제 해결

### "Bucket not found" 에러
- 버킷이 생성되었는지 확인
- 버킷 이름 철자 확인 (`profiles`, `services`)

### "Permission denied" 에러
- Storage Policies가 올바르게 설정되었는지 확인
- Public bucket이 활성화되었는지 확인

### 파일이 업로드되지 않음
- 파일 크기 제한 확인 (5MB 이하)
- MIME 타입 확인 (image/jpeg, image/png, image/gif만 허용)
- 브라우저 콘솔에서 에러 메시지 확인
