# Supabase 프로젝트 이전 완벽 가이드

이 가이드는 현재 Supabase 프로젝트를 새 계정으로 완전히 이전하는 방법을 설명합니다.

## 📦 Export된 데이터

다음 데이터가 export되었습니다:

### 1. 데이터베이스 (`database-export/`)

- **82개 테이블**의 모든 데이터 (JSON 형식)
- 총 **4,000+개 레코드**
- 주요 데이터:
  - 사용자: 31명
  - 카테고리: 582개
  - 서비스: 28개
  - 주문: 12건
  - 페이지뷰: 3,486건

### 2. 데이터베이스 스키마 (`supabase-settings-export/`)

- **176개 Functions** (stored procedures)
- **370개 Indexes**
- **45개 Triggers**
- **203개 RLS Policies**
- **2개 Views**
- **133개 Foreign Keys**

### 3. Storage (`supabase-settings-export/storage-*.json`)

- **6개 Buckets**:
  1. `profiles` - 프로필 이미지 (5MB 제한)
  2. `services` - 서비스 이미지 (5MB 제한)
  3. `portfolio` - 포트폴리오 (10MB 제한)
  4. `uploads` - 범용 업로드 (무제한)
  5. `food-stores` - 음식점 이미지 (10MB 제한)
  6. `business-documents` - 사업자 문서 (비공개, 10MB 제한)
- **35개 Storage Policies**

### 4. Migration 파일 (`supabase/migrations/`)

- **50개 migration 파일**
- 2025-11-12부터 2025-12-08까지의 모든 스키마 변경 이력

---

## 🚀 이전 프로세스

### 단계 1: 새 Supabase 프로젝트 생성

1. https://supabase.com/dashboard 접속 (새 계정으로)
2. **"New Project"** 클릭
3. 프로젝트 설정:
   - **Organization**: 새 organization 생성 또는 기존 선택
   - **Name**: `dolpagu` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 (저장 필수!)
   - **Region**: `Northeast Asia (Seoul)` (기존과 동일)
4. **"Create new project"** 클릭
5. 프로젝트 생성 완료 대기 (약 2-3분)

### 단계 2: 프로젝트 정보 확인

새 프로젝트 Dashboard에서 다음 정보를 확인하고 저장:

1. **Project Settings** → **General**:
   - **Reference ID**: 예) `abcdefghijklmnop`
   - **Project URL**: 예) `https://abcdefghijklmnop.supabase.co`

2. **Project Settings** → **API**:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret**: `SUPABASE_SERVICE_ROLE_KEY`

3. **Account** → **Access Tokens**:
   - **"Generate New Token"** 클릭
   - Token 이름: `migration-token`
   - Token 저장 (이후 단계에서 사용)

---

### 단계 3: 스키마 Import (Migration 파일 사용)

#### 방법 A: Supabase CLI 사용 (권장)

```bash
# 1. Supabase CLI 설치 (아직 안 했다면)
npm install -g supabase

# 2. 새 프로젝트 연결
supabase link --project-ref [NEW_PROJECT_ID]
# 프롬프트에서 데이터베이스 비밀번호 입력

# 3. Migration 실행
supabase db push

# ✅ 모든 migration이 순서대로 실행됩니다
```

#### 방법 B: SQL Editor에서 수동 실행

1. 새 프로젝트 Dashboard → **SQL Editor**
2. 다음 순서로 파일 내용 복사 & 실행:

```bash
# 순서 중요!
1. supabase/migrations/20251112000000_remove_duplicate_indexes.sql
2. supabase/migrations/20251112120000_create_advertising_system.sql
3. supabase/migrations/20251112160000_add_order_constraints.sql
... (총 50개 파일, 날짜 순서대로)
50. supabase/migrations/20251208_create_food_delivery_tables.sql
```

또는 모든 migration을 하나로 합치기:

