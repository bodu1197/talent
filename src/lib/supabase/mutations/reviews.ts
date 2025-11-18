import { createClient } from '@/lib/supabase/client'

export async function createReview(data: {
  orderId: string
  serviceId: string
  sellerId: string
  buyerId: string
  rating: number
  content: string
}) {
  const supabase = createClient()

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      order_id: data.orderId,
      service_id: data.serviceId,
      seller_id: data.sellerId,
      buyer_id: data.buyerId,
      rating: data.rating,
      comment: data.content
    })
    .select()
    .single()

  if (error) throw error

  // Update the order with the review_id
  await supabase
    .from('orders')
    .update({ review_id: review.id })
    .eq('id', data.orderId)

  return review
}

export async function updateReview(reviewId: string, data: {
  rating: number
  content: string
}) {
  const supabase = createClient()

  const { data: review, error } = await supabase
    .from('reviews')
    .update({
      rating: data.rating,
      comment: data.content,
      updated_at: new Date().toISOString()
    })
    .eq('id', reviewId)
    .select()
    .single()

  if (error) throw error
  return review
}

export async function deleteReview(reviewId: string) {
  const supabase = createClient()

  // First, remove the review_id from the order
  await supabase
    .from('orders')
    .update({ review_id: null })
    .eq('review_id', reviewId)

  // Then delete the review
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)

  if (error) throw error
}

export async function createReviewReply(reviewId: string, replyContent: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('reviews')
    .update({
      seller_reply: replyContent,
      seller_reply_at: new Date().toISOString()
    })
    .eq('id', reviewId)
    .select()
    .single()

  if (error) throw error
  return data
}
