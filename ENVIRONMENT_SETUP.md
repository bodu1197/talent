# 환경 변수 설정 가이드

## 개발 환경 (.env.local)

현재 `.env.local` 파일이 설정되어 있습니다.

## 프로덕션 배포 (Vercel)

### 1. Supabase 프로덕션 키 가져오기

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택: `bpvfkkrlyrjkwgwmfrci`
3. Settings > API 이동
4. 다음 값들을 복사:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (Show 클릭): `SUPABASE_SERVICE_ROLE_KEY`

### 2. PortOne 프로덕션 키 설정

⚠️ **중요**: 현재 테스트 키가 설정되어 있습니다!

프로덕션 배포 전에 반드시 변경:

1. [PortOne Dashboard](https://admin.portone.io) 접속
2. **실제 가맹점** 선택 (테스트 가맹점 아님)
3. Settings에서 다음 값 가져오기:
   - **Store ID**: `NEXT_PUBLIC_PORTONE_STORE_ID`
   - **API Secret**: `PORTONE_API_SECRET`
   - **Channel Key**: `NEXT_PUBLIC_PORTONE_CHANNEL_KEY`

### 3. Vercel 환경 변수 설정

1. [Vercel Dashboard](https://vercel.com) 접속
2. 프로젝트 > Settings > Environment Variables
3. 다음 변수들을 **Production** 환경에 추가:

```
NEXT_PUBLIC_SUPABASE_URL=https://bpvfkkrlyrjkwgwmfrci.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[프로덕션 anon key]
SUPABASE_SERVICE_ROLE_KEY=[프로덕션 service role key]

NEXT_PUBLIC_PORTONE_STORE_ID=[프로덕션 store id]
PORTONE_API_SECRET=[프로덕션 api secret]
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=[프로덕션 channel key]

NEXT_PUBLIC_BANK_NAME=국민은행
NEXT_PUBLIC_BANK_ACCOUNT=[실제 계좌번호]
NEXT_PUBLIC_BANK_HOLDER=돌파구

NODE_ENV=production
```

### 4. 선택사항: Sentry 설정

에러 모니터링을 위해 Sentry 설정 (권장):

1. [Sentry.io](https://sentry.io) 가입
2. 새 프로젝트 생성 (Next.js 선택)
3. DSN 키 복사
4. Vercel에 다음 변수 추가:

```
NEXT_PUBLIC_SENTRY_DSN=[your-dsn]
SENTRY_ORG=[your-org]
SENTRY_PROJECT=talent-marketplace
SENTRY_AUTH_TOKEN=[your-auth-token]
```

## 보안 체크리스트

### ✅ 환경 변수 보안

- [ ] `.env.local`이 `.gitignore`에 포함되어 있음
- [ ] 프로덕션 키가 Git에 커밋되지 않음
- [ ] Vercel에서만 프로덕션 키 설정
- [ ] Service Role Key는 서버 사이드에서만 사용

### ✅ PortOne 설정

- [ ] 테스트 키 → 프로덕션 키로 변경
- [ ] 웹훅 URL 설정: `https://your-domain.com/api/webhooks/portone`
- [ ] IP 화이트리스트 설정 (필요시)
- [ ] 결제 테스트 완료

### ✅ Supabase 보안

- [ ] RLS (Row Level Security) 정책 활성화
- [ ] 데이터베이스 인덱스 적용
- [ ] API Rate Limiting 설정 확인
- [ ] 백업 설정 확인

### ✅ 일반 보안

- [ ] HTTPS 강제 적용
- [ ] CORS 설정 확인
- [ ] CSP (Content Security Policy) 설정
- [ ] 민감한 데이터 로깅 제거 완료

## 환경 변수 검증

배포 후 다음 명령으로 환경 변수 확인:

```bash
# 로컬에서
npm run build

# Vercel에서 (배포 후)
# Vercel Dashboard > Deployments > 최신 배포 > Build Logs 확인
```

## 문제 해결

### 환경 변수가 적용되지 않을 때

1. Vercel에서 재배포: `Deployments > Redeploy`
2. 환경 변수 이름 확인 (오타 없는지)
3. `NEXT_PUBLIC_` 접두사 확인 (클라이언트에서 사용할 변수)

### PortOne 결제가 작동하지 않을 때

1. 프로덕션 키로 변경했는지 확인
2. 도메인이 PortOne에 등록되었는지 확인
3. 웹훅 URL이 올바른지 확인

## 참고 문서

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)
- [PortOne Documentation](https://portone.gitbook.io/docs/)
