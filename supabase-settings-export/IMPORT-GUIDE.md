# Supabase 프로젝트 Import 가이드

## 1. 새 Supabase 프로젝트 생성

1. https://supabase.com/dashboard 접속
2. "New Project" 클릭
3. 프로젝트 이름, 비밀번호, 리전 설정
4. 프로젝트 생성 완료 대기

## 2. 데이터베이스 스키마 Import

### 방법 1: Migration 파일 사용 (권장)

```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 초기화
supabase init

# 기존 migration 파일들을 새 프로젝트의 supabase/migrations/ 폴더로 복사
# (이 프로젝트의 supabase/migrations/ 폴더 전체)

# 새 Supabase 프로젝트 연결
supabase link --project-ref [NEW_PROJECT_ID]

# Migration 실행
supabase db push
```

### 방법 2: SQL 파일 직접 실행

1. Supabase Dashboard → SQL Editor
2. 다음 순서로 SQL 파일 실행:
   - `enums.sql` (먼저 실행)
   - `database-export/full-schema.sql`
   - `indexes.sql`
   - `views.sql`
   - `database-functions.sql`

## 3. RLS Policies Import

Dashboard → Authentication → Policies에서:
- `rls-policies.json` 내용 참고하여 정책 수동 생성
- 또는 SQL Editor에서 CREATE POLICY 문 실행

## 4. Storage 설정

### Buckets 생성
Dashboard → Storage → Create bucket
- `storage-buckets.json` 참고

### Storage Policies 설정
Dashboard → Storage → [Bucket] → Policies
- `storage-policies.json` 참고

## 5. Auth 설정

Dashboard → Authentication → Providers
- `auth-config.json` 참고하여 설정

## 6. 데이터 Import

### 방법 1: JSON 데이터 Import 스크립트 사용

```bash
node scripts/import-data.js
```

### 방법 2: SQL INSERT 문 생성 후 실행

각 `.json` 파일을 INSERT 문으로 변환하여 실행

## 7. Environment Variables 업데이트

새 프로젝트의 정보로 업데이트:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 8. 검증

1. 모든 테이블이 생성되었는지 확인
2. 데이터가 정상적으로 import되었는지 확인
3. RLS policies가 작동하는지 테스트
4. Storage 업로드/다운로드 테스트
5. Auth 로그인/회원가입 테스트

## Export된 파일 목록

### 데이터베이스
- `database-export/`: 모든 테이블 데이터 (JSON)
- `full-schema.sql`: 전체 스키마
- `foreign-keys.json`: 외래 키 제약조건

### 데이터베이스 객체
- `enums.sql`: Enum 타입
- `indexes.sql`: 인덱스
- `views.sql`: 뷰
- `database-functions.sql`: 함수
- `triggers.json`: 트리거

### 설정
- `project-info.json`: 프로젝트 기본 정보
- `auth-config.json`: Auth 설정
- `rls-policies.json`: RLS 정책
- `storage-buckets.json`: Storage 버킷
- `storage-policies.json`: Storage 정책

### Migration 파일
- `supabase/migrations/`: 기존 migration 파일 (50개)

## 주의사항

1. **순서 중요**: Enum → Schema → Indexes → Views → Functions 순서로 import
2. **외래 키**: 참조되는 테이블을 먼저 import
3. **RLS**: 데이터 import 전에 RLS를 비활성화하고, import 후 다시 활성화
4. **Secrets**: API keys, passwords는 수동으로 설정 필요
5. **Storage**: 파일은 별도로 다운로드/업로드 필요

## 도움이 필요한 경우

- Supabase 공식 문서: https://supabase.com/docs
- CLI 참고: https://supabase.com/docs/reference/cli
