# 🚀 돌파구 - AI 재능 거래 플랫폼

> **수수료 0원**으로 시작하는 공정한 재능 거래 플랫폼

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 📖 소개

**돌파구**는 판매자와 구매자 모두에게 **수수료 0원**을 제공하는 혁신적인 재능 거래 플랫폼입니다.
신규 판매자와 베테랑 모두에게 공평한 기회를 제공하며, 알고리즘 편향 없이 실력으로만 평가받을 수 있습니다.

### ✨ 주요 기능

- 🎯 **판매 기회 균등**: 모든 판매자에게 동일한 노출 기회 제공
- 💰 **수수료 0원**: 판매자와 구매자 모두 수수료 부담 없음
- 🤖 **AI 서비스 특화**: AI 전문가들을 위한 별도 카테고리
- 💬 **실시간 채팅**: WebSocket 기반 실시간 소통
- 📊 **개인화 추천**: 사용자 방문 패턴 기반 맞춤 서비스 추천
- 🔒 **강력한 보안**: CSP, HSTS, XSS 방어 등 완벽한 보안 헤더

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9 (Strict Mode)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (PKCE Flow)
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **Rate Limiting**: Upstash Redis

### DevOps & Monitoring
- **Deployment**: Vercel
- **Error Tracking**: Sentry
- **Analytics**: Custom Analytics
- **Testing**: Vitest + Playwright
- **Code Quality**: ESLint + Prettier + SonarQube

## 🚦 빠른 시작

### 필수 요구사항

- Node.js 18 이상
- npm/yarn/pnpm/bun
- Supabase 계정
- PostgreSQL (Supabase 제공)

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-org/talent.git
cd talent

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 필요한 값들을 입력하세요

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 환경변수 설정

`.env.local` 파일에 다음 환경변수를 설정해야 합니다:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_PASSWORD=your_db_password

# Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Sentry (에러 추적)
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_auth_token
NEXT_PUBLIC_SENTRY_DSN=your_dsn

# PortOne (결제)
NEXT_PUBLIC_PORTONE_STORE_ID=your_store_id
PORTONE_API_SECRET=your_api_secret

# NICE 본인인증
NEXT_PUBLIC_NICE_CLIENT_ID=your_client_id
NICE_CLIENT_SECRET=your_client_secret
```

## 📜 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 테스트 실행
npm run test          # 단위 테스트
npm run test:e2e      # E2E 테스트
npm run test:all      # 모든 테스트

# 코드 품질 검사
npm run lint          # ESLint 검사
npx tsc --noEmit      # TypeScript 타입 체크
npm run sonar         # SonarQube 검사
```

## 🏗️ 프로젝트 구조

```
talent/
├── public/              # 정적 파일
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── app/            # Next.js App Router 페이지
│   │   ├── api/        # API Routes
│   │   ├── (auth)/     # 인증 관련 페이지
│   │   ├── admin/      # 관리자 페이지
│   │   └── mypage/     # 마이페이지
│   ├── components/     # React 컴포넌트
│   │   ├── common/     # 공통 컴포넌트
│   │   ├── layout/     # 레이아웃 컴포넌트
│   │   └── providers/  # Context Providers
│   ├── lib/            # 유틸리티 및 라이브러리
│   │   ├── supabase/   # Supabase 클라이언트
│   │   ├── auth/       # 인증 로직
│   │   └── utils/      # 유틸리티 함수
│   ├── types/          # TypeScript 타입 정의
│   └── __tests__/      # 테스트 파일
├── middleware.ts       # Next.js Middleware
├── next.config.js      # Next.js 설정
├── tailwind.config.js  # Tailwind 설정
└── vitest.config.ts    # Vitest 설정
```

## 🔒 보안

이 프로젝트는 다음과 같은 보안 기능을 갖추고 있습니다:

- ✅ **CSP (Content Security Policy)**: XSS 공격 방어
- ✅ **HSTS**: HTTPS 강제 적용
- ✅ **X-Frame-Options**: 클릭재킹 방어
- ✅ **XSS Protection**: 브라우저 XSS 필터 활성화
- ✅ **Rate Limiting**: API 남용 방지
- ✅ **환경변수 관리**: 모든 비밀정보 환경변수 처리

## 📈 성능

- **LCP (Largest Contentful Paint)**: 1.3초 ⚡
- **CLS (Cumulative Layout Shift)**: 0.0 ✨
- **TTFB (Time to First Byte)**: 89ms 🚀
- **Lighthouse 성능 점수**: 85+ 🎯

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# 커버리지 포함 테스트
npm run test:coverage

# E2E 테스트
npm run test:e2e

# 테스트 UI 모드
npm run test:ui
```

## 🤝 기여

기여를 환영합니다! 다음 단계를 따라주세요:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 코딩 스타일

- TypeScript strict mode 사용
- ESLint 규칙 준수
- Prettier로 코드 포맷팅
- 함수형 프로그래밍 선호
- 모든 새 기능에 테스트 작성

## 📄 라이선스

이 프로젝트는 MIT 라이선스로 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

- 웹사이트: [https://talent-zeta.vercel.app](https://talent-zeta.vercel.app)
- 이슈: [GitHub Issues](https://github.com/your-org/talent/issues)
- 이메일: support@dolpagu.com

## 🙏 감사의 말

- [Next.js](https://nextjs.org/) - 리액트 프레임워크
- [Supabase](https://supabase.com/) - 백엔드 인프라
- [Vercel](https://vercel.com/) - 배포 플랫폼
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크

---

**Made with ❤️ by 돌파구 Team**
