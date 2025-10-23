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

  // 형제 카테고리 가져오기
  const getSiblingCategories = (): CategoryItem[] => {
    if (!category.parent_id) return []

    // 전체 카테고리에서 부모 찾기
    const findParent = (categories: CategoryItem[]): CategoryItem | null => {
      for (const cat of categories) {
        if (cat.id === category.parent_id) return cat
        if (cat.children) {
          const found = findParent(cat.children)
          if (found) return found
        }
      }
      return null
    }

    const parent = findParent(FULL_CATEGORIES)
    return parent?.children || []
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 카테고리 헤더 */}
      <div className="bg-gray-50 py-12 border-b">
        <div className="container-1200">
          <div className="max-w-4xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-2">
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



            {/* 하위 카테고리 또는 형제 카테고리 표시 */}
            {category.children && category.children.length > 0 ? (
              // 하위 카테고리가 있는 경우 하위 카테고리 표시
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {category.children.map(child => (
                    <a
                      key={child.id}
                      href={`/categories/${child.slug}`}
                      className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:border-[#0f3460] hover:text-[#0f3460] transition-colors"
                    >
                      {child.name}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              // 하위 카테고리가 없는 경우 (3차 카테고리) 형제 카테고리 표시
              getSiblingCategories().length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {getSiblingCategories().map(sibling => (
                      <a
                        key={sibling.id}
                        href={`/categories/${sibling.slug}`}
                        className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                          sibling.id === category.id
                            ? 'bg-[#0f3460] text-white border-[#0f3460]'
                            : 'bg-white border-gray-200 hover:border-[#0f3460] hover:text-[#0f3460]'
                        }`}
                      >
                        {sibling.name}
                      </a>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* 필터 및 서비스 목록 */}
      <section className="py-8">
        <div className="container-1200">
          <div className="flex gap-8">
            {/* 왼쪽 필터 */}
            <aside className="w-64 flex-shrink-0 hidden lg:block">
              <CategoryFilter categoryId={category.id} isAI={category.is_ai} />
            </aside>

            {/* 오른쪽 서비스 그리드 */}
            <main className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  <span className="font-semibold">1,234</span>개의 서비스
                </p>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent">
                  <option value="popular">인기순</option>
                  <option value="latest">최신순</option>
                  <option value="price_low">가격 낮은순</option>
                  <option value="price_high">가격 높은순</option>
                  <option value="rating">평점순</option>
                </select>
              </div>

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