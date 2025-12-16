import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { requireLogin, getUserProfileId } from '@/lib/api/auth';

type SupabaseClientType = SupabaseClient<Database>;

export interface ErrandsAuthResult {
  success: true;
  user: { id: string };
  supabase: SupabaseClientType;
  profileId: string;
}

export interface ErrandsAuthErrorResult {
  success: false;
  error: NextResponse | Response;
}

export type ErrandsAuthResultType = ErrandsAuthResult | ErrandsAuthErrorResult;

/**
 * 심부름 API 공통 인증 및 프로필 조회
 */
export async function verifyErrandsAuth(): Promise<ErrandsAuthResultType> {
  // 사용자 인증 확인
  const authResult = await requireLogin();
  if (!authResult.success) {
    return { success: false, error: authResult.error! };
  }

  const { user, supabase } = authResult;
  if (!user || !supabase) {
    return {
      success: false,
      error: NextResponse.json({ error: 'Authentication failed' }, { status: 401 }),
    };
  }

  // 사용자 프로필 조회
  const profileId = await getUserProfileId(supabase, user.id);
  if (!profileId) {
    return {
      success: false,
      error: NextResponse.json({ error: '프로필을 찾을 수 없습니다' }, { status: 404 }),
    };
  }

  return {
    success: true,
    user,
    supabase,
    profileId,
  };
}
