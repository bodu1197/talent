import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createClient as createServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

// 한 번의 쿼리로 모든 하위 카테고리 ID 가져오기 (최적화)
async function getAllDescendantCategories(
  supabase:
    | ReturnType<typeof createBrowserClient>
    | Awaited<ReturnType<typeof createServerClient>>,
  parentId: string,
  parentLevel: number,
): Promise<string[]> {
  // level에 따라 필요한 모든 카테고리를 한 번에 조회
  if (parentLevel === 1) {
    // 1차 카테고리: 2차와 3차 모두 가져오기
    const { data: level2 } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", parentId);

    if (!level2 || level2.length === 0) return [];

    const level2Ids = level2.map((c: { id: string }) => c.id);

    // 3차 카테고리도 한 번에 가져오기
    const { data: level3 } = await supabase
      .from("categories")
      .select("id")
      .in("parent_id", level2Ids);

    const level3Ids = level3?.map((c: { id: string }) => c.id) || [];
    return [...level2Ids, ...level3Ids];
  } else if (parentLevel === 2) {
    // 2차 카테고리: 3차만 가져오기
    const { data: level3 } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", parentId);

    return level3?.map((c: { id: string }) => c.id) || [];
  }

  return [];
}

export async function getSellerServices(userId: string, status?: string) {
  const supabase = await createServerClient();

  let query = supabase
    .from("services")
    .select(
      `
      *,
      service_categories(
        category:categories(id, name)
      )
    `,
    )
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getServiceById(serviceId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("services")
    .select(
      `
      *,
      seller:seller_profiles(
        id,
        business_name,
        display_name,
        profile_image,
        user_id
      ),
      service_categories(
        category:categories(id, name, slug)
      )
    `,
    )
    .eq("id", serviceId)
    .single();

  if (error) throw error;

  // seller의 user 정보를 별도로 조회 (profiles 테이블 사용)
  if (data?.seller?.user_id) {
    const { data: userData } = await supabase
      .from("profiles")
      .select("user_id, name, email, profile_image")
      .eq("user_id", data.seller.user_id)
      .single();

    if (userData) {
      data.seller.user = {
        id: userData.user_id,
        name: userData.name,
        email: userData.email,
        profile_image: userData.profile_image,
      };
    }
  }

  return data;
}

export async function getSellerServicesCount(userId: string, status: string) {
  const supabase = await createServerClient();

  const { count, error } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", userId)
    .eq("status", status);

  if (error) throw error;
  return count || 0;
}

// 카테고리별 승인된 서비스 조회 (서버 컴포넌트용)
// useAuth=true이면 인증된 클라이언트 사용 (기본값), false면 anon 클라이언트 사용 (캐싱 가능)
export async function getServicesByCategory(
  categoryId: string,
  _limit: number = 100,
  useAuth: boolean = true,
  page: number = 1,
) {
  const supabase = useAuth ? await createServerClient() : createBrowserClient();

  // 1. 먼저 카테고리 정보 조회 (level 확인)
  const { data: category } = await supabase
    .from("categories")
    .select("id, level")
    .eq("id", categoryId)
    .single();

  if (!category) {
    return [];
  }

  let categoryIds = [categoryId];

  // 2. 1차 또는 2차 카테고리인 경우, 모든 하위 카테고리 ID 가져오기
  if (category.level === 1 || category.level === 2) {
    const allDescendants = await getAllDescendantCategories(
      supabase,
      categoryId,
      category.level,
    );
    categoryIds = [categoryId, ...allDescendants];
  }

  // 3. 먼저 해당 카테고리의 service_id 목록 가져오기
  const { data: serviceLinks } = await supabase
    .from("service_categories")
    .select("service_id")
    .in("category_id", categoryIds);

  const serviceIds = serviceLinks?.map((sl) => sl.service_id) || [];

  if (serviceIds.length === 0) {
    return [];
  }

  // 광고 서비스 ID 조회 - Service Role 클라이언트 사용하여 RLS 우회
  const serviceRoleClient = createServiceRoleClient();
  const { data: advertisingData } = await serviceRoleClient
    .from("advertising_subscriptions")
    .select("service_id")
    .eq("status", "active");

  const advertisedServiceIds =
    advertisingData?.map((ad) => ad.service_id) || [];

  // 4. 서비스 조회 (페이지네이션 적용 전 모든 서비스 조회)
  const { data: allServices, error } = await supabase
    .from("services")
    .select(
      `
      *,
      seller:seller_profiles!inner(
        id,
        business_name,
        display_name,
        profile_image,
        user_id,
        is_verified
      ),
      service_categories(
        category:categories(id, name, slug)
      )
    `,
    )
    .in("id", serviceIds)
    .eq("status", "active") // 승인된 서비스만
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("Error fetching services by category:", error);
    throw error;
  }

  if (!allServices || allServices.length === 0) {
    return [];
  }

  // 모든 서비스에 광고 여부 표시 (페이지네이션 전에 미리 표시)
  allServices.forEach((service) => {
    service.is_advertised = advertisedServiceIds.includes(service.id);
  });

  logger.info("getServicesByCategory - 광고 통계", {
    advertisedIds: advertisedServiceIds,
    advertisedCount: allServices.filter((s) => s.is_advertised).length,
    totalCount: allServices.length,
    sample: {
      id: allServices[0]?.id,
      title: allServices[0]?.title,
      is_advertised: allServices[0]?.is_advertised,
    },
  });

  // 광고 서비스와 일반 서비스 분리
  const advertisedServices = allServices.filter((s) =>
    advertisedServiceIds.includes(s.id),
  );
  const regularServices = allServices.filter(
    (s) => !advertisedServiceIds.includes(s.id),
  );

  // 광고 서비스 랜덤 셔플
  for (let i = advertisedServices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [advertisedServices[i], advertisedServices[j]] = [
      advertisedServices[j],
      advertisedServices[i],
    ];
  }

  // 일반 서비스 랜덤 셔플
  for (let i = regularServices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [regularServices[i], regularServices[j]] = [
      regularServices[j],
      regularServices[i],
    ];
  }

  // 광고 서비스(랜덤) + 일반 서비스(랜덤) 결합
  const combinedServices = [...advertisedServices, ...regularServices];

  // 페이지네이션 적용 (1페이지 = 28개)
  const perPage = 28;
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const data = combinedServices.slice(startIndex, endIndex);

  // 데이터 매핑 및 seller user 정보 추가
  if (data && data.length > 0) {
    // 각 서비스에 대해 평균 별점 계산
    const serviceIds = data.map((s) => s.id);
    const { data: reviewStats } = await supabase
      .from("reviews")
      .select("service_id, rating")
      .in("service_id", serviceIds)
      .eq("is_visible", true);

    // 서비스별 평균 별점 계산
    const ratingMap = new Map<string, { sum: number; count: number }>();
    reviewStats?.forEach((review: { service_id: string; rating: number }) => {
      const current = ratingMap.get(review.service_id) || { sum: 0, count: 0 };
      ratingMap.set(review.service_id, {
        sum: current.sum + review.rating,
        count: current.count + 1,
      });
    });

    // 각 서비스에 대해 price_min, price_max 설정 (단일 가격 사용)
    data.forEach((service) => {
      service.price_min = service.price || 0;
      service.price_max = service.price || undefined;

      // order_count 매핑
      service.order_count = service.orders_count || 0;

      // 평균 별점 및 리뷰 수 설정
      const stats = ratingMap.get(service.id);
      if (stats && stats.count > 0) {
        service.rating = stats.sum / stats.count;
        service.review_count = stats.count;
      } else {
        service.rating = 0;
        service.review_count = 0;
      }
    });

    // seller의 user 정보 추가 (profiles 테이블 사용)
    const userIds = data.map((s) => s.seller?.user_id).filter(Boolean);

    if (userIds.length > 0) {
      const { data: usersData } = await supabase
        .from("profiles")
        .select("user_id, name, email, profile_image")
        .in("user_id", userIds);

      if (usersData) {
        data.forEach((service) => {
          if (service.seller?.user_id) {
            const user = usersData.find(
              (u) => u.user_id === service.seller.user_id,
            );
            if (user) {
              service.seller.user = {
                id: user.user_id,
                name: user.name,
                email: user.email,
                profile_image: user.profile_image,
              };
            }
          }
        });
      }
    }
  }

  return data || [];
}

