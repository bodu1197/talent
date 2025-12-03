import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { createClient as createServerClient, createServiceRoleClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { cryptoShuffleArray, partitionArray } from '@/lib/utils/crypto-shuffle';
import {
  fetchAdvertisedServiceIds,
  markAdvertisedServices,
  enrichServicesWithReviewStats,
  enrichServicesWithUserInfo,
} from './service-enrichment-helpers';

// 한 번의 쿼리로 모든 하위 카테고리 ID 가져오기 (최적화)
async function getAllDescendantCategories(
  supabase: ReturnType<typeof createBrowserClient> | Awaited<ReturnType<typeof createServerClient>>,
  parentId: string,
  parentLevel: number
): Promise<string[]> {
  // level에 따라 필요한 모든 카테고리를 한 번에 조회
  if (parentLevel === 1) {
    // 1차 카테고리: 2차와 3차 모두 가져오기
    const { data: level2 } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', parentId);

    if (!level2 || level2.length === 0) return [];

    const level2Ids = level2.map((c: { id: string }) => c.id);

    // 3차 카테고리도 한 번에 가져오기
    const { data: level3 } = await supabase
      .from('categories')
      .select('id')
      .in('parent_id', level2Ids);

    const level3Ids = level3?.map((c: { id: string }) => c.id) || [];
    return [...level2Ids, ...level3Ids];
  } else if (parentLevel === 2) {
    // 2차 카테고리: 3차만 가져오기
    const { data: level3 } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', parentId);

    return level3?.map((c: { id: string }) => c.id) || [];
  }

  return [];
}

export async function getSellerServices(userId: string, status?: string) {
  const supabase = await createServerClient();

  let query = supabase
    .from('services')
    .select(
      `
      *,
      service_categories(
        category:categories(id, name)
      )
    `
    )
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getServiceById(serviceId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('services')
    .select(
      `
      *,
      seller:seller_profiles(
        id,
        business_name,
        display_name,
        profile_image,
        user_id,
        is_business
      ),
      service_categories(
        category:categories(id, name, slug)
      )
    `
    )
    .eq('id', serviceId)
    .single();

  if (error) throw error;
  if (!data) return data;

  // Enrich with seller user information
  await enrichServicesWithUserInfo(supabase, [data]);

  return data;
}

export async function getSellerServicesCount(userId: string, status: string) {
  const supabase = await createServerClient();

  const { count, error } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', userId)
    .eq('status', status);

  if (error) throw error;
  return count || 0;
}

// 위치 기반 거리순 정렬 옵션
export interface LocationSortOptions {
  lat: number;
  lng: number;
}

// 카테고리별 승인된 서비스 조회 (서버 컴포넌트용)
// useAuth=true이면 인증된 클라이언트 사용 (기본값), false면 anon 클라이언트 사용 (캐싱 가능)
// location: 제공시 거리순으로 정렬 (가까운 서비스 우선)
export async function getServicesByCategory(
  categoryId: string,
  _limit: number = 100,
  useAuth: boolean = true,
  page: number = 1,
  location?: LocationSortOptions
) {
  const supabase = useAuth ? await createServerClient() : createBrowserClient();

  // 1. Fetch category and determine hierarchy
  const { data: category } = await supabase
    .from('categories')
    .select('id, level')
    .eq('id', categoryId)
    .single();

  if (!category) return [];

  // 2. Get all relevant category IDs (including descendants)
  let categoryIds = [categoryId];
  if (category.level === 1 || category.level === 2) {
    const allDescendants = await getAllDescendantCategories(supabase, categoryId, category.level);
    categoryIds = [categoryId, ...allDescendants];
  }

  // 3. Fetch service IDs for categories
  const { data: serviceLinks } = await supabase
    .from('service_categories')
    .select('service_id')
    .in('category_id', categoryIds);

  const serviceIds = serviceLinks?.map((sl) => sl.service_id) || [];
  if (serviceIds.length === 0) return [];

  // 4. Fetch advertised service IDs
  const serviceRoleClient = createServiceRoleClient();
  const advertisedServiceIds = await fetchAdvertisedServiceIds(serviceRoleClient);

  // 5. Fetch all services (include location fields if location sorting is needed)
  const sellerFields = location
    ? `
        id,
        business_name,
        display_name,
        profile_image,
        user_id,
        is_verified,
        is_business,
        location_latitude,
        location_longitude,
        location_region
      `
    : `
        id,
        business_name,
        display_name,
        profile_image,
        user_id,
        is_verified,
        is_business
      `;

  const { data: allServices, error } = await supabase
    .from('services')
    .select(
      `
      *,
      seller:seller_profiles!inner(${sellerFields}),
      service_categories(
        category:categories(id, name, slug)
      )
    `
    )
    .in('id', serviceIds)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching services by category:', error);
    throw error;
  }

  if (!allServices || allServices.length === 0) return [];

  // 6. Mark advertised services
  markAdvertisedServices(allServices, advertisedServiceIds);

  logger.info('getServicesByCategory - 광고 통계', {
    advertisedIds: advertisedServiceIds,
    advertisedCount: allServices.filter((s) => s.is_advertised).length,
    totalCount: allServices.length,
    sample: {
      id: allServices[0]?.id,
      title: allServices[0]?.title,
      is_advertised: allServices[0]?.is_advertised,
    },
  });

  // 7. Partition services into advertised and regular
  const [advertisedServices, regularServices] = partitionArray(allServices, (s) =>
    advertisedServiceIds.includes(s.id)
  );

  // 8. Sort or shuffle based on location
  let combinedServices: typeof allServices;

  if (location) {
    // Distance-based sorting: Calculate distance for each service
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Add distance to each service
    const addDistance = (services: typeof allServices) => {
      return services.map((service) => {
        const sellerLat = service.seller?.location_latitude;
        const sellerLng = service.seller?.location_longitude;
        const distance =
          sellerLat && sellerLng
            ? calculateDistance(location.lat, location.lng, sellerLat, sellerLng)
            : 99999; // Services without location go to the end
        return { ...service, _distance: distance };
      });
    };

    // Sort by distance
    const sortByDistance = (
      a: (typeof allServices)[0] & { _distance: number },
      b: (typeof allServices)[0] & { _distance: number }
    ) => a._distance - b._distance;

    const advertisedWithDistance = addDistance(advertisedServices).sort(sortByDistance);
    const regularWithDistance = addDistance(regularServices).sort(sortByDistance);

    // Advertised first, then regular, both sorted by distance
    combinedServices = [...advertisedWithDistance, ...regularWithDistance];

    logger.info('getServicesByCategory - 거리순 정렬 적용', {
      userLocation: location,
      totalCount: combinedServices.length,
      sampleDistances: combinedServices.slice(0, 3).map((s) => ({
        title: s.title,
        distance: s._distance?.toFixed(2),
        region: s.seller?.location_region,
      })),
    });
  } else {
    // Default: Shuffle for random display
    cryptoShuffleArray(advertisedServices);
    cryptoShuffleArray(regularServices);
    combinedServices = [...advertisedServices, ...regularServices];
  }

  // 9. Paginate
  const perPage = 28;
  const startIndex = (page - 1) * perPage;
  const data = combinedServices.slice(startIndex, startIndex + perPage);

  if (data.length === 0) return [];

  // 9. Enrich with review stats and user info
  await enrichServicesWithReviewStats(supabase, data);
  await enrichServicesWithUserInfo(supabase, data);

  return data;
}

// 전문가의 다른 서비스 조회 (현재 서비스 제외)
export async function getSellerOtherServices(
  sellerId: string,
  currentServiceId: string,
  limit: number = 5
) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('services')
    .select(
      `
      *,
      seller:seller_profiles(
        id,
        business_name,
        display_name,
        profile_image,
        is_verified,
        is_business
      )
    `
    )
    .eq('seller_id', sellerId)
    .eq('status', 'active')
    .neq('id', currentServiceId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    logger.error('Error fetching seller other services:', error);
    return [];
  }

  // 평균 별점 및 리뷰 수 추가
  if (data && data.length > 0) {
    const serviceIds = data.map((s) => s.id);
    const { data: reviewStats } = await supabase
      .from('reviews')
      .select('service_id, rating')
      .in('service_id', serviceIds)
      .eq('is_visible', true);

    const ratingMap = new Map<string, { sum: number; count: number }>();
    if (reviewStats) {
      for (const review of reviewStats as { service_id: string; rating: number }[]) {
        const current = ratingMap.get(review.service_id) || { sum: 0, count: 0 };
        ratingMap.set(review.service_id, {
          sum: current.sum + review.rating,
          count: current.count + 1,
        });
      }
    }

    for (const service of data) {
      const stats = ratingMap.get(service.id);
      if (stats && stats.count > 0) {
        service.rating = stats.sum / stats.count;
        service.review_count = stats.count;
      } else {
        service.rating = 0;
        service.review_count = 0;
      }
    }
  }

  return data || [];
}

