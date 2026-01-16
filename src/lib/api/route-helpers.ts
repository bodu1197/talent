import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAuthWithRateLimit, type AuthResult } from './auth';
import type { Ratelimit } from '@upstash/ratelimit';

/**
 * Route handler types
 */
type RouteParams = { params: Promise<{ id: string }> };
type AuthContext = {
  user: { id: string; email?: string };
  supabase: ReturnType<typeof import('@/lib/supabase/server').createClient> extends Promise<infer T>
    ? T
    : never;
};

/**
 * Handler function types
 */
type PATCHHandler = (
  request: NextRequest,
  context: AuthContext & { id: string }
) => Promise<NextResponse>;

type POSTHandler = (request: NextRequest, context: AuthContext) => Promise<NextResponse>;

type GETHandler = (
  request: NextRequest,
  context: AuthContext & { id?: string }
) => Promise<NextResponse>;

/**
 * Core authentication wrapper - DRY principle applied
 * Handles auth, rate limiting, and error handling for all route types
 */
async function withAuth<T extends AuthContext | (AuthContext & { id: string })>(
  authFn: () => Promise<AuthResult>,
  handler: (request: NextRequest, context: T) => Promise<NextResponse>,
  request: NextRequest,
  context: Partial<T>,
  errorMessage: string
): Promise<NextResponse> {
  try {
    const authResult = await authFn();
    if (!authResult.success) {
      return authResult.error! as NextResponse;
    }

    const { user, supabase } = authResult;
    if (!user || !supabase) {
      return NextResponse.json({ error: errorMessage }, { status: user ? 500 : 401 });
    }

    return await handler(request, { ...context, user, supabase } as T);
  } catch (error) {
    logger.error('Route error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

/**
 * PATCH route wrapper with authentication and ID param extraction
 * Eliminates 16-18 lines of boilerplate per route
 *
 * @example
 * export const PATCH = withAuthenticatedPATCH(async (request, { user, supabase, id }) => {
 *   // Your business logic here - auth and params already handled
 *   return NextResponse.json({ success: true });
 * });
 */
export function withAuthenticatedPATCH(handler: PATCHHandler) {
  return async (request: NextRequest, { params }: RouteParams) => {
    const { id } = await params;
    return withAuth(requireAuth, handler, request, { id }, 'Internal server error');
  };
}

/**
 * PATCH route wrapper with rate limiting
 *
 * @example
 * export const PATCH = withRateLimitedPATCH(orderStatusRateLimit, async (request, { user, supabase, id }) => {
 *   // Your business logic here
 * });
 */
export function withRateLimitedPATCH(rateLimitConfig: Ratelimit, handler: PATCHHandler) {
  return async (request: NextRequest, { params }: RouteParams) => {
    const { id } = await params;
    return withAuth(
      () => requireAuthWithRateLimit(rateLimitConfig),
      handler,
      request,
      { id },
      'Authentication failed'
    );
  };
}

/**
 * POST route wrapper with authentication
 * Eliminates 10-15 lines of boilerplate per route
 *
 * @example
 * export const POST = withAuthenticatedPOST(async (request, { user, supabase }) => {
 *   const body = await request.json();
 *   // Your business logic here
 * });
 */
export function withAuthenticatedPOST(handler: POSTHandler) {
  return async (request: NextRequest) => {
    return withAuth(requireAuth, handler, request, {}, '인증이 필요합니다');
  };
}

/**
 * POST route wrapper with rate limiting
 *
 * @example
 * export const POST = withRateLimitedPOST(apiRateLimit, async (request, { user, supabase }) => {
 *   // Your business logic here
 * });
 */
export function withRateLimitedPOST(rateLimitConfig: Ratelimit, handler: POSTHandler) {
  return async (request: NextRequest) => {
    return withAuth(
      () => requireAuthWithRateLimit(rateLimitConfig),
      handler,
      request,
      {},
      'Authentication failed'
    );
  };
}

/**
 * GET route wrapper with authentication (with optional ID param)
 *
 * @example
 * // With ID param
 * export const GET = withAuthenticatedGET(async (request, { user, supabase, id }) => {
 *   // id is available here
 * }, true);
 *
 * // Without ID param
 * export const GET = withAuthenticatedGET(async (request, { user, supabase }) => {
 *   // id is undefined
 * });
 */
// Overload signatures

export function withAuthenticatedGET(
  handler: GETHandler,
  hasIdParam: true
): (request: NextRequest, context: RouteParams) => Promise<NextResponse>;
// eslint-disable-next-line no-redeclare
export function withAuthenticatedGET(
  handler: GETHandler,
  hasIdParam?: false
): (
  request: NextRequest,
  context: { params: Promise<Record<string, never>> }
) => Promise<NextResponse>;

// Implementation
// eslint-disable-next-line no-redeclare
export function withAuthenticatedGET(handler: GETHandler, hasIdParam = false) {
  if (hasIdParam) {
    return async (request: NextRequest, { params }: RouteParams) => {
      const { id } = await params;
      return withAuth(requireAuth, handler, request, { id }, 'Internal server error');
    };
  }

  return async (request: NextRequest, { params }: { params: Promise<Record<string, never>> }) => {
    await params; // Consume params even if empty
    return withAuth(requireAuth, handler, request, {}, '인증이 필요합니다');
  };
}
