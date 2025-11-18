# Supabase 마이그레이션 가이드

Supabase에서 데이터베이스 마이그레이션과 스토리지 버킷을 생성하는 방법을 정리한 문서입니다.

## 목차
1. [환경 변수 설정](#1-환경-변수-설정)
2. [Supabase CLI를 통한 마이그레이션](#2-supabase-cli를-통한-마이그레이션)
3. [Service Role Key를 사용한 버킷 생성](#3-service-role-key를-사용한-버킷-생성)
4. [마이그레이션 파일 작성 규칙](#4-마이그레이션-파일-작성-규칙)
5. [트러블슈팅](#5-트러블슈팅)

---

## 1. 환경 변수 설정

### 1.1 필요한 환경 변수

`.env.local` 파일에 다음 환경 변수를 추가합니다:

```env
# Supabase URL (공개)
NEXT_PUBLIC_SUPABASE_URL=https://bpvfkkrlyrjkwgwmfrci.supabase.co

# Anon Key (공개 - 클라이언트에서 사용, RLS 적용됨)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3MTYsImV4cCI6MjA3Njk1NDcxNn0.luCRwnwQVctX3ewuSjhkQJ6veanWqa2NgivpDI7_Gl4

# Service Role Key (비밀 - 서버에서만 사용, RLS 우회 가능)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8
```

### 1.2 키 확인 방법

Supabase Dashboard에서 키를 확인할 수 있습니다:

1. **URL 및 Anon Key**:
   - https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/settings/api
   - "Project URL" 및 "anon public" 키 복사

2. **Service Role Key**:
   - 같은 페이지에서 "service_role" 키 복사
   - "Reveal" 버튼을 클릭해야 보입니다
   - ⚠️ **절대 클라이언트 코드에 노출하지 마세요!**

### 1.3 보안 주의사항

```bash
# .gitignore에 반드시 추가
.env.local
.env
*.key

# ✅ 클라이언트에서 사용 가능 (RLS 적용)
NEXT_PUBLIC_SUPABASE_ANON_KEY

# ❌ 절대 클라이언트에 노출 금지 (RLS 우회)
SUPABASE_SERVICE_ROLE_KEY
```

---

## 2. Supabase CLI를 통한 마이그레이션

### 2.1 마이그레이션 파일 생성

```bash
# 새 마이그레이션 파일 생성
supabase migration new create_seller_portfolio

# 파일 위치: supabase/migrations/YYYYMMDDHHMMSS_create_seller_portfolio.sql
```

### 2.2 마이그레이션 파일 작성 예시

#### 테이블 생성 예시

```sql
-- seller_portfolio 테이블 생성
CREATE TABLE IF NOT EXISTS public.seller_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  project_url TEXT,
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_seller_portfolio_seller_id
  ON public.seller_portfolio(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_portfolio_category_id
  ON public.seller_portfolio(category_id);
CREATE INDEX IF NOT EXISTS idx_seller_portfolio_created_at
  ON public.seller_portfolio(created_at DESC);

-- RLS 활성화
ALTER TABLE public.seller_portfolio ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 조회 가능
CREATE POLICY "Anyone can view portfolio"
  ON public.seller_portfolio
  FOR SELECT
  TO public
  USING (true);

-- RLS 정책: 판매자는 자신의 포트폴리오 생성 가능
CREATE POLICY "Sellers can insert own portfolio"
  ON public.seller_portfolio
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sellers
      WHERE sellers.id = seller_portfolio.seller_id
      AND sellers.user_id = auth.uid()
    )
  );

-- RLS 정책: 판매자는 자신의 포트폴리오 수정 가능
CREATE POLICY "Sellers can update own portfolio"
  ON public.seller_portfolio
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sellers
      WHERE sellers.id = seller_portfolio.seller_id
      AND sellers.user_id = auth.uid()
    )
  );

-- RLS 정책: 판매자는 자신의 포트폴리오 삭제 가능
CREATE POLICY "Sellers can delete own portfolio"
  ON public.seller_portfolio
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sellers
      WHERE sellers.id = seller_portfolio.seller_id
      AND sellers.user_id = auth.uid()
    )
  );
```

### 2.3 마이그레이션 적용 (Push)

#### 방법 1: Supabase CLI (권장하지 않음 - 연결 불안정)

```bash
# 프로젝트 연결
supabase link --project-ref bpvfkkrlyrjkwgwmfrci

# 마이그레이션 푸시
supabase db push

# 문제점: 비밀번호 인증 실패, 연결 타임아웃 발생 가능
```

**주의**: Windows 환경에서 `supabase db push` 명령은 자주 실패합니다:
- 연결 타임아웃
- 비밀번호 인증 실패
- DNS 해석 실패

#### 방법 2: Supabase Dashboard SQL Editor (권장)

1. https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new 접속
2. 마이그레이션 파일 내용 복사
3. SQL Editor에 붙여넣기
4. "Run" 버튼 클릭
5. 결과 확인

**장점**:
- 즉시 실행 가능
- 오류 메시지가 명확
- 연결 문제 없음
- 실행 결과를 바로 확인 가능

### 2.4 마이그레이션 확인

```javascript
// scripts/check-migration.js
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkTable() {
  const { data, error } = await supabase
    .from('seller_portfolio')
    .select('*')
    .limit(1)

  if (error) {
    console.log('❌ Table not found:', error.message)
  } else {
    console.log('✅ Table exists')
  }
}

checkTable()
```

```bash
node scripts/check-migration.js
```

---

## 3. Service Role Key를 사용한 버킷 생성

Storage 버킷은 **ANON_KEY로 생성 불가**합니다. **SERVICE_ROLE_KEY**가 필요합니다.

### 3.1 버킷 생성 스크립트

```javascript
// scripts/create-storage-bucket.js
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function createPortfolioBucket() {
  console.log('Creating portfolio storage bucket...\n')

  // 1. 버킷이 이미 존재하는지 확인
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.log('❌ Error listing buckets:', listError.message)
    return
  }

  const existingBucket = buckets.find(b => b.id === 'portfolio')
  if (existingBucket) {
    console.log('✅ Portfolio bucket already exists!')
    return
  }

  // 2. 버킷 생성
  const { data, error } = await supabase.storage.createBucket('portfolio', {
    public: true,                  // 공개 접근 가능
    fileSizeLimit: 10485760,       // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
  })

  if (error) {
    console.log('❌ Error creating bucket:', error.message)
    return
  }

  console.log('✅ Portfolio bucket created successfully!')
  console.log('Data:', data)
}

createPortfolioBucket()
```

### 3.2 버킷 생성 실행

```bash
# .env.local에서 SERVICE_ROLE_KEY 로드
node scripts/create-storage-bucket.js
```

### 3.3 버킷 정책 설정 (SQL)

버킷 생성 후 Storage 정책을 SQL로 추가합니다:

```sql
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
```

이 SQL을 Supabase Dashboard SQL Editor에서 실행합니다.

### 3.4 버킷 확인

```javascript
// scripts/check-bucket.js
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function checkBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets()

  if (error) {
    console.log('❌ Error:', error.message)
    return
  }

  const portfolioBucket = buckets.find(b => b.id === 'portfolio')
  if (portfolioBucket) {
    console.log('✅ Portfolio bucket exists')
    console.log('Bucket info:', portfolioBucket)
  } else {
    console.log('❌ Portfolio bucket not found')
  }
}

checkBucket()
```

```bash
node scripts/check-bucket.js
```

---

## 4. 마이그레이션 파일 작성 규칙

### 4.1 IF NOT EXISTS 사용

중복 실행을 방지하기 위해 항상 `IF NOT EXISTS`를 사용합니다:

```sql
-- ✅ 권장
CREATE TABLE IF NOT EXISTS table_name (...);
CREATE INDEX IF NOT EXISTS index_name ON table_name(...);

-- ❌ 비권장 (재실행 시 에러)
CREATE TABLE table_name (...);
CREATE INDEX index_name ON table_name(...);
```

### 4.2 정책 생성 시 DO 블록 사용

`CREATE POLICY IF NOT EXISTS`는 지원되지 않으므로 DO 블록을 사용합니다:

```sql
-- ✅ 권장
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'table_name'
    AND policyname = 'Policy Name'
  ) THEN
    CREATE POLICY "Policy Name"
      ON public.table_name
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- ❌ 비권장 (지원 안 됨)
CREATE POLICY IF NOT EXISTS "Policy Name" ...
```

### 4.3 타입 불일치 주의

Foreign Key 생성 시 타입이 일치해야 합니다:

```sql
-- ✅ 정상 (categories.id가 TEXT인 경우)
CREATE TABLE seller_portfolio (
  category_id TEXT REFERENCES public.categories(id)
);

-- ❌ 에러 (타입 불일치)
CREATE TABLE seller_portfolio (
  category_id UUID REFERENCES public.categories(id)
);
```

### 4.4 마이그레이션 파일 네이밍

```bash
# 형식: YYYYMMDDHHMMSS_description.sql
20251106130000_create_seller_portfolio.sql
20251106130001_create_portfolio_storage.sql
20251106140000_add_wishlist_count.sql
```

- 타임스탬프 순서대로 실행됩니다
- 설명은 snake_case로 작성
- 한 파일에 하나의 주요 기능만 포함

---

## 5. 트러블슈팅

### 5.1 Supabase CLI Push 실패

**문제:**
```bash
failed to connect to postgres: failed to connect to host
```

**해결:**
1. Supabase Dashboard SQL Editor 사용 (권장)
2. 네트워크 연결 확인
3. Supabase 프로젝트 상태 확인
4. VPN 사용 시 VPN 비활성화 후 재시도

### 5.2 ANON_KEY로 버킷 생성 불가

**문제:**
```bash
new row violates row-level security policy
```

**해결:**
- ANON_KEY가 아닌 SERVICE_ROLE_KEY 사용
- 또는 Supabase Dashboard에서 수동 생성

### 5.3 Storage 정책 적용 안 됨

**문제:**
업로드는 되지만 이미지 접근 불가

**해결:**
```sql
-- 정책 확인
SELECT * FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects';

-- 정책이 없으면 DO 블록으로 추가
```

### 5.4 타입 불일치 에러

**문제:**
```sql
ERROR: foreign key constraint fails
ERROR: column "category_id" is of type uuid but expression is of type text
```

**해결:**
```sql
-- 참조 테이블의 실제 타입 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'categories'
AND column_name = 'id';

-- 일치하는 타입 사용
```

### 5.5 마이그레이션 재실행 시 에러

**문제:**
```sql
ERROR: relation "table_name" already exists
```

**해결:**
- 모든 CREATE 문에 `IF NOT EXISTS` 추가
- 정책은 DO 블록으로 존재 여부 확인 후 생성

---

## 6. 전체 워크플로우

### 6.1 테이블 추가 워크플로우

```bash
# 1. 마이그레이션 파일 생성
supabase migration new create_new_table

# 2. SQL 작성 (에디터에서)
# supabase/migrations/xxx_create_new_table.sql

# 3. Dashboard SQL Editor에서 실행
# https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new

# 4. 확인 스크립트 작성 및 실행
node scripts/check-new-table.js
```

### 6.2 스토리지 버킷 추가 워크플로우

```bash
# 1. 버킷 생성 스크립트 작성
# scripts/create-new-bucket.js

# 2. SERVICE_ROLE_KEY로 실행
node scripts/create-new-bucket.js

# 3. 정책 SQL 작성

# 4. Dashboard SQL Editor에서 정책 실행

# 5. 버킷 확인
node scripts/check-new-bucket.js
```

---

## 7. 참고 자료

### 7.1 Supabase 대시보드 링크

- **프로젝트 대시보드**: https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci
- **SQL Editor**: https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new
- **Storage**: https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/storage/buckets
- **API Settings**: https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/settings/api
- **Database**: https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/database/tables

### 7.2 관련 문서

- [Supabase 직접 접속 가이드](./SUPABASE_DIRECT_ACCESS_GUIDE.md)
- [Supabase CLI 문서](https://supabase.com/docs/guides/cli)
- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [PostgreSQL RLS 문서](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**작성일**: 2025-11-06
**프로젝트**: talent
**Supabase Project**: bpvfkkrlyrjkwgwmfrci
**최종 업데이트**: 포트폴리오 시스템 구축
