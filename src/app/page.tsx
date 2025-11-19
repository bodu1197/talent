import { redirect } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import HeroWithCategories from "@/components/common/HeroWithCategories";
import AITalentShowcase from "@/components/home/AITalentShowcase";
import RecommendedServices from "@/components/home/RecommendedServices";
import PersonalizedServices from "@/components/home/PersonalizedServices";
import { Service } from "@/types";

const RecentVisitedCategories = dynamic(
  () => import("@/components/home/RecentVisitedCategories"),
);
const RecentViewedServices = dynamic(
  () => import("@/components/home/RecentViewedServices"),
);

// 캐싱 최적화: 60초마다 재생성
export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  // 인증 상태 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인 사용자는 랜딩 페이지로
  if (!user) {
    redirect("/landing");
  }

  // AI 카테고리 한 번만 조회 (중복 제거)
  const { data: aiCategories } = await supabase
    .from("categories")
    .select("id")
    .eq("is_ai", true);

  const aiCategoryIds = aiCategories?.map((cat) => cat.id) || [];

  // 로그인 사용자는 메인 페이지 표시
  return (
    <div className="pb-0">
      {/* 히어로 섹션 + 카테고리 (즉시 표시) */}
      <HeroWithCategories />

      {/* 로그인 사용자 전용 섹션 (클라이언트 사이드) */}
      <RecentVisitedCategories />
      <RecentViewedServices />

      {/* AI 재능 쇼케이스 (Suspense로 감싸기) */}
      <Suspense fallback={<AIShowcaseSkeleton />}>
        <AIServicesSection aiCategoryIds={aiCategoryIds} />
      </Suspense>

      {/* 추천 서비스 섹션 (Suspense로 감싸기) */}
      <Suspense fallback={<RecommendedSkeleton />}>
        <RecommendedServices aiCategoryIds={aiCategoryIds} />
      </Suspense>

      {/* 회원 맞춤 관심 카테고리 서비스 (Suspense로 감싸기) */}
      <Suspense fallback={<PersonalizedSkeleton />}>
        <PersonalizedServices />
      </Suspense>
    </div>
  );
}

// AI 서비스 섹션 (서버 컴포넌트)
async function AIServicesSection({
  aiCategoryIds,
}: {
  aiCategoryIds: string[];
}) {
  const { createClient, createServiceRoleClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  let services: Service[] = [];

  if (aiCategoryIds.length > 0) {
    // 광고 서비스 ID 조회 - Service Role 클라이언트 사용하여 RLS 우회
    const serviceRoleClient = createServiceRoleClient();
    const { data: advertisingData } = await serviceRoleClient
      .from("advertising_subscriptions")
      .select("service_id")
      .eq("status", "active");

    const advertisedServiceIds =
      advertisingData?.map((ad) => ad.service_id) || [];

    // AI 카테고리의 서비스 조회 (JOIN으로 한 번에)
    const { data: aiServices } = await supabase
      .from("services")
      .select(
        `
        id,
        title,
        description,
        price,
        thumbnail_url,
        orders_count,
        status,
        seller:sellers(
          id,
          business_name,
          is_verified
        ),
        service_categories!inner(category_id)
      `,
      )
      .in("service_categories.category_id", aiCategoryIds)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(50); // 최적화: 1000 -> 50

    if (aiServices && aiServices.length > 0) {
      // 광고 서비스와 일반 서비스 분리
      const advertisedServices = aiServices.filter((s) =>
        advertisedServiceIds.includes(s.id),
      );
      const regularServices = aiServices.filter(
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

      // 광고 서비스(랜덤) + 일반 서비스(랜덤) (상위 20개)
      const combinedServices = [
        ...advertisedServices,
        ...regularServices,
      ].slice(0, 20);

      // 리뷰 통계 한 번에 조회
      const serviceIds = combinedServices.map((s) => s.id);
      const { data: reviewStats } = await supabase
        .from("reviews")
        .select("service_id, rating")
        .in("service_id", serviceIds)
        .eq("is_visible", true);

      // 서비스별 평균 별점 계산
      interface ReviewStat {
        service_id: string;
        rating: number;
      }
      const ratingMap = new Map<string, { sum: number; count: number }>();
      reviewStats?.forEach((review: ReviewStat) => {
        const current = ratingMap.get(review.service_id) || {
          sum: 0,
          count: 0,
        };
        ratingMap.set(review.service_id, {
          sum: current.sum + review.rating,
          count: current.count + 1,
        });
      });

      services = combinedServices.map((service) => {
        const stats = ratingMap.get(service.id);
        return {
          ...service,
          order_count: service.orders_count || 0,
          rating: stats && stats.count > 0 ? stats.sum / stats.count : 0,
          review_count: stats?.count || 0,
        } as unknown as Service;
      });
    }
  }

  return <AITalentShowcase services={services} />;
}

// 스켈레톤 로딩 컴포넌트
function AIShowcaseSkeleton() {
  return (
    <section className="py-8 bg-white">
      <div className="container-1200">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-lg h-64 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecommendedSkeleton() {
  return (
    <section className="py-8 bg-gray-50">
      <div className="container-1200">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
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
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
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
