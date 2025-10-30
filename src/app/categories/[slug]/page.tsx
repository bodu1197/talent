import { notFound } from 'next/navigation'
import { getCategoryBySlug, getCategoryPath, FULL_CATEGORIES, CategoryItem } from '@/data/categories-full'
import ServiceGrid from '@/components/services/ServiceGrid'
import CategoryFilter from '@/components/categories/CategoryFilter'
import CategorySidebar from '@/components/categories/CategorySidebar'
import CategoryVisitTracker from '@/components/categories/CategoryVisitTracker'
import Link from 'next/link'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params

  // 카테고리 찾기
  const category = getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  // 카테고리 경로 가져오기 (breadcrumb용)
  const categoryPath = getCategoryPath(category.id)

  // 1차 카테고리 확인 (parent_id가 없으면 1차 카테고리)
  const isTopLevelCategory = !category.parent_id

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 카테고리 방문 추적 (1차 카테고리만) */}
      <CategoryVisitTracker
        categoryId={category.id}
        categoryName={category.name}
        categorySlug={category.slug}
        isTopLevel={isTopLevelCategory}
      />
      {/* 카테고리 네비 및 서비스 목록 */}
      <section className="py-8">
        <div className="container-1200">
          <div className="flex gap-8">
            {/* 왼쪽 카테고리 네비게이션 */}
            <CategorySidebar
              categories={FULL_CATEGORIES}
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
                    <Link href="/" className="text-gray-500 hover:text-gray-700">홈</Link>
                    {categoryPath.map((cat, index) => (
                      <div key={cat.id} className="flex items-center gap-2">
                        <span className="text-gray-400">/</span>
                        {index === categoryPath.length - 1 ? (
                          <span className="text-gray-900 font-medium">{cat.name}</span>
                        ) : (
                          <Link href={`/categories/${cat.slug}`} className="text-gray-500 hover:text-gray-700">
                            {cat.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </nav>

                  {/* 정렬 */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-medium text-sm">정렬:</span>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent text-sm">
                      <option value="popular">인기순</option>
                      <option value="latest">최신순</option>
                      <option value="price_low">가격 낮은순</option>
                      <option value="price_high">가격 높은순</option>
                      <option value="rating">평점순</option>
                    </select>
                  </div>
                </div>

                {/* 필터 영역 */}
                <CategoryFilter categoryId={category.id} isAI={category.is_ai || false} />
              </div>

              {/* 서비스 그리드 */}
              <ServiceGrid categoryId={category.id} />
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}

// 정적 경로 생성
export async function generateStaticParams() {
  const paths: { slug: string }[] = []

  const addPaths = (categories: typeof FULL_CATEGORIES) => {
    categories.forEach(category => {
      paths.push({ slug: category.slug })
      if (category.children) {
        addPaths(category.children as any)
      }
    })
  }

  addPaths(FULL_CATEGORIES)
  return paths
}