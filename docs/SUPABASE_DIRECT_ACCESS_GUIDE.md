# Supabase 직접 접속 가이드

Claude Code에서 Supabase 데이터베이스에 직접 접속하는 방법을 단계별로 설명합니다.

## 목차
1. [Supabase CLI 설치 및 로그인](#1-supabase-cli-설치-및-로그인)
2. [PostgreSQL 클라이언트 설치](#2-postgresql-클라이언트-설치)
3. [REST API를 통한 접근](#3-rest-api를-통한-접근)
4. [Supabase Management API 사용](#4-supabase-management-api-사용)
5. [데이터베이스 마이그레이션](#5-데이터베이스-마이그레이션)

---

## 1. Supabase CLI 설치 및 로그인

### 1.1 Supabase CLI 설치 (Windows - Scoop)

```bash
# Scoop으로 Supabase CLI 설치
scoop install supabase

# 버전 확인
supabase --version
```

### 1.2 Supabase CLI 업데이트

```bash
# 최신 버전으로 업데이트
scoop update supabase
```

### 1.3 Supabase 로그인

```bash
# Access Token으로 로그인
supabase login --token YOUR_ACCESS_TOKEN

# 예시
supabase login --token sbp_e3f3fef6e88597c1d548a19284a2a0cc8c0a3020
```

**Access Token 발급 방법:**
1. https://supabase.com/dashboard/account/tokens 접속
2. "Generate New Token" 클릭
3. 토큰 이름 입력 후 생성
4. 생성된 토큰 복사 (한 번만 표시됨)

### 1.4 프로젝트 목록 확인

```bash
# 모든 프로젝트 조회
supabase projects list

# JSON 형식으로 조회
supabase projects list --output json
```

출력 예시:
```
LINKED | ORG ID               | REFERENCE ID         | NAME               | REGION
  ●    | gewhpjonpmahjphpyibf | bpvfkkrlyrjkwgwmfrci | talent             | Northeast Asia (Seoul)
```

### 1.5 프로젝트 연결

```bash
# 프로젝트 디렉토리에서 실행
cd /path/to/your/project

# 프로젝트 ID로 연결
supabase link --project-ref bpvfkkrlyrjkwgwmfrci
```

---

## 2. PostgreSQL 클라이언트 설치

### 2.1 psql 설치 (Windows - Scoop)

```bash
# PostgreSQL 설치 (psql 포함)
scoop install postgresql

# 버전 확인
psql --version
```

### 2.2 데이터베이스 정보 확인

프로젝트 정보에서 데이터베이스 접속 정보를 확인:

```bash
supabase projects list --output json
```

주요 정보:
- **Host**: `db.{project_ref}.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: 프로젝트 생성 시 설정한 비밀번호

### 2.3 psql로 직접 접속

```bash
# 환경변수로 비밀번호 설정
export PGPASSWORD="your_database_password"

# 또는 Windows CMD
set PGPASSWORD=your_database_password

# psql 접속
psql -h db.bpvfkkrlyrjkwgwmfrci.supabase.co -p 5432 -U postgres -d postgres

# 쿼리 실행 예시
psql -h db.bpvfkkrlyrjkwgwmfrci.supabase.co -p 5432 -U postgres -d postgres -c "SELECT * FROM public.categories LIMIT 5;"
```

**주의사항:**
- Git Bash에서 경로 문제가 발생할 수 있음
- 경로는 Unix 스타일로 작성: `/c/Users/...`

---

## 3. REST API를 통한 접근

Supabase는 PostgREST를 통해 RESTful API를 제공합니다.

### 3.1 필요한 정보

`.env.local` 파일에서 확인:
```env
NEXT_PUBLIC_SUPABASE_URL=https://bpvfkkrlyrjkwgwmfrci.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.2 데이터 조회 (SELECT)

```bash
# 기본 조회
curl -X GET "https://bpvfkkrlyrjkwgwmfrci.supabase.co/rest/v1/categories?select=*&limit=5" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# 특정 컬럼만 조회
curl -X GET "https://bpvfkkrlyrjkwgwmfrci.supabase.co/rest/v1/categories?select=id,name,slug" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# 필터링
curl -X GET "https://bpvfkkrlyrjkwgwmfrci.supabase.co/rest/v1/categories?select=*&level=eq.1" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# 정렬
curl -X GET "https://bpvfkkrlyrjkwgwmfrci.supabase.co/rest/v1/categories?select=*&order=created_at.desc" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 3.3 데이터 삽입 (INSERT)

```bash
curl -X POST "https://bpvfkkrlyrjkwgwmfrci.supabase.co/rest/v1/table_name" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "column1": "value1",
    "column2": "value2"
  }'
```

### 3.4 데이터 수정 (UPDATE)

```bash
curl -X PATCH "https://bpvfkkrlyrjkwgwmfrci.supabase.co/rest/v1/table_name?id=eq.uuid" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "column1": "new_value"
  }'
```

### 3.5 데이터 삭제 (DELETE)

```bash
curl -X DELETE "https://bpvfkkrlyrjkwgwmfrci.supabase.co/rest/v1/table_name?id=eq.uuid" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 4. Supabase Management API 사용

프로젝트 설정을 변경하거나 관리 작업을 수행할 때 사용합니다.

### 4.1 인증

Management API는 Personal Access Token을 사용합니다:

```bash
# Authorization 헤더에 토큰 추가
-H "Authorization: Bearer sbp_YOUR_ACCESS_TOKEN"
```

### 4.2 프로젝트 정보 조회

```bash
# 프로젝트 목록
curl -X GET "https://api.supabase.com/v1/projects" \
  -H "Authorization: Bearer sbp_YOUR_ACCESS_TOKEN"

# 특정 프로젝트 상세 정보
curl -X GET "https://api.supabase.com/v1/projects/bpvfkkrlyrjkwgwmfrci" \
  -H "Authorization: Bearer sbp_YOUR_ACCESS_TOKEN"
```

### 4.3 Auth 설정 조회

```bash
curl -X GET "https://api.supabase.com/v1/projects/bpvfkkrlyrjkwgwmfrci/config/auth" \
  -H "Authorization: Bearer sbp_YOUR_ACCESS_TOKEN"
```

### 4.4 Auth 설정 변경

```bash
# 유출 비밀번호 보호 활성화
curl -X PATCH "https://api.supabase.com/v1/projects/bpvfkkrlyrjkwgwmfrci/config/auth" \
  -H "Authorization: Bearer sbp_YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password_hibp_enabled": true,
    "password_min_length": 8
  }'
```

### 4.5 주요 Management API 엔드포인트

```bash
# 데이터베이스 설정
GET/PATCH /v1/projects/{ref}/config/database

# 스토리지 설정
GET/PATCH /v1/projects/{ref}/config/storage

# API 설정
GET/PATCH /v1/projects/{ref}/config/api

# 프로젝트 재시작
POST /v1/projects/{ref}/restart

# 조직 목록
GET /v1/organizations

# 프로젝트 생성
POST /v1/projects
```

---

## 5. 데이터베이스 마이그레이션

### 5.1 데이터베이스 스키마 확인

```bash
# 원격 데이터베이스 스키마 덤프
supabase db dump --linked --schema public > schema.sql

# 특정 테이블만 덤프
supabase db dump --linked --schema public --table categories > categories.sql
```

### 5.2 마이그레이션 파일 생성

```bash
# 새 마이그레이션 파일 생성
supabase migration new migration_name

# 예시
supabase migration new enable_rls_for_tables
```

파일 위치: `supabase/migrations/YYYYMMDDHHMMSS_migration_name.sql`

### 5.3 마이그레이션 적용

```bash
# 원격 데이터베이스에 마이그레이션 푸시
supabase db push --linked

# 자동 승인 (프로덕션에서는 주의!)
echo "y" | supabase db push --linked
```

### 5.4 마이그레이션 확인

```bash
# 적용된 마이그레이션 목록
supabase migration list --linked

# 원격 데이터베이스와 로컬 차이 확인
supabase db diff --linked
```

### 5.5 데이터베이스 리셋 (로컬만!)

```bash
# ⚠️ 로컬 데이터베이스만 리셋
supabase db reset

# 원격 데이터베이스는 절대 리셋하지 마세요!
```

---

## 6. 실전 예제

### 6.1 테이블 데이터 확인

```bash
# REST API로 category_visits 테이블 확인
curl -s "https://bpvfkkrlyrjkwgwmfrci.supabase.co/rest/v1/category_visits?select=*&order=last_visited_at.desc&limit=10" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" | jq '.'
```

### 6.2 RLS 정책 확인

```bash
# 마이그레이션 파일 생성
supabase migration new check_rls_policies

# SQL 작성 (supabase/migrations/xxx_check_rls_policies.sql)
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 6.3 함수 search_path 확인

```sql
-- 함수 정의 확인
SELECT
  n.nspname as schema,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_functiondef(p.oid) LIKE '%search_path%';
```

### 6.4 전체 워크플로우

```bash
# 1. 로그인
supabase login --token YOUR_TOKEN

# 2. 프로젝트 연결
supabase link --project-ref YOUR_PROJECT_REF

# 3. 스키마 확인
supabase db dump --linked --schema public

# 4. 마이그레이션 생성
supabase migration new my_changes

# 5. SQL 작성 (에디터에서)
# supabase/migrations/xxx_my_changes.sql

# 6. 마이그레이션 적용
supabase db push --linked

# 7. 결과 확인 (REST API)
curl -X GET "https://YOUR_PROJECT.supabase.co/rest/v1/your_table?select=*" \
  -H "apikey: YOUR_KEY" \
  -H "Authorization: Bearer YOUR_KEY"
```

---

## 7. 트러블슈팅

### 7.1 DNS 해석 실패

**문제:**
```
psql: error: could not translate host name to address: Name or service not known
```

**해결:**
- 인터넷 연결 확인
- DNS 서버 변경 (8.8.8.8, 1.1.1.1)
- REST API 사용으로 대체

### 7.2 RLS 정책으로 데이터 접근 불가

**문제:**
```
curl 요청 시 빈 배열 [] 반환
```

**해결:**
- RLS 정책 확인
- 인증 토큰 확인
- Service Role Key 사용 (관리 작업 시)

### 7.3 마이그레이션 충돌

**문제:**
```
ERROR: relation "table_name" already exists
```

**해결:**
```sql
-- IF NOT EXISTS 사용
CREATE TABLE IF NOT EXISTS table_name (...);
CREATE INDEX IF NOT EXISTS index_name ON table_name(...);

-- DROP IF EXISTS 먼저 실행
DROP TABLE IF EXISTS table_name;
CREATE TABLE table_name (...);
```

---

## 8. 보안 주의사항

### 8.1 토큰 관리

```bash
# ❌ 절대 Git에 커밋하지 마세요
.env.local
.env
*.key
config.toml (토큰 포함 시)

# ✅ 환경 변수 사용
export SUPABASE_ACCESS_TOKEN="your_token"
export SUPABASE_DB_PASSWORD="your_password"

# ✅ .gitignore에 추가
echo ".env.local" >> .gitignore
echo "*.key" >> .gitignore
```

### 8.2 Service Role Key vs Anon Key

- **Anon Key**: 클라이언트에서 사용, RLS 정책 적용됨
- **Service Role Key**: 서버/관리 작업용, RLS 우회 가능 (조심!)

```bash
# Anon Key 사용 (RLS 적용)
curl -H "apikey: ${SUPABASE_ANON_KEY}" ...

# Service Role Key 사용 (RLS 우회)
curl -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" ...
```

---

## 9. 유용한 리소스

- **공식 문서**: https://supabase.com/docs
- **CLI 문서**: https://supabase.com/docs/guides/cli
- **API 문서**: https://supabase.com/docs/reference
- **PostgREST 문서**: https://postgrest.org/
- **Database Linter**: https://supabase.com/docs/guides/database/database-linter

---

## 10. 체크리스트

프로젝트에서 Supabase 접근 시 확인사항:

- [ ] Supabase CLI 설치 및 로그인 완료
- [ ] 프로젝트 연결 확인 (`supabase projects list`)
- [ ] 데이터베이스 비밀번호 확인
- [ ] `.env.local` 파일에 필요한 키 설정
- [ ] RLS 정책 검토 및 적용
- [ ] 마이그레이션 파일 버전 관리
- [ ] 보안 토큰 `.gitignore`에 추가
- [ ] Database Linter 경고 확인 및 해결

---

**작성일**: 2025-10-30
**프로젝트**: talent
**Supabase 버전**: CLI 2.54.11
