import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Service } from '@/types';
import { getServicesByCategory } from '@/lib/supabase/queries/services';
import { FaEye, FaFlag, FaBox, FaCheckCircle, FaStar, FaHistory } from 'react-icons/fa';

// Supabase returns nested relations as arrays
interface SupabaseServiceView {
  service_id: string;
  viewed_at: string;
  service: Array<{
    id: string;
    title: string;
    price: number;
    thumbnail_url: string | null;
    orders_count: number;
    seller: Array<{
      id: string;
      business_name: string;
      is_verified: boolean;
    }>;
    service_categories: Array<{
      category_id: string;
      category: Array<{
        id: string;
        name: string;
        slug: string;
      }>;
    }>;
  }>;
}

interface ReviewData {
  service_id: string;
  rating: number;
}

interface ServiceItemDisplay {
  service: Service;
  isRecentView: boolean;
  viewIndex: number;
  viewed_at: string | null;
}

// Helper: Filter valid service views
function filterValidViews(recentViews: SupabaseServiceView[] | null): SupabaseServiceView[] {
  return (recentViews || []).filter((v) => v.service && v.service.length > 0);
}

// Helper: Calculate rating map from reviews
function calculateRatingMap(
  reviewStats: ReviewData[] | null | undefined
): Map<string, { sum: number; count: number }> {
  const ratingMap = new Map<string, { sum: number; count: number }>();

  if (reviewStats) {
    for (const review of reviewStats) {
      const current = ratingMap.get(review.service_id) || { sum: 0, count: 0 };
      ratingMap.set(review.service_id, {
        sum: current.sum + review.rating,
        count: current.count + 1,
      });
    }
  }

  return ratingMap;
}

// Helper: Add ratings to services
function addRatingsToServices(
  validViews: SupabaseServiceView[],
  ratingMap: Map<string, { sum: number; count: number }>
): void {
  for (const view of validViews) {
    if (view.service && view.service.length > 0) {
      const serviceData = view.service[0] as unknown as Service & {
        rating?: number;
        review_count?: number;
      };
      const stats = ratingMap.get(view.service_id);
      serviceData.rating = stats && stats.count > 0 ? stats.sum / stats.count : 0;
      serviceData.review_count = stats?.count || 0;
    }
  }
}

// Helper: Get category ID from service
function getCategoryIdFromService(service: SupabaseServiceView['service'][0]): string | null {
  const categories = service.service_categories;
  if (!categories || categories.length === 0) return null;

  return categories[0].category && categories[0].category.length > 0
    ? categories[0].category[0].id
    : categories[0].category_id;
}

// Helper: Get related services
async function getRelatedServices(
  validViews: SupabaseServiceView[],
  needed: number
): Promise<Service[]> {
  if (validViews.length === 0 || needed <= 0) return [];

  const firstService = validViews[0].service[0];
  const categoryId = getCategoryIdFromService(firstService);

  if (!categoryId) return [];

  const categoryServices = await getServicesByCategory(categoryId, needed * 2);
  const viewedIds = validViews.map((v) => v.service_id);
  const filtered = categoryServices.filter((s) => !viewedIds.includes(s.id));
  // crypto 기반 셔플로 보안 강화
  const shuffled = filtered.toSorted(() => {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / 0xffffffff - 0.5;
  });

  return shuffled.slice(0, needed);
}

// Helper: Combine services for display
function combineServicesForDisplay(
  validViews: SupabaseServiceView[],
  relatedServices: Service[]
): ServiceItemDisplay[] {
  return [
    ...validViews.map((v, index) => ({
      service: v.service[0] as unknown as Service,
      isRecentView: true,
      viewIndex: index,
      viewed_at: v.viewed_at,
    })),
    ...relatedServices.map((s) => ({
      service: s,
      isRecentView: false,
      viewIndex: -1,
      viewed_at: null,
    })),
  ];
}

