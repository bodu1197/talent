import { notFound } from 'next/navigation'
import { getCategoryBySlug as getCategory, getCategoryPath, getCachedCategoriesTree, getAllCategoriesForBuild } from '@/lib/categories'
import { getServicesByCategory } from '@/lib/supabase/queries/services'
import ServiceCard from '@/components/services/ServiceCard'
import CategoryFilter from '@/components/categories/CategoryFilter'
import CategorySort from '@/components/categories/CategorySort'
import CategorySidebar from '@/components/categories/CategorySidebar'
import CategoryVisitTracker from '@/components/categories/CategoryVisitTracker'
import Link from 'next/link'

// ISR 캐싱: 5분마다 재생성
export const revalidate = 300

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    sort?: string
    price?: string
  }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { sort = 'popular', price } = await searchParams

  // 카테고리 찾기
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  // 병렬 처리로 성능 향상
  const [categoryPath, allCategories, allServices] = await Promise.all([
    getCategoryPath(category.id),
    getCachedCategoriesTree(),
    getServicesByCategory(category.id, 100) // 최대 100개
  ])

  // 정렬 적용
  let services = [...allServices]
  switch (sort) {
    case 'latest':
      // created_at 기준 이미 정렬되어 있음
      break
    case 'price_low':
      services.sort((a, b) => (a.price || 0) - (b.price || 0))
      break
    case 'price_high':
      services.sort((a, b) => (b.price || 0) - (a.price || 0))
      break
    case 'rating':
      services.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      break
    case 'popular':
    default:
      services.sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0))
      break
  }

  // 가격 필터 적용
  if (price) {
    services = services.filter(service => {
      const servicePrice = service.price || 0
      switch (price) {
        case 'under-50000':
          return servicePrice < 50000
        case '50000-100000':
          return servicePrice >= 50000 && servicePrice < 100000
        case '100000-300000':
          return servicePrice >= 100000 && servicePrice < 300000
        case '300000-500000':
          return servicePrice >= 300000 && servicePrice < 500000
        case 'over-500000':
          return servicePrice >= 500000
        default:
          return true
      }
    })
  }

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
                  <CategorySort currentSort={sort} currentPrice={price} />
                </div>

                {/* 필터 영역 */}
                <CategoryFilter categoryId={category.id} isAI={category.is_ai || false} />
              </div>

              {/* 서비스 그리드 */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {services.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}

// 정적 경로 생성
export async function generateStaticParams() {
  const allCategories = await getAllCategoriesForBuild()
  const paths: { slug: string }[] = []

  const addPaths = (categories: typeof allCategories) => {
    categories.forEach(category => {
      paths.push({ slug: category.slug })
      if (category.children) {
        addPaths(category.children)
      }
    })
  }

  addPaths(allCategories)
  return paths
}