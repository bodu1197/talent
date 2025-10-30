# Supabase Auth Security Setup Guide

## Leaked Password Protection 활성화

유출된 비밀번호 보호 기능을 활성화하여 HaveIBeenPwned 데이터베이스에 있는 침해된 비밀번호 사용을 방지합니다.

### 설정 방법

1. **Supabase Dashboard 접속**
   - URL: https://supabase.com/dashboard/project/bpvfkkrlyrjkwgwmfrci
   - 프로젝트: talent

2. **Authentication 설정으로 이동**
   - 왼쪽 메뉴에서 `Authentication` 클릭
   - `Policies` 또는 `Settings` 탭 선택

3. **Password Settings 섹션**
   - "Password Strength" 또는 "Security" 섹션 찾기
   - "Leaked Password Protection" 옵션 찾기

4. **활성화**
   - "Enable Leaked Password Protection" 토글 ON
   - 이 기능은 HaveIBeenPwned.org API를 사용하여 침해된 비밀번호를 체크합니다

### CLI를 통한 설정 (대안)

```bash
# Supabase config 파일 확인
cat supabase/config.toml

# [auth] 섹션에 다음 설정 추가
[auth]
enable_leaked_password_protection = true
```

### 설정 후 확인

설정이 완료되면:
- 새로운 회원가입 시 유출된 비밀번호는 거부됩니다
- 비밀번호 변경 시에도 체크됩니다
- Database Linter 경고가 사라집니다

### 참고 문서

- [Supabase Auth Password Security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [Database Linter - Leaked Password Protection](https://supabase.com/docs/guides/database/database-linter?lint=auth_leaked_password_protection)
