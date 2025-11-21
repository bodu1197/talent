import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

    // 개발 환경에서는 덜 엄격한 CSP 적용
    const isDev = process.env.NODE_ENV === 'development';

    const cspHeader = `
    default-src 'self';
    script-src 'self' ${isDev ? "'unsafe-eval'" : `'nonce-${nonce}'`} 'strict-dynamic' https://vercel.live;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com https://picsum.photos https://i.pravatar.cc https://api.dicebear.com;
    font-src 'self' data:;
    connect-src 'self' https://*.supabase.co https://vercel.live wss://*.supabase.co;
    frame-src 'self' https://vercel.live;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);

    requestHeaders.set(
        'Content-Security-Policy',
        cspHeader
    );

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    response.headers.set('Content-Security-Policy', cspHeader);

    // 추가 보안 헤더
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=()'
    );

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        {
            source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
};
