import { requireSellerAuth } from '@/lib/seller/page-auth';
import SellerReviewsClient from './SellerReviewsClient';

export default async function SellerReviewsPage() {
  const { supabase, user } = await requireSellerAuth();

  // Get seller reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(
      `
      *,
      service:services(id, title, thumbnail_url),
      buyer:profiles!reviews_buyer_id_fkey(user_id, name, profile_image),
      order:orders(id, order_number)
    `
    )
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  // DB 타입을 클라이언트 타입으로 변환 - unknown을 통한 타입 캐스팅
  const mappedReviews =
    reviews?.map((r) => ({
      id: r.id,
      order_id: r.order_id,
      buyer_id: r.buyer_id,
      seller_id: r.seller_id,
      service_id: r.service_id,
      rating: r.rating || 0,
      content: r.comment || '',
      is_visible: r.is_visible ?? true,
      moderated: r.moderated ?? false,
      seller_reply: r.seller_reply,
      seller_reply_at: r.seller_reply_at,
      created_at: r.created_at || '',
      updated_at: r.updated_at || '',
      buyer: r.buyer,
      service: r.service,
      order: r.order,
    })) || [];

  return (
    <SellerReviewsClient reviews={mappedReviews as unknown as import('@/types/common').Review[]} />
  );
}
