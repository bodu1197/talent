interface TimestampedItem {
  created_at: string;
}

export interface TimelineItem<T = TimestampedItem> {
  type: 'message' | 'payment';
  data: T;
  timestamp: string;
}

/**
 * 메시지와 결제 요청을 시간순으로 정렬한 타임라인 생성
 */
export function createChatTimeline<M extends TimestampedItem, P extends TimestampedItem>(
  messages: M[],
  paymentRequests: P[]
): TimelineItem<M | P>[] {
  const timeline: TimelineItem<M | P>[] = [];

  for (const msg of messages) {
    timeline.push({ type: 'message', data: msg, timestamp: msg.created_at });
  }

  for (const req of paymentRequests) {
    timeline.push({ type: 'payment', data: req, timestamp: req.created_at });
  }

  return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
