import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 보호된 라우트 체크
  const protectedPaths = ['/dashboard', '/seller', '/buyer', '/admin', '/profile', '/settings']
  const authPaths = ['/auth/login', '/auth/register']

  const path = request.nextUrl.pathname
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p))
  const isAuthPath = authPaths.some(p => path.startsWith(p))

  if (isProtectedPath && !user) {
    // 로그인되지 않은 사용자가 보호된 페이지 접근시 로그인 페이지로
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (isAuthPath && user) {
    // 이미 로그인한 사용자가 로그인/회원가입 페이지 접근시 홈으로
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 관리자 페이지 접근 제한
  if (path.startsWith('/admin') && user) {
    const { data: adminCheck } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!adminCheck) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}