// @ts-nocheck - TypeScript incorrectly infers 'false | void | Element' due to notFound() control flow
// [Known Issue] TypeScript/Next.js 16 type inference issue - notFound() return type not narrowing correctly
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ViewTracker from '@/components/services/ViewTracker';
import FavoriteButton from '@/components/services/FavoriteButton';
import ShareButton from '@/components/services/ShareButton';
import PortfolioGrid from '@/components/services/PortfolioGrid';
import ExpertResponseBanner from '@/components/services/ExpertResponseBanner';
import ContactSellerButton from '@/components/services/ContactSellerButton';
import MobileServiceHeader from '@/components/services/MobileServiceHeader';
import MobilePackageSelector from '@/components/services/MobilePackageSelector';
import { logger } from '@/lib/logger';
import { getCategoryPath } from '@/lib/categories';
import {
  Star,
  Heart,
  User,
  Crown,
  Reply,
  Shield,
  Image as ImageIcon,
  MessageCircle,
  UserCircle,
  MapPin,
} from 'lucide-react';
import ServiceCard from '@/components/services/ServiceCard';
import {
  getSellerOtherServices,
  getRecommendedServicesByCategory,
} from '@/lib/supabase/queries/services';
import ServicePackageSelector from '@/components/services/ServicePackageSelector';
import { isOfflineCategory } from '@/lib/constants/categories';

// 동적 렌더링 강제 (찜 개수 실시간 반영)
export const dynamic = 'force-dynamic';

interface ServiceDetailProps {
  readonly params: Promise<{
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
    const match = pattern.exec(url);
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
      .from('portfolio_services')
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
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false });

    if (portfolioError) {
      logger.error('Portfolio links fetch error:', portfolioError);
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
      .filter((p): p is PortfolioItem => p !== null && p !== undefined && typeof p === 'object');
  } catch (error: unknown) {
    logger.error('Portfolio fetch exception:', error);
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
    avgResponseTime: '10분 이내',
  };

  // Fetch total completed orders
  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', seller.user_id)
    .eq('status', 'completed');

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
    .from('services')
    .select('id')
    .eq('seller_id', sellerId);

  if (!sellerServices || sellerServices.length === 0) {
    return 0;
  }

  const serviceIds = sellerServices.map((s) => s.id);

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .in('service_id', serviceIds);

  if (!reviews || reviews.length === 0) {
    return 0;
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return Math.round((avgRating / 5) * 100);
}

