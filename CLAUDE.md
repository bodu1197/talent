# 돌파구 (Dolpagu) 프로젝트 가이드

## Supabase 데이터베이스 접속 방법

### 프로젝트 정보

- **Project ID**: `abroivxthindezdtdzmj`
- **Project Name**: `dolpagu`
- **Region**: `ap-northeast-2` (서울)
- **Database Host**: `db.abroivxthindezdtdzmj.supabase.co`
- **로컬 프로젝트 ID**: `kmong`

⚠️ **보안**: Access Token은 환경 변수로 관리됩니다. `scripts/README.md` 참조

### 방법 1: Supabase CLI (로컬 개발 - 권장)

#### 1-1. 로컬 데이터베이스 시작

```bash
# Docker Desktop을 먼저 실행한 후
npx supabase start

# 로컬 Studio 접속: http://localhost:54323
```

#### 1-2. 원격 데이터베이스 연결

```bash
# 로그인 (브라우저에서 인증)
npx supabase login

# 원격 DB 연결 (프로젝트 선택)
npx supabase link --project-ref abroivxthindezdtdzmj

# 원격 스키마 가져오기
npx supabase db pull

# 원격에 마이그레이션 적용
npx supabase db push
```

#### 1-3. 직접 SQL 실행

```bash
# 로컬 DB 쿼리
npx supabase db execute "SELECT * FROM users LIMIT 10"

# 원격 DB 쿼리 (--remote 플래그 사용)
npx supabase db execute --remote "SELECT * FROM users LIMIT 10"
```

### 방법 2: TypeScript/JavaScript 클라이언트

프로젝트 내에서 Supabase 클라이언트를 사용하여 데이터베이스에 접근합니다.

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 쿼리 예시
const { data, error } = await supabase.from('users').select('*').limit(10);
```

### 방법 3: PostgreSQL 직접 연결

Supabase Dashboard에서 Connection String을 가져와 psql 또는 다른 PostgreSQL 클라이언트로 접속할 수 있습니다.

1. [Supabase Dashboard](https://supabase.com/dashboard/project/abroivxthindezdtdzmj/settings/database) 접속
2. "Database Settings" > "Connection String" 복사
3. psql 또는 DBeaver 등으로 연결

### 방법 4: Management API (접속 성공)

Supabase Management API를 통해 직접 데이터베이스 쿼리를 실행할 수 있습니다.

#### 사용 예시

```bash
# 환경 변수 설정 (토큰은 Supabase Dashboard에서 발급)
export SUPABASE_ACCESS_TOKEN=your_token_here

# 테이블 목록 조회
curl -s -X POST "https://api.supabase.com/v1/projects/abroivxthindezdtdzmj/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT tablename FROM pg_tables WHERE schemaname = '\''public'\'' ORDER BY tablename"}'

# users 테이블 조회
curl -s -X POST "https://api.supabase.com/v1/projects/abroivxthindezdtdzmj/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM users LIMIT 10"}'
```

**토큰 발급 방법**: [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API → Management API tokens

### 추천 방법

- **빠른 쿼리 실행**: Management API (방법 4)
- **개발/디버깅**: Supabase CLI (방법 1)
- **애플리케이션 코드**: TypeScript 클라이언트 (방법 2)
- **데이터베이스 관리/스키마 작업**: Supabase Studio 또는 PostgreSQL 직접 연결 (방법 3)

---

## 프로젝트 구조

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Payment**: PortOne (KCP)

## 주요 서비스

1. **재능 거래 플랫폼**: 수수료 0원 프리랜서 매칭
2. **심부름 서비스**: 배달/구매대행 (헬퍼 매칭)

## 개발 서버

```bash
npm run dev
```
