import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

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
    }
  },
  useSearchParams() {
    return {
      get: vi.fn(),
    }
  },
  usePathname() {
    return '/'
  },
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => {
  interface MockQueryBuilder {
    select: ReturnType<typeof vi.fn>
    eq: ReturnType<typeof vi.fn>
    single: ReturnType<typeof vi.fn>
    order: ReturnType<typeof vi.fn>
    limit: ReturnType<typeof vi.fn>
    range: ReturnType<typeof vi.fn>
    insert: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
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
    }
    return mockBuilder
  }

  return {
    createClient: vi.fn(() => ({
      auth: {
        getUser: vi.fn(),
        signOut: vi.fn(),
      },
      from: vi.fn(() => createMockQueryBuilder()),
    })),
  }
})

// Add custom matchers if needed
expect.extend({
  // Custom matchers can be added here
})
