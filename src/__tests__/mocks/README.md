# 테스트 Mock 가이드

이 폴더는 테스트에서 재사용 가능한 공통 mock 함수들을 제공합니다.

## 📁 파일 구조

- `supabase.ts` - Supabase 클라이언트 mock
- `logger.ts` - Logger mock
- `auth.ts` - 인증 미들웨어 mock
- `index.ts` - 모든 mock export

## 🎯 사용 목적

테스트 파일마다 중복되는 mock 코드를 제거하고, 한 곳에서 관리하여:

- ✅ 코드 중복 제거
- ✅ 유지보수성 향상
- ✅ SonarQube 품질 점수 개선
- ✅ 테스트 작성 속도 향상

## 📖 사용 예시

### Before (중복 코드)

```typescript
// 매 테스트 파일마다 반복
const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  // ... 20줄 이상
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    // ...
  },
}));
```

### After (공통 mock 사용)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { mockSupabaseServer, mockLogger, mockAuthenticatedUser } from '@/__tests__/mocks';

const mockSupabase = mockSupabaseServer();
const logger = mockLogger();

describe('My API Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should work with authenticated user', async () => {
    mockAuthenticatedUser(mockSupabase, 'user-123', 'test@example.com');

    // 테스트 로직...
  });
});
```

## 🔧 주요 함수

### Supabase Mock

```typescript
// 서버 클라이언트 mock
const mockSupabase = mockSupabaseServer();

// 클라이언트 클라이언트 mock
const mockSupabase = mockSupabaseClient();

// 인증된 사용자 설정
mockAuthenticatedUser(mockSupabase, 'user-id', 'email@example.com');

// 미인증 사용자 설정
mockUnauthenticatedUser(mockSupabase);
```

### Logger Mock

```typescript
const logger = mockLogger();

// 테스트 후 검증
expect(logger.error).toHaveBeenCalledWith('Error message');
```

### Auth Middleware Mock

```typescript
// 인증된 사용자로 withAuth mock
mockWithAuth({ id: 'user-123', email: 'test@example.com' });

// 인증 실패로 withAuth mock
mockWithAuthUnauthorized();

// requireAuth mock
mockRequireAuth({ id: 'user-123', email: 'test@example.com' });
```

## 🎨 장점

1. **중복 제거**: 100+ 테스트 파일의 중복 코드 제거
2. **일관성**: 모든 테스트에서 동일한 mock 사용
3. **유지보수**: Mock 수정 시 한 곳만 수정
4. **가독성**: 테스트 코드가 더 짧고 명확해짐
5. **품질**: SonarQube 중복 코드 지표 개선

## 📝 기여 가이드

새로운 공통 mock이 필요한 경우:

1. 해당 모듈의 mock 파일 생성 (예: `nextjs.ts`)
2. `index.ts`에 export 추가
3. 이 README에 사용 예시 추가
4. 기존 테스트 파일들을 새로운 mock으로 리팩토링
