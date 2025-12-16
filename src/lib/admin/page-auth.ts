import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type SupabaseClientType = SupabaseClient<Database>;

export interface AdminAuthResult {
  supabase: SupabaseClientType;
  user: { id: string };
  admin: { id: string };
}

/**
 * Admin 페이지 공통 인증 및 권한 확인
 * - 로그인 확인
 * - 관리자 권한 확인
 * - 인증 실패 시 자동 리다이렉트
 */
export async function requireAdminAuth(): Promise<AdminAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 관리자 확인
  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!admin) {
    redirect('/');
  }

  return {
    supabase,
    user,
    admin,
  };
}
