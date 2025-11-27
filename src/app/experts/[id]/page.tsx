import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ServiceCard from '@/components/services/ServiceCard';
import { Star, CheckCircle, Briefcase, User, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ExpertDetailProps {
  readonly params: Promise<{
    id: string;
  }>;
}

interface ReviewData {
  service_id: string;
  rating: number;
}

interface ReviewStats {
  rating: number;
  count: number;
}

// Helper: Calculate review stats from raw reviews
function calculateReviewStats(reviews: ReviewData[]): Record<string, ReviewStats> {
  const grouped: Record<string, number[]> = {};

  for (const r of reviews) {
    if (!grouped[r.service_id]) grouped[r.service_id] = [];
    grouped[r.service_id].push(r.rating);
  }

  const stats: Record<string, ReviewStats> = {};
  for (const [serviceId, ratings] of Object.entries(grouped)) {
    stats[serviceId] = {
      rating: ratings.reduce((a, b) => a + b, 0) / ratings.length,
      count: ratings.length,
    };
  }

  return stats;
}

// Helper: Calculate overall rating from review stats
function calculateOverallRating(reviewStats: Record<string, ReviewStats>): {
  avgRating: number;
  totalReviews: number;
} {
  const allRatings = Object.values(reviewStats);
  const totalReviews = allRatings.reduce((sum, s) => sum + s.count, 0);
  const avgRating =
    totalReviews > 0
      ? allRatings.reduce((sum, s) => sum + s.rating * s.count, 0) / totalReviews
      : 0;

  return { avgRating, totalReviews };
}

export default async function ExpertDetailPage({ params }: ExpertDetailProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 판매자 프로필 조회
  const { data: seller, error } = await supabase
    .from('seller_profiles')
    .select(
      `
      id,
      user_id,
      business_name,
      display_name,
      profile_image,
      bio,
      contact_hours,
      tax_invoice_available,
      is_verified,
      created_at
    `
    )
    .eq('id', id)
    .single();

  if (error || !seller) {
    notFound();
  }

  // 판매자의 서비스 목록 조회
  const { data: services } = await supabase
    .from('services')
    .select(
      `
      id,
      title,
      description,
      price,
      thumbnail_url,
      orders_count,
      wishlist_count,
      view_count,
      created_at,
      is_promoted
    `
    )
    .eq('seller_id', seller.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // 서비스별 리뷰 통계 조회
  const serviceIds = services?.map((s) => s.id) || [];
  let reviewStats: Record<string, ReviewStats> = {};

  if (serviceIds.length > 0) {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('service_id, rating')
      .in('service_id', serviceIds);

    if (reviews) {
      reviewStats = calculateReviewStats(reviews);
    }
  }

  // 전체 리뷰 통계 계산
  const { avgRating, totalReviews } = calculateOverallRating(reviewStats);

  // 총 주문 수
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', seller.user_id)
    .eq('status', 'completed');

  // 서비스 데이터 가공
  const servicesWithStats =
    services?.map((service) => ({
      ...service,
      order_count: service.orders_count || 0,
      rating: reviewStats[service.id]?.rating || 0,
      review_count: reviewStats[service.id]?.count || 0,
      seller: {
        id: seller.id,
        business_name: seller.business_name,
        display_name: seller.display_name,
        profile_image: seller.profile_image,
        is_verified: seller.is_verified || false,
      },
    })) || [];

  const displayName = seller.display_name || seller.business_name || '전문가';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 프로필 헤더 */}
      <div className="bg-white border-b">
        <div className="container-1200 px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* 프로필 이미지 */}
            <div className="relative w-32 h-32 flex-shrink-0">
              {seller.profile_image ? (
                <Image
                  src={seller.profile_image}
                  alt={displayName}
                  fill
                  className="rounded-full object-cover"
                  sizes="128px"
                  priority
                />
              ) : (
                <div className="w-32 h-32 bg-brand-primary rounded-full flex items-center justify-center text-white text-4xl font-semibold">
                  {displayName[0]}
                </div>
              )}
              {seller.is_verified && (
                <div className="absolute bottom-1 right-1 bg-blue-500 rounded-full p-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* 프로필 정보 */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold">{displayName}</h1>
                {seller.is_verified && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    인증됨
                  </span>
                )}
              </div>

              {seller.bio && <p className="text-gray-600 mb-4 whitespace-pre-wrap">{seller.bio}</p>}

              {/* 통계 */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold">{avgRating.toFixed(1)}</span>
                  <span className="text-gray-500">({totalReviews} 리뷰)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">{services?.length || 0}</span>
                  <span className="text-gray-500">서비스</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">{totalOrders || 0}</span>
                  <span className="text-gray-500">거래 완료</span>
                </div>
              </div>

              {/* 추가 정보 */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                {seller.contact_hours && <span>연락 가능: {seller.contact_hours}</span>}
                {seller.tax_invoice_available && (
                  <span className="text-green-600">세금계산서 발행 가능</span>
                )}
              </div>
            </div>

            {/* 문의 버튼 */}
            <div className="flex-shrink-0">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium"
              >
                <Mail className="w-4 h-4" />
                문의하기
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 서비스 목록 */}
      <div className="container-1200 px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">
          {displayName}님의 서비스 ({servicesWithStats.length})
        </h2>

        {servicesWithStats.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {servicesWithStats.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">등록된 서비스가 없습니다</h3>
            <p className="text-gray-600">아직 등록된 서비스가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
