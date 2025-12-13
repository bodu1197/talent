import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error('Auth callback error:', error);
      return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
    }

    // SNS 로그인 성공 시 users 테이블 업데이트
    if (data.user) {
      // state 파라미터를 다음 페이지로 전달
      const completeUrl = state
        ? `${origin}/auth/callback/complete?state=${encodeURIComponent(state)}`
        : `${origin}/auth/callback/complete`;

      return NextResponse.redirect(completeUrl);
    }
  }

  // 회원가입/로그인 성공 후 홈으로 리다이렉트
  return NextResponse.redirect(`${origin}/`);
}
