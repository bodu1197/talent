import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getCategoryBySlug as getCategory,
  getCategoryPath,
  getCachedCategoriesTree,
  getAllCategoriesForBuild,
} from '@/lib/categories';
import { getServicesByCategory } from '@/lib/supabase/queries/services';
import ServiceGrid from '@/components/categories/ServiceGrid';
import CategoryFilter from '@/components/categories/CategoryFilter';
import CategorySort from '@/components/categories/CategorySort';
import CategorySidebar from '@/components/categories/CategorySidebar';
import CategoryVisitTracker from '@/components/categories/CategoryVisitTracker';
import LocationSortToggle from '@/components/categories/LocationSortToggle';
import CategoryTreeSelect from '@/components/categories/CategoryTreeSelect';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { logger } from '@/lib/logger';
import { isOfflineCategory } from '@/lib/constants/categories';

// ISR 캐싱: 광고 우선순위 테스트를 위해 일시적으로 비활성화
export const revalidate = 0;

// generateMetadata - 동적 SEO 메타데이터 생성
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug, false);

  if (!category) {
    return {
      title: '카테고리를 찾을 수 없습니다 | 돌파구',
      description: '요청하신 카테고리를 찾을 수 없습니다.',
    };
  }

  const categoryPath = await getCategoryPath(category.id, false);
  const pathNames = categoryPath.map((c) => c.name).join(' > ');
  const description = `${category.name} 분야의 전문가를 찾아보세요. 돌파구에서 ${category.name} 관련 다양한 서비스와 전문가를 만나보세요.`;

  return {
    title: `${category.name} 전문가 찾기 | 돌파구`,
    description,
    keywords: [category.name, '전문가', '서비스', '돌파구', pathNames, `${category.name} 전문가`],
    openGraph: {
      title: `${category.name} 전문가 찾기 | 돌파구`,
      description,
      type: 'website',
      url: `https://dolpagu.com/categories/${slug}`,
      siteName: '돌파구',
      images: [
        {
          url: 'https://dolpagu.com/og-default.png',
          width: 1200,
          height: 630,
          alt: `${category.name} - 돌파구`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} 전문가 찾기`,
      description,
      images: ['https://dolpagu.com/og-default.png'],
    },
    alternates: {
      canonical: `https://dolpagu.com/categories/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// JSON-LD 구조화 데이터 생성 함수 (카테고리/컬렉션 페이지용)
function generateCategoryJsonLd(
  category: { id: string; name: string; slug: string; description?: string | null },
  categoryPath: { id: string; name: string; slug: string }[],
  serviceCount: number
) {
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: '홈', item: 'https://dolpagu.com/' },
    ...categoryPath.map((cat, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: cat.name,
      item: `https://dolpagu.com/categories/${cat.slug}`,
    })),
  ];

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${category.name} 전문가 찾기`,
      description:
        category.description ||
        `${category.name} 분야의 전문가를 찾아보세요. 돌파구에서 다양한 서비스와 전문가를 만나보세요.`,
      url: `https://dolpagu.com/categories/${category.slug}`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: serviceCount,
        itemListElement: [],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems,
    },
  ];
}

