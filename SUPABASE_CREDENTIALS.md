# Supabase 인증 정보

## 🔑 핵심 인증 정보

### CLI Access Token
```
sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f
```

### Database Password
```
chl1197dbA!@
```

### Project Reference
```
bpvfkkrlyrjkwgwmfrci
```

### Database Connection String
```
postgresql://postgres.bpvfkkrlyrjkwgwmfrci:chl1197dbA!@@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

---

## 🚀 마이그레이션 실행 방법 (3가지)

### ⭐ 방법 1: Node.js 스크립트로 직접 실행 (권장 - 100% 성공)

**가장 확실하고 빠른 방법입니다!**

```bash
# 프로젝트 루트에서 실행
node scripts/execute-pending-migrations.js
```

**특징:**
- ✅ 히스토리 불일치 문제 없음
- ✅ 네트워크 타임아웃 없음
- ✅ 자동으로 모든 마이그레이션 실행
- ✅ 상세한 로그 출력
- ✅ 에러 발생 시 정확한 위치와 이유 표시

**실행 예시:**
```
🚀 Supabase 마이그레이션 실행 시작
============================================================
📍 프로젝트: bpvfkkrlyrjkwgwmfrci
🌏 리전: Seoul (ap-northeast-2)

🔌 Supabase PostgreSQL 연결 중...
✅ 데이터베이스 연결 성공!

📊 연결 정보:
   데이터베이스: postgres
   사용자: postgres
   PostgreSQL 버전: PostgreSQL 17.6

📄 실행 중: Revision History 테이블 생성
============================================================
✅ Revision History 테이블 생성 마이그레이션 완료!

🎉 모든 마이그레이션이 성공적으로 완료되었습니다!
```

---

### 방법 2: Supabase CLI 사용

**CLI가 제대로 연결된 경우에만 사용**

#### 2-1. CLI 로그인
```bash
npx supabase login
# 토큰 입력: sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f
```

#### 2-2. 프로젝트 연결
```bash
npx supabase link --project-ref bpvfkkrlyrjkwgwmfrci
```

#### 2-3. 마이그레이션 푸시
```bash
npx supabase db push
# DB 비밀번호 입력: chl1197dbA!@
```

**주의사항:**
- ⚠️ 로컬과 리모트 히스토리가 맞지 않으면 실패할 수 있음
- ⚠️ 네트워크 타임아웃 가능성 있음
- ⚠️ "Initialising login role..." 에서 멈출 수 있음

**히스토리 불일치 에러 발생 시:**
```bash
# 에러 메시지:
# Remote migration versions not found in local migrations directory.

# 해결 방법 1: repair 사용
npx supabase migration repair --status reverted [migration_ids]

# 해결 방법 2: Node.js 스크립트 사용 (권장)
node scripts/execute-pending-migrations.js
```

---

### 방법 3: Supabase Dashboard 수동 실행

**CLI와 스크립트 모두 실패한 경우 마지막 수단**

#### 3-1. SQL Editor 열기
```
https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new
```

#### 3-2. 마이그레이션 파일 복사
```bash
# 파일 위치
C:\Users\ohyus\talent\supabase\migrations\

# 실행 순서대로 복사 & 실행:
1. 20251114000000_create_revision_history.sql
2. 20251114010000_create_notifications.sql
```

#### 3-3. SQL Editor에 붙여넣고 실행
1. **New Query** 클릭
2. SQL 전체 복사해서 붙여넣기
3. **Run** 버튼 클릭 (Ctrl+Enter)
4. **Success** 메시지 확인

---

## 📊 연결 정보 상세

### Supabase 프로젝트 정보
- **Project Ref**: `bpvfkkrlyrjkwgwmfrci`
- **Region**: Northeast Asia (Seoul)
- **Organization ID**: `gewhpjonpmahjphpyibf`
- **Supabase URL**: `https://bpvfkkrlyrjkwgwmfrci.supabase.co`

### PostgreSQL 연결 정보

#### Transaction Pooler (단일 쿼리 - 권장)
```
Host: aws-1-ap-northeast-2.pooler.supabase.com
Port: 5432
User: postgres.bpvfkkrlyrjkwgwmfrci
Password: chl1197dbA!@
Database: postgres
```

