import { notFound } from 'next/navigation'
import { getCategoryBySlug, getCategoryPath, FULL_CATEGORIES, CategoryItem } from '@/data/categories-full'
import ServiceGrid from '@/components/services/ServiceGrid'
import CategoryFilter from '@/components/categories/CategoryFilter'
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

  // 현재 카테고리 경로의 ID들을 Set으로 만들기
  const pathIds = new Set(categoryPath.map(c => c.id))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 카테고리 헤더 */}
      <div className="bg-gray-50 py-6 border-b">
        <div className="container-1200">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm">
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
        </div>
      </div>

      {/* 카테고리 네비 및 서비스 목록 */}
      <section className="py-8">
        <div className="container-1200">
          <div className="flex gap-8">
            {/* 왼쪽 카테고리 네비게이션 */}
            <aside className="w-64 flex-shrink-0 hidden lg:block">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="font-semibold text-lg mb-4">카테고리</h2>
                <div className="space-y-1">
                  {/* 전체 카테고리 트리 표시 */}
                  {FULL_CATEGORIES.map(category1 => (
                    <div key={category1.id}>
                      {/* 1차 카테고리 */}
                      <a
                        href={`/categories/${category1.slug}`}
                        className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          category1.id === category.id
                            ? 'bg-[#0f3460] text-white'
                            : 'hover:bg-gray-50 hover:text-[#0f3460]'
                        }`}
                      >
                        {category1.name}
                      </a>

                      {/* 2차 카테고리 (현재 경로에 1차가 포함되어 있으면 표시) */}
                      {pathIds.has(category1.id) && category1.children && (
                        <div className="ml-3 mt-1 space-y-1">
                          {category1.children.map(category2 => (
                            <div key={category2.id}>
                              <a
                                href={`/categories/${category2.slug}`}
                                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                                  category2.id === category.id
                                    ? 'bg-[#0f3460] text-white'
                                    : 'hover:bg-gray-50 hover:text-[#0f3460]'
                                }`}
                              >
                                {category2.name}
                              </a>

                              {/* 3차 카테고리 (현재 경로에 2차가 포함되어 있으면 표시) */}
                              {pathIds.has(category2.id) && category2.children && (
                                <div className="ml-3 mt-1 space-y-1">
                                  {category2.children.map(category3 => (
                                    <a
                                      key={category3.id}
                                      href={`/categories/${category3.slug}`}
                                      className={`block px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                        category3.id === category.id
                                          ? 'bg-[#0f3460] text-white'
                                          : 'hover:bg-gray-50 hover:text-[#0f3460]'
                                      }`}
                                    >
                                      {category3.name}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* 오른쪽 필터 및 서비스 그리드 */}
            <main className="flex-1">
              {/* 필터 영역 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
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