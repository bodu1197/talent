# Supabase 데이터베이스 접속 가이드

## 프로젝트 정보

- **프로젝트 ID**: bpvfkkrlyrjkwgwmfrci
- **호스트**: https://bpvfkkrlyrjkwgwmfrci.supabase.co
- **데이터베이스 호스트**: db.bpvfkkrlyrjkwgwmfrci.supabase.co
- **포트**: 5432 (PostgreSQL), 443 (HTTPS/REST API)
- **데이터베이스**: postgres
- **사용자**: postgres
- **비밀번호**: `chl1197dbA!@`

## 접속 방법

### 1. Supabase MCP를 통한 접속 (권장) ✅

**장점**:
- 파일 업로드/다운로드 가능
- 테이블 CRUD 작업 가능
- 사용자 관리 가능
- Edge Functions 실행 가능
- 별도의 네트워크 설정 불필요

**사용 가능한 작업**:

#### 테이블 조회
```javascript
// MCP를 통해 사용 가능
mcp__supabase-storage__list_tables
mcp__supabase-storage__read_records
```

#### 데이터 CRUD
```javascript
// 레코드 생성
mcp__supabase-storage__create_record({
  table: "users",
  data: { email: "test@example.com", name: "Test User" }
})

// 레코드 조회
mcp__supabase-storage__read_records({
  table: "users",
  filter: { email: "test@example.com" },
  limit: 10
})

// 레코드 수정
mcp__supabase-storage__update_records({
  table: "users",
  filter: { email: "test@example.com" },
  data: { name: "Updated Name" }
})

// 레코드 삭제
mcp__supabase-storage__delete_records({
  table: "users",
  filter: { email: "test@example.com" }
})
```

#### 파일 업로드/다운로드
```javascript
// 파일 업로드
mcp__supabase-storage__upload_file({
  bucket: "avatars",
  path: "user123/profile.jpg",
  file: base64FileData,
  options: {
    contentType: "image/jpeg",
    upsert: true
  }
})

// 파일 다운로드
mcp__supabase-storage__download_file({
  bucket: "avatars",
  path: "user123/profile.jpg"
})
```

#### 사용자 관리
```javascript
// 사용자 목록 조회
mcp__supabase-storage__list_users({ page: 1, per_page: 10 })

// 사용자 생성
mcp__supabase-storage__create_user({
  email: "newuser@example.com",
  password: "securepassword123"
})

// 사용자 수정
mcp__supabase-storage__update_user({
  user_id: "uuid-here",
  email: "updated@example.com"
})
```

### 2. Supabase JavaScript 클라이언트

**환경 변수** (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://bpvfkkrlyrjkwgwmfrci.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3MTYsImV4cCI6MjA3Njk1NDcxNn0.luCRwnwQVctX3ewuSjhkQJ6veanWqa2NgivpDI7_Gl4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8
```

**사용 예시**:
```typescript
import { createClient } from '@supabase/supabase-js';

// 클라이언트용 (Row Level Security 적용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 서버용 (모든 권한)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 데이터 조회
const { data, error } = await supabase
  .from('users')
  .select('*')
  .limit(10);

// 파일 업로드
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user123/profile.jpg', file);
```

### 3. PostgreSQL 직접 연결 (pg 라이브러리)

**연결 문자열**:
```
postgresql://postgres:chl1197dbA!@@db.bpvfkkrlyrjkwgwmfrci.supabase.co:5432/postgres
```

**Node.js 예시**:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.bpvfkkrlyrjkwgwmfrci.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'chl1197dbA!@',
  ssl: { rejectUnauthorized: false }
});

// 쿼리 실행
const result = await pool.query('SELECT * FROM users LIMIT 10');
```

**주의사항**:
- 네트워크 연결 문제가 발생할 수 있음 (IPv6 DNS 해상도 문제)
- Row Level Security를 우회하므로 주의해서 사용
- 프로덕션에서는 연결 풀 관리 필요

### 4. Supabase CLI

**CLI 설치**:
```bash
npm install -g supabase
# 또는 프로젝트 내에서
npx supabase
```

**프로젝트 링크**:
```bash
supabase link --project-ref bpvfkkrlyrjkwgwmfrci
```

**스키마 덤프**:
```bash
supabase db dump --db-url "postgresql://postgres:chl1197dbA!@@db.bpvfkkrlyrjkwgwmfrci.supabase.co:5432/postgres" --schema public > schema.sql
```

**마이그레이션 적용**:
```bash
supabase db push
```

### 5. pgAdmin / DBeaver / DataGrip

**연결 설정**:
- **Host**: db.bpvfkkrlyrjkwgwmfrci.supabase.co
- **Port**: 5432
- **Database**: postgres
- **Username**: postgres
- **Password**: chl1197dbA!@
- **SSL Mode**: require 또는 prefer

## 파일 업로드 가능 여부

### ✅ 가능한 작업

1. **Storage 버킷에 파일 업로드**
   - Supabase MCP 사용
   - JavaScript 클라이언트 사용
   - 이미지, 문서, 비디오 등 모든 파일 타입 지원

2. **데이터베이스에 데이터 삽입**
   - 모든 테이블에 대한 CRUD 작업
   - 대량 데이터 삽입 (bulk insert)
   - 트랜잭션 처리

3. **Edge Functions 실행**
   - 서버리스 함수 호출
   - 복잡한 비즈니스 로직 실행

4. **실시간 구독**
   - 테이블 변경사항 실시간 수신
   - Realtime 채널 구독

## Storage 버킷 정보

프로젝트에서 사용 가능한 버킷:
- `avatars`: 사용자 프로필 이미지
- `service-images`: 서비스 썸네일 및 포트폴리오
- `attachments`: 주문 첨부파일
- `certificates`: 판매자 인증서류

## 보안 권장사항

1. **비밀번호 보안**
   - 데이터베이스 비밀번호를 코드에 하드코딩하지 말 것
   - 환경 변수 사용 (`.env.local`)
   - `.env.local` 파일은 `.gitignore`에 추가

2. **서비스 롤 키 사용**
   - 서버 사이드에서만 사용
   - 클라이언트에 노출 금지
   - Row Level Security 우회 가능하므로 신중히 사용

3. **Row Level Security (RLS)**
   - 모든 테이블에 RLS 정책 설정
   - 사용자별 데이터 접근 제어
   - 공개/비공개 데이터 분리

## 스키마 정보

전체 데이터베이스 스키마는 다음 파일에서 확인:
- `supabase_complete_schema.sql`: 전체 테이블 스키마
- `src/types/database.ts`: TypeScript 타입 정의

**주요 테이블** (26개):
- `users`, `seller_profiles`, `admins`
- `categories`, `services`, `service_packages`
- `orders`, `reviews`, `favorites`
- `conversations`, `messages`
- `payments`, `refunds`, `settlements`
- `notifications`, `reports`, `disputes`
- `advertising_campaigns`, `premium_placements`

## 문제 해결

### 연결 문제
- DNS 해상도 문제: IPv6 설정 확인
- 방화벽 문제: 5432 포트 허용 확인
- SSL 문제: `ssl: { rejectUnauthorized: false }` 설정

### 권한 문제
- RLS 정책 확인
- 서비스 롤 키 사용 고려
- 테이블 권한 설정 확인

### 성능 최적화
- 연결 풀 사용
- 인덱스 확인 및 추가
- 쿼리 최적화 (EXPLAIN ANALYZE 사용)

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