**전체 연결 문자열:**
```
postgresql://postgres.bpvfkkrlyrjkwgwmfrci:chl1197dbA!@@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

#### Session Pooler (트랜잭션)
```
Host: aws-1-ap-northeast-2.pooler.supabase.com
Port: 6543
User: postgres.bpvfkkrlyrjkwgwmfrci
Password: chl1197dbA!@
Database: postgres
```

#### Direct Connection
```
Host: db.bpvfkkrlyrjkwgwmfrci.supabase.co
Port: 5432
User: postgres.bpvfkkrlyrjkwgwmfrci
Password: chl1197dbA!@
Database: postgres
```

---

## 🛠️ 트러블슈팅

### 문제 1: "히스토리가 맞지 않습니다"
```
Remote migration versions not found in local migrations directory.
```

**해결:**
```bash
# 가장 확실한 방법
node scripts/execute-pending-migrations.js
```

### 문제 2: "Initialising login role..." 에서 멈춤
```
Initialising login role...
(계속 진행 안됨)
```

**해결:**
```bash
# Ctrl+C로 중단 후
node scripts/execute-pending-migrations.js
```

### 문제 3: "Connection timeout"
```
ETIMEDOUT: connect timeout
```

**해결:**
1. 인터넷 연결 확인
2. VPN 연결 확인
3. Node.js 스크립트 사용:
```bash
node scripts/execute-pending-migrations.js
```

### 문제 4: "password authentication failed"
```
error: password authentication failed for user "postgres.bpvfkkrlyrjkwgwmfrci"
```

**해결:**
- 비밀번호 확인: `chl1197dbA!@`
- 특수문자 포함 주의 (!, @)

---

## 🔐 환경변수

`.env.local` 파일에 저장된 값:

```bash
SUPABASE_ACCESS_TOKEN=sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f
SUPABASE_DB_PASSWORD=chl1197dbA!@
NEXT_PUBLIC_SUPABASE_URL=https://bpvfkkrlyrjkwgwmfrci.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_ROLE_KEY=[service_role_key]
```

---

## 📝 새 마이그레이션 생성 및 실행 워크플로우

### 1단계: 마이그레이션 파일 생성
```bash
# 수동으로 파일 생성
# 파일명 형식: YYYYMMDDHHmmss_description.sql
# 예: 20251114120000_add_user_profile.sql

# 위치: supabase/migrations/
```

### 2단계: SQL 작성
```sql
-- 예시
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "사용자는 자신의 프로필만 조회"
ON user_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

### 3단계: 마이그레이션 실행
```bash
# 가장 확실한 방법
node scripts/execute-pending-migrations.js

# 또는 CLI (히스토리 일치 시)
npx supabase db push
```

### 4단계: 확인
```bash
# Supabase Dashboard에서 확인
https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/editor

# 또는 SQL Editor에서 확인
SELECT * FROM user_profiles LIMIT 1;
```

---

## ⚠️ 중요 보안 주의사항

1. **이 파일은 절대 GitHub에 푸시하지 마세요**
   - `.gitignore`에 추가되어 있음
   - 민감한 인증 정보 포함

2. **토큰과 비밀번호는 외부에 공유하지 마세요**
   - Slack, Discord, 이메일 등에 붙여넣기 금지
   - 스크린샷 찍을 때 주의

3. **Service Role Key는 더욱 중요합니다**
   - RLS 정책을 우회할 수 있음
   - 절대 클라이언트 코드에 노출 금지

---

## 🎯 빠른 참조

| 작업 | 명령어 |
|------|--------|
| **마이그레이션 실행** | `node scripts/execute-pending-migrations.js` |
| **CLI 로그인** | `npx supabase login` |
| **프로젝트 연결** | `npx supabase link --project-ref bpvfkkrlyrjkwgwmfrci` |
| **마이그레이션 상태** | `npx supabase migration list` |
| **Dashboard 열기** | https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci |
| **SQL Editor 열기** | https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/sql/new |
| **Table Editor 열기** | https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci/editor |

---

**최종 업데이트**: 2025-11-14
**작성자**: Claude Code
**프로젝트**: talent
**Supabase Project**: bpvfkkrlyrjkwgwmfrci
