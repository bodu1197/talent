import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type SupabaseClientType = SupabaseClient<Database>;

export interface SellerAuthResult {
  supabase: SupabaseClientType;
  user: { id: string };
  seller: { id: string };
}

/**
 * 판매자 페이지 공통 인증 및 권한 확인
 * - 로그인 확인
 * - 판매자 등록 확인
 * - 인증 실패 시 자동 리다이렉트
 */
export async function requireSellerAuth(): Promise<SellerAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!seller) {
    redirect('/mypage/seller/register');
  }

  return {
    supabase,
    user,
    seller,
  };
}
