import { vi } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * 공통 Auth Middleware Mock
 */

export interface MockUser {
  id: string;
  email: string;
  created_at?: string;
}

/**
 * withAuth 미들웨어 모킹 (인증된 사용자)
 * @example
 * ```ts
 * import { mockWithAuth } from '@/__tests__/mocks/auth';
 *
 * mockWithAuth({ id: 'user-123', email: 'test@example.com' });
 * ```
 */
export const mockWithAuth = (user: MockUser = { id: 'user-1', email: 'test@example.com' }) => {
  vi.mock('@/lib/api/auth-middleware', () => ({
    withAuth: vi.fn((handler) => {
      return async (request: NextRequest) => {
        return handler(request, user);
      };
    }),
  }));

  return user;
};

/**
 * withAuth 미들웨어 모킹 (인증 실패)
 */
export const mockWithAuthUnauthorized = () => {
  vi.mock('@/lib/api/auth-middleware', () => ({
    withAuth: vi.fn(() => {
      return async () => {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      };
    }),
  }));
};

/**
 * requireAuth 모킹 (인증된 사용자)
 */
export const mockRequireAuth = (user: MockUser = { id: 'user-1', email: 'test@example.com' }) => {
  vi.mock('@/lib/auth/server', () => ({
    requireAuth: vi.fn(async () => ({
      user,
      supabase: {},
    })),
  }));

  return user;
};

/**
 * requireAuth 모킹 (인증 실패 - redirect)
 */
export const mockRequireAuthRedirect = () => {
  vi.mock('@/lib/auth/server', () => ({
    requireAuth: vi.fn(async () => {
      throw new Error('Unauthorized - redirecting to login');
    }),
  }));
};

/**
 * checkAdminAuth 공통 mock
 */
export const mockCheckAdminAuth = vi.fn();
