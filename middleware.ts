import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // pathname을 헤더에 추가 (Server Component에서 사용)
  supabaseResponse.headers.set('x-pathname', request.nextUrl.pathname)

  // 보안 헤더를 먼저 설정
  const setSecurityHeaders = (response: NextResponse) => {
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Content-Security-Policy', "frame-ancestors 'none'")
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          // 쿠키 설정 후 보안 헤더 다시 적용
          setSecurityHeaders(supabaseResponse)
        },
      },
      auth: {
        flowType: 'pkce',
        storageKey: 'sb-auth-token',
      },
    }
  )

  // 세션 새로고침 - 세션이 만료되었는지 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // 디버깅: 쿠키와 인증 상태 확인
  if (request.nextUrl.pathname.startsWith('/mypage')) {
    const allCookies = request.cookies.getAll()
    console.log('[Middleware] Path:', request.nextUrl.pathname)
    console.log('[Middleware] Cookies count:', allCookies.length)
    console.log('[Middleware] Auth cookies:', allCookies.filter(c => c.name.includes('sb-')).map(c => c.name))
    console.log('[Middleware] Has user:', !!user, 'User ID:', user?.id)
    console.log('[Middleware] Auth error:', authError)
  }

  // 보호된 경로 설정 - mypage는 모두 인증 필요
  const protectedPaths = ['/mypage', '/home', '/profile/edit', '/messages', '/orders']
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // 인증이 필요한 페이지인데 로그인하지 않은 경우 - 즉시 리다이렉트
  if (isProtectedPath && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)

    const response = NextResponse.redirect(redirectUrl)
    setSecurityHeaders(response)
    return response
  }

  // 로그인한 사용자가 로그인/회원가입 페이지 접근 시 홈으로 리다이렉트
  if ((request.nextUrl.pathname === '/auth/login' || request.nextUrl.pathname === '/auth/register') && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  // 보안 헤더 적용
  setSecurityHeaders(supabaseResponse)

  // RSC 요청 확인 (_rsc 쿼리 파라미터)
  const isRSCRequest = request.nextUrl.searchParams.has('_rsc')

  // RSC 요청에 캐시 및 charset 추가
  const contentType = supabaseResponse.headers.get('Content-Type')
  if (contentType === 'text/x-component' || isRSCRequest) {
    supabaseResponse.headers.set('Content-Type', 'text/x-component; charset=utf-8')
    supabaseResponse.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0')
  }

  // SVG 파일에 charset 추가
  if (contentType === 'image/svg+xml') {
    supabaseResponse.headers.set('Content-Type', 'image/svg+xml; charset=utf-8')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
