'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
}

interface Props {
  categoriesInFirstRow: Category[]
  remainingCategories: Category[]
  hasMoreCategories: boolean
  brightColors: string[]
  initialVisibleCount: number
}

function CategoryIcon({ icon, color }: { icon?: string; color: string }) {
  const iconClass = `${color}`

  if (icon === 'robot') return <i className={`fas fa-robot ${iconClass}`}></i>
  if (icon === 'palette') return <i className={`fas fa-palette ${iconClass}`}></i>
  if (icon === 'scissors') return <i className={`fas fa-scissors ${iconClass}`}></i>
  if (icon === 'code') return <i className={`fas fa-code ${iconClass}`}></i>
  if (icon === 'bullhorn') return <i className={`fas fa-bullhorn ${iconClass}`}></i>
  if (icon === 'camera') return <i className={`fas fa-camera ${iconClass}`}></i>
  if (icon === 'language') return <i className={`fas fa-language ${iconClass}`}></i>
  if (icon === 'pen-fancy') return <i className={`fas fa-pen-fancy ${iconClass}`}></i>
  if (icon === 'briefcase') return <i className={`fas fa-briefcase ${iconClass}`}></i>
  if (icon === 'book') return <i className={`fas fa-book ${iconClass}`}></i>
  if (icon === 'music') return <i className={`fas fa-music ${iconClass}`}></i>
  if (icon === 'calendar') return <i className={`fas fa-calendar ${iconClass}`}></i>
  if (icon === 'spa') return <i className={`fas fa-spa ${iconClass}`}></i>
  if (icon === 'bullseye') return <i className={`fas fa-bullseye ${iconClass}`}></i>
  if (icon === 'star') return <i className={`fas fa-star ${iconClass}`}></i>
  if (icon === 'book-open') return <i className={`fas fa-book-open ${iconClass}`}></i>
  if (icon === 'gavel') return <i className={`fas fa-gavel ${iconClass}`}></i>
  if (icon === 'hammer') return <i className={`fas fa-hammer ${iconClass}`}></i>
  if (icon === 'graduation-cap') return <i className={`fas fa-graduation-cap ${iconClass}`}></i>
  if (icon === 'chart-line') return <i className={`fas fa-chart-line ${iconClass}`}></i>
  if (icon === 'home') return <i className={`fas fa-home ${iconClass}`}></i>
  if (icon === 'motorcycle') return <i className={`fas fa-motorcycle ${iconClass}`}></i>

  return <i className={`fas fa-circle ${iconClass}`}></i>
}

export default function CategoryGridClient({
  categoriesInFirstRow,
  remainingCategories,
  hasMoreCategories,
  brightColors,
  initialVisibleCount
}: Props) {
  const [showAllCategories, setShowAllCategories] = useState(false)

  return (
    <>
      <div className="hidden lg:flex flex-wrap gap-x-3 sm:gap-x-6 md:gap-x-8 gap-y-3 sm:gap-y-4 items-center justify-between">
        {categoriesInFirstRow.map((category, index) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`text-2xl sm:text-3xl md:text-4xl mb-1 h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[index % brightColors.length]} group-hover:text-brand-primary`}>
              <CategoryIcon icon={category.icon} color="" />
            </div>
            <div className="text-gray-700 group-hover:text-brand-primary transition-colors duration-200 font-bold text-xs sm:text-sm md:text-[15px] text-center">{category.name}</div>
          </Link>
        ))}

        {hasMoreCategories && (
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="flex flex-col items-center justify-center h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 bg-gray-100 text-gray-500 hover:bg-brand-primary hover:text-white transition-all duration-200 cursor-pointer rounded-lg"
          >
            <div className="grid grid-cols-2 gap-1">
              <i className={`fas ${showAllCategories ? 'fa-minus' : 'fa-th'} text-lg`}></i>
              <i className={`fas ${showAllCategories ? 'fa-minus' : 'fa-th'} text-lg`}></i>
              <i className={`fas ${showAllCategories ? 'fa-minus' : 'fa-th'} text-lg`}></i>
              <i className={`fas ${showAllCategories ? 'fa-minus' : 'fa-th'} text-lg`}></i>
            </div>
            <span className="text-xs font-medium mt-1">{showAllCategories ? '간략히 보기' : '전체 보기'}</span>
          </button>
        )}
      </div>

      {showAllCategories && remainingCategories.length > 0 && (
        <div className="hidden lg:flex flex-wrap gap-x-8 gap-y-4 items-center mt-4">
          {remainingCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className={`text-4xl mb-1 h-12 w-12 flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[(index + initialVisibleCount) % brightColors.length]} group-hover:text-brand-primary`}>
                <CategoryIcon icon={category.icon} color="" />
              </div>
              <div className="text-gray-700 group-hover:text-brand-primary transition-colors duration-200 font-bold text-[15px]">{category.name}</div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
