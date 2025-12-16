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

  // DB 타입을 클라이언트 타입으로 변환
  const mappedReviews =
    reviews?.map((r) => ({
      ...r,
      content: r.comment || '',
      is_visible: r.is_visible ?? true,
      moderated: r.moderated ?? false,
    })) || [];

  return <SellerReviewsClient reviews={mappedReviews} />;
}
