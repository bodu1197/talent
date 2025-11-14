import { createClient } from '@/lib/supabase/server'

export async function createNotification({
  userId,
  type,
  title,
  message,
  linkUrl
}: {
  userId: string
  type: string
  title: string
  message: string
  linkUrl?: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      link_url: linkUrl || null,
      is_read: false
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create notification:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return null
  }

  return data
}

// 새 주문 알림 (판매자에게)
export async function notifyNewOrder(sellerId: string, orderId: string, serviceName: string) {
  return createNotification({
    userId: sellerId,
    type: 'new_order',
    title: '새로운 주문이 들어왔습니다',
    message: `${serviceName} 서비스에 새로운 주문이 접수되었습니다`,
    linkUrl: `/mypage/seller/orders/${orderId}`
  })
}

// 결제 완료 알림 (판매자에게)
export async function notifyPaymentReceived(sellerId: string, orderId: string, amount: number) {
  return createNotification({
    userId: sellerId,
    type: 'payment_received',
    title: '결제가 완료되었습니다',
    message: `${amount.toLocaleString()}원 결제가 완료되었습니다. 작업을 시작해주세요`,
    linkUrl: `/mypage/seller/orders/${orderId}`
  })
}

// 주문 취소 알림
export async function notifyOrderCancelled(userId: string, orderId: string, serviceName: string) {
  return createNotification({
    userId,
    type: 'order_cancelled',
    title: '주문이 취소되었습니다',
    message: `${serviceName} 주문이 취소되었습니다`,
    linkUrl: `/mypage/buyer/orders/${orderId}`
  })
}

// 작업 완료 알림 (구매자에게)
export async function notifyWorkCompleted(buyerId: string, orderId: string, serviceName: string) {
  return createNotification({
    userId: buyerId,
    type: 'work_completed',
    title: '작업이 완료되었습니다',
    message: `${serviceName} 작업이 완료되었습니다. 확인해주세요`,
    linkUrl: `/mypage/buyer/orders/${orderId}`
  })
}

// 구매 확정 알림 (판매자에게)
export async function notifyOrderConfirmed(sellerId: string, orderId: string, amount: number) {
  return createNotification({
    userId: sellerId,
    type: 'order_confirmed',
    title: '구매가 확정되었습니다',
    message: `${amount.toLocaleString()}원 정산이 예정되어 있습니다`,
    linkUrl: `/mypage/seller/earnings`
  })
}

// 리뷰 작성 알림 (판매자에게)
export async function notifyNewReview(sellerId: string, orderId: string, rating: number) {
  return createNotification({
    userId: sellerId,
    type: 'new_review',
    title: '새로운 리뷰가 등록되었습니다',
    message: `별점 ${rating}점 리뷰가 작성되었습니다`,
    linkUrl: `/mypage/seller/reviews`
  })
}

// 메시지 알림
export async function notifyNewMessage(userId: string, senderName: string, roomId: string) {
  return createNotification({
    userId,
    type: 'new_message',
    title: '새로운 메시지가 도착했습니다',
    message: `${senderName}님이 메시지를 보냈습니다`,
    linkUrl: `/chat/${roomId}`
  })
}
