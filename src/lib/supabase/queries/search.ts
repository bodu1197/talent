import { createClient as createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export interface SearchResult {
  services: any[];
  experts: any[];
  portfolios: any[];
}

/**
 * 통합 검색 함수 - 서비스, 전문가, 포트폴리오 검색
 */
export async function searchAll(query: string): Promise<SearchResult> {
  const supabase = await createServerClient();
  const searchTerm = `%${query}%`;

  try {
    // 서비스 검색
    const { data: services } = await supabase
      .from("services")
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
      .eq("status", "active")
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .order("orders_count", { ascending: false })
      .limit(20);

    // 서비스별 리뷰 통계 조회
    let servicesWithRating = [];
    if (services && services.length > 0) {
      const serviceIds = services.map((s) => s.id);
      const { data: reviewStats } = await supabase
        .from("reviews")
        .select("service_id, rating")
        .in("service_id", serviceIds)
        .eq("is_visible", true);

      const ratingMap = new Map<string, { sum: number; count: number }>();
      reviewStats?.forEach((review: { service_id: string; rating: number }) => {
        const current = ratingMap.get(review.service_id) || {
          sum: 0,
          count: 0,
        };
        ratingMap.set(review.service_id, {
          sum: current.sum + review.rating,
          count: current.count + 1,
        });
      });

      servicesWithRating = services.map((service) => {
        const stats = ratingMap.get(service.id);
        return {
          ...service,
          order_count: service.orders_count || 0,
          rating: stats && stats.count > 0 ? stats.sum / stats.count : 0,
          review_count: stats?.count || 0,
        };
      });
    }

    // 전문가 검색 (판매자 프로필)
    const { data: experts } = await supabase
      .from("seller_profiles")
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

    // 각 전문가의 서비스 수와 평균 평점 조회
    let expertsWithStats = [];
    if (experts && experts.length > 0) {
      expertsWithStats = await Promise.all(
        experts.map(async (expert) => {
          // 서비스 수 조회
          const { count: serviceCount } = await supabase
            .from("services")
            .select("*", { count: "exact", head: true })
            .eq("seller_id", expert.id)
            .eq("status", "active");

          // 평균 평점 조회
          const { data: expertServices } = await supabase
            .from("services")
            .select("id")
            .eq("seller_id", expert.id)
            .eq("status", "active");

          let avgRating = 0;
          let reviewCount = 0;

          if (expertServices && expertServices.length > 0) {
            const serviceIds = expertServices.map((s) => s.id);
            const { data: reviews } = await supabase
              .from("reviews")
              .select("rating")
              .in("service_id", serviceIds)
              .eq("is_visible", true);

            if (reviews && reviews.length > 0) {
              avgRating =
                reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
              reviewCount = reviews.length;
            }
          }

          return {
            ...expert,
            service_count: serviceCount || 0,
            rating: avgRating,
            review_count: reviewCount,
          };
        })
      );
    }

    // 포트폴리오 검색
    const { data: portfolios } = await supabase
      .from("seller_portfolio")
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
      .order("created_at", { ascending: false })
      .limit(20);

    return {
      services: servicesWithRating || [],
      experts: expertsWithStats || [],
      portfolios: portfolios || [],
    };
  } catch (error) {
    logger.error("Search error:", error);
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
      .from("category_visits")
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
      .order("visited_at", { ascending: false })
      .limit(1000);

    if (!categoryClicks || categoryClicks.length === 0) {
      return [];
    }

    // 카테고리별 클릭 수 집계
    const clickMap = new Map<
      string,
      { name: string; slug: string; count: number; level: number }
    >();

    categoryClicks.forEach(
      (click: {
        category_id: string;
        categories: {
          id: string;
          name: string;
          slug: string;
          level: number;
        } | null;
      }) => {
        if (click.categories) {
          const key = click.categories.id;
          const current = clickMap.get(key);
          if (current) {
            current.count += 1;
          } else {
            clickMap.set(key, {
              name: click.categories.name,
              slug: click.categories.slug,
              count: 1,
              level: click.categories.level,
            });
          }
        }
      }
    );

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
    logger.error("Failed to get recommended search terms:", error);
    return [];
  }
}
