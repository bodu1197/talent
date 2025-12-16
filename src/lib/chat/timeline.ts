import type { Message, PaymentRequest } from '@/types/chat';

export interface TimelineItem {
  type: 'message' | 'payment';
  data: Message | PaymentRequest;
  timestamp: string;
}

/**
 * 메시지와 결제 요청을 시간순으로 정렬한 타임라인 생성
 */
export function createChatTimeline(
  messages: Message[],
  paymentRequests: PaymentRequest[]
): TimelineItem[] {
  const timeline: TimelineItem[] = [];

  for (const msg of messages) {
    timeline.push({ type: 'message', data: msg, timestamp: msg.created_at });
  }

  for (const req of paymentRequests) {
    timeline.push({ type: 'payment', data: req, timestamp: req.created_at });
  }

  return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