// 판매자의 다른 서비스 조회 (현재 서비스 제외)
export async function getSellerOtherServices(
  sellerId: string,
  currentServiceId: string,
  limit: number = 5,
) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("services")
    .select(
      `
      *,
      seller:seller_profiles(
        id,
        business_name,
        display_name,
        profile_image,
        is_verified
      )
    `,
    )
    .eq("seller_id", sellerId)
    .eq("status", "active")
    .neq("id", currentServiceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    logger.error("Error fetching seller other services:", error);
    return [];
  }

  // 평균 별점 및 리뷰 수 추가
  if (data && data.length > 0) {
    const serviceIds = data.map((s) => s.id);
    const { data: reviewStats } = await supabase
      .from("reviews")
      .select("service_id, rating")
      .in("service_id", serviceIds)
      .eq("is_visible", true);

    const ratingMap = new Map<string, { sum: number; count: number }>();
    reviewStats?.forEach((review: { service_id: string; rating: number }) => {
      const current = ratingMap.get(review.service_id) || { sum: 0, count: 0 };
      ratingMap.set(review.service_id, {
        sum: current.sum + review.rating,
        count: current.count + 1,
      });
    });

    data.forEach((service) => {
      service.order_count = service.orders_count || 0;
      const stats = ratingMap.get(service.id);
      if (stats && stats.count > 0) {
        service.rating = stats.sum / stats.count;
        service.review_count = stats.count;
      } else {
        service.rating = 0;
        service.review_count = 0;
      }
    });
  }

  return data || [];
}