export default async function RecentViewedServices() {
  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 최근 본 서비스 조회
  const { data: recentViews } = await supabase
    .from('service_views')
    .select(
      `
      service_id,
      viewed_at,
      service:services(
        id,
        title,
        price,
        thumbnail_url,
        orders_count,
        seller:sellers(
          id,
          business_name,
          is_verified
        ),
        service_categories(
          category_id,
          category:categories(id, name, slug)
        )
      )
    `
    )
    .eq('user_id', user.id)
    .order('viewed_at', { ascending: false })
    .limit(10);

  const validViews = filterValidViews(recentViews);

  // 최근 본 서비스들의 별점 계산
  if (validViews.length > 0) {
    const serviceIds = validViews.map((v) => v.service_id);
    const { data: reviewStats } = await supabase
      .from('reviews')
      .select('service_id, rating')
      .in('service_id', serviceIds)
      .eq('is_visible', true);

    const ratingMap = calculateRatingMap(reviewStats);
    addRatingsToServices(validViews, ratingMap);
  }

  // 관련 서비스 가져오기
  const needed = Math.max(0, 10 - validViews.length);
  const relatedServices = await getRelatedServices(validViews, needed);

  // 데이터 없으면 표시 안 함
  if (validViews.length === 0 && relatedServices.length === 0) {
    return null;
  }

  // 최근 본 서비스 + 같은 카테고리 서비스 합치기
  const allServices = combineServicesForDisplay(validViews, relatedServices);

  return (
    <section className="py-8 bg-white border-t border-gray-200">
      <div className="container-1200">
        <div className="flex items-center gap-3 mb-6">
          <FaEye className="text-brand-primary text-xl" />
          <h2 className="text-xl font-bold text-gray-900">최근 본 서비스</h2>
          {validViews.length > 0 && (
            <span className="text-sm text-gray-500">
              ({validViews.length}개)
              {relatedServices.length > 0 && ` + 추천 ${relatedServices.length}개`}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allServices.map((item, index) => {
            const { service, isRecentView, viewIndex } = item;
            if (!service) return null;

            return (
              <Link
                key={`${service.id}-${index}`}
                href={`/services/${service.id}`}
                className="group relative"
              >
                {/* 최근 본 서비스 표시 (처음 3개만 깃발) */}
                {isRecentView && viewIndex < 3 && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-1">
                      <FaFlag />
                      금방 봄
                    </div>
                  </div>
                )}

                {/* 썸네일 */}
                <div
                  className="bg-gray-100 rounded-lg overflow-hidden w-full relative"
                  style={{ aspectRatio: '210/160' }}
                >
                  {service.thumbnail_url ? (
                    <Image
                      src={service.thumbnail_url}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FaBox className="text-4xl text-gray-400" />
                    </div>
                  )}

                  {/* 최근 본 서비스 오버레이 (4번째부터는 작은 배지) */}
                  {isRecentView && viewIndex >= 3 && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        <FaEye />
                      </div>
                    </div>
                  )}
                </div>

                {/* 서비스 정보 */}
                <div className="mt-2">
                  {/* 판매자 */}
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-4 h-4 rounded-full bg-brand-primary flex items-center justify-center text-white text-[8px] font-bold">
                      {service.seller?.business_name?.[0] || 'S'}
                    </div>
                    <span className="text-xs text-gray-600 truncate">
                      {service.seller?.business_name}
                    </span>
                    {service.seller?.is_verified && (
                      <FaCheckCircle className="text-[10px] text-blue-500" />
                    )}
                  </div>

                  {/* 제목 */}
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-brand-primary transition-colors mb-1">
                    {service.title}
                  </h3>

                  {/* 평점 */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                    <span className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      {(service.rating || 0).toFixed(1)}
                    </span>
                  </div>

                  {/* 가격 */}
                  <p className="text-brand-primary font-bold text-sm">
                    {(service.price || 0).toLocaleString()}원
                  </p>

                  {/* 같은 카테고리 추천 표시 */}
                  {!isRecentView && (
                    <div className="mt-1">
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded">
                        추천
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* 더보기 버튼 (최근 본 서비스가 많을 경우) */}
        {validViews.length > 10 && (
          <div className="mt-6 text-center">
            <Link
              href="/mypage/buyer/history"
              className="inline-flex items-center gap-2 px-6 py-3 border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-colors"
            >
              <FaHistory />
              전체 방문 기록 보기
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
