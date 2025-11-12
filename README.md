# AI 재능 거래 플랫폼 (AI Talent Hub)

> 수수료 0%, 판매자와 구매자 모두를 위한 공정한 재능 거래 플랫폼

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

## 🚀 주요 기능

### 판매자를 위한 기능
- ✅ **수수료 0%** - 판매자가 100% 수익 가져가기
- ✅ **공정한 기회** - 신규/베테랑 관계없이 동등한 노출
- ✅ **간편한 판매** - 직관적인 서비스 등록 및 관리
- ✅ **실시간 정산** - 최소 금액만 충족하면 즉시 정산 가능
- ✅ **포트폴리오** - 작업물 전시 및 홍보

### 구매자를 위한 기능
- ✅ **구매 수수료 0원** - 표시된 가격이 최종 가격
- ✅ **안전한 거래** - 에스크로 결제 시스템
- ✅ **실시간 채팅** - 판매자와 직접 소통
- ✅ **리뷰 시스템** - 투명한 평가 및 피드백
- ✅ **AI 서비스** - 최신 AI 기술 활용 서비스

## 📚 기술 스택

### Frontend
- **Framework:** Next.js 16.0 (App Router)
- **UI Library:** React 19.2
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS 3.4
- **Icons:** Font Awesome 7.1, Lucide React

### Backend & Database
- **BaaS:** Supabase (PostgreSQL)
- **ORM:** Prisma 6.19
- **Authentication:** Supabase Auth

### State Management
- **Client State:** Zustand 5.0
- **Server State:** React Query 5.90

### Payment
- **PG:** PortOne (구 아임포트)

### Testing
- **Unit Tests:** Vitest 4.0
- **E2E Tests:** Playwright 1.56
- **Testing Library:** React Testing Library 16.3

### Monitoring & Analytics
- **Error Tracking:** Sentry 10.22
- **Bundle Analysis:** @next/bundle-analyzer

## 🛠️ 개발 환경 설정

### 필수 요구사항
- Node.js 18.x 이상
- npm, pnpm, yarn 또는 bun

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-org/ai-talent-hub.git
cd ai-talent-hub

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 실제 값 입력
```

### 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# PortOne
NEXT_PUBLIC_PORTONE_STORE_ID=your-store-id
PORTONE_API_SECRET=your-api-secret
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=your-channel-key

# Sentry (선택사항)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

자세한 내용은 `.env.example` 파일 참조

### 개발 서버 실행

```bash
npm run dev
# 또는
pnpm dev
# 또는
yarn dev
# 또는
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 📦 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

### 프로덕션 서버 실행

```bash
npm start
```

### 번들 크기 분석

```bash
ANALYZE=true npm run build
```

## 🧪 테스트

### 단위 테스트 실행

```bash
npm run test          # Watch 모드
npm run test:run      # 1회 실행
npm run test:ui       # UI 모드
npm run test:coverage # 커버리지
```

### E2E 테스트 실행

```bash
npm run test:e2e      # Headless 모드
npm run test:e2e:ui   # UI 모드
```

### 전체 테스트 실행

```bash
npm run test:all
```

## 📁 프로젝트 구조

```
ai-talent-hub/
├── src/
│   ├── app/                 # Next.js App Router 페이지
│   │   ├── admin/          # 관리자 페이지
│   │   ├── auth/           # 인증 페이지
│   │   ├── buyer/          # 구매자 가이드
│   │   ├── seller/         # 판매자 가이드
│   │   ├── mypage/         # 마이페이지
│   │   ├── chat/           # 채팅
│   │   └── api/            # API 라우트
│   ├── components/         # React 컴포넌트
│   │   ├── admin/          # 관리자 전용
│   │   ├── chat/           # 채팅 관련
│   │   ├── home/           # 홈 화면
│   │   ├── layout/         # 레이아웃
│   │   ├── providers/      # Context Providers
│   │   └── services/       # 서비스 관련
│   ├── lib/                # 라이브러리 및 유틸리티
│   │   ├── supabase/       # Supabase 클라이언트
│   │   │   ├── queries/    # DB 쿼리 함수
│   │   │   └── mutations/  # DB 변경 함수
│   │   ├── auth/           # 인증 설정
│   │   └── ...
│   ├── types/              # TypeScript 타입 정의
│   ├── utils/              # 유틸리티 함수
│   │   ├── format.ts       # 포맷 함수 (숫자, 날짜 등)
│   │   └── validation.ts   # 검증 함수
│   └── styles/             # 전역 스타일
├── public/                 # 정적 파일
├── supabase/              # Supabase 마이그레이션
├── docs/                  # 문서
│   └── RLS_POLICY_GUIDE.md
├── scripts/               # 유틸리티 스크립트
└── tests/                 # 테스트 파일
```

## 🔒 보안

- ✅ **RLS (Row Level Security)** - 데이터베이스 접근 제어
- ✅ **XSS 방어** - DOMPurify 적용
- ✅ **CSRF 방어** - Next.js 기본 보호
- ✅ **보안 헤더** - CSP, X-Content-Type-Options 등
- ✅ **환경 변수 보호** - 민감 정보 분리

자세한 내용은 [RLS 정책 가이드](./docs/RLS_POLICY_GUIDE.md) 참조

## 📊 성능

- ✅ **Server Components** - React 서버 컴포넌트 최대 활용
- ✅ **Code Splitting** - Next.js 자동 코드 분할
- ✅ **이미지 최적화** - Next.js Image 컴포넌트
- ✅ **캐싱 전략** - 정적 파일 장기 캐싱
- ✅ **Bundle Analyzer** - 번들 크기 모니터링

현재 빌드 크기: ~102MB (.next 디렉토리)

## 🎨 브랜딩

### 색상 팔레트
- **Primary:** `#0f3460` (brand-primary)
- **Light:** `#1a4b7d` (brand-light)
- **Dark:** `#0a2340` (brand-dark)

### 폰트
- **Main:** Noto Sans KR

## 📝 데이터베이스

### 주요 테이블 (22개)

#### 핵심
- `users` - 사용자
- `seller_profiles` - 판매자 프로필
- `services` - 서비스
- `orders` - 주문
- `payments` - 결제

#### 커뮤니케이션
- `conversations` - 대화방
- `messages` - 메시지
- `notifications` - 알림

#### 피드백
- `reviews` - 리뷰
- `favorites` - 찜
- `reports` - 신고

#### 마케팅
- `advertising_campaigns` - 광고 캠페인
- `premium_placements` - 프리미엄 배치

#### 로그
- `activity_logs` - 활동 로그
- `search_logs` - 검색 로그

자세한 스키마는 `src/types/database.ts` 참조

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 커밋 컨벤션
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경 (포맷팅)
- `refactor`: 코드 리팩토링
- `perf`: 성능 개선
- `test`: 테스트 추가/수정
- `chore`: 빌드 설정, 기타

## 📜 라이선스

This project is private and proprietary.

## 📞 문의

- Email: support@talent.com
- Website: https://talent-platform.com

## 🙏 감사의 말

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PortOne](https://portone.io/)

---

**Made with ❤️ by AI Talent Hub Team**

**최종 업데이트:** 2025-11-12
**배포 준비도:** ✅ 100점 (모든 항목 완료)
