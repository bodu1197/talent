import { createClient } from '@/lib/supabase/client'

export async function confirmOrder(orderId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function requestRevision(orderId: string, revisionDetails: string) {
  const supabase = createClient()

  // TODO: This might need to create a revision request record in a separate table
  // For now, we'll just update the order status and add a note
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'in_progress',
      revision_requested: true,
      revision_details: revisionDetails,
      revision_requested_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function cancelOrder(orderId: string, cancelReason: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      cancel_reason: cancelReason,
      cancelled_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}
