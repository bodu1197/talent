import { createClient as createServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { cryptoShuffleArray } from '@/lib/utils/crypto-shuffle';
import type { SupabaseClient } from '@supabase/supabase-js';

interface SellerInfo {
  id: string;
  business_name: string;
  display_name: string;
  profile_image: string | null;
  is_verified: boolean;
}

interface ServiceWithRating {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string | null;
  orders_count: number;
  seller: SellerInfo | null;
  rating: number;
  review_count: number;
  is_promoted: boolean;
}

interface ExpertWithStats {
  id: string;
  user_id: string;
  business_name: string;
  display_name: string;
  profile_image: string | null;
  bio: string;
  is_verified: boolean;
  created_at: string;
  service_count: number;
  rating: number;
  review_count: number;
}

interface PortfolioResult {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  project_url: string | null;
  tags: string[] | null;
  created_at: string;
  seller: SellerInfo | null;
}

export interface SearchResult {
  services: ServiceWithRating[];
  experts: ExpertWithStats[];
  portfolios: PortfolioResult[];
}

// Helper: Build rating map from review stats
function buildRatingMap(
  reviewStats: Array<{ service_id: string; rating: number }> | null
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

// Helper: Extract first seller from Supabase array response
function extractSeller(seller: unknown): SellerInfo | null {
  if (Array.isArray(seller) && seller.length > 0) {
    return seller[0] as SellerInfo;
  }
  return null;
}

// Helper: Fetch expert stats (service count, rating, review count)
async function fetchExpertStats(
  supabase: SupabaseClient,
  expertId: string
): Promise<{ serviceCount: number; avgRating: number; reviewCount: number }> {
  const { count: serviceCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', expertId)
    .eq('status', 'active');

  const { data: expertServices } = await supabase
    .from('services')
    .select('id')
    .eq('seller_id', expertId)
    .eq('status', 'active');

  if (!expertServices || expertServices.length === 0) {
    return { serviceCount: serviceCount || 0, avgRating: 0, reviewCount: 0 };
  }

  const serviceIds = expertServices.map((s) => s.id);
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .in('service_id', serviceIds)
    .eq('is_visible', true);

  if (!reviews || reviews.length === 0) {
    return { serviceCount: serviceCount || 0, avgRating: 0, reviewCount: 0 };
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return { serviceCount: serviceCount || 0, avgRating, reviewCount: reviews.length };
}

// Helper: Classify services into promoted and regular
function classifyServices<T extends { id: string }>(
  services: T[] | null,
  promotedIds: Set<string>
): { promoted: T[]; regular: T[] } {
  const promoted: T[] = [];
  const regular: T[] = [];

  if (!services) return { promoted, regular };

  for (const service of services) {
    if (promotedIds.has(service.id)) {
      promoted.push(service);
    } else {
      regular.push(service);
    }
  }
  return { promoted, regular };
}

// Helper: Format portfolios with extracted seller
function formatPortfolios(
  portfolios: Array<{
    id: string;
    seller_id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    project_url: string | null;
    tags: string[] | null;
    created_at: string;
    seller: unknown;
  }> | null
): PortfolioResult[] {
  if (!portfolios) return [];
  return portfolios.map((portfolio) => ({
    ...portfolio,
    seller: extractSeller(portfolio.seller),
  }));
}

// Helper: Format experts with stats
async function formatExpertsWithStats(
  supabase: SupabaseClient,
  experts: Array<{
    id: string;
    user_id: string;
    business_name: string;
    display_name: string;
    profile_image: string | null;
    bio: string;
    is_verified: boolean;
    created_at: string;
  }> | null
): Promise<ExpertWithStats[]> {
  if (!experts || experts.length === 0) return [];

  return Promise.all(
    experts.map(async (expert) => {
      const stats = await fetchExpertStats(supabase, expert.id);
      return {
        ...expert,
        service_count: stats.serviceCount,
        rating: stats.avgRating,
        review_count: stats.reviewCount,
      };
    })
  );
}

// Helper: Format services with rating data
async function formatServicesWithRating(
  supabase: SupabaseClient,
  services: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnail_url: string | null;
    orders_count: number;
    seller: unknown;
  }>,
  promotedServiceIds: Set<string>
): Promise<ServiceWithRating[]> {
  if (!services || services.length === 0) return [];

  const serviceIds = services.map((s) => s.id);
  const { data: reviewStats } = await supabase
    .from('reviews')
    .select('service_id, rating')
    .in('service_id', serviceIds)
    .eq('is_visible', true);

  const ratingMap = buildRatingMap(
    reviewStats as Array<{ service_id: string; rating: number }> | null
  );

  return services.map((service) => {
    const stats = ratingMap.get(service.id);
    const rating = stats && stats.count > 0 ? stats.sum / stats.count : 0;
    return {
      ...service,
      seller: extractSeller(service.seller),
      rating,
      review_count: stats?.count || 0,
      is_promoted: promotedServiceIds.has(service.id),
    };
  });
}

/**
 * 통합 검색 함수 - 서비스, 전문가, 포트폴리오 검색
 * 광고 중인 서비스를 상단에 랜덤으로 표시
 */
export async function searchAll(query: string): Promise<SearchResult> {
  const supabase = await createServerClient();
  const searchTerm = `%${query}%`;

  try {
    // 1. 광고 중인 서비스 조회 (active 구독만)
    const { data: promotedSubscriptions } = await supabase
      .from('advertising_subscriptions')
      .select('service_id')
      .eq('status', 'active');

    const promotedServiceIds = new Set(promotedSubscriptions?.map((p) => p.service_id) || []);

    // 2. 모든 서비스 검색 (광고/일반 모두 포함)
    const { data: allServices } = await supabase
      .from('services')
      .select(
        `
        id,
        title,
        description,
        price,
        thumbnail_url,
        orders_count,
        seller:seller_profiles(
          id,
          business_name,
          display_name,
          profile_image,
          is_verified
        )
      `
      )
      .eq('status', 'active')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(50);

    // 3. 광고/일반 서비스 분류 (헬퍼 함수 사용)
    const { promoted: promotedServices, regular: regularServices } = classifyServices(
      allServices,
      promotedServiceIds
    );

    // 4. 광고 서비스 랜덤 셔플 (cryptographically secure)
    cryptoShuffleArray(promotedServices);

    // 5. 일반 서비스는 주문 수 기준으로 정렬
    regularServices.sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0));

    // 6. 광고(랜덤) + 일반(주문순) 결합
    const services = [...promotedServices, ...regularServices].slice(0, 20);

    // 서비스별 리뷰 통계 조회 및 포맷팅
    const servicesWithRating = await formatServicesWithRating(
      supabase,
      services,
      promotedServiceIds
    );

    // 전문가 검색 (전문가 프로필)
    const { data: experts } = await supabase
      .from('seller_profiles')
      .select(
        `
        id,
        user_id,
        business_name,
        display_name,
        profile_image,
        bio,
        is_verified,
        created_at
      `
      )
      .or(
        `business_name.ilike.${searchTerm},display_name.ilike.${searchTerm},bio.ilike.${searchTerm}`
      )
      .limit(20);

    // 각 전문가의 서비스 수와 평균 평점 조회 (헬퍼 함수 사용)
    const expertsWithStats = await formatExpertsWithStats(supabase, experts);

    // 포트폴리오 검색
    const { data: portfolios } = await supabase
      .from('seller_portfolio')
      .select(
        `
        id,
        seller_id,
        title,
        description,
        thumbnail_url,
        project_url,
        tags,
        created_at,
        seller:seller_profiles(
          id,
          business_name,
          display_name,
          profile_image,
          is_verified
        )
      `
      )
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .order('created_at', { ascending: false })
      .limit(20);

    return {
      services: servicesWithRating,
      experts: expertsWithStats,
      portfolios: formatPortfolios(portfolios),
    };
  } catch (error) {
    logger.error('Search error:', error);
    return {
      services: [],
      experts: [],
      portfolios: [],
    };
  }
}

/**
 * 추천 검색어 조회 - 최종 카테고리 클릭 수 기반
 */
export async function getRecommendedSearchTerms(limit: number = 10) {
  const supabase = await createServerClient();

  try {
    // 최종 카테고리(3차 또는 하위 카테고리)의 클릭 수 집계
    const { data: categoryClicks } = await supabase
      .from('category_visits')
      .select(
        `
        category_id,
        categories(
          id,
          name,
          slug,
          level
        )
      `
      )
      .order('visited_at', { ascending: false })
      .limit(1000);

    if (!categoryClicks || categoryClicks.length === 0) {
      return [];
    }

    // 카테고리별 클릭 수 집계
    const clickMap = new Map<
      string,
      { name: string; slug: string; count: number; level: number }
    >();

    for (const click of categoryClicks as {
      category_id: string;
      categories:
        | {
            id: string;
            name: string;
            slug: string;
            level: number;
          }[]
        | null;
    }[]) {
      if (click.categories && Array.isArray(click.categories) && click.categories.length > 0) {
        const category = click.categories[0];
        const key = category.id;
        const current = clickMap.get(key);
        if (current) {
          current.count += 1;
        } else {
          clickMap.set(key, {
            name: category.name,
            slug: category.slug,
            count: 1,
            level: category.level,
          });
        }
      }
    }

    // 최종 카테고리(level 3)만 필터링하고 클릭 수 순으로 정렬
    const sortedCategories = Array.from(clickMap.values())
      .filter((cat) => cat.level === 3)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sortedCategories.map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      count: cat.count,
    }));
  } catch (error) {
    logger.error('Failed to get recommended search terms:', error);
    return [];
  }
}
