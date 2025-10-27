import { notFound } from 'next/navigation'
import { getCategoryBySlug, getCategoryPath, FULL_CATEGORIES, CategoryItem } from '@/data/categories-full'
import ServiceGrid from '@/components/services/ServiceGrid'
import CategoryFilter from '@/components/categories/CategoryFilter'
import CategorySidebar from '@/components/categories/CategorySidebar'
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
            <CategorySidebar
              categories={FULL_CATEGORIES}
              currentCategoryId={category.id}
              categoryPath={categoryPath}
            />

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