// 같은 카테고리의 추천 서비스 조회 (광고 우선, 현재 서비스 제외)
export async function getRecommendedServicesByCategory(
  categoryId: string,
  currentServiceId: string,
  limit: number = 5,
) {
  const supabase = await createServerClient();

  // 광고 서비스 ID 조회 - Service Role 클라이언트 사용하여 RLS 우회
  const serviceRoleClient = createServiceRoleClient();
  const { data: advertisingData } = await serviceRoleClient
    .from("advertising_subscriptions")
    .select("service_id")
    .eq("status", "active");

  const advertisedServiceIds =
    advertisingData?.map((ad) => ad.service_id) || [];

  // 해당 카테고리의 서비스 ID 조회
  const { data: serviceLinks } = await supabase
    .from("service_categories")
    .select("service_id")
    .eq("category_id", categoryId);

  const serviceIds =
    serviceLinks?.map((sl) => sl.service_id).filter((id) => id !== currentServiceId) || [];

  if (serviceIds.length === 0) {
    return [];
  }

  // 서비스 조회
  const { data: allServices, error } = await supabase
    .from("services")
    .select(
      `
      *,
      seller:seller_profiles(
        id,
        business_name,
        display_name,
        profile_image,
        is_verified
      )
    `,
    )
    .in("id", serviceIds)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("Error fetching recommended services:", error);
    return [];
  }

  if (!allServices || allServices.length === 0) {
    return [];
  }

  // 광고 서비스와 일반 서비스 분리
  const advertisedServices = allServices.filter((s) =>
    advertisedServiceIds.includes(s.id),
  );
  const regularServices = allServices.filter(
    (s) => !advertisedServiceIds.includes(s.id),
  );

  // 광고 서비스 랜덤 셔플
  for (let i = advertisedServices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [advertisedServices[i], advertisedServices[j]] = [
      advertisedServices[j],
      advertisedServices[i],
    ];
  }

  // 일반 서비스 랜덤 셔플
  for (let i = regularServices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [regularServices[i], regularServices[j]] = [
      regularServices[j],
      regularServices[i],
    ];
  }

  // 광고 서비스(랜덤) + 일반 서비스(랜덤)
  const combinedServices = [...advertisedServices, ...regularServices].slice(
    0,
    limit,
  );

  // 평균 별점 및 리뷰 수 추가
  if (combinedServices.length > 0) {
    const serviceIds = combinedServices.map((s) => s.id);
    const { data: reviewStats } = await supabase
      .from("reviews")
      .select("service_id, rating")
      .in("service_id", serviceIds)
      .eq("is_visible", true);

    const ratingMap = new Map<string, { sum: number; count: number }>();
    reviewStats?.forEach((review: { service_id: string; rating: number }) => {
      const current = ratingMap.get(review.service_id) || { sum: 0, count: 0 };
      ratingMap.set(review.service_id, {
        sum: current.sum + review.rating,
        count: current.count + 1,
      });
    });

    combinedServices.forEach((service) => {
      service.order_count = service.orders_count || 0;
      const stats = ratingMap.get(service.id);
      if (stats && stats.count > 0) {
        service.rating = stats.sum / stats.count;
        service.review_count = stats.count;
      } else {
        service.rating = 0;
        service.review_count = 0;
      }
    });
  }

  return combinedServices;
}

