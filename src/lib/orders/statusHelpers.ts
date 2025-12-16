/**
 * Shared order status utility functions
 */

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending_payment':
      return '결제 대기';
    case 'paid':
    case 'payment_completed':
      return '결제완료';
    case 'in_progress':
      return '진행중';
    case 'delivered':
      return '도착 확인 대기';
    case 'completed':
      return '완료';
    case 'cancelled':
      return '취소/환불';
    case 'refunded':
      return '환불완료';
    case 'revision':
    case 'revision_requested':
      return '수정 요청';
    case 'in_review':
      return '검토중';
    default:
      return status;
  }
}

export function getStatusColor(status: string): string {
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

interface StatusHistory {
  status: string;
  date: string;
  actor: string;
}

interface OrderTimestamps {
  created_at: string;
  paid_at?: string | null;
  started_at?: string | null;
  delivered_at?: string | null;
  completed_at?: string | null;
}

function createStatusEntry(
  status: string,
  timestamp: string | null | undefined,
  actor: string
): StatusHistory | null {
  if (!timestamp) return null;

  return {
    status,
    date: new Date(timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    actor,
  };
}

export function buildStatusHistory(order: OrderTimestamps): StatusHistory[] {
  const entries = [
    createStatusEntry('주문 접수', order.created_at, '시스템'),
    createStatusEntry('결제 완료', order.paid_at, '구매자'),
    createStatusEntry('작업 시작', order.started_at, '판매자'),
    createStatusEntry('작업 완료', order.delivered_at, '판매자'),
    createStatusEntry('구매 확정', order.completed_at, '구매자'),
  ];

  return entries.filter((entry): entry is StatusHistory => entry !== null);
}
