import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * CSP nonce 생성 함수
 * @returns 암호학적으로 안전한 랜덤 nonce 문자열
 */
function generateNonce(): string {
  // Node.js crypto 모듈 사용 (Edge Runtime에서도 사용 가능)
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  return Buffer.from(randomBytes).toString('base64');
}

export async function middleware(request: NextRequest) {
  // /api/nice/verify 경로는 CSP 제외 (인라인 스타일/스크립트 사용)
  if (request.nextUrl.pathname === '/api/nice/verify') {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  // CSP nonce 생성
  const nonce = generateNonce();

  // pathname과 nonce를 헤더에 추가 (Server Component에서 사용)
  supabaseResponse.headers.set('x-pathname', request.nextUrl.pathname);
  supabaseResponse.headers.set('x-nonce', nonce);

  // 보안 헤더 강화
  const setSecurityHeaders = (response: NextResponse, _nonce: string) => {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // CSP 설정
    // Next.js 자동 생성 인라인 스크립트 호환을 위해 'unsafe-inline' 허용
    // style-src: 'unsafe-inline' 허용 (Tailwind CSS, 서드파티 라이브러리 호환)
    // 보안: XSS 취약점은 React의 자동 이스케이프로 완화
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live;
      style-src 'self' 'unsafe-inline';
      style-src-attr 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self' data:;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live https://img.youtube.com https://www.youtube.com;
      frame-src 'self' https://vercel.live https://www.youtube.com;
      frame-ancestors 'none';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      upgrade-insecure-requests;
    `
      .replace(/\s{2,}/g, ' ')
      .trim();

    response.headers.set('Content-Security-Policy', cspHeader);
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // HTTPS 전용 (프로덕션에서만)
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    return response;
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          // 쿠키 설정 후 보안 헤더 다시 적용
          setSecurityHeaders(supabaseResponse, nonce);
        },
      },
      auth: {
        flowType: 'pkce',
        storageKey: 'sb-auth-token',
      },
    }
  );

  // 세션 새로고침 - 세션이 만료되었는지 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // 디버깅: 쿠키와 인증 상태 확인 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development' && request.nextUrl.pathname.startsWith('/mypage')) {
    logger.debug('[Middleware] Auth check', {
      path: request.nextUrl.pathname,
      hasUser: !!user,
      userId: user?.id,
      cookieCount: request.cookies.getAll().length,
    });

    if (authError) {
      logger.error('[Middleware] Auth error:', authError);
    }
  }

  // 보호된 경로 설정 - mypage는 모두 인증 필요
  const protectedPaths = ['/mypage', '/profile/edit', '/messages', '/orders'];
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  // 인증이 필요한 페이지인데 로그인하지 않은 경우 - 즉시 리다이렉트
  if (isProtectedPath && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);

    const response = NextResponse.redirect(redirectUrl);
    setSecurityHeaders(response, nonce);
    return response;
  }

  // 로그인한 사용자가 로그인/회원가입 페이지 접근 시 홈으로 리다이렉트
  if (
    (request.nextUrl.pathname === '/auth/login' || request.nextUrl.pathname === '/auth/register') &&
    user
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    const redirectResponse = NextResponse.redirect(redirectUrl);
    setSecurityHeaders(redirectResponse, nonce);
    return redirectResponse;
  }

  // 보안 헤더 적용
  setSecurityHeaders(supabaseResponse, nonce);

  // RSC 요청 확인 (_rsc 쿼리 파라미터)
  const isRSCRequest = request.nextUrl.searchParams.has('_rsc');

  // RSC 요청에 캐시 및 charset 추가
  const contentType = supabaseResponse.headers.get('Content-Type');
  if (contentType === 'text/x-component' || isRSCRequest) {
    supabaseResponse.headers.set('Content-Type', 'text/x-component; charset=utf-8');
    supabaseResponse.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0');
  }

  // SVG 파일에 charset 추가
  if (contentType === 'image/svg+xml') {
    supabaseResponse.headers.set('Content-Type', 'image/svg+xml; charset=utf-8');
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - *.svg, *.png, *.jpg, etc. (image files)
     */
    // eslint-disable-next-line no-useless-escape
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
