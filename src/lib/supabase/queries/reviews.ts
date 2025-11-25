import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function getBuyerReviews(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reviews')
    .select(
      `
      *,
      service:services(id, title, thumbnail_url),
      seller:users!seller_id(id, name, profile_image),
      order:orders(id, order_number)
    `
    )
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('[getBuyerReviews] Error:', error);
    return [];
  }
  return data || [];
}

export async function getSellerReviews(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reviews')
    .select(
      `
      *,
      service:services(id, title, thumbnail_url),
      buyer:users!buyer_id(id, name, profile_image),
      order:orders(id, order_number)
    `
    )
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPendingReviews(userId: string) {
  const supabase = await createClient();

  // 완료된 주문 중 리뷰가 없는 것들
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      id,
      order_number,
      completed_at,
      total_amount,
      title,
      service_id,
      seller_id,
      service:services(id, title, thumbnail_url),
      seller:users!seller_id(id, name, profile_image)
    `
    )
    .eq('buyer_id', userId)
    .eq('status', 'completed')
    .is('review_id', null)
    .order('completed_at', { ascending: false });

  if (error) {
    logger.error('[getPendingReviews] Error:', error);
    return [];
  }
  return data || [];
}
