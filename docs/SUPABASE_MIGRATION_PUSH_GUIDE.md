# Supabase 마이그레이션 푸시 완벽 가이드

Supabase에 마이그레이션을 푸시하는 모든 방법을 정리한 문서입니다.

## 📋 목차

1. [환경 정보](#환경-정보)
2. [방법 1: Supabase CLI (권장)](#방법-1-supabase-cli-권장)
3. [방법 2: PostgreSQL 직접 연결](#방법-2-postgresql-직접-연결)
4. [방법 3: Supabase Dashboard](#방법-3-supabase-dashboard)
5. [방법 4: Node.js 스크립트](#방법-4-nodejs-스크립트)
6. [방법 5: REST API](#방법-5-rest-api)
7. [트러블슈팅](#트러블슈팅)
8. [현재 프로젝트 정보](#현재-프로젝트-정보)

---

## 환경 정보

### 프로젝트 정보
- **Project Ref**: `bpvfkkrlyrjkwgwmfrci`
- **Region**: Northeast Asia (Seoul)
- **Organization ID**: `gewhpjonpmahjphpyibf`
- **Supabase URL**: `https://bpvfkkrlyrjkwgwmfrci.supabase.co`

### 연결 정보
- **Pooler URL (Transaction)**: `postgresql://postgres.bpvfkkrlyrjkwgwmfrci@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`
- **Pooler URL (Session)**: `postgresql://postgres.bpvfkkrlyrjkwgwmfrci@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres`
- **Direct Connection**: `db.bpvfkkrlyrjkwgwmfrci.supabase.co:5432`

### 필요한 자격 증명
1. **Database Password**: 프로젝트 생성 시 설정한 비밀번호
2. **Supabase Access Token**: https://supabase.com/dashboard/account/tokens 에서 생성
3. **Service Role Key**: `.env.local` 파일의 `SUPABASE_SERVICE_ROLE_KEY`

---

## 방법 1: Supabase CLI (권장)

가장 안전하고 권장되는 방법입니다.

### 1.1 기본 사용법

```bash
# 프로젝트 디렉토리로 이동
cd C:\Users\ohyus\talent

# 마이그레이션 푸시
npx supabase db push

# 'Y' 입력하여 확인
```

### 1.2 자동 승인

```bash
# Windows PowerShell
powershell -Command "Write-Host 'Y' | npx supabase db push"

# Windows CMD
echo Y | npx supabase db push

# Bash/Git Bash
echo "Y" | npx supabase db push
```

### 1.3 디버그 모드

```bash
# 상세한 로그 출력
npx supabase db push --debug

# 특정 마이그레이션까지만 적용
npx supabase db push --version 20251109000000

# 모든 마이그레이션 포함
npx supabase db push --include-all
```

### 1.4 로그인 필요 시

```bash
# Access Token으로 로그인
npx supabase login --token YOUR_ACCESS_TOKEN

# 프로젝트 연결 확인
npx supabase projects list

# 프로젝트 링크 (처음 한 번만)
npx supabase link --project-ref bpvfkkrlyrjkwgwmfrci
```

### 1.5 마이그레이션 상태 확인

```bash
# 적용된 마이그레이션 목록
npx supabase migration list

# 원격과 로컬 차이 확인
npx supabase db diff --linked

# 마이그레이션 파일 목록
ls supabase/migrations/
```

---

## 방법 2: PostgreSQL 직접 연결

`psql` 또는 `pg` 라이브러리를 사용한 직접 연결 방법입니다.

### 2.1 psql 사용

```bash
# 환경 변수 설정
export PGPASSWORD="chl1197dbA!@"

# 마이그레이션 파일 실행
psql -h aws-1-ap-northeast-2.pooler.supabase.com \
     -p 5432 \
     -U postgres.bpvfkkrlyrjkwgwmfrci \
     -d postgres \
     -f supabase/migrations/20251109010000_refactor_chat_rooms_for_any_users.sql

# 또는 파이프 사용
cat supabase/migrations/20251109010000_refactor_chat_rooms_for_any_users.sql | \
  psql -h aws-1-ap-northeast-2.pooler.supabase.com \
       -p 5432 \
       -U postgres.bpvfkkrlyrjkwgwmfrci \
       -d postgres
```

### 2.2 Node.js pg 라이브러리 사용

먼저 `pg` 패키지 설치:

```bash
npm install pg
```

스크립트 작성 (`scripts/migrate-with-pg.js`):

```javascript
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const connectionString = 'postgresql://postgres.bpvfkkrlyrjkwgwmfrci:chl1197dbA!@@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres'

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function runMigration() {
  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...')
    await client.connect()
    console.log('✅ Connected successfully!\n')

    const migrationPath = path.join(__dirname, '../supabase/migrations/20251109010000_refactor_chat_rooms_for_any_users.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('📄 Executing migration SQL...')
    await client.query(sql)

    console.log('\n✅ Migration executed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
```

실행:

```bash
node scripts/migrate-with-pg.js
```

### 2.3 주의사항

- **포트 선택**:
  - `5432`: Transaction pooler (단일 쿼리에 권장)
  - `6543`: Session pooler (트랜잭션 사용 시)
- **호스트 선택**:
  - `aws-1-ap-northeast-2.pooler.supabase.com`: Pooler (권장)
  - `db.bpvfkkrlyrjkwgwmfrci.supabase.co`: Direct connection
- **SSL 필수**: `ssl: { rejectUnauthorized: false }`

---

## 방법 3: Supabase Dashboard

웹 인터페이스를 통한 수동 실행 방법입니다.

### 3.1 SQL Editor 사용

1. **대시보드 접속**
   ```
   https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new
   ```

2. **마이그레이션 SQL 복사**
   - 로컬 파일 열기: `supabase/migrations/20251109010000_refactor_chat_rooms_for_any_users.sql`
   - 전체 내용 복사

3. **SQL Editor에 붙여넣기**
   - New Query 클릭
   - SQL 붙여넣기
   - Run 버튼 클릭

4. **결과 확인**
   - Success 메시지 확인
   - Table Editor에서 변경사항 확인

### 3.2 Migration 파일 업로드

현재 Supabase Dashboard는 직접 파일 업로드를 지원하지 않습니다. SQL Editor를 사용하세요.

---

## 방법 4: Node.js 스크립트

Supabase JavaScript 클라이언트를 사용한 방법입니다.

### 4.1 Supabase 클라이언트 사용

```javascript
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSql(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { query: sql })

  if (error) {
    throw error
  }

  return data
}
```

### 4.2 주의사항

- `exec_sql` RPC 함수가 데이터베이스에 생성되어 있어야 함
- Service Role Key 필요
- 대부분의 경우 PostgreSQL 직접 연결이 더 안정적

---

## 방법 5: REST API

PostgREST를 통한 데이터 변경 방법입니다.

### 5.1 제한사항

REST API는 DDL (CREATE TABLE, ALTER TABLE 등)을 직접 실행할 수 없습니다.
데이터 변경(INSERT, UPDATE, DELETE)만 가능합니다.

### 5.2 데이터 마이그레이션 예시

```bash
# 데이터 삽입
curl -X POST "https://bpvfkkrlyrjkwgwmfrci.supabase.co/rest/v1/table_name" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "column1": "value1",
    "column2": "value2"
  }'

# 데이터 업데이트
curl -X PATCH "https://bpvfkkrlyrjkwgwmfrci.supabase.co/rest/v1/table_name?id=eq.123" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"column1": "new_value"}'
```

### 5.3 주의사항

- DDL 마이그레이션에는 사용 불가
- RLS 정책을 우회하려면 Service Role Key 사용
- 대용량 데이터 마이그레이션에 비효율적

---

## 트러블슈팅

### 문제 1: "Initialising login role..." 에서 멈춤

**증상:**
```
Initialising login role...
(진행 안됨)
```

**원인:**
- 네트워크 연결 문제
- Supabase API 서버 응답 지연
- 방화벽 차단

**해결 방법:**

```bash
# 1. 프로세스 종료
# Ctrl+C로 중단

# 2. 다른 방법 시도
# 2-1. PostgreSQL 직접 연결 사용
node scripts/migrate-with-pg.js

# 2-2. Dashboard 사용
# https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new

# 2-3. 디버그 모드로 재시도
npx supabase db push --debug
```

### 문제 2: "Tenant or user not found"

**증상:**
```
error: Tenant or user not found
```

**원인:**
- 잘못된 데이터베이스 비밀번호
- 잘못된 호스트/포트
- Pooler 인증 문제

**해결 방법:**

```bash
# 1. 비밀번호 확인
# Supabase Dashboard > Settings > Database > Database Password

# 2. 올바른 연결 문자열 사용
# ✅ 올바른 형식:
postgresql://postgres.PROJECT_REF:PASSWORD@HOST:PORT/postgres

# ❌ 잘못된 예:
postgresql://postgres:PASSWORD@HOST:PORT/postgres  # 'postgres.' 빠짐
```

### 문제 3: "Connection timeout"

**증상:**
```
ETIMEDOUT: connect timeout
```

**원인:**
- 방화벽 차단
- VPN 연결 문제
- 포트 차단

**해결 방법:**

```bash
# 1. 포트 변경 시도
# 5432 → 6543 또는 그 반대

# 2. Direct Connection 시도
# pooler.supabase.com → db.PROJECT_REF.supabase.com

# 3. Dashboard 사용
# 웹 인터페이스는 HTTPS(443)만 사용하므로 방화벽 문제 없음
```

### 문제 4: "Migration already applied"

**증상:**
```
ERROR: relation "table_name" already exists
```

**원인:**
- 마이그레이션이 이미 적용됨
- 중복 실행

**해결 방법:**

```sql
-- IF NOT EXISTS 사용
CREATE TABLE IF NOT EXISTS table_name (...);
ALTER TABLE IF EXISTS table_name ADD COLUMN IF NOT EXISTS column_name;

-- 또는 먼저 삭제
DROP TABLE IF EXISTS table_name CASCADE;
CREATE TABLE table_name (...);
```

### 문제 5: "RLS policy violation"

**증상:**
```
permission denied for table table_name
```

**원인:**
- RLS 정책으로 인한 접근 제한
- Anon Key 사용 시 발생

**해결 방법:**

```bash
# Service Role Key 사용
# .env.local의 SUPABASE_SERVICE_ROLE_KEY 사용

# 또는 RLS 정책 수정
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;  # 주의!
```

---

## 현재 프로젝트 정보

### 마이그레이션 파일 위치
```
C:\Users\ohyus\talent\supabase\migrations\
```

### 최근 마이그레이션
- `20251109010000_refactor_chat_rooms_for_any_users.sql`
- `20251109000000_fix_chat_trigger_remove_last_message.sql`

### 환경 변수 파일
```
C:\Users\ohyus\talent\.env.local
```

### 설정 파일
```
C:\Users\ohyus\talent\supabase\config.toml
```

---

## 권장 워크플로우

### 개발 환경

```bash
# 1. 마이그레이션 파일 생성
npx supabase migration new my_feature

# 2. SQL 작성
# supabase/migrations/YYYYMMDDHHMMSS_my_feature.sql

# 3. 로컬 테스트 (로컬 Supabase 필요)
npx supabase db reset

# 4. 원격 푸시
npx supabase db push

# 5. 확인
npx supabase migration list
```

### 프로덕션 환경

```bash
# 1. 백업 생성
npx supabase db dump --linked > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 마이그레이션 리뷰
cat supabase/migrations/LATEST_FILE.sql

# 3. 테스트 환경에서 먼저 테스트
# (별도 Supabase 프로젝트 권장)

# 4. 프로덕션 푸시
npx supabase db push --linked

# 5. 롤백 준비
# 문제 발생 시 이전 백업으로 복구
```

---

## 비상 연락처

### Supabase 대시보드
```
https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci
```

### SQL Editor
```
https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new
```

### Table Editor
```
https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/editor
```

### Database Settings
```
https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/settings/database
```

---

## 체크리스트

마이그레이션 전 확인사항:

- [ ] 백업 생성 완료
- [ ] 마이그레이션 SQL 검토 완료
- [ ] IF NOT EXISTS / IF EXISTS 사용 확인
- [ ] RLS 정책 영향도 확인
- [ ] 트리거 함수 search_path 확인
- [ ] CASCADE 영향 범위 확인
- [ ] 롤백 계획 수립
- [ ] 테스트 환경에서 검증 완료

마이그레이션 후 확인사항:

- [ ] 마이그레이션 상태 확인 (`migration list`)
- [ ] 테이블 구조 확인 (Dashboard Table Editor)
- [ ] 데이터 정합성 확인
- [ ] RLS 정책 동작 확인
- [ ] 애플리케이션 기능 테스트
- [ ] 에러 로그 확인

---

**작성일**: 2025-11-09
**작성자**: Claude Code
**프로젝트**: talent
**Supabase Project**: bpvfkkrlyrjkwgwmfrci
