import Link from 'next/link'
import { FULL_CATEGORIES } from '@/data/categories-full'

export const metadata = {
  title: '전체 카테고리 - AI Talent Hub',
  description: 'AI 재능 거래 플랫폼의 모든 카테고리를 둘러보세요',
}

export default function CategoriesPage() {
  // Get only top-level categories
  const topLevelCategories = FULL_CATEGORIES.filter(cat => cat.parent_id === undefined)

  const getIconClass = (iconName: string) => {
    const iconMap: Record<string, string> = {
      'robot': 'fa-robot',
      'palette': 'fa-palette',
      'scissors': 'fa-scissors',
      'code': 'fa-code',
      'bullhorn': 'fa-bullhorn',
      'camera': 'fa-camera',
      'language': 'fa-language',
      'pen-fancy': 'fa-pen-fancy',
      'briefcase': 'fa-briefcase',
      'book': 'fa-book',
      'music': 'fa-music',
      'calendar': 'fa-calendar',
      'spa': 'fa-spa',
      'bullseye': 'fa-bullseye',
      'star': 'fa-star',
      'book-open': 'fa-book-open',
      'gavel': 'fa-gavel',
      'hammer': 'fa-hammer',
      'graduation-cap': 'fa-graduation-cap',
      'chart-line': 'fa-chart-line',
      'home': 'fa-home',
      'motorcycle': 'fa-motorcycle',
    }
    return `fas ${iconMap[iconName] || 'fa-circle'}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container-1200 px-4">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            전체 카테고리
          </h1>
          <p className="text-gray-600">
            필요한 서비스를 카테고리별로 찾아보세요
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
          {topLevelCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="bg-white rounded-xl p-4 lg:p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3 lg:mb-4 group-hover:bg-blue-100 transition-colors">
                <i className={`${getIconClass(category.icon || '')} text-xl lg:text-2xl text-[#0f3460]`}></i>
              </div>
              <h3 className="font-semibold text-sm lg:text-base text-gray-900 mb-1">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-xs text-gray-500 line-clamp-2">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
