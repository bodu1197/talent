import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 통합 API 에러 핸들러
 *
 * 사용 예시:
 * ```typescript
 * export const GET = withAuth(async (req, user) => {
 *   try {
 *     const { data, error } = await supabase.from('orders').select()
 *     if (error) throw new ApiError('주문 목록을 불러올 수 없습니다', 500)
 *     return NextResponse.json({ orders: data })
 *   } catch (error) {
 *     return handleApiError(error)
 *   }
 * })
 * ```
 */
export function handleApiError(error: unknown): NextResponse {
  logger.error('API Error:', error);

  // ApiError 인스턴스인 경우
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Supabase 에러인 경우
  if (error && typeof error === 'object' && 'message' in error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  // 기타 에러
  return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
}

/**
 * 에러를 catch해서 자동으로 처리하는 래퍼
 *
 * 사용 예시:
 * ```typescript
 * export const GET = withErrorHandling(
 *   withAuth(async (req, user) => {
 *     const { data, error } = await supabase.from('orders').select()
 *     if (error) throw new ApiError('주문 목록을 불러올 수 없습니다')
 *     return NextResponse.json({ orders: data })
 *   })
 * )
 * ```
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
