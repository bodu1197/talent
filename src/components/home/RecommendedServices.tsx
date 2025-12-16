import RecommendedServicesClient from './RecommendedServicesClient';
import { createClient } from '@/lib/supabase/server';
import { Service } from '@/types';
import { buildRatingMap, formatServicesWithAdvertising } from '@/lib/services/service-helpers';
import { getActiveAdvertisedServiceIds } from '@/lib/services/advertising-helpers';

interface RecommendedServicesProps {
  readonly aiCategoryIds: string[];
}

interface CategoryTab {
  id: string;
  name: string;
  slug: string;
}

// 탭에서 제외할 카테고리 slug (내 주변의 프리미엄 전문가 6개 + 심부름)
const EXCLUDED_CATEGORY_SLUGS = [
  'life-service', // 생활 서비스
  'event', // 이벤트
  'beauty-fashion', // 뷰티 · 패션
  'custom-order', // 주문제작
  'counseling-coaching', // 상담 · 코칭
  'hobby-handmade', // 취미 · 핸드메이드
  'errands', // 심부름
];

export default async function RecommendedServices({ aiCategoryIds }: RecommendedServicesProps) {
  const supabase = await createClient();

  // 1. 1단계 카테고리 조회 (AI + 심부름 + 내주변전문가 6개 제외)
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('id, name, slug')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('display_order');

  const filteredCategories = (categoriesData || []).filter(
    (cat) => !aiCategoryIds.includes(cat.id) && !EXCLUDED_CATEGORY_SLUGS.includes(cat.slug)
  );

  if (filteredCategories.length === 0) {
    return <RecommendedServicesClient categories={[]} servicesByCategory={{}} />;
  }

  // 2. 광고 서비스 ID 조회
  const advertisedServiceIds = await getActiveAdvertisedServiceIds();

  // 3. 하위 카테고리 조회 (2단계 + 3단계 모두)
  const allCategoryIds = filteredCategories.map((c) => c.id);

  // 2단계 카테고리 (1단계의 자식)
  const { data: level2Categories } = await supabase
    .from('categories')
    .select('id, parent_id')
    .in('parent_id', allCategoryIds);

  const level2Ids = level2Categories?.map((c) => c.id) || [];

  // 3단계 카테고리 (2단계의 자식)
  let level3Categories: { id: string; parent_id: string }[] = [];
  if (level2Ids.length > 0) {
    const { data: level3Data } = await supabase
      .from('categories')
      .select('id, parent_id')
      .in('parent_id', level2Ids);
    level3Categories = level3Data || [];
  }

  // 카테고리별 ID 매핑 (자신 + 2단계 + 3단계)
  const categoryIdMap = new Map<string, string[]>();
  for (const cat of filteredCategories) {
    const level2Cats = level2Categories?.filter((sub) => sub.parent_id === cat.id) || [];
    const level2CatIds = level2Cats.map((c) => c.id);
    const level3CatIds = level3Categories
      .filter((sub) => level2CatIds.includes(sub.parent_id))
      .map((c) => c.id);
    categoryIdMap.set(cat.id, [cat.id, ...level2CatIds, ...level3CatIds]);
  }

  // 4. 각 카테고리별로 서비스 조회 (JOIN 쿼리 사용 - AIServicesSection과 동일한 패턴)
  const servicesByCategory: Record<string, Service[]> = {};
  const categories: CategoryTab[] = [];
  const allServiceIds: string[] = [];

  for (const category of filteredCategories) {
    const catIds = categoryIdMap.get(category.id) || [];

    if (catIds.length === 0) {
      categories.push({ id: category.id, name: category.name, slug: category.slug });
      continue;
    }

    // JOIN 쿼리로 서비스 조회 (service_categories!inner 사용)
    const { data: categoryServices } = await supabase
      .from('services')
      .select(
        `
        id,
        title,
        description,
        price,
        thumbnail_url,
        orders_count,
        delivery_method,
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
      .in('service_categories.category_id', catIds)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);

    categories.push({ id: category.id, name: category.name, slug: category.slug });

    if (categoryServices && categoryServices.length > 0) {
      // 중복 제거 (같은 서비스가 여러 카테고리에 연결된 경우)
      const uniqueServices = Array.from(new Map(categoryServices.map((s) => [s.id, s])).values());

      // 서비스 ID 수집 (리뷰 통계 조회용)
      uniqueServices.forEach((s) => {
        if (!allServiceIds.includes(s.id)) {
          allServiceIds.push(s.id);
        }
      });

      // 임시 저장 (리뷰 통계 적용 후 최종 포맷팅)
      servicesByCategory[category.id] = uniqueServices as unknown as Service[];
    }
  }

  // 5. 리뷰 통계 조회 (모든 서비스에 대해 한 번에)
  let ratingMap = new Map<string, { sum: number; count: number }>();
  if (allServiceIds.length > 0) {
    const { data: reviewStats } = await supabase
      .from('reviews')
      .select('service_id, rating')
      .in('service_id', allServiceIds)
      .eq('is_visible', true);

    ratingMap = buildRatingMap(reviewStats as { service_id: string; rating: number }[] | null);
  }

  // 6. 각 카테고리별 서비스에 리뷰 통계 적용 및 셔플
  for (const categoryId of Object.keys(servicesByCategory)) {
    const services = servicesByCategory[categoryId];
    if (services && services.length > 0) {
      servicesByCategory[categoryId] = formatServicesWithAdvertising(
        services as unknown as Array<{ id: string; [key: string]: unknown }>,
        ratingMap,
        advertisedServiceIds
      ) as never[];
    }
  }

  return (
    <RecommendedServicesClient categories={categories} servicesByCategory={servicesByCategory} />
  );
}