// 같은 카테고리의 추천 서비스 조회 (광고 우선, 현재 서비스 제외)
export async function getRecommendedServicesByCategory(
  categoryId: string,
  currentServiceId: string,
  limit: number = 5
) {
  const supabase = await createServerClient();

  // 광고 서비스 ID 조회 - Service Role 클라이언트 사용하여 RLS 우회
  const serviceRoleClient = createServiceRoleClient();
  const { data: advertisingData } = await serviceRoleClient
    .from('advertising_subscriptions')
    .select('service_id')
    .eq('status', 'active');

  const advertisedServiceIds = advertisingData?.map((ad) => ad.service_id) || [];

  // 해당 카테고리의 서비스 ID 조회
  const { data: serviceLinks } = await supabase
    .from('service_categories')
    .select('service_id')
    .eq('category_id', categoryId);

  const serviceIds =
    serviceLinks?.map((sl) => sl.service_id).filter((id) => id !== currentServiceId) || [];

  if (serviceIds.length === 0) {
    return [];
  }

  // 서비스 조회
  const { data: allServices, error } = await supabase
    .from('services')
    .select(
      `
      *,
      seller:seller_profiles(
        id,
        business_name,
        display_name,
        profile_image,
        is_verified,
        is_business
      )
    `
    )
    .in('id', serviceIds)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching recommended services:', error);
    return [];
  }

  if (!allServices || allServices.length === 0) {
    return [];
  }

  // Partition and shuffle with cryptographic randomness
  const [advertisedServices, regularServices] = partitionArray(allServices, (s) =>
    advertisedServiceIds.includes(s.id)
  );

  cryptoShuffleArray(advertisedServices);
  cryptoShuffleArray(regularServices);

  // Combine and limit
  const combinedServices = [...advertisedServices, ...regularServices].slice(0, limit);

  // 평균 별점 및 리뷰 수 추가 (헬퍼 함수 사용)
  return enrichServicesWithReviewStats(supabase, combinedServices);
}

