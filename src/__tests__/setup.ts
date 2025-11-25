import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      pathname: '/',
      query: {},
    };
  },
  useSearchParams() {
    return {
      get: vi.fn(),
    };
  },
  usePathname() {
    return '/';
  },
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => {
  interface MockQueryBuilder {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    range: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  }

  const createMockQueryBuilder = (): MockQueryBuilder => {
    const mockBuilder: MockQueryBuilder = {
      select: vi.fn(() => mockBuilder),
      eq: vi.fn(() => mockBuilder),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      order: vi.fn(() => mockBuilder),
      limit: vi.fn(() => mockBuilder),
      range: vi.fn(() => mockBuilder),
      insert: vi.fn(() => mockBuilder),
      update: vi.fn(() => mockBuilder),
      delete: vi.fn(() => mockBuilder),
    };
    return mockBuilder;
  };

  return {
    createClient: vi.fn(() => ({
      auth: {
        getUser: vi.fn(),
        signOut: vi.fn(),
      },
      from: vi.fn(() => createMockQueryBuilder()),
    })),
  };
});

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => {
  interface MockQueryBuilder {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    in: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    range: ReturnType<typeof vi.fn>;
    gte: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  }

  const createMockQueryBuilder = (): MockQueryBuilder => {
    const mockBuilder: MockQueryBuilder = {
      select: vi.fn(() => mockBuilder),
      eq: vi.fn(() => mockBuilder),
      in: vi.fn(() => mockBuilder),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      order: vi.fn(() => mockBuilder),
      limit: vi.fn(() => mockBuilder),
      range: vi.fn(() => mockBuilder),
      gte: vi.fn(() => mockBuilder),
      insert: vi.fn(() => mockBuilder),
      update: vi.fn(() => mockBuilder),
      delete: vi.fn(() => mockBuilder),
    };
    return mockBuilder;
  };

  return {
    createClient: vi.fn(() =>
      Promise.resolve({
        auth: {
          getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
          getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
        },
        from: vi.fn(() => createMockQueryBuilder()),
        rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })
    ),
    createServiceRoleClient: vi.fn(() => ({
      from: vi.fn(() => createMockQueryBuilder()),
    })),
  };
});

// Mock Supabase singleton
vi.mock('@/lib/supabase/singleton', () => ({
  SupabaseManager: {
    getInstance: vi.fn(() => ({
      getClient: vi.fn(),
    })),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    dev: vi.fn(),
  },
}));

// Mock rate-limit
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
  paymentPrepareRateLimit: {},
  paymentVerifyRateLimit: {},
}));

// Mock error utilities
vi.mock('@/lib/error', () => ({
  getErrorMessage: vi.fn((error: unknown) => {
    if (error instanceof Error) return error.message;
    return String(error);
  }),
  isError: vi.fn((error: unknown) => error instanceof Error),
}));

// Mock transaction utilities
vi.mock('@/lib/transaction', () => ({
  createOrderWithIdempotency: vi.fn(),
  createPaymentWithIdempotency: vi.fn(),
}));

// Mock auth config
vi.mock('@/lib/auth/config', () => ({
  ALLOWED_REDIRECT_ORIGINS: ['http://localhost:3000'],
  RATE_LIMIT_CONFIG: {
    maxAttempts: 5,
    windowMs: 60000,
  },
  AUTH_CONFIG: {
    sessionTimeout: 3600,
  },
}));

// Add custom matchers if needed
expect.extend({
  // Custom matchers can be added here
});
