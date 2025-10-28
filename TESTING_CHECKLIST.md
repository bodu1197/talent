# 테스트 환경 구축 체크리스트

## 📋 목차
1. [단위 테스트 (Unit Testing)](#1-단위-테스트-unit-testing)
2. [통합 테스트 (Integration Testing)](#2-통합-테스트-integration-testing)
3. [E2E 테스트 (End-to-End Testing)](#3-e2e-테스트-end-to-end-testing)
4. [시스템 테스트](#4-시스템-테스트)

---

## 1. 단위 테스트 (Unit Testing)

### 1.1 패키지 설치
```bash
npm install -D vitest @vitest/ui @vitejs/plugin-react jsdom
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @types/jest
```

### 1.2 설정 파일 생성

**`vitest.config.ts`**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**`src/__tests__/setup.ts`**
```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Next.js Router Mock
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Supabase Client Mock
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  })),
}))

// 환경변수 Mock
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
```

### 1.3 package.json 스크립트 추가
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

### 1.4 테스트 파일 구조
```
src/
└── __tests__/
    ├── setup.ts
    ├── unit/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── LoadingSpinner.test.tsx
    │   │   │   └── ErrorState.test.tsx
    │   │   └── mypage/
    │   │       └── Sidebar.test.tsx
    │   └── lib/
    │       ├── supabase/
    │       │   └── queries/
    │       │       ├── coupons.test.ts
    │       │       ├── earnings.test.ts
    │       │       ├── messages.test.ts
    │       │       └── quotes.test.ts
    │       └── utils/
    │           └── formatters.test.ts
    ├── integration/
    ├── e2e/
    └── fixtures/
        └── testData.ts
```

### 1.5 예시 테스트 코드

**컴포넌트 테스트: `LoadingSpinner.test.tsx`**
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingSpinner from '@/components/common/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('기본 메시지와 함께 렌더링된다', () => {
    render(<LoadingSpinner message="로딩 중..." />)
    expect(screen.getByText('로딩 중...')).toBeInTheDocument()
  })

  it('메시지가 없으면 기본 텍스트를 보여준다', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
```

**쿼리 함수 테스트: `coupons.test.ts`**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUserCoupons } from '@/lib/supabase/queries/coupons'
import { createClient } from '@/lib/supabase/client'

vi.mock('@/lib/supabase/client')

describe('getUserCoupons', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('사용자의 쿠폰 목록을 반환한다', async () => {
    const mockData = [
      { id: '1', coupon: { name: '테스트 쿠폰', discount_value: 5000 } },
    ]

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
          })),
        })),
      })),
    } as any)

    const result = await getUserCoupons('user-123')
    expect(result).toEqual(mockData)
  })

  it('에러 발생 시 throw 한다', async () => {
    const mockError = { message: 'Database error' }

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: null, error: mockError })),
          })),
        })),
      })),
    } as any)

    await expect(getUserCoupons('user-123')).rejects.toThrow()
  })
})
```

---

## 2. 통합 테스트 (Integration Testing)

### 2.1 테스트용 Supabase 설정

**로컬 Supabase 사용 (권장)**
```bash
# Supabase CLI로 로컬 인스턴스 시작
supabase start

# 테스트용 데이터 시딩
supabase db seed
```

**`.env.test`**
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### 2.2 테스트 데이터 시딩

**`supabase/seed.sql`**
```sql
-- 테스트용 사용자 생성
INSERT INTO auth.users (id, email) VALUES
  ('test-user-1', 'buyer@test.com'),
  ('test-user-2', 'seller@test.com');

INSERT INTO public.users (id, email, name, user_type) VALUES
  ('test-user-1', 'buyer@test.com', '테스트 구매자', 'buyer'),
  ('test-user-2', 'seller@test.com', '테스트 판매자', 'seller');

-- 테스트용 쿠폰 생성
INSERT INTO public.coupons (code, name, discount_type, discount_value, starts_at, expires_at) VALUES
  ('TEST2025', '테스트 쿠폰', 'fixed', 5000, NOW(), NOW() + INTERVAL '30 days');

-- 테스트용 서비스 생성
INSERT INTO public.services (seller_id, title, description, price, category_id) VALUES
  ('test-user-2', '테스트 서비스', '테스트용 서비스입니다', 50000,
   (SELECT id FROM categories LIMIT 1));
```

### 2.3 통합 테스트 헬퍼

**`src/__tests__/integration/helpers.ts`**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const testClient = createClient(supabaseUrl, supabaseKey)

export async function createTestUser(userData: {
  email: string
  name: string
  user_type: string
}) {
  const { data, error } = await testClient
    .from('users')
    .insert(userData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function cleanupTestData() {
  // 테스트 데이터 정리
  await testClient.from('user_coupons').delete().ilike('user_id', 'test-%')
  await testClient.from('orders').delete().ilike('buyer_id', 'test-%')
  await testClient.from('users').delete().ilike('id', 'test-%')
}
```

### 2.4 통합 테스트 예시

**`src/__tests__/integration/coupons-api.test.ts`**
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getUserCoupons } from '@/lib/supabase/queries/coupons'
import { createTestUser, cleanupTestData, testClient } from './helpers'

describe('Coupons API Integration', () => {
  let testUserId: string

  beforeAll(async () => {
    const user = await createTestUser({
      email: 'test-coupon@test.com',
      name: '쿠폰 테스트',
      user_type: 'buyer',
    })
    testUserId = user.id

    // 테스트 쿠폰 발급
    const { data: coupon } = await testClient
      .from('coupons')
      .select('id')
      .eq('code', 'TEST2025')
      .single()

    await testClient.from('user_coupons').insert({
      user_id: testUserId,
      coupon_id: coupon.id,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  it('실제 DB에서 사용자 쿠폰을 조회한다', async () => {
    const coupons = await getUserCoupons(testUserId)

    expect(coupons).toBeDefined()
    expect(coupons.length).toBeGreaterThan(0)
    expect(coupons[0]).toHaveProperty('coupon')
    expect(coupons[0].coupon).toHaveProperty('name')
  })
})
```

---

## 3. E2E 테스트 (End-to-End Testing)

### 3.1 Playwright 설치 및 설정

```bash
npm install -D @playwright/test
npx playwright install
```

**`playwright.config.ts`**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 3.2 인증 상태 관리

**`src/__tests__/e2e/auth.setup.ts`**
```typescript
import { test as setup, expect } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await page.waitForURL('/mypage')
  await expect(page.locator('text=마이페이지')).toBeVisible()

  await page.context().storageState({ path: authFile })
})
```

### 3.3 E2E 테스트 예시

**`src/__tests__/e2e/buyer-coupons.spec.ts`**
```typescript
import { test, expect } from '@playwright/test'

test.describe('구매자 쿠폰 페이지', () => {
  test.use({ storageState: 'playwright/.auth/user.json' })

  test('보유 쿠폰 목록을 표시한다', async ({ page }) => {
    await page.goto('/mypage/buyer/coupons')

    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('쿠폰')

    // 캐시 잔액 카드 확인
    await expect(page.locator('text=보유 캐시')).toBeVisible()

    // 쿠폰 목록 또는 빈 상태 확인
    const hasCoupons = await page.locator('.coupon-card').count() > 0
    if (!hasCoupons) {
      await expect(page.locator('text=보유 중인 쿠폰이 없습니다')).toBeVisible()
    }
  })

  test('사용 내역 탭으로 이동한다', async ({ page }) => {
    await page.goto('/mypage/buyer/coupons')
    await page.click('text=사용 내역')

    await expect(page).toHaveURL('/mypage/buyer/coupons/history')
    await expect(page.locator('h1')).toContainText('사용 내역')
  })

  test('모바일 화면에서 정상 동작한다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/mypage/buyer/coupons')

    // 모바일에서도 주요 요소 표시
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=보유 캐시')).toBeVisible()
  })
})
```

**`src/__tests__/e2e/seller-earnings.spec.ts`**
```typescript
import { test, expect } from '@playwright/test'

test.describe('판매자 수익 페이지', () => {
  test.use({ storageState: 'playwright/.auth/seller.json' })

  test('수익 현황을 표시한다', async ({ page }) => {
    await page.goto('/mypage/seller/earnings')

    // 수익 카드들 확인
    await expect(page.locator('text=출금 가능 금액')).toBeVisible()
    await expect(page.locator('text=정산 대기중')).toBeVisible()
    await expect(page.locator('text=출금 완료')).toBeVisible()
    await expect(page.locator('text=총 수익')).toBeVisible()

    // 출금 신청 버튼
    await expect(page.locator('text=출금 신청')).toBeVisible()
  })

  test('거래 내역을 표시한다', async ({ page }) => {
    await page.goto('/mypage/seller/earnings')

    // 테이블 헤더 확인
    await expect(page.locator('th:has-text("날짜")')).toBeVisible()
    await expect(page.locator('th:has-text("구분")')).toBeVisible()
    await expect(page.locator('th:has-text("금액")')).toBeVisible()
  })
})
```

### 3.4 package.json 스크립트 추가
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## 4. 시스템 테스트

### 4.1 빌드 검증
```bash
# TypeScript 컴파일 체크
npx tsc --noEmit

# 프로덕션 빌드
npm run build

# ESLint 체크
npm run lint
```

### 4.2 로깅 시스템 (선택사항)

**Winston 설치**
```bash
npm install winston winston-daily-rotate-file
```

**`src/lib/logger.ts`**
```typescript
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  )
}

export default logger
```

### 4.3 에러 트래킹 (선택사항)

**Sentry 설치**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 4.4 성능 테스트

**Lighthouse CI 설치**
```bash
npm install -D @lhci/cli
```

**`lighthouserc.js`**
```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: ['http://localhost:3000', 'http://localhost:3000/services'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

---

## 5. 테스트 커버리지 목표

### 5.1 우선순위별 테스트 대상

**높음 (Critical)**
- 인증/로그인 플로우
- 결제 프로세스
- 주문 생성/관리
- 사용자 프로필 관리

**중간 (Important)**
- 서비스 검색/필터링
- 쿠폰 시스템
- 메시지 시스템
- 리뷰 작성

**낮음 (Nice to have)**
- UI 컴포넌트 단위 테스트
- 유틸리티 함수
- 정적 페이지

### 5.2 커버리지 목표
- 전체 코드 커버리지: 60% 이상
- 핵심 비즈니스 로직: 80% 이상
- 유틸리티 함수: 90% 이상

---

## 6. CI/CD 통합

### 6.1 GitHub Actions 설정

**`.github/workflows/test.yml`**
```yaml
name: Test

on:
  push:
    branches: [master, main]
  pull_request:
    branches: [master, main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:run

      - name: Run build
        run: npm run build

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: playwright-report/
```

---

## 7. 테스트 실행 순서

### 개발 중
```bash
# 1. 단위 테스트 (빠름, 자주 실행)
npm run test

# 2. 특정 파일만 테스트
npm run test src/__tests__/unit/queries/coupons.test.ts

# 3. Watch 모드로 실행
npm run test -- --watch
```

### 커밋 전
```bash
# 1. 전체 단위 테스트
npm run test:run

# 2. 빌드 확인
npm run build

# 3. Lint 확인
npm run lint
```

### 배포 전
```bash
# 1. 전체 테스트
npm run test:run
npm run test:e2e

# 2. 커버리지 확인
npm run test:coverage

# 3. 프로덕션 빌드
npm run build
```

---

## 8. 트러블슈팅

### 문제 1: Supabase mock이 작동하지 않음
**해결책**: `setup.ts`에서 mock 설정 확인 및 `vi.clearAllMocks()` 사용

### 문제 2: E2E 테스트에서 인증 실패
**해결책**: `auth.setup.ts` 실행 후 storageState 파일 생성 확인

### 문제 3: 테스트가 너무 느림
**해결책**: 단위 테스트와 통합 테스트 분리, 병렬 실행 설정

### 문제 4: CI에서 테스트 실패
**해결책**: 환경변수 설정 확인, 타임아웃 증가

---

## 9. 유용한 명령어 모음

```bash
# Vitest UI로 테스트 보기
npm run test:ui

# 특정 테스트만 실행
npm run test -- coupons

# 커버리지 확인
npm run test:coverage

# E2E 테스트 디버그
npm run test:e2e:debug

# Playwright UI 모드
npm run test:e2e:ui

# 테스트 리포트 보기
npm run test:e2e:report
```

---

## 완료 체크리스트

- [ ] Vitest 설치 및 설정
- [ ] React Testing Library 설치
- [ ] 테스트 setup 파일 작성
- [ ] 단위 테스트 예시 작성
- [ ] 로컬 Supabase 설정
- [ ] 통합 테스트 헬퍼 작성
- [ ] 통합 테스트 예시 작성
- [ ] Playwright 설치
- [ ] E2E 테스트 설정
- [ ] E2E 테스트 예시 작성
- [ ] CI/CD 파이프라인 설정
- [ ] 첫 번째 테스트 통과 ✅

---

**문서 작성일**: 2025-10-28
**최종 수정일**: 2025-10-28
**작성자**: Claude Code
