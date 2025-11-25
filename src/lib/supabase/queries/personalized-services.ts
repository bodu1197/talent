import { createClient as createServerClient, createServiceRoleClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { cryptoShuffleArray } from '@/lib/utils/crypto-shuffle';
import { Service } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase에서 반환하는 부분 서비스 타입
 * (Supabase 쿼리의 select 필드와 일치)
 */
interface PartialServiceFromDB {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string | null;
  orders_count: number;
  seller: Array<{
    id: string;
    business_name: string | null;
    display_name: string | null;
    profile_image: string | null;
    is_verified: boolean;
  }>;
  service_categories: Array<{
    category_id: string;
  }>;
}

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  level: number;
  parent_id: string | null;
}

interface CategoryVisit {
  category_id: string;
  category_name: string;
  category_slug: string;
  visit_count: number;
}

export interface PersonalizedCategory {
  category_id: string;
  category_name: string;
  category_slug: string;
  visit_count: number;
  services: Service[];
}

/**
 * 1차 카테고리(최상위) 찾기
 */
async function findTopLevelCategory(
  supabase: SupabaseClient,
  categoryInfo: CategoryInfo
): Promise<CategoryInfo> {
  if (categoryInfo.level === 1) {
    return categoryInfo;
  }

  if (categoryInfo.level === 2) {
    const { data: parent } = await supabase
      .from('categories')
      .select('id, name, slug, level, parent_id')
      .eq('id', categoryInfo.parent_id)
      .single();
    return parent || categoryInfo;
  }

  // level === 3: 조부모(1차) 찾기
  const { data: parent2nd } = await supabase
    .from('categories')
    .select('id, parent_id')
    .eq('id', categoryInfo.parent_id)
    .single();

  if (!parent2nd?.parent_id) {
    return categoryInfo;
  }

  const { data: grandparent } = await supabase
    .from('categories')
    .select('id, name, slug, level, parent_id')
    .eq('id', parent2nd.parent_id)
    .single();

  return grandparent || categoryInfo;
}

/**
 * 1차 카테고리의 모든 하위 카테고리 ID 수집
 */
async function collectAllCategoryIds(
  supabase: SupabaseClient,
  topLevelCategoryId: string
): Promise<string[]> {
  const allCategoryIds = [topLevelCategoryId];

  // 2차 카테고리들
  const { data: level2Categories } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', topLevelCategoryId);

  const level2Ids = level2Categories?.map((c) => c.id) || [];
  allCategoryIds.push(...level2Ids);

  // 3차 카테고리들
  if (level2Ids.length === 0) {
    return allCategoryIds;
  }

  const { data: level3Categories } = await supabase
    .from('categories')
    .select('id')
    .in('parent_id', level2Ids);

  const level3Ids = level3Categories?.map((c) => c.id) || [];
  allCategoryIds.push(...level3Ids);

  return allCategoryIds;
}

/**
 * 서비스별 평균 별점 계산
 */
function buildRatingMap(
  reviewStats: Array<{ service_id: string; rating: number }> | null
): Map<string, { sum: number; count: number }> {
  const ratingMap = new Map<string, { sum: number; count: number }>();

  if (!reviewStats) {
    return ratingMap;
  }

  for (const review of reviewStats) {
    const current = ratingMap.get(review.service_id) || { sum: 0, count: 0 };
    ratingMap.set(review.service_id, {
      sum: current.sum + review.rating,
      count: current.count + 1,
    });
  }

  return ratingMap;
}

/**
 * 서비스에 별점 정보 추가
 */
function applyRatingsToServices(
  services: PartialServiceFromDB[],
  ratingMap: Map<string, { sum: number; count: number }>
): Service[] {
  return services.map((service) => {
    const stats = ratingMap.get(service.id);
    return {
      ...service,
      rating: stats && stats.count > 0 ? stats.sum / stats.count : 0,
      review_count: stats?.count || 0,
      order_count: service.orders_count || 0,
    } as unknown as Service;
  });
}

/**
 * 광고/일반 서비스 분리 및 셔플
 */
function separateAndShuffleServices(
  services: PartialServiceFromDB[],
  advertisedServiceIds: string[],
  limit: number
): PartialServiceFromDB[] {
  const advertisedServices = services.filter((s) => advertisedServiceIds.includes(s.id));
  const regularServices = services.filter((s) => !advertisedServiceIds.includes(s.id));

  // 암호학적으로 안전한 랜덤 셔플
  cryptoShuffleArray(advertisedServices);
  cryptoShuffleArray(regularServices);

  // 광고 서비스 우선, 그 다음 일반 서비스
  return [...advertisedServices, ...regularServices].slice(0, limit);
}

