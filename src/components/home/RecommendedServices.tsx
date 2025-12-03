import RecommendedServicesClient from './RecommendedServicesClient';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { Service } from '@/types';

interface RecommendedServicesProps {
  readonly aiCategoryIds: string[];
}

interface CategoryTab {
  id: string;
  name: string;
  slug: string;
}

// 탭에서 제외할 카테고리 slug (내 주변의 프리미엄 전문가 + 심부름)
const EXCLUDED_CATEGORY_SLUGS = [
  'life-service', // 생활 서비스
  'event', // 이벤트
  'beauty-fashion', // 뷰티 · 패션
  'custom-order', // 주문제작
  'counseling-coaching', // 상담 · 코칭
  'hobby-handmade', // 취미 · 핸드메이드
  'errands', // 심부름
];

// 배열 랜덤 셔플 (Fisher-Yates)
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const j = Math.floor((arr[0] / 0xffffffff) * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// 리뷰 통계 맵 생성
function buildRatingMap(
  reviewStats: { service_id: string; rating: number }[] | null
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

// 서비스 ID → 카테고리 ID 매핑 생성
function buildServiceToCategoriesMap(
  serviceLinks: { service_id: string; category_id: string }[] | null
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  if (!serviceLinks) return map;

  for (const link of serviceLinks) {
    if (!map.has(link.service_id)) {
      map.set(link.service_id, new Set());
    }
    map.get(link.service_id)!.add(link.category_id);
  }
  return map;
}

// 카테고리별 서비스 분류 및 셔플
function processCategoryServices<T extends { id: string }>(
  categoryServices: T[],
  advertisedServiceIds: Set<string>,
  ratingMap: Map<string, { sum: number; count: number }>
): Service[] {
  const advertisedServices = categoryServices.filter((s) => advertisedServiceIds.has(s.id));
  const regularServices = categoryServices.filter((s) => !advertisedServiceIds.has(s.id));

  shuffleArray(advertisedServices);
  shuffleArray(regularServices);

  const shuffled = [...advertisedServices, ...regularServices].slice(0, 15);

  return shuffled.map((service) => {
    const stats = ratingMap.get(service.id);
    return {
      ...service,
      rating: stats && stats.count > 0 ? stats.sum / stats.count : 0,
      review_count: stats?.count || 0,
    } as unknown as Service;
  });
}

export default async function RecommendedServices({ aiCategoryIds }: RecommendedServicesProps) {
  const supabase = await createClient();

  // 1. 1단계 카테고리 조회 (AI 카테고리 및 제외 카테고리 제외 - 탭용)
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('id, name, slug')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('display_order');

  // 탭에 표시할 카테고리 (AI 카테고리 및 제외 카테고리 제외)
  const categories: CategoryTab[] = (categoriesData || [])
    .filter((cat) => !aiCategoryIds.includes(cat.id) && !EXCLUDED_CATEGORY_SLUGS.includes(cat.slug))
    .map((cat) => ({ id: cat.id, name: cat.name, slug: cat.slug }));

  // 2. 광고 서비스 ID 조회 - Service Role 클라이언트 사용
  const serviceRoleClient = createServiceRoleClient();
  const { data: advertisingData } = await serviceRoleClient
    .from('advertising_subscriptions')
    .select('service_id')
    .eq('status', 'active');

  const advertisedServiceIds = new Set(advertisingData?.map((ad) => ad.service_id) || []);

  // 3. 모든 활성 서비스 조회 (전체 탭용)
  const { data: allServicesData } = await supabase
    .from('services')
    .select(
      `id, title, description, price, thumbnail_url, orders_count, delivery_method,
       seller:seller_profiles(id, business_name, display_name, profile_image, is_verified)`
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(100);

  if (!allServicesData || allServicesData.length === 0) {
    return (
      <RecommendedServicesClient categories={categories} servicesByCategory={{}} allServices={[]} />
    );
  }

  const allServiceIds = allServicesData.map((s) => s.id);

  // 4. 모든 리뷰 통계 한 번에 조회
  const { data: reviewStats } = await supabase
    .from('reviews')
    .select('service_id, rating')
    .in('service_id', allServiceIds)
    .eq('is_visible', true);

  const ratingMap = buildRatingMap(reviewStats as { service_id: string; rating: number }[] | null);

  // 5. 전체 탭용 서비스 (광고 우선 + 랜덤)
  const allServices = processCategoryServices(allServicesData, advertisedServiceIds, ratingMap);

  // 6. 카테고리별 서비스 조회 (탭에 표시되는 카테고리만)
  const allCategoryIds = categories.map((c) => c.id);

  if (allCategoryIds.length === 0) {
    return (
      <RecommendedServicesClient
        categories={categories}
        servicesByCategory={{}}
        allServices={allServices}
      />
    );
  }

  const { data: allSubCategories } = await supabase
    .from('categories')
    .select('id, parent_id')
    .in('parent_id', allCategoryIds);

  // 카테고리별 ID 매핑 (자신 + 하위)
  const categoryIdMap = new Map<string, string[]>();
  for (const cat of categories) {
    const subCatIds =
      allSubCategories?.filter((sub) => sub.parent_id === cat.id).map((sub) => sub.id) || [];
    categoryIdMap.set(cat.id, [cat.id, ...subCatIds]);
  }

  const allRelatedCatIds = [...categoryIdMap.values()].flat();

  const { data: allServiceLinks } = await supabase
    .from('service_categories')
    .select('service_id, category_id')
    .in('category_id', allRelatedCatIds);

  const serviceToCategories = buildServiceToCategoriesMap(allServiceLinks);

  // 각 카테고리별로 서비스 분류
  const servicesByCategory: Record<string, Service[]> = {};

  for (const category of categories) {
    const catIds = new Set(categoryIdMap.get(category.id) || []);
    const categoryServices = allServicesData.filter((service) => {
      const serviceCats = serviceToCategories.get(service.id);
      return serviceCats ? [...serviceCats].some((catId) => catIds.has(catId)) : false;
    });

    if (categoryServices.length > 0) {
      servicesByCategory[category.id] = processCategoryServices(
        categoryServices,
        advertisedServiceIds,
        ratingMap
      );
    }
  }

  return (
    <RecommendedServicesClient
      categories={categories}
      servicesByCategory={servicesByCategory}
      allServices={allServices}
    />
  );
}
