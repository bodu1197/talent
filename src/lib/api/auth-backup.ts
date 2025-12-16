import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Ratelimit } from '@upstash/ratelimit';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * API 인증 결과 타입
 */
export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email?: string;
  };
  supabase?: SupabaseClient;
  error?: NextResponse | Response;
}

/**
 * API 라우트에서 사용자 인증 확인
 * 인증 실패 시 401 에러 응답 반환
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 }),
    };
  }

  return {
    success: true,
    user,
    supabase,
  };
}

/**
 * API 라우트에서 사용자 로그인 확인 (간단한 버전)
 * '로그인이 필요합니다' 메시지 사용
 */
export async function requireLogin(): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 }),
    };
  }

  return {
    success: true,
    user,
    supabase,
  };
}

/**
 * 사용자의 profile.id 조회
 */
export async function getUserProfileId(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  return userProfile?.id || null;
}

/**
 * 사용자의 seller.id 조회
 */
export async function getUserSellerId(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', userId)
    .single();

  return seller?.id || null;
}

/**
 * API 라우트에서 사용자 인증 + Rate Limiting 확인
 * 인증 후 Rate Limit 체크까지 수행
 */
export async function requireAuthWithRateLimit(rateLimiter: Ratelimit): Promise<AuthResult> {
  // 먼저 인증 확인
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult;
  }

  const { user, supabase } = authResult;
  if (!user || !supabase) {
    return {
      success: false,
      error: NextResponse.json({ error: 'Authentication failed' }, { status: 401 }),
    };
  }

  // Rate Limiting 체크
  const rateLimitResult = await checkRateLimit(user.id, rateLimiter);
  if (!rateLimitResult.success) {
    return {
      success: false,
      error: rateLimitResult.error,
    };
  }

  return {
    success: true,
    user,
    supabase,
  };
}
