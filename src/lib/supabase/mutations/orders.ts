import { createClient } from '@/lib/supabase/client';

export async function confirmOrder(orderId: string) {
  // 에스크로 구매확정을 위해 API 호출 (PortOne 에스크로 정산 처리)
  const response = await fetch(`/api/orders/${orderId}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '구매확정에 실패했습니다');
  }

  return response.json();
}

export async function requestRevision(orderId: string, revisionDetails: string) {
  const supabase = createClient();

  // [Implementation Note] Consider creating a separate revision_requests table for better tracking
  // Current approach: Update order status and store revision details inline
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'in_progress',
      revision_requested: true,
      revision_details: revisionDetails,
      revision_requested_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelOrder(orderId: string, cancelReason: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      cancel_reason: cancelReason,
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
