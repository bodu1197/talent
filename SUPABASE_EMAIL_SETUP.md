# Supabase 이메일 인증 비활성화 가이드

## ⚠️ 중요: 이메일 인증 제거

판매자는 별도의 본인인증을 진행하므로, 회원가입 시 이메일 인증은 불필요합니다.
Supabase Dashboard에서 이메일 인증을 비활성화해야 즉시 회원가입이 가능합니다.

---

## 🛠️ Supabase Dashboard 설정 방법

### 1단계: Supabase Dashboard 접속

1. https://supabase.com 접속
2. 프로젝트 선택: **bpvfkkrlyrjkwgwmfrci** (Talent)
3. 왼쪽 메뉴에서 **Authentication** 클릭

### 2단계: Email Provider 설정

1. **Providers** 탭 클릭
2. **Email** 제공자 찾기
3. **Enable Email Provider** 토글 확인 (켜져 있어야 함)
4. 아래로 스크롤하여 **Email Settings** 섹션 찾기

### 3단계: 이메일 인증 비활성화

**중요한 설정:**

```
☐ Confirm email (이 옵션을 OFF로 설정)
```

이 옵션을 **OFF**로 설정하면:
- ✅ 회원가입 후 이메일 인증 불필요
- ✅ 즉시 로그인 가능
- ✅ 세션 자동 생성

### 4단계: 저장

1. 하단의 **Save** 버튼 클릭
2. 설정이 즉시 적용됨

---

## 🔍 설정 확인 방법

### 방법 1: 테스트 회원가입

1. https://dolpagu.com/auth/register 접속
2. 새 이메일로 회원가입 진행
3. 회원가입 즉시 홈페이지로 리다이렉트되는지 확인
4. 이메일 인증 메일이 오지 않는지 확인

### 방법 2: Supabase SQL Editor 확인

```sql
-- auth.users 테이블에서 최근 가입자 확인
SELECT
  email,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

**예상 결과:**
- `email_confirmed_at`이 `created_at`과 거의 동일한 시각
- 이메일 인증 없이 즉시 확인됨

---

## 📋 현재 코드 동작 방식

### 회원가입 플로우

```typescript
// src/app/auth/register/page.tsx

const { data: authData, error: authError } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      name: randomNickname,
      profile_image: profileImage,
    },
  },
})

// Supabase 설정에 따른 동작:
if (authData.session) {
  // ✅ Confirm email OFF: 즉시 세션 생성 → 홈으로 이동
  router.push('/')
} else {
  // ❌ Confirm email ON: 세션 없음 → 로그인 페이지로 이동
  router.push('/auth/login?registered=true')
}
```

### 판매자 본인인증 플로우

회원가입과는 별도로 진행:

1. 회원가입 완료 (이메일 인증 없음)
2. 로그인
3. `/mypage/seller/dashboard` 접속
4. "판매자 등록하기" 버튼 클릭
5. `/mypage/seller/register`에서 **본인인증** 진행
6. 본인인증 완료 후 판매자로 등록

---

## ✅ 완료 체크리스트

- [ ] Supabase Dashboard → Authentication → Providers → Email
- [ ] "Confirm email" 옵션 OFF 설정
- [ ] Save 버튼 클릭
- [ ] 테스트 회원가입으로 즉시 로그인 확인
- [ ] 이메일 인증 메일이 오지 않는지 확인

---

## 🚨 주의사항

### 보안 고려사항

**이메일 인증 제거 시:**
- ✅ 사용자 경험 향상 (즉시 가입 가능)
- ✅ 판매자는 별도 본인인증 진행
- ⚠️ 스팸 가입 가능성 증가
- ⚠️ 이메일 주소 유효성 검증 불가

**권장 보안 조치:**
1. Rate Limiting (이미 구현됨 - 10분에 5회 제한)
2. 판매자 본인인증 필수 (계획됨)
3. 구매자는 첫 주문 시 추가 인증 고려
4. reCAPTCHA 추가 고려 (향후)

---

## 📞 문제 해결

### 회원가입 후에도 로그인 페이지로 이동하는 경우

**원인**: Supabase에서 여전히 이메일 인증을 요구하고 있음

**해결**:
1. Supabase Dashboard 설정 재확인
2. "Confirm email" 옵션이 **OFF**인지 확인
3. 브라우저 캐시 삭제 후 재시도

### 이메일 인증 메일이 계속 오는 경우

**원인**: 이전 설정이 캐시되어 있음

**해결**:
1. Supabase Dashboard에서 설정 재저장
2. 몇 분 후 다시 테스트
3. 문제 지속 시 Supabase Support 문의

---

**작성일**: 2025-11-14
**프로젝트**: Talent Platform
**상태**: 🔧 설정 필요
