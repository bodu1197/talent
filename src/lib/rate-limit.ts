/**
 * Redis 기반 Rate Limiting (Upstash)
 * 서버리스 환경에서 안전하게 작동하는 Rate Limiting 구현
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { logger } from '@/lib/logger';

// Upstash Redis 클라이언트 초기화
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

/**
 * Rate Limiter 인스턴스 생성
 * @param requests 허용 요청 수
 * @param windowMs 시간 윈도우 (밀리초)
 * @returns Ratelimit 인스턴스
 */
function createRateLimiter(requests: number, windowMs: number) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowMs} ms`),
    analytics: true,
    prefix: 'ratelimit',
  });
}

// 결제 준비용 Rate Limiter (분당 10회)
export const paymentPrepareRateLimit = createRateLimiter(10, 60000);

// 결제 검증용 Rate Limiter (분당 5회 - 더 엄격)
export const paymentVerifyRateLimit = createRateLimiter(5, 60000);

// 직접 구매용 Rate Limiter (분당 10회)
export const directPurchaseRateLimit = createRateLimiter(10, 60000);

// 주문 상태 변경용 Rate Limiter (분당 20회)
export const orderStatusRateLimit = createRateLimiter(20, 60000);

/**
 * Rate Limit 체크 및 에러 응답 반환
 * @param identifier 사용자 식별자 (user.id)
 * @param limiter Rate Limiter 인스턴스
 * @returns { success: boolean, error?: Response }
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit
): Promise<{ success: boolean; error?: Response }> {
  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      return {
        success: false,
        error: new Response(
          JSON.stringify({
            error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
            limit,
            remaining,
            reset: new Date(reset).toISOString(),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
            },
          }
        ),
      };
    }

    return { success: true };
  } catch (error) {
    logger.error('Rate limit check failed:', error);
    // Redis 오류 시에도 요청 허용 (fallback)
    return { success: true };
  }
}

/**
 * Upstash Redis 설정 확인
 * @returns Redis 설정 여부
 */
export function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * 환경 변수 미설정 시 경고 로그
 */
if (!isRedisConfigured()) {
  console.warn(
    '[Rate Limit] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set. Rate limiting will be disabled.'
  );
}
