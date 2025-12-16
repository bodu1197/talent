/**
 * 주문 로딩 유틸리티
 * 주문 상세 페이지에서 공통으로 사용하는 주문 데이터 로딩 로직
 */

import { logger } from '@/lib/logger';

export interface LoadOrderOptions {
  orderId: string;
  onStart?: () => void;
  onSuccess?: (order: unknown) => void;
  onError?: (error: string) => void;
  onFinally?: () => void;
}

/**
 * 주문 데이터를 API에서 로드하는 공통 함수
 */
export async function loadOrderData({
  orderId,
  onStart,
  onSuccess,
  onError,
  onFinally,
}: LoadOrderOptions): Promise<void> {
  try {
    onStart?.();

    const response = await fetch(`/api/orders/${orderId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '주문을 찾을 수 없습니다');
    }

    const { order } = await response.json();
    onSuccess?.(order);
  } catch (err: unknown) {
    logger.error('주문 조회 실패:', err);
    const errorMessage = err instanceof Error ? err.message : '주문 정보를 불러오는데 실패했습니다';
    onError?.(errorMessage);
  } finally {
    onFinally?.();
  }
}