```bash
# PowerShell
Get-Content supabase\migrations\*.sql | Out-File -Encoding UTF8 all-migrations.sql

# 그 다음 all-migrations.sql 파일 내용을 SQL Editor에 붙여넣기
```

---

### 단계 4: Storage 설정

#### 4.1 Buckets 생성

새 프로젝트 Dashboard → **Storage** → **"Create a new bucket"**

각 버킷 생성:

```javascript
// 1. profiles
Name: profiles
Public: Yes
File size limit: 5 MB
Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, image/webp

// 2. services
Name: services
Public: Yes
File size limit: 5 MB
Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, image/webp

// 3. portfolio
Name: portfolio
Public: Yes
File size limit: 10 MB
Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, image/webp

// 4. uploads
Name: uploads
Public: Yes
File size limit: (none)
Allowed MIME types: (none)

// 5. food-stores
Name: food-stores
Public: Yes
File size limit: 10 MB
Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, image/webp

// 6. business-documents
Name: business-documents
Public: No  ⚠️ Private!
File size limit: 10 MB
Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, image/webp, application/pdf
```

#### 4.2 Storage Policies 적용

각 버킷의 **Policies** 탭에서:

- `supabase-settings-export/storage-policies.json` 파일 참고
- 35개 policy를 수동으로 생성

또는 SQL Editor에서 직접 실행:

```sql
-- 예시 (실제 policy는 storage-policies.json 참고)
CREATE POLICY "Public can view profiles"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload own profile"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### 단계 5: 데이터 Import

#### 방법 A: 자동 Import 스크립트 (권장)

```bash
node scripts/import-data-to-new-project.js [NEW_PROJECT_ID] [NEW_ACCESS_TOKEN]

# 예시:
node scripts/import-data-to-new-project.js abc123xyz sbp_your_token_here
```

스크립트가 자동으로:

1. RLS 일시 비활성화
2. 82개 테이블의 데이터를 올바른 순서로 import
3. RLS 재활성화

#### 방법 B: 수동 Import

각 테이블의 JSON 파일을 SQL INSERT 문으로 변환하여 실행:

```sql
-- 예시: users 테이블
INSERT INTO users (id, email, created_at, ...)
VALUES
  ('...', '...', '...', ...),
  ('...', '...', '...', ...);
```

---

### 단계 6: Storage 파일 이전

Storage 파일은 수동으로 다운로드/업로드해야 합니다:

#### 방법 A: Supabase CLI

```bash
# 기존 프로젝트에서 다운로드
supabase storage download profiles .

# 새 프로젝트로 업로드
supabase storage upload profiles .
```

#### 방법 B: 직접 다운로드/업로드

1. 기존 프로젝트 Dashboard → Storage
2. 각 버킷의 파일 다운로드
3. 새 프로젝트 Dashboard → Storage
4. 파일 업로드

---

### 단계 7: Environment Variables 업데이트

프로젝트의 `.env.local` 파일 업데이트:

```bash
# 기존 값 (삭제)
NEXT_PUBLIC_SUPABASE_URL=https://bpvfkkrlyrjkwgwmfrci.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...기존값...
SUPABASE_SERVICE_ROLE_KEY=eyJ...기존값...

# 새 값 (추가)
NEXT_PUBLIC_SUPABASE_URL=https://[NEW_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NEW_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[NEW_SERVICE_ROLE_KEY]
```

---

### 단계 8: 검증 및 테스트

#### 8.1 데이터베이스 검증

```sql
-- 테이블 개수 확인
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';
-- 결과: 82

