import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
    }

    // SNS 로그인 성공 시 users 테이블 업데이트 (트리거가 자동 생성하지만 추가 정보 업데이트)
    if (data.user) {
      // 클라이언트 측 JavaScript로 처리하도록 중간 페이지로 리다이렉트
      return NextResponse.redirect(`${origin}/auth/callback/complete`)
    }
  }

  // 회원가입/로그인 성공 후 홈으로 리다이렉트
  return NextResponse.redirect(`${origin}/`)
}
