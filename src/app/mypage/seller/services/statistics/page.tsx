import { redirect } from 'next/navigation';
import { requireSellerAuth } from '@/lib/seller/page-auth';
import ServiceStatisticsClient from './ServiceStatisticsClient';
import { logger } from '@/lib/logger';

// 인증이 필요한 페이지이므로 동적 렌더링 강제
export const dynamic = 'force-dynamic';

interface Order {
  total_amount: number | null;
  status: string;
}

interface Review {
  rating: number;
}

interface ViewLog {
  viewed_at: string;
}

// Helper: 완료된 주문의 매출 계산
function calculateRevenue(orders: Order[] | null): number {
  if (!orders) return 0;
  return orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, order) => sum + (order.total_amount || 0), 0);
}

// Helper: 리뷰 통계 계산
function calculateReviewStats(reviews: Review[] | null): {
  avgRating: number;
  ratingPercentages: number[];
} {
  const ratingDistribution = [0, 0, 0, 0, 0];

  if (!reviews || reviews.length === 0) {
    return { avgRating: 0, ratingPercentages: [0, 0, 0, 0, 0] };
  }

  let sum = 0;
  for (const review of reviews) {
    sum += review.rating;
    if (review.rating >= 1 && review.rating <= 5) {
      ratingDistribution[review.rating - 1]++;
    }
  }

  const avgRating = Math.round((sum / reviews.length) * 10) / 10;
  const ratingPercentages = ratingDistribution.map((count) => (count / reviews.length) * 100);

  return { avgRating, ratingPercentages };
}

// Helper: 일별 조회수 계산 (최근 7일)
function calculateDailyViews(viewLogs: ViewLog[] | null): { date: string; views: number }[] {
  const dailyViewsMap = new Map<string, number>();

  if (viewLogs) {
    for (const log of viewLogs) {
      const date = new Date(log.viewed_at);
      const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
      dailyViewsMap.set(dateStr, (dailyViewsMap.get(dateStr) || 0) + 1);
    }
  }

  const dailyViews = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    dailyViews.push({
      date: dateStr,
      views: dailyViewsMap.get(dateStr) || 0,
    });
  }

  return dailyViews;
}

export default async function ServiceStatisticsPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ id?: string }>;
}) {
  const { supabase, seller } = await requireSellerAuth();

  const params = await searchParams;
  const serviceId = params.id;

  if (!serviceId) {
    redirect('/mypage/seller/services');
  }

  // 서비스 정보 조회 (seller_id는 sellers.id를 저장)
  logger.info('[ServiceStatistics] 조회 시작:', { serviceId, sellerId: seller.id });

  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('id, title, views, orders_count, review_count, seller_id')
    .eq('id', serviceId)
    .eq('seller_id', seller.id)
    .single();

  logger.info('[ServiceStatistics] 조회 결과:', { service, error: serviceError });

  if (!service) {
    logger.warn('[ServiceStatistics] 서비스 없음 - 리다이렉트:', {
      serviceId,
      userId: user.id,
      error: serviceError,
    });
    redirect('/mypage/seller/services');
  }

  // 찜 수 조회 (service_favorites 테이블에서 계산)
  const { count: favoriteCount } = await supabase
    .from('service_favorites')
    .select('*', { count: 'exact', head: true })
    .eq('service_id', serviceId);

  // 주문 통계 (최근 30일)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 일별 조회수 (최근 7일)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 병렬 데이터 조회
  const [{ data: orders }, { data: reviews }, { data: viewLogs }, { count: totalViewCount }] =
    await Promise.all([
      supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .eq('service_id', serviceId)
        .gte('created_at', thirtyDaysAgo.toISOString()),
      supabase.from('reviews').select('rating').eq('service_id', serviceId),
      supabase
        .from('service_views')
        .select('viewed_at')
        .eq('service_id', serviceId)
        .gte('viewed_at', sevenDaysAgo.toISOString())
        .order('viewed_at', { ascending: true }),
      supabase
        .from('service_views')
        .select('*', { count: 'exact', head: true })
        .eq('service_id', serviceId),
    ]);

  // 헬퍼 함수로 통계 계산
  const revenue = calculateRevenue(orders);
  const { avgRating, ratingPercentages } = calculateReviewStats(reviews);
  const dailyViews = calculateDailyViews(viewLogs);

  const stats = {
    serviceName: service.title,
    period: '최근 30일',
    viewCount: totalViewCount || 0,
    favoriteCount: favoriteCount || 0,
    orderCount: service.orders_count || 0,
    revenue,
    avgRating,
    reviewCount: reviews?.length || 0,
  };

  return (
    <ServiceStatisticsClient
      stats={stats}
      dailyViews={dailyViews}
      ratingPercentages={ratingPercentages}
      serviceId={serviceId}
    />
  );
}
