/**
 * Order status helper utilities
 * Shared between buyer and seller order pages
 */

export type OrderStatusColor = 'red' | 'yellow' | 'green' | 'gray';

/**
 * Get human-readable label for order status
 */
export function getOrderStatusLabel(status: string): string {
  switch (status) {
    case 'pending_payment':
      return '결제 대기';
    case 'paid':
    case 'payment_completed':
      return '결제완료';
    case 'in_progress':
      return '진행중';
    case 'revision':
      return '수정 요청';
    case 'delivered':
      return '도착 확인 대기';
    case 'completed':
      return '완료';
    case 'cancelled':
      return '취소/환불';
    case 'refunded':
      return '환불완료';
    case 'in_review':
      return '검토중';
    default:
      return status;
  }
}

/**
 * Get color code for order status badge
 * @param status - Order status
 * @param mode - 'buyer' or 'seller' (affects color mapping)
 */
export function getOrderStatusColor(
  status: string,
  mode: 'buyer' | 'seller' = 'buyer'
): OrderStatusColor {
  if (mode === 'buyer') {
    switch (status) {
      case 'delivered':
      case 'revision':
        return 'red';
      case 'in_progress':
        return 'yellow';
      case 'completed':
        return 'green';
      default:
        return 'gray';
    }
  } else {
    // Seller mode
    switch (status) {
      case 'paid':
      case 'revision':
        return 'red';
      case 'in_progress':
        return 'yellow';
      case 'delivered':
        return 'green';
      case 'completed':
      default:
        return 'gray';
    }
  }
}

/**
 * Calculate days remaining until delivery date
 */
export function calculateDaysLeft(deliveryDate: string | null): number {
  if (!deliveryDate) return 0;
  return Math.ceil((new Date(deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

/**
 * Format order date for display
 */
export function formatOrderDate(dateString: string): string {
  return new Date(dateString).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
}

/**
 * Format delivery date for display
 */
export function formatDeliveryDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
}
