import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/server';
import HeroWithCategories from '@/components/common/HeroWithCategories';
import AITalentShowcase from '@/components/home/AITalentShowcase';
import RecommendedServices from '@/components/home/RecommendedServices';
import PersonalizedServices from '@/components/home/PersonalizedServices';
import SellerRegistrationGuide from '@/components/home/SellerRegistrationGuide';
import UserReviews from '@/components/home/UserReviews';
import { Service } from '@/types';

const RecentVisitedCategories = dynamic(() => import('@/components/home/RecentVisitedCategories'));
const RecentViewedServices = dynamic(() => import('@/components/home/RecentViewedServices'));
const TrendingCategories = dynamic(() => import('@/components/home/TrendingCategories'));
const SecondHeroBanner = dynamic(() => import('@/components/home/SecondHeroBanner'));

// 캐싱 최적화: 60초마다 재생성
export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  // 인증 상태 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // AI 카테고리 한 번만 조회 (중복 제거)
  const { data: aiCategories } = await supabase.from('categories').select('id').eq('is_ai', true);

  const aiCategoryIds = aiCategories?.map((cat) => cat.id) || [];

  return (
    <div className="pb-0">
      {/* 히어로 섹션 + 카테고리 (즉시 표시) */}
      <HeroWithCategories />

      {/* 로그인 사용자 전용 섹션 (클라이언트 사이드) */}
      {user && (
        <>
          <RecentVisitedCategories />
          <RecentViewedServices />
        </>
      )}

      {/* AI 재능 쇼케이스 (LCP 최적화: Suspense 제거 - 초기 HTML에 이미지 포함) */}
      <AIServicesSection aiCategoryIds={aiCategoryIds} />

      {/* 추천 서비스 섹션 (Suspense로 감싸기) */}
      <Suspense fallback={<RecommendedSkeleton />}>
        <RecommendedServices aiCategoryIds={aiCategoryIds} />
      </Suspense>

      {/* 로그인 전 사용자 전용 섹션 */}
      {!user && (
        <>
          {/* 실시간 인기재능 섹션 */}
          <TrendingCategories />

          {/* 제2 히어로 배너 - 돌파구 소개 */}
          <SecondHeroBanner />

          {/* 판매자 등록 안내 섹션 */}
          <SellerRegistrationGuide />

          {/* 사용자 리뷰 섹션 */}
          <Suspense fallback={<ReviewsSkeleton />}>
            <UserReviews />
          </Suspense>
        </>
      )}

      {/* 회원 맞춤 관심 카테고리 서비스 (Suspense로 감싸기) - 로그인 시에만 표시 */}
      {user && (
        <Suspense fallback={<PersonalizedSkeleton />}>
          <PersonalizedServices />
        </Suspense>
      )}
    </div>
  );
}

// 배열 랜덤 셔플 (Fisher-Yates) - crypto 기반 보안 강화
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const j = Math.floor((arr[0] / 0xffffffff) * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// 리뷰 통계 맵 생성
interface ReviewStat {
  service_id: string;
  rating: number;
}

function buildRatingMap(
  reviewStats: ReviewStat[] | null
): Map<string, { sum: number; count: number }> {
  const ratingMap = new Map<string, { sum: number; count: number }>();
  if (!reviewStats) return ratingMap;

  for (const review of reviewStats) {
    const current = ratingMap.get(review.service_id) || { sum: 0, count: 0 };
    ratingMap.set(review.service_id, {
      sum: current.sum + review.rating,
      count: current.count + 1,
    });
  }
  return ratingMap;
}

// 서비스 최종 포맷 변환
function formatServicesWithRating(
  services: Array<{ id: string; orders_count?: number; [key: string]: unknown }>,
  ratingMap: Map<string, { sum: number; count: number }>
): Service[] {
  return services.map((service) => {
    const stats = ratingMap.get(service.id);
    const rating = stats && stats.count > 0 ? stats.sum / stats.count : 0;
    return {
      ...service,
      rating,
      review_count: stats?.count || 0,
    } as unknown as Service;
  });
}

// AI 서비스 섹션 (서버 컴포넌트)
async function AIServicesSection({ aiCategoryIds }: { readonly aiCategoryIds: string[] }) {
  if (aiCategoryIds.length === 0) {
    return <AITalentShowcase services={[]} />;
  }

  const { createClient, createServiceRoleClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  // 광고 서비스 ID 조회 - Service Role 클라이언트 사용하여 RLS 우회
  const serviceRoleClient = createServiceRoleClient();
  const { data: advertisingData } = await serviceRoleClient
    .from('advertising_subscriptions')
    .select('service_id')
    .eq('status', 'active');

  const advertisedServiceIds = new Set(advertisingData?.map((ad) => ad.service_id) || []);

  // AI 카테고리의 서비스 조회 (JOIN으로 한 번에)
  const { data: aiServices } = await supabase
    .from('services')
    .select(
      `
      id,
      title,
      description,
      price,
      thumbnail_url,
      orders_count,
      status,
      seller:seller_profiles(
        id,
        business_name,
        display_name,
        profile_image,
        is_verified
      ),
      service_categories!inner(category_id)
    `
    )
    .in('service_categories.category_id', aiCategoryIds)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(50);

  if (!aiServices || aiServices.length === 0) {
    return <AITalentShowcase services={[]} />;
  }

  // 광고 서비스와 일반 서비스 분리 및 셔플
  const advertisedServices = aiServices.filter((s) => advertisedServiceIds.has(s.id));
  const regularServices = aiServices.filter((s) => !advertisedServiceIds.has(s.id));

  shuffleArray(advertisedServices);
  shuffleArray(regularServices);

  // 광고 서비스(랜덤) + 일반 서비스(랜덤) (상위 15개)
  const combinedServices = [...advertisedServices, ...regularServices].slice(0, 15);

  // 리뷰 통계 조회 및 서비스 포맷팅
  const serviceIds = combinedServices.map((s) => s.id);
  const { data: reviewStats } = await supabase
    .from('reviews')
    .select('service_id, rating')
    .in('service_id', serviceIds)
    .eq('is_visible', true);

  const ratingMap = buildRatingMap(reviewStats as ReviewStat[] | null);
  const services = formatServicesWithRating(combinedServices, ratingMap);

  return <AITalentShowcase services={services} />;
}

// 스켈레톤 로딩 컴포넌트
function RecommendedSkeleton() {
  return (
    <section className="py-8 bg-gray-50">
      <div className="container-1200">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={`recommended-skeleton-${i}`}
              className="bg-gray-100 rounded-lg h-64 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PersonalizedSkeleton() {
  return (
    <section className="py-8 bg-white">
      <div className="container-1200">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-80 animate-pulse"></div>
        </div>
        <div className="space-y-10">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={`personalized-category-${i}`}>
              <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }, (_, j) => (
                  <div
                    key={`personalized-skeleton-${i}-${j}`}
                    className="bg-gray-100 rounded-lg h-64 animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewsSkeleton() {
  return (
    <section className="py-16 bg-white">
      <div className="container-1200">
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={`review-skeleton-${i}`} className="bg-gray-50 rounded-xl p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
