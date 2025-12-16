/**
 * 주문 상태 관련 유틸리티 함수
 */

/**
 * 주문 상태를 한글 라벨로 변환
 */
export function getOrderStatusLabel(status: string): string {
  switch (status) {
    case 'paid':
      return '결제완료';
    case 'in_progress':
      return '진행중';
    case 'delivered':
      return '완료 대기';
    case 'completed':
      return '완료';
    case 'cancelled':
      return '취소/환불';
    default:
      return status;
  }
}

/**
 * 주문 상태에 맞는 색상 클래스 반환
 */
export function getOrderStatusColor(status: string): string {
  switch (status) {
    case 'paid':
      return 'bg-red-100 text-red-700';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-700';
    case 'delivered':
      return 'bg-blue-100 text-blue-700';
    case 'completed':
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
