import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';

export interface VerificationAuthResult<T = Record<string, unknown>> {
  success: true;
  user: { id: string };
  body: T;
}

export interface VerificationAuthErrorResult {
  success: false;
  error: NextResponse | Response;
}

export type VerificationAuthResultType<T = Record<string, unknown>> =
  | VerificationAuthResult<T>
  | VerificationAuthErrorResult;

/**
 * 검증 API 공통 인증 로직
 */
export async function verifyAuth<T = Record<string, unknown>>(
  request: NextRequest
): Promise<VerificationAuthResultType<T>> {
  // 인증 확인
  const authResult = await requireAuth();
  if (!authResult.success) {
    return { success: false, error: authResult.error! };
  }

  const { user } = authResult;
  if (!user) {
    return {
      success: false,
      error: NextResponse.json({ error: 'Authentication failed' }, { status: 401 }),
    };
  }

  // 요청 본문 파싱
  const body = (await request.json()) as T;

  return {
    success: true,
    user,
    body,
  };
}
