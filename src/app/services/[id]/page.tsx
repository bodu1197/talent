import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ViewTracker from "@/components/services/ViewTracker";
import FavoriteButton from "@/components/services/FavoriteButton";
import PortfolioGrid from "@/components/services/PortfolioGrid";
import ExpertResponseBanner from "@/components/services/ExpertResponseBanner";
import ContactSellerButton from "@/components/services/ContactSellerButton";
import PurchaseButton from "@/components/services/PurchaseButton";
import { logger } from "@/lib/logger";
import { getCategoryPath } from "@/lib/categories";
import {
  FaStar,
  FaHeart,
  FaUser,
  FaCrown,
  FaReply,
  FaShare,
  FaShieldAlt,
  FaImage,
  FaRegComment,
  FaRegUser,
} from "react-icons/fa";
import ServiceCard from "@/components/services/ServiceCard";
import {
  getSellerOtherServices,
  getRecommendedServicesByCategory,
} from "@/lib/supabase/queries/services";

// 동적 렌더링 강제 (찜 개수 실시간 반영)
export const dynamic = "force-dynamic";

interface ServiceDetailProps {
  params: Promise<{
    id: string;
  }>;
}

type PortfolioItem = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  description: string;
  youtube_url: string | null;
  project_url: string | null;
  image_urls: string[];
  tags: string[];
  created_at: string;
};

// YouTube 비디오 ID 추출 함수
function _getYoutubeVideoId(url: string | null): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Helper function to fetch linked portfolios
async function fetchLinkedPortfolios(
  supabase: Awaited<ReturnType<typeof createClient>>,
  serviceId: string
): Promise<PortfolioItem[]> {
  try {
    const { data: portfolioLinks, error: portfolioError } = await supabase
      .from("portfolio_services")
      .select(
        `
        portfolio:seller_portfolio(
          id,
          title,
          thumbnail_url,
          description,
          youtube_url,
          project_url,
          image_urls,
          tags,
          created_at
        )
      `
      )
      .eq("service_id", serviceId)
      .order("created_at", { ascending: false });

    if (portfolioError) {
      logger.error("Portfolio links fetch error:", portfolioError);
      return [];
    }

    if (!portfolioLinks) {
      return [];
    }

    // Flatten portfolio data structure
    return portfolioLinks
      .map((link: { portfolio: PortfolioItem | PortfolioItem[] | null }) => {
        if (Array.isArray(link.portfolio) && link.portfolio.length > 0) {
          return link.portfolio[0];
        }
        return link.portfolio;
      })
      .filter((p): p is PortfolioItem =>
        p !== null && p !== undefined && typeof p === "object"
      );
  } catch (error: unknown) {
    logger.error("Portfolio fetch exception:", error);
    return [];
  }
}

// Helper function to fetch seller statistics
async function fetchSellerStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  seller: { id: string; user_id: string }
) {
  const stats = {
    totalOrders: 0,
    satisfactionRate: 0,
    avgResponseTime: "10분 이내",
  };

  // Fetch total completed orders
  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", seller.user_id)
    .eq("status", "completed");

  stats.totalOrders = orderCount || 0;

  // Calculate satisfaction rate from reviews
  const satisfactionRate = await calculateSatisfactionRate(supabase, seller.id);
  stats.satisfactionRate = satisfactionRate;

  return stats;
}