-- 주요 테이블 row 수 확인
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;
```

#### 8.2 애플리케이션 테스트

```bash
# 개발 서버 실행
npm run dev
```

테스트 체크리스트:

- [ ] 로그인/회원가입
- [ ] 서비스 목록 조회
- [ ] 서비스 상세 페이지
- [ ] 이미지 로드 (프로필, 서비스 등)
- [ ] 채팅 기능
- [ ] 주문 생성
- [ ] 결제 (테스트 모드)

#### 8.3 Storage 테스트

- [ ] 프로필 이미지 업로드
- [ ] 서비스 이미지 업로드
- [ ] 파일 다운로드
- [ ] 비공개 파일 접근 제어

---

## 📋 체크리스트

### 사전 준비

- [ ] 새 Supabase 계정 생성
- [ ] Export된 파일 확인 (`database-export/`, `supabase-settings-export/`)
- [ ] Migration 파일 확인 (`supabase/migrations/`)

### Import 작업

- [ ] 새 프로젝트 생성
- [ ] 프로젝트 정보 저장 (ID, URL, Keys)
- [ ] Access Token 생성
- [ ] Migration 실행 (스키마 생성)
- [ ] Storage buckets 생성
- [ ] Storage policies 적용
- [ ] 데이터 import
- [ ] Storage 파일 이전
- [ ] Environment variables 업데이트

### 검증

- [ ] 테이블 개수 확인 (82개)
- [ ] 데이터 개수 확인
- [ ] Functions 작동 확인
- [ ] RLS policies 작동 확인
- [ ] Storage 접근 테스트
- [ ] 애플리케이션 기능 테스트

### 완료

- [ ] DNS/도메인 설정 업데이트 (있는 경우)
- [ ] 기존 프로젝트 일시 중지 또는 삭제
- [ ] 팀원에게 새 프로젝트 정보 공유
- [ ] 백업 파일 안전한 곳에 보관

---

## ⚠️ 주의사항

### 1. 순서 중요

- **Enum → Schema → Data → RLS** 순서로 진행
- Migration 파일은 날짜 순서대로 실행
- 외래 키 의존성 고려 (import 스크립트가 자동 처리)

### 2. RLS (Row Level Security)

- 데이터 import 전에 RLS 비활성화
- Import 완료 후 RLS 재활성화
- 모든 policies가 올바르게 적용되었는지 확인

### 3. Storage

- 파일은 자동 이전 안 됨 (수동 작업 필요)
- Bucket 설정 (public/private, size limit) 정확히 복사
- Policies 누락 시 파일 접근 불가

### 4. Secrets & Credentials

- API keys는 자동 이전 안 됨
- 결제 시스템 (PortOne) 재설정 필요
- Webhook URLs 업데이트 필요

### 5. 다운타임 최소화

- 새 프로젝트 완전히 준비 후 전환
- DNS 전환 전 충분히 테스트
- 기존 프로젝트는 검증 완료 후 삭제

---

## 🆘 문제 해결

### "permission denied" 오류

```sql
-- RLS가 활성화된 상태로 import 시도한 경우
ALTER TABLE [table_name] DISABLE ROW LEVEL SECURITY;
```

### Foreign key 오류

- 참조되는 테이블을 먼저 import
- Import 순서 확인 (`TABLE_ORDER` 배열 참고)

### Function 실행 오류

```sql
-- search_path 설정
ALTER FUNCTION [function_name] SET search_path = public, auth, storage;
```

### Storage 접근 오류

- Bucket이 생성되었는지 확인
- Policy가 올바르게 설정되었는지 확인
- Public/Private 설정 확인

---

## 📞 지원

문제가 발생하면:

1. Supabase 공식 문서: https://supabase.com/docs
2. Supabase Discord: https://discord.supabase.com
3. GitHub Issues: https://github.com/supabase/supabase/issues

---

## 🎉 완료!

이전 작업이 완료되면 새 프로젝트가 기존 프로젝트와 완전히 동일하게 작동합니다.

새 프로젝트 정보:

- URL: `https://[NEW_PROJECT_ID].supabase.co`
- Dashboard: `https://supabase.com/dashboard/project/[NEW_PROJECT_ID]`
- Database: PostgreSQL 15
- Region: Seoul (ap-northeast-2)

축하합니다! 🎊
