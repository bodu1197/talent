# 테스트 인프라 설정

## 설정 완료

### Vitest 단위 테스트
- ✅ Vitest 설치 및 설정 완료
- ✅ React Testing Library 설정
- ✅ 테스트 환경 (jsdom) 설정
- ✅ Mock 설정 (Next.js Router, Supabase)

### 테스트 스크립트
```json
{
  "test": "vitest",              // 워치 모드로 테스트 실행
  "test:ui": "vitest --ui",      // UI로 테스트 실행
  "test:coverage": "vitest --coverage",  // 커버리지 측정
  "test:run": "vitest run",      // 단일 실행
  "test:e2e": "playwright test", // E2E 테스트 (Playwright)
  "test:all": "npm run test:run && npm run test:e2e"  // 모든 테스트
}
```

### 테스트 실행
```bash
# 단위 테스트 실행
npm run test:run

# 워치 모드
npm test

# 커버리지
npm run test:coverage

# E2E 테스트
npm run test:e2e
```

## 작성된 예제 테스트

### src/__tests__/lib/error.test.ts
에러 유틸리티 함수 테스트 - ✅ 통과

```typescript
describe('Error utilities', () => {
  describe('getErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error')
      expect(getErrorMessage(error)).toBe('Test error')
    })
    // ... 더 많은 테스트
  })
})
```

## 테스트 작성 가이드

### 1. 단위 테스트 작성 위치
```
src/__tests__/
├── lib/                    # 유틸리티 함수 테스트
│   ├── error.test.ts      ✅
│   └── ...
├── unit/                   # 컴포넌트/함수 테스트
│   ├── components/
│   └── lib/
└── e2e/                    # E2E 테스트 (Playwright)
    ├── auth/
    ├── mypage/
    └── services/
```

### 2. 테스트 작성 예제

#### 컴포넌트 테스트
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

#### 함수 테스트
```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/lib/myFunction'

describe('myFunction', () => {
  it('returns expected value', () => {
    expect(myFunction('input')).toBe('output')
  })
})
```

### 3. Mock 설정

#### Supabase Mock
```typescript
import { vi } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  })),
}))
```

#### Next.js Router Mock
```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}))
```

## 현재 상태

### 통과하는 테스트
- ✅ Error utilities (6 tests)
- ✅ LoadingSpinner component (3 tests)  
- ✅ 일부 ErrorState tests (3 tests)

### 개선 필요한 테스트
일부 Supabase 쿼리 테스트와 컴포넌트 테스트가 실패하고 있습니다.
이것들은 환경 변수 설정과 mock 개선이 필요합니다.

## 다음 단계

### 테스트 커버리지 향상
1. 핵심 비즈니스 로직 테스트 추가
2. 결제 플로우 테스트
3. 인증/인가 테스트

### CI/CD 통합
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:run
      - run: npm run build
```

## 참고 문서
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
