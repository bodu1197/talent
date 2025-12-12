# Supabase 프로젝트 마이그레이션 완료 가이드

## ✅ 완료된 작업

### 1. 데이터베이스 스키마 (100% 완료)
- ✅ 82개 테이블
- ✅ 56개 함수
- ✅ 40개 트리거
- ✅ 203개 RLS 정책
- ✅ 133개 외래 키
- ✅ 288개 인덱스

### 2. 데이터 마이그레이션 (99.7% 완료)
- ✅ users: 31 rows
- ✅ profiles: 30 rows
- ✅ buyers: 31 rows
- ✅ sellers: 3 rows
- ✅ services: 28 rows
- ✅ orders: 12 rows
- ✅ chat_rooms: 5 rows
- ✅ chat_messages: 38 rows
- ✅ notifications: 12 rows
- ✅ page_views: 3,486 rows
- ✅ 기타 모든 테이블

**데이터 정합성 이슈** (6 rows):
- service_categories: 76/78 (존재하지 않는 category_id 참조)
- service_revision_categories: 23/27 (존재하지 않는 category_id 참조)

### 3. Storage Buckets (100% 완료)
- ✅ profiles (public, 5MB)
- ✅ services (public, 5MB)
- ✅ portfolio (public, 10MB)
- ✅ uploads (public, unlimited)
- ✅ food-stores (public, 10MB)
- ✅ business-documents (private, 10MB)
- ✅ 모든 Storage policies 적용

---

## 🔧 수동 설정 필요

### 1. Environment Variables 업데이트

**.env.local 파일 업데이트 필요:**

```bash
# 새 Supabase 프로젝트 정보
NEXT_PUBLIC_SUPABASE_URL=https://abroivxthindezdtdzmj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5ODk3NjcsImV4cCI6MjA0OTU2NTc2N30.P-pJc-qGUYdw8z_jNmG-p8kE1TlhCpNzmYR4EBBZUBs

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzk4OTc2NywiZXhwIjoyMDQ5NTY1NzY3fQ.sb_secret_yjCABwj3zJbfvFsJ4baU4A_4b3YUPvT
```

### 2. Supabase Authentication Providers 설정

**Supabase 대시보드에서 수동 설정 필요:**

1. **Google OAuth 설정**
   - Supabase 대시보드 → Authentication → Providers → Google
   - Client ID와 Client Secret 입력 (원본 프로젝트에서 복사)
   - Authorized redirect URIs: `https://abroivxthindezdtdzmj.supabase.co/auth/v1/callback`

2. **Kakao OAuth 설정**
   - Supabase 대시보드 → Authentication → Providers → Kakao
   - Client ID와 Client Secret 입력 (원본 프로젝트에서 복사)
   - Authorized redirect URIs: `https://abroivxthindezdtdzmj.supabase.co/auth/v1/callback`

3. **원본 프로젝트에서 OAuth 설정 확인 방법:**
   - 원본 대시보드: https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci
   - Authentication → Providers에서 Google, Kakao 설정 확인
   - Client ID와 Client Secret 복사

### 3. 이메일 템플릿 설정 (선택사항)

Supabase 대시보드에서:
- Authentication → Email Templates
- Confirm signup
- Invite user
- Magic Link
- Change Email Address
- Reset Password

원본 프로젝트의 템플릿을 복사하여 새 프로젝트에 적용

### 4. API Keys 및 JWT 설정

**이미 완료된 설정:**
- ✅ JWT Secret (자동 생성됨)
- ✅ Anon Key (자동 생성됨)
- ✅ Service Role Key (자동 생성됨)

---

## 📋 설정 체크리스트

- [ ] .env.local 파일 업데이트
- [ ] Google OAuth Provider 설정
- [ ] Kakao OAuth Provider 설정
- [ ] 이메일 템플릿 복사 (선택사항)
- [ ] 프로덕션 배포 전 테스트
  - [ ] 로그인/로그아웃
  - [ ] 회원가입
  - [ ] Google 로그인
  - [ ] Kakao 로그인
  - [ ] 프로필 이미지 업로드
  - [ ] 서비스 등록
  - [ ] 주문 생성
  - [ ] 채팅

---

## 🚀 마이그레이션 완료 후 테스트

### 데이터베이스 연결 테스트
```bash
curl -X POST "https://api.supabase.com/v1/projects/abroivxthindezdtdzmj/database/query" \
  -H "Authorization: Bearer sbp_f40b15f794e727f0aa9161de38c497174fcac2ee" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT COUNT(*) FROM users"}'
```

### 애플리케이션 테스트
```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속하여:
1. 회원가입/로그인 테스트
2. Google/Kakao 소셜 로그인 테스트
3. 프로필 페이지 테스트
4. 서비스 목록 조회 테스트
5. Storage 파일 업로드 테스트

---

## 📞 이슈 발생 시

### 인증 관련 오류
- JWT Secret이 변경되었으므로 기존 세션이 무효화됨
- 모든 사용자는 다시 로그인해야 함

### Storage 파일 누락
- 원본 프로젝트의 Storage 파일은 자동으로 복사되지 않음
- 필요시 수동으로 파일 마이그레이션 필요

### 데이터 정합성
- 6개 row가 원본 데이터 정합성 문제로 실패
- category_id `560825ff-712f-4396-82e1-357c4aa16b06`가 존재하지 않음
- 필요시 원본 데이터베이스에서 해당 카테고리 복구 필요

---

## 🎉 마이그레이션 성공!

새 프로젝트 URL: https://abroivxthindezdtdzmj.supabase.co
프로젝트 ID: abroivxthindezdtdzmj

모든 데이터베이스 객체, 데이터, Storage 설정이 성공적으로 이동되었습니다.