// Helper function to calculate satisfaction rate
async function calculateSatisfactionRate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sellerId: string
): Promise<number> {
  const { data: sellerServices } = await supabase
    .from("services")
    .select("id")
    .eq("seller_id", sellerId);

  if (!sellerServices || sellerServices.length === 0) {
    return 0;
  }

  const serviceIds = sellerServices.map((s) => s.id);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .in("service_id", serviceIds);

  if (!reviews || reviews.length === 0) {
    return 0;
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return Math.round((avgRating / 5) * 100);
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 현재 로그인한 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: service, error } = await supabase
    .from("services")
    .select(
      `
      *,
      seller:seller_profiles(
        id,
        business_name,
        display_name,
        profile_image,
        contact_hours,
        tax_invoice_available,
        user_id,
        bio,
        phone,
        created_at
      ),
      service_categories(
        category:categories(id, name, slug)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    logger.error("Service fetch error:", error);
    notFound();
  }

  if (!service) {
    notFound();
  }

  // 이 서비스와 연결된 포트폴리오 조회 (portfolio_services 중간 테이블 사용)
  const linkedPortfolios = await fetchLinkedPortfolios(supabase, id);

  // seller_profiles 뷰에서 이미 display_name과 profile_image를 포함한 모든 정보를 가져왔으므로
  // 추가 조회가 필요 없음

  // 이 서비스에 대한 리뷰 조회
  const { data: serviceReviews } = await supabase
    .from("reviews")
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      buyer:users!buyer_id(id, name, profile_image),
      seller_reply,
      seller_reply_at
    `,
    )
    .eq("service_id", id)
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  // seller의 통계 정보 조회
  const sellerStats = service?.seller
    ? await fetchSellerStats(supabase, service.seller)
    : { totalOrders: 0, satisfactionRate: 0, avgResponseTime: "10분 이내" };

  interface ServiceCategory {
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }

  const categories =
    service.service_categories?.map((sc: ServiceCategory) => sc.category) || [];

  // 카테고리 경로 가져오기 (1차 > 2차 > 3차)
  let categoryPath: Array<{ id: string; name: string; slug: string }> = [];
  if (categories.length > 0) {
    // 첫 번째 카테고리의 전체 경로를 가져옴
    categoryPath = await getCategoryPath(categories[0].id);
  }

  // 실제 리뷰 데이터로 평균 별점 계산
  const averageRating =
    serviceReviews && serviceReviews.length > 0
      ? (
          serviceReviews.reduce((sum, r) => sum + r.rating, 0) /
          serviceReviews.length
        ).toFixed(1)
      : "0.0";
  const reviewCount = serviceReviews?.length || 0;

  // 판매자의 다른 서비스 조회 (현재 서비스 제외, 5개)
  const otherServices = await getSellerOtherServices(
    service.seller.id,
    service.id,
    5,
  );

  // 같은 카테고리의 추천 서비스 조회 (현재 서비스 제외, 5개)
  const recommendedServices =
    categories.length > 0
      ? await getRecommendedServicesByCategory(
          categories[categories.length - 1].id,
          service.id,
          5,
        )
      : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 조회수 추적 */}
      <ViewTracker serviceId={id} />

      {/* 상단 네비게이션 (Breadcrumb) */}
      <nav className="bg-white border-b mt-16">
        <div className="container-1200 px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              홈
            </Link>
            {categoryPath.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <span className="text-gray-400">/</span>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {cat.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* 제목 및 판매자 프로필 영역 - 전체 가로 배경 */}
      <div
        className="w-full"
        style={{
          background:
            "radial-gradient(ellipse at center, #a7f3d0 0%, #d1fae5 50%, #ecfdf5 100%)",
        }}
      >
        <div className="container-1200 px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-5">
            {/* 왼쪽: 제목, 통계, 판매자 카드 */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-6">{service.title}</h1>

              {/* 통계 */}
              <div className="flex items-center gap-6 py-3 mb-6 text-sm relative z-10">
                <div className="flex items-center gap-2">
                  {/* 별점 5개 표시 */}
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar key={star} className="text-yellow-400" />
                  ))}
                  <span className="font-bold ml-1">{averageRating}</span>
                  <span className="text-gray-500">({reviewCount})</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaHeart className="text-red-400" />
                  <span className="font-bold">
                    {service.wishlist_count || 0}
                  </span>
                </div>
              </div>

              {/* 판매자 정보 카드 */}
              <div className="bg-white rounded-lg p-3 h-[70px] flex items-center">
                <div className="flex items-center gap-3 w-full">
                  {/* 프로필 이미지 */}
                  <div className="w-[54px] h-[54px] bg-gray-200 rounded-full overflow-hidden flex-shrink-0 relative">
                    {service.seller?.profile_image ? (
                      <Image
                        src={service.seller.profile_image}
                        alt={service.seller?.display_name || "판매자"}
                        fill
                        className="object-cover"
                        sizes="54px"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FaUser className="text-xl" />
                      </div>
                    )}
                  </div>

                  {/* 정보 영역 */}
                  <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
                    {/* 판매자 활동명 */}
                    <h3 className="font-bold text-sm leading-tight truncate">
                      {service.seller?.display_name ||
                        service.seller?.business_name}
                    </h3>

                    {/* 정보 한 줄 */}
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      {/* 연락 가능 시간 */}
                      {service.seller?.contact_hours && (
                        <span className="whitespace-nowrap">
                          연락: {service.seller.contact_hours}
                        </span>
                      )}

                      {/* 평균 응답 시간 */}
                      <span className="whitespace-nowrap">응답: 00분</span>

                      {/* 세금계산서 */}
                      <span className="whitespace-nowrap">
                        세금계산서:{" "}
                        {service.seller?.tax_invoice_available ? (
                          <span className="text-green-600 font-medium">
                            가능
                          </span>
                        ) : (
                          <span className="text-gray-500">불가</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* 버튼 */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs whitespace-nowrap">
                      <FaRegComment className="mr-1 inline" /> 문의
                    </button>
                    <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs whitespace-nowrap">
                      <FaRegUser className="mr-1 inline" /> 프로필
                    </button>
                  </div>
                </div>
              </div>

              {/* 탭 메뉴 */}
              <div className="flex gap-4 mt-6 border-b border-gray-200">
                <a
                  href="#portfolio"
                  className="pb-3 px-2 text-sm hover:text-brand-primary hover:border-b-2 hover:border-brand-primary transition-colors"
                >
                  포트폴리오
                </a>
                <a
                  href="#description"
                  className="pb-3 px-2 text-sm hover:text-brand-primary hover:border-b-2 hover:border-brand-primary transition-colors"
                >
                  서비스 설명
                </a>
                <a
                  href="#price"
                  className="pb-3 px-2 text-sm hover:text-brand-primary hover:border-b-2 hover:border-brand-primary transition-colors"
                >
                  가격 정보
                </a>
                <a
                  href="#expert"
                  className="pb-3 px-2 text-sm hover:text-brand-primary hover:border-b-2 hover:border-brand-primary transition-colors"
                >
                  전문가 정보
                </a>
                <a
                  href="#reviews"
                  className="pb-3 px-2 text-sm hover:text-brand-primary hover:border-b-2 hover:border-brand-primary transition-colors"
                >
                  리뷰
                </a>
              </div>
            </div>

            {/* 오른쪽: 썸네일 (배경색 영역 내부, 상단만 포함) */}
            <div className="w-full lg:w-[350px] flex-shrink-0">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="h-[260px] relative bg-gray-100">
                  {service.thumbnail_url ? (
                    <Image
                      src={service.thumbnail_url}
                      alt={service.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 350px"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <FaImage className="text-[40px]" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="container-1200 px-4 pb-8 pt-5">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* 왼쪽: 서비스 설명 */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* 포트폴리오 */}
            {linkedPortfolios && linkedPortfolios.length > 0 && (
              <div
                id="portfolio"
                className="bg-white rounded-xl shadow-sm p-6 scroll-mt-20"
              >
                <h2 className="text-xl font-bold mb-6">
                  포트폴리오 ({linkedPortfolios.length})
                </h2>
                <PortfolioGrid portfolios={linkedPortfolios} />
              </div>
            )}

            {/* 서비스 설명 */}
            <div
              id="description"
              className="bg-white rounded-xl shadow-sm p-6 scroll-mt-20 overflow-hidden"
            >
              <h2 className="text-xl font-bold mb-4">서비스 설명</h2>
              <div
                className="prose prose-lg max-w-none whitespace-pre-wrap break-words overflow-wrap-anywhere"
                style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
              >
                {service.description}
              </div>
            </div>

            {/* 전문가 정보 */}
            {service.seller && (
              <div
                id="expert"
                className="bg-white rounded-xl shadow-sm p-6 scroll-mt-20"
              >
                <h2 className="text-xl font-bold mb-6">전문가 정보</h2>

                {/* 전문가 카드 */}
                <div className="border border-gray-200 rounded-lg p-6">
                  {/* 상단 알림 배너 (응답 시간) */}
                  <ExpertResponseBanner
                    avgResponseTime={sellerStats.avgResponseTime}
                  />

                  {/* 전문가 기본 정보 */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      {/* 프로필 이미지 */}
                      <div className="w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 relative overflow-hidden">
                        {service.seller?.profile_image ? (
                          <Image
                            src={service.seller.profile_image}
                            alt={service.seller?.display_name || "판매자"}
                            fill
                            className="object-cover"
                            sizes="64px"
                            loading="lazy"
                          />
                        ) : (
                          <span>
                            {
                              (service.seller?.display_name ||
                                service.seller?.business_name ||
                                "U")[0]
                            }
                          </span>
                        )}
                      </div>

                      {/* 이름 및 영업 시간 */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {service.seller?.display_name ||
                              service.seller?.business_name}
                          </h3>
                          <span className="text-yellow-500">
                            <FaCrown />
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          영업 가능 시간:{" "}
                          {service.seller?.contact_hours || "9시 - 18시"}
                        </p>
                        <p className="text-sm text-gray-600">
                          평균 응답 시간: {sellerStats.avgResponseTime}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            결제 전 전화상담 제공
                          </span>
                          <button className="text-xs px-2 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                            연락처 보기
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 문의하기 버튼 */}
                    <Link
                      href="/chat"
                      className="px-6 py-2 border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-colors font-medium"
                    >
                      문의하기
                    </Link>
                  </div>

                  {/* 통계 정보 */}
                  <div className="grid grid-cols-4 gap-4 py-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">
                        총 거래 건수
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {sellerStats.totalOrders}건
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">만족도</div>
                      <div className="text-lg font-bold text-gray-900">
                        {sellerStats.satisfactionRate}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">회원구분</div>
                      <div className="text-lg font-bold text-gray-900">
                        기업회원
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">
                        세금계산서
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {service.seller?.tax_invoice_available
                          ? "발행 가능"
                          : "미발행"}
                      </div>
                    </div>
                  </div>

                  {/* 전문가 소개 */}
                  {service.seller?.bio && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-3">
                        전문가 소개
                      </h4>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">
                        {service.seller.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 리뷰 */}
            <div
              id="reviews"
              className="bg-white rounded-xl shadow-sm p-6 scroll-mt-20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  리뷰 ({serviceReviews?.length || 0})
                </h2>
                {serviceReviews && serviceReviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={
                            star <=
                            Math.round(
                              serviceReviews.reduce(
                                (sum, r) => sum + r.rating,
                                0,
                              ) / serviceReviews.length,
                            )
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="font-bold text-lg">
                      {(
                        serviceReviews.reduce((sum, r) => sum + r.rating, 0) /
                        serviceReviews.length
                      ).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {serviceReviews && serviceReviews.length > 0 ? (
                <div className="space-y-6">
                  {serviceReviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 pb-6 last:border-0"
                    >
                      {/* 리뷰 헤더 */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {/* 프로필 이미지 */}
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
                            {Array.isArray(review.buyer) &&
                            review.buyer[0]?.profile_image ? (
                              <Image
                                src={review.buyer[0].profile_image}
                                alt={review.buyer[0].name}
                                fill
                                className="object-cover"
                                sizes="40px"
                                loading="lazy"
                              />
                            ) : (
                              <FaUser className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {(Array.isArray(review.buyer) &&
                                review.buyer[0]?.name) ||
                                "익명"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString(
                                "ko-KR",
                              )}
                            </div>
                          </div>
                        </div>
                        {/* 별점 */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={`text-sm ${
                                star <= review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* 리뷰 내용 */}
                      <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                        {review.comment}
                      </p>

                      {/* 판매자 답변 */}
                      {review.seller_reply && (
                        <div className="bg-gray-50 rounded-lg p-4 ml-8">
                          <div className="flex items-center gap-2 mb-2">
                            <FaReply className="text-brand-primary" />
                            <span className="text-sm font-medium text-gray-900">
                              판매자 답변
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(
                                review.seller_reply_at,
                              ).toLocaleDateString("ko-KR")}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {review.seller_reply}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaStar className="text-gray-300 text-5xl mb-4 inline-block" />
                  <p className="text-gray-600">아직 작성된 리뷰가 없습니다</p>
                  <p className="text-sm text-gray-500 mt-2">
                    첫 번째 리뷰를 작성해보세요!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 가격, 안전거래 */}
          <div className="w-full lg:w-[350px] flex-shrink-0">
            <div className="sticky top-12 space-y-6">
              {/* 가격 정보 */}
              <div
                id="price"
                className="bg-white rounded-xl shadow-sm overflow-hidden scroll-mt-20"
              >
                <div className="p-6">
                  <div className="text-2xl font-bold mb-1">
                    {service.price?.toLocaleString() || 0}원
                  </div>
                  <div className="text-sm text-gray-600 mb-6">
                    {service.delivery_days || 0}일 이내 완료 ·{" "}
                    {service.revision_count === 999
                      ? "무제한"
                      : `${service.revision_count || 0}회`}{" "}
                    수정
                  </div>

                  {service.seller?.id && user && (
                    <PurchaseButton
                      sellerId={service.seller.id}
                      serviceId={id}
                      currentUserId={user.id}
                      sellerUserId={service.seller.user_id}
                      serviceTitle={service.title}
                      servicePrice={service.price || 0}
                      deliveryDays={service.delivery_days || 7}
                      revisionCount={service.revision_count || 0}
                      serviceDescription={service.description}
                    />
                  )}

                  {service.seller?.id &&
                    user &&
                    service.seller.user_id !== user.id && (
                      <ContactSellerButton
                        sellerId={service.seller.id}
                        serviceId={id}
                      />
                    )}

                  <div className="flex gap-2 mt-3">
                    <FavoriteButton serviceId={id} />
                    <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <FaShare className="inline" /> 공유
                    </button>
                  </div>
                </div>
              </div>

              {/* 안전거래 배지 */}
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <FaShieldAlt className="text-2xl text-brand-primary mb-2 inline-block" />
                <h4 className="font-bold mb-1">100% 안전거래</h4>
                <p className="text-xs text-gray-600">
                  에스크로 결제 시스템으로
                  <br />
                  안전하게 거래하세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 이 전문가의 다른 서비스예요 */}
      {otherServices && otherServices.length > 0 && (
        <div className="bg-white py-12">
          <div className="container-1200 px-4">
            <h2 className="text-2xl font-bold mb-6">이 전문가의 다른 서비스예요</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {otherServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 돌파구가 추천 서비스 */}
      {recommendedServices && recommendedServices.length > 0 && (
        <div className="bg-gray-50 py-12">
          <div className="container-1200 px-4">
            <h2 className="text-2xl font-bold mb-6">돌파구가 추천 서비스</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recommendedServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