/**
 * 카테고리별 서비스 조회 및 처리
 */
async function fetchCategoryServices(
  supabase: SupabaseClient,
  category: CategoryVisit
): Promise<PersonalizedCategory> {
  const emptyResult: PersonalizedCategory = {
    category_id: category.category_id,
    category_name: category.category_name,
    category_slug: category.category_slug,
    visit_count: category.visit_count,
    services: [],
  };

  // 카테고리 정보 조회
  const { data: categoryInfo } = await supabase
    .from('categories')
    .select('id, name, slug, level, parent_id')
    .eq('slug', category.category_slug)
    .single();

  if (!categoryInfo) {
    return emptyResult;
  }

  // 1차 카테고리 찾기
  const topLevelCategory = await findTopLevelCategory(supabase, categoryInfo as CategoryInfo);

  // 모든 하위 카테고리 ID 수집
  const allCategoryIds = await collectAllCategoryIds(supabase, topLevelCategory.id);

  // 광고 서비스 ID 조회 (RLS 우회)
  const serviceRoleClient = createServiceRoleClient();
  const { data: advertisingData } = await serviceRoleClient
    .from('advertising_subscriptions')
    .select('service_id')
    .eq('status', 'active');

  const advertisedServiceIds = advertisingData?.map((ad) => ad.service_id) || [];

  // 서비스 조회
  const { data: services } = await supabase
    .from('services')
    .select(
      `
      id, title, description, price, thumbnail_url, orders_count,
      seller:seller_profiles(id, business_name, display_name, profile_image, is_verified),
      service_categories!inner(category_id)
    `
    )
    .in('service_categories.category_id', allCategoryIds)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(100);

  const typedServices = (services || []) as PartialServiceFromDB[];

  // 광고/일반 서비스 분리 및 셔플
  const topServices = separateAndShuffleServices(typedServices, advertisedServiceIds, 5);

  if (topServices.length === 0) {
    return {
      ...emptyResult,
      category_id: topLevelCategory.id,
      category_name: topLevelCategory.name,
      category_slug: topLevelCategory.slug,
    };
  }

  // 별점 정보 조회
  const serviceIds = topServices.map((s) => s.id);
  const { data: reviewStats } = await supabase
    .from('reviews')
    .select('service_id, rating')
    .in('service_id', serviceIds)
    .eq('is_visible', true);

  // 별점 맵 생성 및 적용
  const ratingMap = buildRatingMap(reviewStats as Array<{ service_id: string; rating: number }>);
  const servicesWithRatings = applyRatingsToServices(topServices, ratingMap);

  return {
    category_id: topLevelCategory.id,
    category_name: topLevelCategory.name,
    category_slug: topLevelCategory.slug,
    visit_count: category.visit_count,
    services: servicesWithRatings,
  };
}

/**
 * 중복 카테고리 제거 및 병합
 */
function deduplicateCategories(categories: PersonalizedCategory[]): PersonalizedCategory[] {
  const uniqueCategories = new Map<string, PersonalizedCategory>();

  for (const cat of categories) {
    const existing = uniqueCategories.get(cat.category_id);
    if (existing) {
      existing.visit_count += cat.visit_count;
    } else {
      uniqueCategories.set(cat.category_id, cat);
    }
  }

  return Array.from(uniqueCategories.values());
}

/**
 * 회원의 관심 카테고리 기반 개인화 서비스 추천
 * 최근 방문한 모든 카테고리의 서비스를 불러옴 (방문 횟수 순)
 */
export async function getPersonalizedServicesByInterest(): Promise<PersonalizedCategory[]> {
  const supabase = await createServerClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  try {
    // 최근 방문한 카테고리 조회 (방문 횟수 우선, 최근 방문 순)
    const { data: topCategories, error: categoryError } = await supabase.rpc(
      'get_recent_category_visits',
      { p_user_id: user.id, p_limit: 3 }
    );

    if (categoryError || !topCategories || topCategories.length === 0) {
      return [];
    }

    // 각 카테고리별 서비스 조회 (병렬 처리)
    const categoriesWithServices = await Promise.all(
      topCategories.map((category: CategoryVisit) => fetchCategoryServices(supabase, category))
    );

    // 중복 카테고리 제거
    return deduplicateCategories(categoriesWithServices);
  } catch (error) {
    logger.error('Failed to fetch personalized services:', error);
    return [];
  }
}
