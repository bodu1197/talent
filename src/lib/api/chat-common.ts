import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { requireLogin } from '@/lib/api/auth';

type SupabaseClientType = SupabaseClient<Database>;

export interface ChatAuthResult {
  success: true;
  user: { id: string };
  supabase: SupabaseClientType;
  room_id: string;
}

export interface ChatAuthErrorResult {
  success: false;
  error: NextResponse | Response;
}

export type ChatAuthResultType = ChatAuthResult | ChatAuthErrorResult;

/**
 * 채팅 API 공통 인증 및 room_id 검증
 */
export async function verifyChatAuth(request: NextRequest): Promise<ChatAuthResultType> {
  // 인증 확인
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

  // 요청 본문 파싱
  const body = await request.json();
  const { room_id } = body;

  // room_id 검증
  if (!room_id) {
    return {
      success: false,
      error: NextResponse.json({ error: 'room_id is required' }, { status: 400 }),
    };
  }

  return {
    success: true,
    user,
    supabase,
    room_id,
  };
}