// 전체 승인된 서비스 조회 (홈페이지용) - AI 카테고리 제외
export async function getActiveServices(limit?: number) {
  const supabase = await createServerClient();

  // 1. AI 카테고리 ID 조회
  const { data: aiCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'ai-services')
    .maybeSingle();

  // 2. AI 카테고리 서비스 ID 조회
  let excludeServiceIds: string[] = [];
  if (aiCategory) {
    const { data: aiServiceLinks } = await supabase
      .from('service_categories')
      .select('service_id')
      .eq('category_id', aiCategory.id);

    if (aiServiceLinks && aiServiceLinks.length > 0) {
      excludeServiceIds = aiServiceLinks.map((sc) => sc.service_id);
    }
  }

  // 3. AI 카테고리 제외한 서비스 조회
  let query = supabase
    .from('services')
    .select(
      `
      *,
      seller:seller_profiles!inner(
        id,
        business_name,
        display_name,
        profile_image,
        user_id,
        is_verified,
        is_business
      ),
      service_categories(
        category:categories(id, name, slug)
      )
    `
    )
    .eq('status', 'active'); // 승인된 서비스만

  // AI 카테고리 서비스 제외
  if (excludeServiceIds.length > 0) {
    query = query.not('id', 'in', `(${excludeServiceIds.join(',')})`);
  }

  query = query.order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Error fetching active services:', error);
    throw error;
  }

  // 데이터 매핑 (단일 가격 사용) 및 리뷰 통계 추가
  if (data && data.length > 0) {
    // 가격 매핑
    for (const service of data) {
      service.price_min = service.price || 0;
      service.price_max = service.price || undefined;
    }

    // 평균 별점 및 리뷰 수 추가 (헬퍼 함수 사용)
    await enrichServicesWithReviewStats(supabase, data);
    return data;
  }

  return data || [];
}
