import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ServiceStatisticsClient from './ServiceStatisticsClient';

export default async function ServiceStatisticsPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ id?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!seller) {
    redirect('/mypage/seller/register');
  }

  const params = await searchParams;
  const serviceId = params.id;

  if (!serviceId) {
    redirect('/mypage/seller/services');
  }

  // 서비스 정보 조회
  const { data: service } = await supabase
    .from('services')
    .select('id, title, view_count, favorite_count, order_count, seller_id')
    .eq('id', serviceId)
    .eq('seller_id', seller.id)
    .single();

  if (!service) {
    redirect('/mypage/seller/services');
  }

  // 주문 통계 (최근 30일)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, created_at, status')
    .eq('service_id', serviceId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  // 매출 계산 (완료된 주문만)
  const revenue =
    orders
      ?.filter((o) => o.status === 'completed')
      .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

  // 리뷰 통계
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('service_id', serviceId);

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // 일별 조회수 (최근 7일)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: viewLogs } = await supabase
    .from('service_view_logs')
    .select('created_at')
    .eq('service_id', serviceId)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  // 일별 조회수 집계
  const dailyViewsMap = new Map<string, number>();
  if (viewLogs) {
    for (const log of viewLogs) {
      const date = new Date(log.created_at);
      const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
      dailyViewsMap.set(dateStr, (dailyViewsMap.get(dateStr) || 0) + 1);
    }
  }

  // 최근 7일 날짜 생성
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

  // 평점 분포 계산
  const ratingDistribution = [0, 0, 0, 0, 0]; // 1-5점
  if (reviews) {
    for (const review of reviews) {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating - 1]++;
      }
    }
  }

  const ratingPercentages = ratingDistribution.map((count) =>
    reviews && reviews.length > 0 ? (count / reviews.length) * 100 : 0
  );

  const stats = {
    serviceName: service.title,
    period: '최근 30일',
    viewCount: service.view_count || 0,
    favoriteCount: service.favorite_count || 0,
    orderCount: service.order_count || 0,
    revenue: revenue,
    avgRating: Math.round(avgRating * 10) / 10,
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
