import { vi } from 'vitest';

/**
 * 공통 Supabase Mock
 * 모든 테스트에서 재사용 가능한 Supabase 클라이언트 목업
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export const createMockSupabase = () => {
  const mockSupabase: Record<string, any> = {
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
    },
    from: vi.fn(function (this: any) {
      return this;
    }),
    select: vi.fn(function (this: any) {
      return this;
    }),
    insert: vi.fn(function (this: any) {
      return this;
    }),
    update: vi.fn(function (this: any) {
      return this;
    }),
    delete: vi.fn(function (this: any) {
      return this;
    }),
    upsert: vi.fn(function (this: any) {
      return this;
    }),
    eq: vi.fn(function (this: any) {
      return this;
    }),
    neq: vi.fn(function (this: any) {
      return this;
    }),
    gt: vi.fn(function (this: any) {
      return this;
    }),
    gte: vi.fn(function (this: any) {
      return this;
    }),
    lt: vi.fn(function (this: any) {
      return this;
    }),
    lte: vi.fn(function (this: any) {
      return this;
    }),
    like: vi.fn(function (this: any) {
      return this;
    }),
    ilike: vi.fn(function (this: any) {
      return this;
    }),
    is: vi.fn(function (this: any) {
      return this;
    }),
    in: vi.fn(function (this: any) {
      return this;
    }),
    or: vi.fn(function (this: any) {
      return this;
    }),
    not: vi.fn(function (this: any) {
      return this;
    }),
    order: vi.fn(function (this: any) {
      return this;
    }),
    limit: vi.fn(function (this: any) {
      return this;
    }),
    range: vi.fn(function (this: any) {
      return this;
    }),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
    rpc: vi.fn(),
  };

  // Make functions return mockSupabase for chaining
  Object.keys(mockSupabase).forEach((key) => {
    if (
      typeof mockSupabase[key] === 'function' &&
      key !== 'auth' &&
      key !== 'storage' &&
      key !== 'rpc'
    ) {
      const originalFn = mockSupabase[key];
      mockSupabase[key] = vi.fn(() => mockSupabase);
      // Copy the mock implementation
      if (originalFn.getMockName) {
        mockSupabase[key].mockName(originalFn.getMockName());
      }
    }
  });

  return mockSupabase;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * 인증된 사용자 모킹
 */
export const mockAuthenticatedUser = (
  mockSupabase: ReturnType<typeof createMockSupabase>,
  userId = 'user-1',
  email = 'test@example.com'
) => {
  mockSupabase.auth.getUser.mockResolvedValue({
    data: {
      user: {
        id: userId,
        email,
        created_at: new Date().toISOString(),
      },
    },
    error: null,
  });
};

/**
 * 인증되지 않은 사용자 모킹
 */
export const mockUnauthenticatedUser = (mockSupabase: ReturnType<typeof createMockSupabase>) => {
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: null,
  });
};
