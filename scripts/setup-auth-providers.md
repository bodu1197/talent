# 🔐 소셜 로그인 설정 가이드 (Google / Kakao)

## 📋 Step 1: 원본 프로젝트에서 OAuth 설정 확인

### 1-1. 원본 Supabase 프로젝트 접속
1. https://supabase.com/dashboard 로그인
2. 원본 프로젝트 선택: `bpvfkkrlyrjkwgwmfrci`

### 1-2. Google OAuth 설정 확인
1. 왼쪽 메뉴 → **Authentication** → **Providers**
2. **Google** 클릭
3. 다음 정보 복사:
   - ✅ **Client ID** (Google Cloud Console에서 발급받은 값)
   - ✅ **Client Secret** (Google Cloud Console에서 발급받은 값)
   - ✅ **Authorized redirect URIs** 확인

### 1-3. Kakao OAuth 설정 확인
1. 왼쪽 메뉴 → **Authentication** → **Providers**
2. **Kakao** 클릭
3. 다음 정보 복사:
   - ✅ **Client ID** (Kakao Developers에서 발급받은 REST API 키)
   - ✅ **Client Secret** (Kakao Developers에서 발급받은 값)

---

## 🚀 Step 2: 새 프로젝트에 OAuth 설정 적용

### 2-1. 새 Supabase 프로젝트 접속
1. https://supabase.com/dashboard 로그인
2. 새 프로젝트 선택: `abroivxthindezdtdzmj`

### 2-2. Google OAuth 설정
1. 왼쪽 메뉴 → **Authentication** → **Providers**
2. **Google** 클릭
3. **Enable** 토글 활성화
4. 입력:
   ```
   Client ID: [원본에서 복사한 값]
   Client Secret: [원본에서 복사한 값]
   ```
5. **Authorized Client IDs** (선택사항):
   - Android/iOS 앱이 있다면 추가
6. **Save** 클릭

### 2-3. Kakao OAuth 설정
1. 왼쪽 메뉴 → **Authentication** → **Providers**
2. **Kakao** 클릭
3. **Enable** 토글 활성화
4. 입력:
   ```
   Client ID: [원본에서 복사한 값]
   Client Secret: [원본에서 복사한 값]
   ```
5. **Save** 클릭

---

## 🔧 Step 3: OAuth Provider 설정 업데이트 (중요!)

### 3-1. Google Cloud Console 설정 업데이트

**새로운 Redirect URI 추가:**

1. https://console.cloud.google.com/ 접속
2. 프로젝트 선택 → **APIs & Services** → **Credentials**
3. OAuth 2.0 Client ID 선택
4. **Authorized redirect URIs**에 추가:
   ```
   https://abroivxthindezdtdzmj.supabase.co/auth/v1/callback
   ```
5. **기존 URI는 유지** (원본 프로젝트도 계속 사용 가능)
   ```
   https://bpvfkkrlyrjkwgwmfrci.supabase.co/auth/v1/callback  (기존)
   https://abroivxthindezdtdzmj.supabase.co/auth/v1/callback  (신규)
   ```
6. **Save** 클릭

### 3-2. Kakao Developers 설정 업데이트

**새로운 Redirect URI 추가:**

1. https://developers.kakao.com/console/app 접속
2. 앱 선택
3. **제품 설정** → **카카오 로그인** → **Redirect URI**
4. **Redirect URI 등록**:
   ```
   https://abroivxthindezdtdzmj.supabase.co/auth/v1/callback
   ```
5. **기존 URI는 유지** (원본 프로젝트도 계속 사용 가능)
   ```
   https://bpvfkkrlyrjkwgwmfrci.supabase.co/auth/v1/callback  (기존)
   https://abroivxthindezdtdzmj.supabase.co/auth/v1/callback  (신규)
   ```
6. **저장** 클릭

---

## ✅ Step 4: 테스트

### 4-1. 로컬 환경 설정
```bash
# .env.local 파일 업데이트
NEXT_PUBLIC_SUPABASE_URL=https://abroivxthindezdtdzmj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicm9pdnh0aGluZGV6ZHRkem1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5ODk3NjcsImV4cCI6MjA0OTU2NTc2N30.P-pJc-qGUYdw8z_jNmG-p8kE1TlhCpNzmYR4EBBZUBs
```

### 4-2. 개발 서버 실행
```bash
npm run dev
```

### 4-3. 소셜 로그인 테스트
1. http://localhost:3000 접속
2. **Google 로그인** 버튼 클릭
   - Google 계정 선택
   - 권한 승인
   - 로그인 성공 확인
3. **Kakao 로그인** 버튼 클릭
   - Kakao 계정 로그인
   - 권한 동의
   - 로그인 성공 확인

---

## 🐛 문제 해결

### "redirect_uri_mismatch" 오류
**원인:** OAuth Provider (Google/Kakao)에 Redirect URI가 등록되지 않음

**해결:**
1. Google Cloud Console 또는 Kakao Developers에서
2. Redirect URI 확인:
   ```
   https://abroivxthindezdtdzmj.supabase.co/auth/v1/callback
   ```
3. 정확히 일치하는지 확인 (끝에 슬래시 없음)

### "invalid_client" 오류
**원인:** Client ID 또는 Client Secret이 잘못됨

**해결:**
1. Supabase 대시보드에서 Provider 설정 재확인
2. Google Cloud Console / Kakao Developers에서 정확한 값 복사
3. 공백이나 특수문자 주의

### 로그인 후 리다이렉트 안됨
**원인:** Site URL 설정 문제

**해결:**
1. Supabase 대시보드 → **Authentication** → **URL Configuration**
2. **Site URL** 확인:
   ```
   개발: http://localhost:3000
   프로덕션: https://dolpagu.com
   ```
3. **Redirect URLs**에 허용할 URL 추가

---

## 📌 중요 사항

### 기존 사용자 영향
- ✅ **기존 사용자 데이터 보존됨** (users, profiles 테이블 이미 이동 완료)
- ⚠️ **JWT Secret이 변경되어 기존 세션 무효화됨**
- 👉 **모든 사용자는 다시 로그인해야 함**

### OAuth Client 공유
- Google/Kakao OAuth Client는 **여러 Supabase 프로젝트에서 공유 가능**
- 원본 프로젝트와 새 프로젝트 동시 사용 가능
- Redirect URI만 두 개 모두 등록하면 됨

### 프로덕션 배포 시
1. 프로덕션 도메인 (예: https://dolpagu.com)도 Redirect URI에 추가
2. Site URL을 프로덕션 도메인으로 업데이트
3. .env.production 파일 생성 및 배포

---

## ✨ 완료!

이제 Google과 Kakao 소셜 로그인이 새 Supabase 프로젝트에서 정상 작동합니다.

**다음 단계:**
- [ ] 로컬에서 테스트
- [ ] 스테이징 환경 배포 및 테스트
- [ ] 프로덕션 배포
- [ ] 사용자에게 재로그인 안내
