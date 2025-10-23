'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FULL_CATEGORIES } from '@/data/categories-full'

export default function CategoryGrid() {
  const [showAllCategories, setShowAllCategories] = useState(false)

  // Filter to get only top-level categories
  const topLevelCategories = FULL_CATEGORIES.filter(cat => cat.parent_id === undefined)

  const initialVisibleCount = 11; // Show 11 categories + 1 "View All" button = 12 items in the first row
  const categoriesInFirstRow = topLevelCategories.slice(0, initialVisibleCount);
  const remainingCategories = topLevelCategories.slice(initialVisibleCount);

  const hasMoreCategories = topLevelCategories.length > initialVisibleCount;

  // Define bright Tailwind colors for hover effect
  const brightColors = [
    'text-red-500', 'text-blue-500', 'text-green-500', 'text-yellow-500',
    'text-purple-500', 'text-pink-500', 'text-indigo-500', 'text-teal-500',
    'text-orange-500', 'text-cyan-500', 'text-lime-500', 'text-fuchsia-500',
  ];

  return (
    <section className="py-8 bg-white">
      <div className="container-1200">
        <div className="flex items-center justify-between mb-4">
          {/* Removed h2 title "카테고리" as per instruction */}
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-4 items-center justify-between"> {/* Increased gap-x and added justify-between */}
          {categoriesInFirstRow.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className={`text-4xl mb-1 h-12 w-12 flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[index % brightColors.length]} group-hover:bg-current group-hover:text-white`}>
                {category.icon === 'robot' && <i className="fas fa-robot"></i>}
                {category.icon === 'palette' && <i className="fas fa-palette"></i>}
                {category.icon === 'code' && <i className="fas fa-code"></i>}
                {category.icon === 'bullhorn' && <i className="fas fa-bullhorn"></i>}
                {category.icon === 'camera' && <i className="fas fa-camera"></i>}
                {category.icon === 'language' && <i className="fas fa-language"></i>}
                {category.icon === 'pen-fancy' && <i className="fas fa-pen-fancy"></i>}
                {category.icon === 'briefcase' && <i className="fas fa-briefcase"></i>}
                {category.icon === 'book' && <i className="fas fa-book"></i>}
                {category.icon === 'music' && <i className="fas fa-music"></i>}
                {category.icon === 'calendar' && <i className="fas fa-calendar"></i>}
                {category.icon === 'spa' && <i className="fas fa-spa"></i>}
                {category.icon === 'bullseye' && <i className="fas fa-bullseye"></i>}
                {category.icon === 'star' && <i className="fas fa-star"></i>}
                {category.icon === 'book-open' && <i className="fas fa-book-open"></i>}
                {category.icon === 'gavel' && <i className="fas fa-gavel"></i>}
                {category.icon === 'hammer' && <i className="fas fa-hammer"></i>}
                {category.icon === 'graduation-cap' && <i className="fas fa-graduation-cap"></i>}
                {category.icon === 'chart-line' && <i className="fas fa-chart-line"></i>}
                {!category.icon && <i className="fas fa-circle"></i>}
              </div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-[#0f3460] transition-colors duration-200">{category.name}</div>
            </Link>
          ))}

          {hasMoreCategories && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="flex flex-col items-center justify-center h-20 w-20 bg-gray-100 text-gray-500 hover:bg-[#0f3460] hover:text-white transition-all duration-200 cursor-pointer rounded-lg"
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
          <div className="flex flex-wrap gap-x-8 gap-y-4 items-center mt-4"> {/* Increased gap-x and added justify-between */}
            {remainingCategories.map((category, index) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className={`text-4xl mb-1 h-12 w-12 flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[(index + initialVisibleCount) % brightColors.length]} group-hover:bg-current group-hover:text-white`}>
                  {category.icon === 'robot' && <i className="fas fa-robot"></i>}
                  {category.icon === 'palette' && <i className="fas fa-palette"></i>}
                  {category.icon === 'code' && <i className="fas fa-code"></i>}
                  {category.icon === 'bullhorn' && <i className="fas fa-bullhorn"></i>}
                  {category.icon === 'camera' && <i className="fas fa-camera"></i>}
                  {category.icon === 'language' && <i className="fas fa-language"></i>}
                  {category.icon === 'pen-fancy' && <i className="fas fa-pen-fancy"></i>}
                  {category.icon === 'briefcase' && <i className="fas fa-briefcase"></i>}
                  {category.icon === 'book' && <i className="fas fa-book"></i>}
                  {category.icon === 'music' && <i className="fas fa-music"></i>}
                  {category.icon === 'calendar' && <i className="fas fa-calendar"></i>}
                  {category.icon === 'spa' && <i className="fas fa-spa"></i>}
                  {category.icon === 'bullseye' && <i className="fas fa-bullseye"></i>}
                  {category.icon === 'star' && <i className="fas fa-star"></i>}
                  {category.icon === 'book-open' && <i className="fas fa-book-open"></i>}
                  {category.icon === 'gavel' && <i className="fas fa-gavel"></i>}
                  {category.icon === 'hammer' && <i className="fas fa-hammer"></i>}
                  {category.icon === 'graduation-cap' && <i className="fas fa-graduation-cap"></i>}
                  {category.icon === 'chart-line' && <i className="fas fa-chart-line"></i>}
                  {!category.icon && <i className="fas fa-circle"></i>}
                </div>
                <div className="text-sm font-medium text-gray-700 group-hover:text-[#0f3460] transition-colors duration-200">{category.name}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
