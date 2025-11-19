import { notFound } from "next/navigation";
import {
  getCategoryBySlug as getCategory,
  getCategoryPath,
  getCachedCategoriesTree,
  getAllCategoriesForBuild,
} from "@/lib/categories";
import { getServicesByCategory } from "@/lib/supabase/queries/services";
import ServiceGrid from "@/components/categories/ServiceGrid";
import CategoryFilter from "@/components/categories/CategoryFilter";
import CategorySort from "@/components/categories/CategorySort";
import CategorySidebar from "@/components/categories/CategorySidebar";
import CategoryVisitTracker from "@/components/categories/CategoryVisitTracker";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// ISR 캐싱: 광고 우선순위 테스트를 위해 일시적으로 비활성화
export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Number.parseInt(pageParam || "1", 10);

  // 카테고리 찾기 (인증 불필요, 캐싱 가능)
  const category = await getCategory(slug, false);

  if (!category) {
    notFound();
  }

  // category.id가 유효한지 확인
  if (!category.id) {
    console.error(
      "[CategoryPage] category.id is invalid:",
      category.id,
      "slug:",
      slug,
    );
    notFound();
  }

  // 병렬 처리로 성능 향상 (모두 인증 불필요, 캐싱 가능)
  const [categoryPath, allCategories, services] = await Promise.all([
    getCategoryPath(category.id, false),
    getCachedCategoriesTree(false),
    getServicesByCategory(category.id, 1000, false, currentPage), // 모든 서비스 조회, 페이지네이션 적용
  ]);

  return (
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
              {/* Breadcrumb + 정렬 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  {/* Breadcrumb */}
                  <nav className="flex items-center gap-2 text-sm flex-wrap">
                    <Link
                      href="/"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      홈
                    </Link>
                    {categoryPath.map((cat, index) => (
                      <div key={cat.id} className="flex items-center gap-2">
                        <span className="text-gray-400">/</span>
                        {index === categoryPath.length - 1 ? (
                          <span className="text-gray-900 font-medium">
                            {cat.name}
                          </span>
                        ) : (
                          <Link
                            href={`/categories/${cat.slug}`}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {cat.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </nav>

                  {/* 정렬 */}
                  <CategorySort currentSort="popular" currentPrice="" />
                </div>

                {/* 필터 영역 */}
                <CategoryFilter
                  categoryId={category.id}
                  isAI={category.is_ai || false}
                />
              </div>

              {/* 서비스 그리드 */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                <ServiceGrid
                  initialServices={services}
                  categoryId={category.id}
                  page={currentPage}
                />
              </div>

              {/* 페이지네이션 */}
              {services.length === 28 && (
                <div className="flex justify-center gap-2">
                  {currentPage > 1 && (
                    <Link
                      href={`/categories/${slug}?page=${currentPage - 1}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <FaChevronLeft />
                    </Link>
                  )}
                  <span className="px-4 py-2 bg-brand-primary text-white rounded-lg">
                    {currentPage}
                  </span>
                  <Link
                    href={`/categories/${slug}?page=${currentPage + 1}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <FaChevronRight />
                  </Link>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}

// 정적 경로 생성
export async function generateStaticParams() {
  const allCategories = await getAllCategoriesForBuild();
  const paths: { slug: string }[] = [];

  const addPaths = (categories: typeof allCategories) => {
    categories.forEach((category) => {
      paths.push({ slug: category.slug });
      if (category.children) {
        addPaths(category.children);
      }
    });
  };

  addPaths(allCategories);
  return paths;
}