// 전체 승인된 서비스 조회 (홈페이지용) - AI 카테고리 제외
export async function getActiveServices(limit?: number) {
  const supabase = await createServerClient();

  // 1. AI 카테고리 ID 조회
  const { data: aiCategory } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "ai-services")
    .maybeSingle();

  let excludeServiceIds: string[] = [];

  // 2. AI 카테고리 서비스 ID 조회
  if (aiCategory) {
    const { data: aiServiceLinks } = await supabase
      .from("service_categories")
      .select("service_id")
      .eq("category_id", aiCategory.id);

    if (aiServiceLinks && aiServiceLinks.length > 0) {
      excludeServiceIds = aiServiceLinks.map((sc) => sc.service_id);
    }
  }

  // 3. AI 카테고리 제외한 서비스 조회
  let query = supabase
    .from("services")
    .select(
      `
      *,
      seller:seller_profiles!inner(
        id,
        business_name,
        display_name,
        profile_image,
        user_id,
        is_verified
      ),
      service_categories(
        category:categories(id, name, slug)
      )
    `,
    )
    .eq("status", "active"); // 승인된 서비스만

  // AI 카테고리 서비스 제외
  if (excludeServiceIds.length > 0) {
    query = query.not("id", "in", `(${excludeServiceIds.join(",")})`);
  }

  query = query.order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    logger.error("Error fetching active services:", error);
    throw error;
  }

  // 데이터 매핑 (단일 가격 사용)
  if (data && data.length > 0) {
    // 각 서비스에 대해 평균 별점 계산
    const serviceIds = data.map((s) => s.id);
    const { data: reviewStats } = await supabase
      .from("reviews")
      .select("service_id, rating")
      .in("service_id", serviceIds)
      .eq("is_visible", true);

    // 서비스별 평균 별점 계산
    const ratingMap = new Map<string, { sum: number; count: number }>();
    reviewStats?.forEach((review: { service_id: string; rating: number }) => {
      const current = ratingMap.get(review.service_id) || { sum: 0, count: 0 };
      ratingMap.set(review.service_id, {
        sum: current.sum + review.rating,
        count: current.count + 1,
      });
    });

    data.forEach((service) => {
      service.price_min = service.price || 0;
      service.price_max = service.price || undefined;

      // order_count 매핑
      service.order_count = service.orders_count || 0;

      // 평균 별점 및 리뷰 수 설정
      const stats = ratingMap.get(service.id);
      if (stats && stats.count > 0) {
        service.rating = stats.sum / stats.count;
        service.review_count = stats.count;
      } else {
        service.rating = 0;
        service.review_count = 0;
      }
    });
  }

  return data || [];
}
