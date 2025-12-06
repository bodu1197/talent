# 돌파구 (Dolpagu) 프로젝트 가이드

## Supabase 데이터베이스 접속 방법

**중요: Supabase 데이터베이스에 접근할 때는 반드시 아래 방법을 사용하세요.**

### 접속 정보

- **API**: Supabase Management API (api.supabase.com)
- **Access Token**: `sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f`
- **Project ID**: `bpvfkkrlyrjkwgwmfrci`
- **Endpoint**: `/v1/projects/bpvfkkrlyrjkwgwmfrci/database/query`
- **Method**: POST

### 사용 예시

```bash
curl -s -X POST "https://api.supabase.com/v1/projects/bpvfkkrlyrjkwgwmfrci/database/query" \
  -H "Authorization: Bearer sbp_140ed0f35c7b31aa67f56bdca11db02fd469802f" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM table_name LIMIT 10"}'
```

### 주의사항

- `.env.local` 파일은 읽기 권한이 없으므로 환경변수 방식 사용 불가
- 항상 위의 curl 명령어 방식으로 SQL 쿼리 실행

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
