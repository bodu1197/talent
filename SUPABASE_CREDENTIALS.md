# Supabase 인증 정보

## CLI Access Token
```
sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f
```

## Database Password
```
chl1197dbA!@
```

## 사용 방법

### 1. Supabase CLI 로그인
```bash
npx supabase login
# 토큰 입력: sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f
```

### 2. 프로젝트 연결
```bash
npx supabase link --project-ref bpvfkkrlyrjkwgwmfrci
```

### 3. 마이그레이션 실행
```bash
npx supabase db push
# DB 비밀번호 입력: chl1197dbA!@
```

## 환경변수
`.env.local` 파일에 이미 저장되어 있습니다:
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`

## 주의사항
⚠️ 이 파일은 `.gitignore`에 추가되어 있으므로 GitHub에 푸시되지 않습니다.
⚠️ 민감한 정보이므로 외부에 공유하지 마세요.
