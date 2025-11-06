# Supabase Storage 정책 설정 가이드

Supabase Storage에 RLS (Row Level Security) 정책을 설정하는 방법을 단계별로 설명합니다.

## 목차
1. [Storage 정책이란?](#1-storage-정책이란)
2. [정책 설정이 필요한 이유](#2-정책-설정이-필요한-이유)
3. [정책 설정 방법](#3-정책-설정-방법)
4. [정책 확인 및 테스트](#4-정책-확인-및-테스트)
5. [트러블슈팅](#5-트러블슈팅)
6. [대안: SERVICE_ROLE_KEY 사용](#6-대안-service_role_key-사용)

---

## 1. Storage 정책이란?

Supabase Storage는 PostgreSQL의 RLS (Row Level Security)를 사용하여 파일 접근을 제어합니다. Storage 정책은 `storage.objects` 테이블에 적용되는 PostgreSQL 정책입니다.

### 주요 개념

- **Bucket**: 파일을 저장하는 컨테이너
- **RLS Policy**: 누가 어떤 파일에 접근할 수 있는지 제어하는 규칙
- **storage.objects**: 모든 업로드된 파일의 메타데이터를 저장하는 테이블

### 정책 종류

- **SELECT**: 파일 읽기/다운로드
- **INSERT**: 파일 업로드
- **UPDATE**: 파일 수정 (upsert 포함)
- **DELETE**: 파일 삭제

---

## 2. 정책 설정이 필요한 이유

### 기본 동작

Supabase Storage는 **기본적으로 모든 업로드를 차단**합니다:
- RLS 정책이 없으면 → "new row violates row-level security policy" 에러 발생
- 공개 버킷이라도 정책이 없으면 업로드 불가

### 정책이 필요한 경우

1. **클라이언트에서 직접 업로드**: 브라우저에서 Supabase Storage API 호출
2. **인증된 사용자 업로드**: 로그인한 사용자만 파일 업로드
3. **특정 폴더 접근 제어**: 사용자별 폴더 분리

### 정책이 필요 없는 경우

- **서버에서 SERVICE_ROLE_KEY로 업로드**: RLS 우회 가능
- **읽기 전용 공개 파일**: SELECT 정책만 필요

---

## 3. 정책 설정 방법

### 방법 1: psql로 직접 실행 (권장)

가장 확실하고 빠른 방법입니다.

#### 1단계: SQL 파일 준비

`apply-storage-policies.sql` 파일 생성:

```sql
-- RLS 활성화 (이미 활성화되어 있을 수 있음)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (재실행 시 충돌 방지)
DROP POLICY IF EXISTS "Anyone can view portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete portfolio images" ON storage.objects;

-- 정책 1: 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can view portfolio images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'portfolio');

-- 정책 2: 인증된 사용자가 업로드 가능
CREATE POLICY "Authenticated users can upload portfolio images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio');

-- 정책 3: 인증된 사용자가 수정 가능
CREATE POLICY "Users can update portfolio images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'portfolio');

-- 정책 4: 인증된 사용자가 삭제 가능
CREATE POLICY "Users can delete portfolio images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio');
```

#### 2단계: psql로 실행

**Windows (CMD/PowerShell):**
```bash
# 환경변수로 비밀번호 설정
set PGPASSWORD=your_database_password

# SQL 실행
psql -h aws-1-ap-northeast-2.pooler.supabase.com -p 5432 -U postgres.bpvfkkrlyrjkwgwmfrci -d postgres -f apply-storage-policies.sql
```

**Windows (Git Bash):**
```bash
PGPASSWORD="your_database_password" psql -h aws-1-ap-northeast-2.pooler.supabase.com -p 5432 -U postgres.bpvfkkrlyrjkwgwmfrci -d postgres -f apply-storage-policies.sql
```

**예상 출력:**
```
ALTER TABLE (이미 활성화되어 있으면 에러 - 무시 가능)
DROP POLICY
DROP POLICY
DROP POLICY
DROP POLICY
CREATE POLICY
CREATE POLICY
CREATE POLICY
CREATE POLICY
```

#### 3단계: 데이터베이스 정보

- **Host**: `aws-1-ap-northeast-2.pooler.supabase.com`
- **Port**: `5432` (트랜잭션 모드) 또는 `6543` (세션 모드)
- **Database**: `postgres`
- **User**: `postgres.{project-ref}` (예: `postgres.bpvfkkrlyrjkwgwmfrci`)
- **Password**: Supabase 프로젝트 생성 시 설정한 비밀번호

---

### 방법 2: Supabase Dashboard SQL Editor

psql을 사용할 수 없는 경우 사용합니다.

#### 단계:

1. Supabase Dashboard 접속:
   ```
   https://supabase.com/dashboard/project/{project-ref}/sql/new
   ```

2. SQL 파일 내용을 복사하여 붙여넣기

3. "Run" 버튼 클릭

4. 성공 메시지 확인

**장점:**
- 웹 브라우저만 있으면 가능
- 비밀번호 입력 불필요 (이미 로그인됨)
- 에러 메시지가 명확

**단점:**
- 수동 작업 필요
- 자동화 불가능

---

### 방법 3: Supabase CLI (db push)

마이그레이션 파일을 사용한 방법입니다.

#### 1단계: 마이그레이션 파일 생성

```bash
supabase migration new create_storage_policies
```

파일 위치: `supabase/migrations/YYYYMMDDHHMMSS_create_storage_policies.sql`

#### 2단계: SQL 작성

```sql
-- storage.objects 정책 (위의 SQL과 동일)
CREATE POLICY "Anyone can view portfolio images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'portfolio');
-- ... (나머지 정책)
```

#### 3단계: 마이그레이션 푸시

```bash
supabase db push --password "your_database_password"
```

**문제점:**
- Windows 환경에서 연결 불안정
- 비밀번호 인증 실패 빈번
- Timeout 에러 발생 가능

**결론:** psql 직접 실행이 더 안정적

---

### 방법 4: Node.js 스크립트 (pg 라이브러리)

자동화가 필요한 경우 사용합니다.

#### 1단계: pg 설치

```bash
npm install pg
```

#### 2단계: 스크립트 작성

```javascript
const { Client } = require('pg')
const fs = require('fs')

const client = new Client({
  host: 'aws-1-ap-northeast-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.bpvfkkrlyrjkwgwmfrci',
  password: 'your_database_password',
  ssl: { rejectUnauthorized: false }
})

async function applyPolicies() {
  try {
    await client.connect()
    const sql = fs.readFileSync('apply-storage-policies.sql', 'utf8')
    await client.query(sql)
    console.log('✅ Policies applied successfully!')
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

applyPolicies()
```

#### 3단계: 실행

```bash
node scripts/apply-policies.js
```

**장점:**
- 자동화 가능
- CI/CD 파이프라인에 통합 가능

**단점:**
- 권한 에러 발생 가능 ("must be owner of table objects")
- `postgres` 사용자가 `storage.objects` 소유자가 아닐 수 있음

---

## 4. 정책 확인 및 테스트

### 정책 조회 (SQL)

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;
```

### 업로드 테스트 스크립트

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://your-project.supabase.co'
const anonKey = 'your-anon-key'

const supabase = createClient(supabaseUrl, anonKey)

async function testUpload() {
  // 테스트 이미지 (1x1 PNG)
  const testImage = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  )

  const { data, error } = await supabase.storage
    .from('portfolio')
    .upload(`test/test-${Date.now()}.png`, testImage, {
      contentType: 'image/png'
    })

  if (error) {
    console.log('❌ Upload failed:', error.message)
  } else {
    console.log('✅ Upload success:', data.path)
  }
}

testUpload()
```

**예상 결과:**
- 정책 없음: `new row violates row-level security policy`
- 정책 있음: `✅ Upload success: test/test-xxxxx.png`

---

## 5. 트러블슈팅

### 문제 1: "must be owner of table objects"

**원인:**
- `postgres` 사용자가 `storage.objects` 테이블의 소유자가 아님
- `storage.objects`는 `supabase_storage_admin` 역할이 소유

**해결책:**

1. **Supabase Dashboard SQL Editor 사용** (권장)
2. **SECURITY DEFINER 함수 사용**:
   ```sql
   CREATE OR REPLACE FUNCTION apply_storage_policies()
   RETURNS text
   LANGUAGE plpgsql
   SECURITY DEFINER
   AS $$
   BEGIN
     -- ALTER TABLE 명령 (실패 가능 - 무시)
     BEGIN
       ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
     EXCEPTION WHEN OTHERS THEN
       NULL; -- 이미 활성화되어 있음
     END;

     -- 정책 생성 (위의 SQL과 동일)
     -- ...

     RETURN 'Success';
   END;
   $$;

   -- 함수 호출
   SELECT apply_storage_policies();
   ```

3. **SERVICE_ROLE_KEY로 우회** (아래 참고)

---

### 문제 2: "new row violates row-level security policy"

**원인:**
- RLS 정책이 적용되지 않음
- 또는 정책 조건이 맞지 않음

**진단:**

1. 정책 존재 여부 확인:
   ```sql
   SELECT policyname FROM pg_policies
   WHERE schemaname = 'storage' AND tablename = 'objects';
   ```

2. 버킷 ID 확인:
   ```sql
   SELECT id, name FROM storage.buckets;
   ```

3. 사용자 인증 상태 확인:
   ```sql
   SELECT auth.uid(); -- 인증된 사용자만 반환값 있음
   ```

**해결책:**
- 정책이 없으면 → 정책 생성 (위의 방법 사용)
- 정책은 있는데 실패 → 정책 조건 확인 (bucket_id, 역할 등)

---

### 문제 3: ALTER TABLE 권한 에러

**증상:**
```
ERROR: must be owner of table objects
```

**원인:**
`ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY` 명령 실패

**해결책:**

RLS는 이미 활성화되어 있을 가능성이 높으므로 무시 가능:

```bash
# ALTER TABLE 명령 제외하고 실행
grep -v "ALTER TABLE" apply-storage-policies.sql | psql ...
```

또는 SQL 파일에서 해당 줄 제거:

```sql
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; (주석 처리)
```

---

### 문제 4: Supabase CLI 연결 실패

**증상:**
```
failed to connect to postgres: password authentication failed
failed to connect: timeout
```

**원인:**
- Windows 환경에서 Supabase CLI 연결 불안정
- 네트워크 타임아웃
- 비밀번호 인증 실패

**해결책:**

1. **psql 직접 사용** (권장)
2. **Supabase Dashboard 사용**
3. **VPN 비활성화 후 재시도**
4. **포트 변경**: 5432 → 6543 또는 반대

---

## 6. 대안: SERVICE_ROLE_KEY 사용

정책 설정이 어려운 경우, API에서 SERVICE_ROLE_KEY를 사용하여 RLS를 우회할 수 있습니다.

### 장점

- 정책 설정 불필요
- RLS 문제 완전 회피
- 즉시 작동

### 단점

- 서버 측에서만 사용 가능
- 클라이언트에서 직접 업로드 불가
- 보안 주의 필요 (SERVICE_ROLE_KEY 노출 금지)

### 구현 방법

#### 1. 환경 변수 설정

`.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. API 라우트에서 사용

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  // 1. 사용자 인증 확인
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. SERVICE_ROLE_KEY로 Admin Client 생성
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 3. 파일 업로드 (RLS 우회)
  const { data, error: uploadError } = await supabaseAdmin.storage
    .from('portfolio')
    .upload(filePath, fileBuffer, {
      contentType: file.type
    })

  // ...
}
```

#### 3. 보안 주의사항

**✅ 해야 할 것:**
- 서버 API에서만 사용
- 환경 변수로 관리
- `.gitignore`에 `.env.local` 추가

**❌ 하지 말아야 할 것:**
- 클라이언트 코드에 포함
- Git에 커밋
- 브라우저에 노출

---

## 7. 실전 예제

### 예제 1: Portfolio 버킷 정책

**요구사항:**
- 모든 사용자: 이미지 읽기 가능
- 인증된 사용자: 업로드/수정/삭제 가능

**SQL:**
```sql
-- 읽기: 공개
CREATE POLICY "Anyone can view portfolio images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'portfolio');

-- 업로드: 인증 필요
CREATE POLICY "Authenticated users can upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio');

-- 수정: 인증 필요
CREATE POLICY "Authenticated users can update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'portfolio');

-- 삭제: 인증 필요
CREATE POLICY "Authenticated users can delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio');
```

---

### 예제 2: 사용자별 폴더 분리

**요구사항:**
- 사용자는 자신의 폴더(`{user_id}/`)에만 접근 가능

**SQL:**
```sql
-- 읽기: 자신의 폴더만
CREATE POLICY "Users can view own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'private'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 업로드: 자신의 폴더만
CREATE POLICY "Users can upload to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'private'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

**Helper Functions:**
- `storage.foldername(name)`: 폴더 경로 추출
- `storage.filename(name)`: 파일명 추출
- `storage.extension(name)`: 확장자 추출
- `auth.uid()`: 현재 사용자 UUID

---

### 예제 3: 파일 타입 제한

**요구사항:**
- 이미지 파일만 업로드 가능

**SQL:**
```sql
CREATE POLICY "Only images allowed"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
  );
```

---

## 8. 체크리스트

### 정책 설정 전

- [ ] Supabase 프로젝트 생성
- [ ] Storage 버킷 생성
- [ ] 데이터베이스 비밀번호 확인
- [ ] psql 또는 Dashboard 접근 가능

### 정책 설정 중

- [ ] SQL 파일 작성
- [ ] 버킷 ID 확인
- [ ] 정책 조건 확인 (bucket_id, 역할 등)
- [ ] SQL 실행

### 정책 설정 후

- [ ] 정책 존재 여부 확인 (`SELECT FROM pg_policies`)
- [ ] 업로드 테스트 (ANON_KEY)
- [ ] 업로드 테스트 (인증된 사용자)
- [ ] 읽기 테스트 (공개 URL)

---

## 9. 참고 자료

### 공식 문서

- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Storage Helper Functions](https://supabase.com/docs/guides/storage/schema/helper-functions)

### 관련 문서

- [SUPABASE_MIGRATION_GUIDE.md](./SUPABASE_MIGRATION_GUIDE.md) - 마이그레이션 전체 가이드
- [SUPABASE_DIRECT_ACCESS_GUIDE.md](./SUPABASE_DIRECT_ACCESS_GUIDE.md) - 데이터베이스 직접 접근

### Supabase Dashboard 링크

- **SQL Editor**: https://supabase.com/dashboard/project/{project-ref}/sql/new
- **Storage**: https://supabase.com/dashboard/project/{project-ref}/storage/buckets
- **API Settings**: https://supabase.com/dashboard/project/{project-ref}/settings/api

---

## 10. 요약

### 권장 방법 (우선순위)

1. **psql로 직접 실행** - 가장 확실하고 빠름
2. **Supabase Dashboard SQL Editor** - psql 사용 불가 시
3. **SERVICE_ROLE_KEY 사용** - 정책 설정 실패 시

### 핵심 포인트

- Storage 정책은 **SQL로만** 생성 가능
- `storage.objects` 테이블에 정책 적용
- **반드시 bucket_id 조건** 포함
- 정책 없으면 **업로드 불가**
- SERVICE_ROLE_KEY로 **RLS 우회** 가능

### 일반적인 에러

| 에러 메시지 | 원인 | 해결 방법 |
|------------|------|----------|
| `new row violates row-level security policy` | 정책 없음 | 정책 생성 |
| `must be owner of table objects` | 권한 부족 | Dashboard 또는 SECURITY DEFINER 함수 사용 |
| `password authentication failed` | 비밀번호 오류 | 비밀번호 확인 |
| `connection timeout` | 네트워크 문제 | VPN 끄기, 포트 변경 |

---

**작성일**: 2025-11-06
**프로젝트**: talent
**Supabase Project**: bpvfkkrlyrjkwgwmfrci
**최종 업데이트**: Portfolio 이미지 업로드 구현