interface CategoryPageProps {
  readonly params: Promise<{
    slug: string;
  }>;
  readonly searchParams: Promise<{
    page?: string;
    lat?: string; // 사용자 위치 위도 (거리순 정렬용)
    lng?: string; // 사용자 위치 경도 (거리순 정렬용)
  }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam, lat: latParam, lng: lngParam } = await searchParams;
  const currentPage = Number.parseInt(pageParam || '1', 10);

  // 위치 정보 파싱 (거리순 정렬용)
  const userLocation =
    latParam && lngParam
      ? {
          lat: parseFloat(latParam),
          lng: parseFloat(lngParam),
        }
      : undefined;

  // 카테고리 찾기 (인증 불필요, 캐싱 가능)
  const category = await getCategory(slug, false);

  if (!category) {
    notFound();
  }

  // category.id가 유효한지 확인
  if (!category.id) {
    logger.error('[CategoryPage] category.id is invalid', { categoryId: category.id, slug });
    notFound();
  }

  // 병렬 처리로 성능 향상 (모두 인증 불필요, 캐싱 가능)
  const [categoryPath, allCategories, services] = await Promise.all([
    getCategoryPath(category.id, false),
    getCachedCategoriesTree(false),
    getServicesByCategory(category.id, 1000, false, currentPage, userLocation), // 위치 제공 시 거리순 정렬
  ]);

  // 페이지네이션 URL 생성 헬퍼 함수
  const buildPageUrl = (pageNum: number): string => {
    const locationParams = userLocation ? `&lat=${userLocation.lat}&lng=${userLocation.lng}` : '';
    return `/categories/${slug}?page=${pageNum}${locationParams}`;
  };

  // 오프라인 카테고리 여부 확인 (1차 카테고리 기준)
  const rootCategorySlug = categoryPath.length > 0 ? categoryPath[0].slug : slug;
  const isOfflineCategoryPage = isOfflineCategory(rootCategorySlug);

  // 1차 카테고리와 하위 카테고리 트리 추출 (CategoryTreeSelect용)
  const rootCategory = allCategories.find((c) => c.slug === rootCategorySlug);
  const rootCategoryName = rootCategory?.name || category.name;
  const subCategories = rootCategory?.children || [];

  // JSON-LD 구조화 데이터 준비
  const jsonLd = generateCategoryJsonLd(category, categoryPath, services.length);

  return (
    <>
      {/* JSON-LD 구조화 데이터 (SEO/AI 최적화) */}
      {jsonLd.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      <div className="min-h-screen bg-gray-50">
        {/* 카테고리 방문 추적 (모든 카테고리) */}
        <CategoryVisitTracker
          categoryId={category.id}
          categoryName={category.name}
          categorySlug={category.slug}
          isTopLevel={true}
        />
        {/* 카테고리 네비 및 서비스 목록 */}
        <section className="py-8">
          <div className="container-1200">
            <div className="flex gap-8">
              {/* 왼쪽 카테고리 네비게이션 */}
              <CategorySidebar
                categories={allCategories}
                currentCategoryId={category.id}
                categoryPath={categoryPath}
              />

              {/* 오른쪽 필터 및 서비스 그리드 */}
              <main className="flex-1">
                {/* Breadcrumb + 필터/정렬 */}
                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
                  {/* 빵조각 + 거리순 버튼 (같은 줄) */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-wrap min-w-0">
                      <Link
                        href="/"
                        className="text-gray-500 hover:text-gray-700 whitespace-nowrap"
                      >
                        홈
                      </Link>
                      {categoryPath.map((cat, index) => (
                        <div key={cat.id} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <span className="text-gray-400">/</span>
                          {index === categoryPath.length - 1 ? (
                            <span className="text-gray-900 font-medium truncate">{cat.name}</span>
                          ) : (
                            <Link
                              href={`/categories/${cat.slug}`}
                              className="text-gray-500 hover:text-gray-700 truncate"
                            >
                              {cat.name}
                            </Link>
                          )}
                        </div>
                      ))}
                    </nav>

                    {/* 거리순 버튼 (오프라인 카테고리에서만) */}
                    {isOfflineCategoryPage && <LocationSortToggle />}
                  </div>

                  {/* 카테고리 선택 + 필터 + 정렬 */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {/* 카테고리 트리 선택 (하위 카테고리가 있는 경우만) */}
                    {subCategories.length > 0 && (
                      <CategoryTreeSelect
                        categories={subCategories}
                        currentCategoryId={category.id}
                        rootCategoryName={rootCategoryName}
                        rootCategorySlug={rootCategorySlug}
                      />
                    )}
                    <CategoryFilter categoryId={category.id} isAI={category.is_ai || false} />
                    <div className="ml-auto">
                      <CategorySort currentSort="popular" currentPrice="" />
                    </div>
                  </div>
                </div>

                {/* 서비스 그리드 */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  <ServiceGrid
                    initialServices={services}
                    categoryId={category.id}
                    page={currentPage}
                    showLocation={isOfflineCategoryPage}
                  />
                </div>

                {/* 페이지네이션 */}
                {services.length === 28 && (
                  <div className="flex justify-center gap-2">
                    {currentPage > 1 && (
                      <Link
                        href={buildPageUrl(currentPage - 1)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Link>
                    )}
                    <span className="px-4 py-2 bg-brand-primary text-white rounded-lg">
                      {currentPage}
                    </span>
                    <Link
                      href={buildPageUrl(currentPage + 1)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </main>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// 정적 경로 생성
export async function generateStaticParams() {
  const allCategories = await getAllCategoriesForBuild();
  const paths: { slug: string }[] = [];

  const addPaths = (categories: typeof allCategories) => {
    for (const category of categories) {
      paths.push({ slug: category.slug });
      if (category.children) {
        addPaths(category.children);
      }
    }
  };

  addPaths(allCategories);
  return paths;
}
