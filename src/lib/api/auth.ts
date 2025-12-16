import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * API 라우트용 인증 헬퍼
 * 인증된 사용자와 Supabase 클라이언트를 반환하거나 401 에러를 반환
 */
export async function requireAuth(): Promise<
  | { supabase: SupabaseClient; user: User; error: null }
  | { supabase: null; user: null; error: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      supabase: null,
      user: null,
      error: NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 }),
    };
  }

  return {
    supabase,
    user,
    error: null,
  };
}
