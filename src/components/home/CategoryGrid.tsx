import Link from 'next/link'
import { FULL_CATEGORIES } from '@/data/categories-full'
import CategoryGridClient from './CategoryGridClient'

function CategoryIcon({ icon }: { icon?: string }) {
  if (icon === 'robot') return <i className="fas fa-robot"></i>
  if (icon === 'palette') return <i className="fas fa-palette"></i>
  if (icon === 'scissors') return <i className="fas fa-scissors"></i>
  if (icon === 'code') return <i className="fas fa-code"></i>
  if (icon === 'bullhorn') return <i className="fas fa-bullhorn"></i>
  if (icon === 'camera') return <i className="fas fa-camera"></i>
  if (icon === 'language') return <i className="fas fa-language"></i>
  if (icon === 'pen-fancy') return <i className="fas fa-pen-fancy"></i>
  if (icon === 'briefcase') return <i className="fas fa-briefcase"></i>
  if (icon === 'book') return <i className="fas fa-book"></i>
  if (icon === 'music') return <i className="fas fa-music"></i>
  if (icon === 'calendar') return <i className="fas fa-calendar"></i>
  if (icon === 'spa') return <i className="fas fa-spa"></i>
  if (icon === 'bullseye') return <i className="fas fa-bullseye"></i>
  if (icon === 'star') return <i className="fas fa-star"></i>
  if (icon === 'book-open') return <i className="fas fa-book-open"></i>
  if (icon === 'gavel') return <i className="fas fa-gavel"></i>
  if (icon === 'hammer') return <i className="fas fa-hammer"></i>
  if (icon === 'graduation-cap') return <i className="fas fa-graduation-cap"></i>
  if (icon === 'chart-line') return <i className="fas fa-chart-line"></i>
  if (icon === 'home') return <i className="fas fa-home"></i>
  if (icon === 'motorcycle') return <i className="fas fa-motorcycle"></i>

  return <i className="fas fa-circle"></i>
}

export default function CategoryGrid() {
  // Filter to get only top-level categories
  const topLevelCategories = FULL_CATEGORIES.filter(cat => cat.parent_id === undefined)

  const initialVisibleCount = 11
  const categoriesInFirstRow = topLevelCategories.slice(0, initialVisibleCount)
  const remainingCategories = topLevelCategories.slice(initialVisibleCount)
  const hasMoreCategories = topLevelCategories.length > initialVisibleCount

  const brightColors = [
    'text-red-500',
    'text-blue-500',
    'text-green-500',
    'text-yellow-500',
    'text-purple-500',
    'text-pink-500',
    'text-indigo-500',
    'text-teal-500',
    'text-orange-500',
    'text-cyan-500',
    'text-lime-500',
    'text-fuchsia-500',
  ]

  return (
    <section className="py-8 bg-white">
      <div className="container-1200">
        <div className="flex items-center justify-between mb-4">
          {/* Removed h2 title */}
        </div>

        {/* 모바일: 2줄 가로 스크롤 */}
        <div className="lg:hidden">
          <div className="flex flex-col gap-0">
            {/* 첫 번째 줄 */}
            <div className="flex gap-0 overflow-x-auto pb-2 scrollbar-hide">
              {topLevelCategories.slice(0, 11).map((category, index) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="flex flex-col items-center group cursor-pointer flex-shrink-0 w-[76px]"
                >
                  <div className={`text-[27px] mb-1 h-11 w-11 flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[index % brightColors.length]} group-hover:text-brand-primary`}>
                    <CategoryIcon icon={category.icon} />
                  </div>
                  <div className="text-gray-700 group-hover:text-brand-primary transition-colors duration-200 font-bold text-mobile-sm text-center w-[76px] whitespace-nowrap px-0">{category.name}</div>
                </Link>
              ))}
            </div>

            {/* 두 번째 줄 */}
            <div className="flex gap-0 overflow-x-auto pb-2 scrollbar-hide">
              {topLevelCategories.slice(11).map((category, index) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="flex flex-col items-center group cursor-pointer flex-shrink-0 w-[76px]"
                >
                  <div className={`text-[27px] mb-1 h-11 w-11 flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[(index + 11) % brightColors.length]} group-hover:text-brand-primary`}>
                    <CategoryIcon icon={category.icon} />
                  </div>
                  <div className="text-gray-700 group-hover:text-brand-primary transition-colors duration-200 font-bold text-mobile-sm text-center w-[76px] whitespace-nowrap px-0">{category.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* PC: 클라이언트 컴포넌트 사용 */}
        <CategoryGridClient
          categoriesInFirstRow={categoriesInFirstRow}
          remainingCategories={remainingCategories}
          hasMoreCategories={hasMoreCategories}
          brightColors={brightColors}
          initialVisibleCount={initialVisibleCount}
        />
      </div>
    </section>
  )
}
