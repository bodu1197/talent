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

export default async function RecommendedServices({ aiCategoryIds }: RecommendedServicesProps) {
  const supabase = await createClient();

  // 1. 1단계 카테고리 조회 (AI 카테고리 제외)
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('id, name, slug')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('display_order');

  // AI 카테고리 제외한 카테고리 목록
  const categories: CategoryTab[] = (categoriesData || [])
    .filter((cat) => !aiCategoryIds.includes(cat.id))
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    }));

  // 2. 광고 서비스 ID 조회 - Service Role 클라이언트 사용
  const serviceRoleClient = createServiceRoleClient();
  const { data: advertisingData } = await serviceRoleClient
    .from('advertising_subscriptions')
    .select('service_id')
    .eq('status', 'active');

  const advertisedServiceIds = new Set(advertisingData?.map((ad) => ad.service_id) || []);

  // 3. 카테고리별 서비스 조회
  const servicesByCategory: Record<string, Service[]> = {};

  // 각 카테고리에 대해 서비스 조회
  for (const category of categories) {
    // 해당 카테고리와 하위 카테고리의 서비스 조회
    const { data: categoryIds } = await supabase
      .from('categories')
      .select('id')
      .or(`id.eq.${category.id},parent_id.eq.${category.id}`);

    const catIds = categoryIds?.map((c) => c.id) || [category.id];

    // 해당 카테고리 서비스 조회
    const { data: serviceLinks } = await supabase
      .from('service_categories')
      .select('service_id')
      .in('category_id', catIds);

    const serviceIds = [...new Set(serviceLinks?.map((s) => s.service_id) || [])];

    if (serviceIds.length === 0) continue;

    // 서비스 상세 조회
    const { data: servicesData } = await supabase
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
        )
      `
      )
      .in('id', serviceIds)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!servicesData || servicesData.length === 0) continue;

    // 광고 서비스와 일반 서비스 분리
    const advertisedServices = servicesData.filter((s) => advertisedServiceIds.has(s.id));
    const regularServices = servicesData.filter((s) => !advertisedServiceIds.has(s.id));

    // 광고 서비스 랜덤 셔플
    for (let i = advertisedServices.length - 1; i > 0; i--) {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      const j = Math.floor((arr[0] / 0xffffffff) * (i + 1));
      [advertisedServices[i], advertisedServices[j]] = [
        advertisedServices[j],
        advertisedServices[i],
      ];
    }

    // 일반 서비스 랜덤 셔플
    for (let i = regularServices.length - 1; i > 0; i--) {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      const j = Math.floor((arr[0] / 0xffffffff) * (i + 1));
      [regularServices[i], regularServices[j]] = [regularServices[j], regularServices[i]];
    }

    // 광고 우선 + 랜덤 (15개)
    const shuffled = [...advertisedServices, ...regularServices].slice(0, 15);

    // 리뷰 통계 조회
    const svcIds = shuffled.map((s) => s.id);
    const { data: reviewStats } = await supabase
      .from('reviews')
      .select('service_id, rating')
      .in('service_id', svcIds)
      .eq('is_visible', true);

    // 평균 별점 계산
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

    // 서비스 포맷팅
    servicesByCategory[category.id] = shuffled.map((service) => {
      const stats = ratingMap.get(service.id);
      return {
        ...service,
        rating: stats && stats.count > 0 ? stats.sum / stats.count : 0,
        review_count: stats?.count || 0,
      } as unknown as Service;
    });
  }

  return (
    <RecommendedServicesClient categories={categories} servicesByCategory={servicesByCategory} />
  );
}