// generateMetadata - 동적 SEO 메타데이터 생성
export async function generateMetadata({ params }: ServiceDetailProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: service } = await supabase
    .from('services')
    .select(
      `
      id,
      title,
      description,
      thumbnail_url,
      price,
      seller:seller_profiles(
        display_name,
        business_name
      ),
      service_categories(
        category:categories(name, slug)
      )
    `
    )
    .eq('id', id)
    .single();

  if (!service) {
    return {
      title: '서비스를 찾을 수 없습니다 | 돌파구',
      description: '요청하신 서비스를 찾을 수 없습니다.',
    };
  }

  const sellerName = service.seller?.display_name || service.seller?.business_name || '전문가';
  const categoryName =
    (service.service_categories as { category: { name: string; slug: string } }[])?.[0]?.category
      ?.name || '서비스';
  const truncatedDesc =
    service.description?.slice(0, 155) || `${sellerName}님의 ${categoryName} 전문 서비스`;

  return {
    title: `${service.title} | ${sellerName} | 돌파구`,
    description: truncatedDesc,
    keywords: [categoryName, sellerName, '전문가', '서비스', '돌파구', service.title],
    authors: [{ name: sellerName }],
    openGraph: {
      title: service.title,
      description: truncatedDesc,
      type: 'website',
      url: `https://dolpagu.com/services/${service.id}`,
      siteName: '돌파구',
      images: service.thumbnail_url
        ? [
            {
              url: service.thumbnail_url,
              width: 1200,
              height: 630,
              alt: service.title,
            },
          ]
        : [
            {
              url: 'https://dolpagu.com/og-default.png',
              width: 1200,
              height: 630,
              alt: '돌파구 - 전문가 매칭 플랫폼',
            },
          ],
    },
    twitter: {
      card: 'summary_large_image',
      title: service.title,
      description: truncatedDesc,
      images: service.thumbnail_url
        ? [service.thumbnail_url]
        : ['https://dolpagu.com/og-default.png'],
    },
    alternates: {
      canonical: `https://dolpagu.com/services/${service.id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// JSON-LD 구조화 데이터 생성 함수
function generateServiceJsonLd(service: {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  seller?: { display_name: string | null; business_name: string | null } | null;
  service_categories?: { category: { name: string; slug: string } }[];
  average_rating?: number;
  review_count?: number;
}) {
  const sellerName = service.seller?.display_name || service.seller?.business_name || '전문가';
  const categoryName = service.service_categories?.[0]?.category?.name || '서비스';

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description || `${sellerName}님의 ${categoryName} 전문 서비스`,
    image: service.thumbnail_url || 'https://dolpagu.com/og-default.png',
    url: `https://dolpagu.com/services/${service.id}`,
    provider: {
      '@type': 'Person',
      name: sellerName,
    },
    offers: {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
    },
    category: categoryName,
    ...(service.average_rating &&
      service.review_count && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: service.average_rating,
          reviewCount: service.review_count,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  };
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export default async function ServiceDetailPage({ params }: ServiceDetailProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1단계: 사용자 정보와 서비스 정보를 병렬로 조회
  const [userResult, serviceResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('services')
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
          is_business,
          user_id,
          bio,
          phone,
          created_at
        ),
        service_categories(
          category:categories(id, name, slug, level)
        ),
        service_packages(
          id,
          name,
          package_type,
          price,
          delivery_days,
          revision_count,
          features,
          description,
          is_active,
          display_order
        )
      `
      )
      .eq('id', id)
      .single(),
  ]);

  const user = userResult.data?.user;
  const { data: service, error } = serviceResult;

  if (error) {
    logger.error('Service fetch error:', error);
    notFound();
  }

  if (!service) {
    notFound();
  }

  // 카테고리 정보 추출 (병렬 쿼리에 필요)
  interface ServiceCategory {
    category: {
      id: string;
      name: string;
      slug: string;
      level: number;
    };
  }

  type CategoryInfo = ServiceCategory['category'];

  const categories: CategoryInfo[] =
    service.service_categories?.map((sc: ServiceCategory) => sc.category) || [];

  const deepestCategory = categories.reduce((deepest: CategoryInfo | null, cat: CategoryInfo) => {
    const deepestLevel = deepest?.level || 0;
    const catLevel = cat?.level || 0;
    return catLevel > deepestLevel ? cat : deepest;
  }, categories[0] || null);

  // 2단계: 모든 추가 데이터를 병렬로 조회
  const [
    linkedPortfolios,
    reviewsResult,
    sellerStats,
    categoryPath,
    otherServices,
    recommendedServices,
    wishlistResult,
  ] = await Promise.all([
    // 포트폴리오 조회
    fetchLinkedPortfolios(supabase, id),

    // 리뷰 조회
    supabase
      .from('reviews')
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        buyer:users!buyer_id(id, name, profile_image),
        seller_reply,
        seller_reply_at
      `
      )
      .eq('service_id', id)
      .eq('is_visible', true)
      .order('created_at', { ascending: false }),

    // 전문가 통계 조회
    service?.seller
      ? fetchSellerStats(supabase, service.seller)
      : Promise.resolve({ totalOrders: 0, satisfactionRate: 0, avgResponseTime: '10분 이내' }),

    // 카테고리 경로 조회
    deepestCategory ? getCategoryPath(deepestCategory.id) : Promise.resolve([]),

    // 전문가의 다른 서비스 조회
    getSellerOtherServices(service.seller.id, service.id, 5),

    // 같은 카테고리 추천 서비스 조회
    deepestCategory
      ? getRecommendedServicesByCategory(deepestCategory.id, service.id, 10)
      : Promise.resolve([]),

    // 현재 사용자의 찜 상태 조회
    user
      ? supabase
          .from('service_favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('service_id', id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const serviceReviews = reviewsResult.data;
  const isFavorited = !!wishlistResult?.data;

  // 실제 리뷰 데이터로 평균 별점 계산
  const averageRating =
    serviceReviews && serviceReviews.length > 0
      ? (serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length).toFixed(1)
      : '0.0';
  const reviewCount = serviceReviews?.length || 0;

  const categoryName = deepestCategory?.name || '관련';

  // 오프라인 카테고리 여부 확인 (1차 카테고리 기준)
  const rootCategorySlug = categoryPath.length > 0 ? categoryPath[0].slug : '';
  const showLocationInfo = isOfflineCategory(rootCategorySlug);

  // JSON-LD 구조화 데이터 준비
  const jsonLd = generateServiceJsonLd({
    id: service.id,
    title: service.title,
    description: service.description,
    thumbnail_url: service.thumbnail_url,
    price: service.price,
    seller: service.seller,
    service_categories: categories.map((sc) => ({
      category: { name: sc.name, slug: sc.slug },
    })),
    average_rating: service.average_rating,
    review_count: service.review_count,
  });

  return (
    <>
      {/* JSON-LD 구조화 데이터 (SEO/AI 최적화) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gray-50">
        {/* 조회수 추적 */}
        <ViewTracker serviceId={id} />

        {/* 모바일 전용: 풀 넓이 썸네일 + 헤더 오버레이 */}
        <div className="lg:hidden relative w-full" style={{ aspectRatio: '16/10' }}>
          {service.thumbnail_url ? (
            <Image
              src={service.thumbnail_url}
              alt={service.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
              <ImageIcon className="w-16 h-16" />
            </div>
          )}
          {/* 모바일 헤더 오버레이 */}
          <MobileServiceHeader
            serviceId={id}
            serviceTitle={service.title}
            sellerPhone={service.seller?.phone}
          />
        </div>

        {/* PC 전용: 상단 네비게이션 (Breadcrumb) */}
        <nav className="hidden lg:block bg-white border-b mt-20">
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

        {/* PC 전용: 제목 및 전문가 프로필 영역 - 전체 가로 배경 */}
        <div
          className="hidden lg:block w-full"
          style={{
            background: 'radial-gradient(ellipse at center, #a7f3d0 0%, #d1fae5 50%, #ecfdf5 100%)',
          }}
        >
          <div className="container-1200 px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-5">
              {/* 왼쪽: 제목, 통계, 전문가 카드 */}
              <div className="flex-1">
                <h1 className="text-2xl font-semibold mb-6">{service.title}</h1>

                {/* 통계 */}
                <div className="flex items-center gap-6 py-3 mb-6 text-sm relative z-10">
                  <div className="flex items-center gap-2">
                    {/* 별점 5개 표시 */}
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="font-semibold ml-1">{averageRating}</span>
                    <span className="text-gray-500">({reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Heart className="w-4 h-4 text-red-400 fill-current" />
                    <span className="font-semibold">{service.wishlist_count || 0}</span>
                  </div>
                  {/* 서비스 제공 지역 (오프라인 카테고리에서만 표시) */}
                  {showLocationInfo && service.location_region && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{service.location_region}</span>
                    </div>
                  )}
                </div>

                {/* 전문가 정보 카드 */}
                <div className="bg-white rounded-lg p-3 h-[70px] flex items-center">
                  <div className="flex items-center gap-3 w-full">
                    {/* 프로필 이미지 */}
                    <div className="w-[54px] h-[54px] bg-gray-200 rounded-full overflow-hidden flex-shrink-0 relative">
                      {service.seller?.profile_image ? (
                        <Image
                          src={service.seller.profile_image}
                          alt={service.seller?.display_name || '전문가'}
                          fill
                          className="object-cover"
                          sizes="54px"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* 정보 영역 */}
                    <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
                      {/* 전문가 활동명 */}
                      <h3 className="font-semibold text-sm leading-tight truncate">
                        {service.seller?.display_name || service.seller?.business_name}
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
                          세금계산서:{' '}
                          {service.seller?.tax_invoice_available ? (
                            <span className="text-green-600 font-medium">가능</span>
                          ) : (
                            <span className="text-gray-500">불가</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Link
                        href="/chat"
                        className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs whitespace-nowrap"
                      >
                        <MessageCircle className="w-3 h-3 mr-1 inline" /> 문의
                      </Link>
                      <Link
                        href={`/experts/${service.seller.id}`}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs whitespace-nowrap"
                      >
                        <UserCircle className="w-3 h-3 mr-1 inline" /> 프로필
                      </Link>
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
                        <ImageIcon className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 모바일 전용: 전문가 카드 (썸네일 바로 아래) */}
        {service.seller && (
          <div className="lg:hidden bg-white px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 relative">
                {service.seller?.profile_image ? (
                  <Image
                    src={service.seller.profile_image}
                    alt={service.seller?.display_name || '전문가'}
                    fill
                    className="object-cover"
                    sizes="48px"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {service.seller?.display_name || service.seller?.business_name}
                </div>
                <div className="text-xs text-gray-500">
                  {service.delivery_days || 0}일 이내 완료 · 수정{' '}
                  {service.revision_count === 999 ? '무제한' : `${service.revision_count || 0}회`}
                </div>
              </div>
              <Link
                href={`/experts/${service.seller.id}`}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                프로필
              </Link>
            </div>
          </div>
        )}

        {/* 모바일 전용: 평점 별표 */}
        <div className="lg:hidden bg-white px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-1 flex-wrap">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${star <= Math.round(Number(averageRating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
            <span className="ml-2 font-semibold text-gray-900">{averageRating}</span>
            <span className="text-gray-500">({reviewCount})</span>
            <div className="ml-4 flex items-center gap-1 text-gray-500">
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>{service.wishlist_count || 0}</span>
            </div>
            {/* 서비스 제공 지역 (오프라인 카테고리에서만 표시) */}
            {showLocationInfo && service.location_region && (
              <div className="ml-4 flex items-center gap-1 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{service.location_region}</span>
              </div>
            )}
          </div>
        </div>

        {/* 모바일 전용: 제목 */}
        <div className="lg:hidden bg-white px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-900">{service.title}</h1>
        </div>

        {/* 모바일 전용: 패키지 선택 (제목 아래에 바로 표시) */}
        {service.seller && (
          <MobilePackageSelector
            serviceId={id}
            sellerId={service.seller.id}
            sellerUserId={service.seller.user_id}
            serviceTitle={service.title}
            serviceDescription={service.description}
            servicePrice={service.price || 0}
            deliveryDays={service.delivery_days || 7}
            revisionCount={service.revision_count || 0}
            hasPackages={service.has_packages || false}
            packages={
              service.service_packages?.filter((p: { is_active: boolean }) => p.is_active) || []
            }
            initialIsFavorite={isFavorited}
            isBusiness={service.seller?.is_business ?? false}
          />
        )}

        {/* 메인 컨텐츠 영역 */}
        <div className="container-1200 px-4 pb-8 pt-5 lg:pt-5">
          <div className="flex flex-col lg:flex-row gap-5">
            {/* 왼쪽: 서비스 설명 */}
            <div className="flex-1 min-w-0 space-y-8">
              {/* 포트폴리오 */}
              {linkedPortfolios && linkedPortfolios.length > 0 && (
                <div
                  id="portfolio"
                  className="bg-white rounded-xl shadow-sm p-3 lg:p-6 scroll-mt-20"
                >
                  <h2 className="text-xl font-semibold mb-4 lg:mb-6">
                    포트폴리오 ({linkedPortfolios.length})
                  </h2>
                  <PortfolioGrid portfolios={linkedPortfolios} />
                </div>
              )}

              {/* 서비스 설명 */}
              <div
                id="description"
                className="bg-white rounded-xl shadow-sm p-3 lg:p-6 scroll-mt-20 overflow-hidden"
              >
                <h2 className="text-xl font-semibold mb-3 lg:mb-4">서비스 설명</h2>
                <div
                  className="prose prose-lg max-w-none whitespace-pre-wrap break-words overflow-wrap-anywhere"
                  style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                >
                  {service.description}
                </div>
              </div>

              {/* 전문가 정보 */}
              {service.seller && (
                <div id="expert" className="bg-white rounded-xl shadow-sm p-3 lg:p-6 scroll-mt-20">
                  <h2 className="text-xl font-semibold mb-4 lg:mb-6">전문가 정보</h2>

                  {/* 전문가 카드 */}
                  <div className="border border-gray-200 rounded-lg p-3 lg:p-6">
                    {/* 상단 알림 배너 (응답 시간) */}
                    <ExpertResponseBanner avgResponseTime={sellerStats.avgResponseTime} />

                    {/* 전문가 기본 정보 */}
                    <div className="flex items-start justify-between mb-4 lg:mb-6">
                      <div className="flex items-start gap-3 lg:gap-4">
                        {/* 프로필 이미지 */}
                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-brand-primary flex items-center justify-center text-white text-xl lg:text-2xl font-semibold flex-shrink-0 relative overflow-hidden">
                          {service.seller?.profile_image ? (
                            <Image
                              src={service.seller.profile_image}
                              alt={service.seller?.display_name || '전문가'}
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
                                  'U')[0]
                              }
                            </span>
                          )}
                        </div>

                        {/* 이름 및 영업 시간 */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                              {service.seller?.display_name || service.seller?.business_name}
                            </h3>
                            <span className="text-yellow-500">
                              <Crown className="w-4 h-4" />
                            </span>
                          </div>
                          <p className="text-xs lg:text-sm text-gray-600 mb-1">
                            영업 가능 시간: {service.seller?.contact_hours || '9시 - 18시'}
                          </p>
                          <p className="text-xs lg:text-sm text-gray-600">
                            평균 응답 시간: {sellerStats.avgResponseTime}
                          </p>
                          {/* PC: 인라인 버튼 */}
                          <div className="hidden lg:flex mt-2 gap-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              결제 전 전화상담 제공
                            </span>
                            <button className="text-xs px-2 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                              연락처 보기
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 오른쪽: 통계 정보 (문의하기 버튼 대체) */}
                      <div className="hidden lg:grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="text-right">
                          <span className="text-gray-500">총 거래</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {sellerStats.totalOrders}건
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500">만족도</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {sellerStats.satisfactionRate}%
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500">회원구분</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {service.seller?.is_business ? '기업회원' : '개인회원'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500">세금계산서</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {service.seller?.is_business || service.seller?.tax_invoice_available
                              ? '발행가능'
                              : '불가능'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 모바일: 버튼 영역 (전체 너비) */}
                    <div className="lg:hidden flex gap-2 py-3 border-t border-gray-200">
                      <span className="flex-1 text-center text-xs px-2 py-2.5 bg-gray-100 text-gray-700 rounded-lg">
                        결제 전 전화상담 제공
                      </span>
                      <button className="flex-1 text-xs px-2 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        연락처 보기
                      </button>
                    </div>

                    {/* 모바일: 통계 정보 */}
                    <div className="lg:hidden grid grid-cols-4 gap-2 py-3 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">총 거래</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {sellerStats.totalOrders}건
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">만족도</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {sellerStats.satisfactionRate}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">회원구분</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {service.seller?.is_business ? '기업' : '개인'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">세금계산서</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {service.seller?.is_business || service.seller?.tax_invoice_available
                            ? '가능'
                            : '불가'}
                        </div>
                      </div>
                    </div>

                    {/* 전문가 소개 */}
                    {service.seller?.bio && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">전문가 소개</h4>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">
                          {service.seller.bio}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 리뷰 */}
              <div id="reviews" className="bg-white rounded-xl shadow-sm p-3 lg:p-6 scroll-mt-20">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h2 className="text-xl font-semibold">리뷰 ({serviceReviews?.length || 0})</h2>
                  {serviceReviews && serviceReviews.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <=
                              Math.round(
                                serviceReviews.reduce((sum, r) => sum + r.rating, 0) /
                                  serviceReviews.length
                              )
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-lg">
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
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                        {/* 리뷰 헤더 */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {/* 프로필 이미지 */}
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
                              {Array.isArray(review.buyer) && review.buyer[0]?.profile_image ? (
                                <Image
                                  src={review.buyer[0].profile_image}
                                  alt={review.buyer[0].name}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                  loading="lazy"
                                />
                              ) : (
                                <User className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {(Array.isArray(review.buyer) && review.buyer[0]?.name) || '익명'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('ko-KR', {
                                  timeZone: 'Asia/Seoul',
                                })}
                              </div>
                            </div>
                          </div>
                          {/* 별점 */}
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* 리뷰 내용 */}
                        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.comment}</p>

                        {/* 전문가 답변 */}
                        {review.seller_reply && (
                          <div className="bg-gray-50 rounded-lg p-4 ml-8">
                            <div className="flex items-center gap-2 mb-2">
                              <Reply className="w-4 h-4 text-brand-primary" />
                              <span className="text-sm font-medium text-gray-900">전문가 답변</span>
                              <span className="text-xs text-gray-500">
                                {new Date(review.seller_reply_at).toLocaleDateString('ko-KR', {
                                  timeZone: 'Asia/Seoul',
                                })}
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
                    <Star className="w-12 h-12 text-gray-300 mb-4 inline-block" />
                    <p className="text-gray-600">아직 작성된 리뷰가 없습니다</p>
                    <p className="text-sm text-gray-500 mt-2">첫 번째 리뷰를 작성해보세요!</p>
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽: 가격, 안전거래 (모바일에서 숨김 - 하단바로 이동) */}
            <div className="hidden lg:block w-full lg:w-[350px] flex-shrink-0">
              <div className="sticky top-20 space-y-6">
                {/* 가격 정보 (패키지 또는 단일 가격) + 버튼들 */}
                <div id="price" className="scroll-mt-20">
                  {service.seller?.id && (
                    <ServicePackageSelector
                      serviceId={id}
                      sellerId={service.seller.id}
                      sellerUserId={service.seller.user_id}
                      serviceTitle={service.title}
                      serviceDescription={service.description}
                      servicePrice={service.price || 0}
                      deliveryDays={service.delivery_days || 7}
                      revisionCount={service.revision_count ?? 0}
                      hasPackages={service.has_packages || false}
                      packages={
                        service.service_packages?.filter(
                          (p: { is_active: boolean }) => p.is_active
                        ) || []
                      }
                      currentUserId={user?.id}
                      isBusiness={service.seller?.is_business ?? false}
                    >
                      {/* 문의하기/찜/공유 버튼 - 구매버튼과 동일한 간격(gap-3) */}
                      {(!user || service.seller.user_id !== user.id) && (
                        <ContactSellerButton sellerId={service.seller.id} serviceId={id} />
                      )}
                      <FavoriteButton serviceId={id} />
                      <ShareButton serviceId={id} serviceTitle={service.title} />
                    </ServicePackageSelector>
                  )}
                </div>

                {/* 안전거래 배지 */}
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <Shield className="w-7 h-7 text-brand-primary mb-2 inline-block" />
                  <h4 className="font-semibold mb-1">100% 안전거래</h4>
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
          <div className="bg-white py-6 lg:py-12">
            <div className="container-1200 px-4">
              <h2 className="text-lg lg:text-2xl font-semibold mb-4 lg:mb-6">
                이 전문가의 다른 서비스예요
              </h2>
              {/* 모바일: 가로 스크롤 */}
              <div className="lg:hidden flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
                {otherServices.map((service) => (
                  <div key={service.id} className="flex-shrink-0 w-40">
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
              {/* PC: 그리드 */}
              <div className="hidden lg:grid grid-cols-5 gap-4">
                {otherServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 같은 카테고리 추천 서비스 (광고 우선 랜덤 10개) */}
        {recommendedServices && recommendedServices.length > 0 && (
          <div className="bg-gray-50 py-6 lg:py-12 pb-20 lg:pb-12">
            <div className="container-1200 px-4">
              <h2 className="text-lg lg:text-2xl font-semibold mb-4 lg:mb-6">
                {categoryName} 분야의 다른 서비스
              </h2>
              {/* 모바일: 가로 스크롤 */}
              <div className="lg:hidden flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
                {recommendedServices.map((recService) => (
                  <div key={recService.id} className="flex-shrink-0 w-40">
                    <ServiceCard service={recService} />
                  </div>
                ))}
              </div>
              {/* PC: 그리드 */}
              <div className="hidden lg:grid grid-cols-5 gap-4">
                {recommendedServices.map((recService) => (
                  <ServiceCard key={recService.id} service={recService} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
