import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

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
        },
      },
    }
  )

  // 세션 새로고침 - 세션이 만료되었는지 확인
  const { 
    data: { user }, 
  } = await supabase.auth.getUser()

  // 보호된 경로 설정
  const protectedPaths = ['/dashboard', '/profile/edit', '/messages', '/orders']
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // 인증이 필요한 페이지인데 로그인하지 않은 경우
  if (isProtectedPath && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 로그인한 사용자가 로그인/회원가입 페이지 접근 시 홈으로 리다이렉트
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  // 보안 헤더 추가
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('Content-Security-Policy', "frame-ancestors 'none'")
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // RSC 요청에 charset 추가
  const contentType = supabaseResponse.headers.get('Content-Type')
  if (contentType === 'text/x-component') {
    supabaseResponse.headers.set('Content-Type', 'text/x-component; charset=utf-8')
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
