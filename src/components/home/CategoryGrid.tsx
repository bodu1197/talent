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

  // Define bright colors for default state
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
  ];


  return (
    <section className="py-8 bg-white">
      <div className="container-1200">
        <div className="flex items-center justify-between mb-4">
          {/* Removed h2 title "카테고리" as per instruction */}
        </div>

        {/* 모바일: 2줄 가로 스크롤 */}
        <div className="lg:hidden">
          <div className="flex flex-col gap-0">
            {/* 첫 번째 줄 */}
            <div className="flex gap-[-20px] overflow-x-auto pb-2 scrollbar-hide">
              {topLevelCategories.slice(0, 11).map((category, index) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="flex flex-col items-center group cursor-pointer flex-shrink-0"
                >
                  <div className={`text-[27px] mb-1 h-11 w-11 flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[index % brightColors.length]} group-hover:text-[#0f3460]`}>
                    {category.icon === 'robot' && <i className="fas fa-robot"></i>}
                    {category.icon === 'palette' && <i className="fas fa-palette"></i>}
                    {category.icon === 'scissors' && <i className="fas fa-scissors"></i>}
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
                    {category.icon === 'home' && <i className="fas fa-home"></i>}
                    {category.icon === 'motorcycle' && <i className="fas fa-motorcycle"></i>}
                    {!category.icon && <i className="fas fa-circle"></i>}
                  </div>
                  <div className="text-gray-700 group-hover:text-[#0f3460] transition-colors duration-200 font-bold text-xs text-center w-24 whitespace-nowrap">{category.name}</div>
                </Link>
              ))}
            </div>

            {/* 두 번째 줄 */}
            <div className="flex gap-[-20px] overflow-x-auto pb-2 scrollbar-hide">
              {topLevelCategories.slice(11).map((category, index) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="flex flex-col items-center group cursor-pointer flex-shrink-0"
                >
                  <div className={`text-[27px] mb-1 h-11 w-11 flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[(index + 11) % brightColors.length]} group-hover:text-[#0f3460]`}>
                    {category.icon === 'robot' && <i className="fas fa-robot"></i>}
                    {category.icon === 'palette' && <i className="fas fa-palette"></i>}
                    {category.icon === 'scissors' && <i className="fas fa-scissors"></i>}
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
                    {category.icon === 'home' && <i className="fas fa-home"></i>}
                    {category.icon === 'motorcycle' && <i className="fas fa-motorcycle"></i>}
                    {!category.icon && <i className="fas fa-circle"></i>}
                  </div>
                  <div className="text-gray-700 group-hover:text-[#0f3460] transition-colors duration-200 font-bold text-xs text-center w-24 whitespace-nowrap">{category.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* PC: 기존 레이아웃 유지 */}
        <div className="hidden lg:flex flex-wrap gap-x-3 sm:gap-x-6 md:gap-x-8 gap-y-3 sm:gap-y-4 items-center justify-between">
          {categoriesInFirstRow.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className={`text-2xl sm:text-3xl md:text-4xl mb-1 h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[index % brightColors.length]} group-hover:text-[#0f3460]`}>
                {category.icon === 'robot' && <i className="fas fa-robot"></i>}
                {category.icon === 'palette' && <i className="fas fa-palette"></i>}
                {category.icon === 'scissors' && <i className="fas fa-scissors"></i>}
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
                {category.icon === 'home' && <i className="fas fa-home"></i>}
                {category.icon === 'motorcycle' && <i className="fas fa-motorcycle"></i>}
                {!category.icon && <i className="fas fa-circle"></i>}
              </div>
              <div className="text-gray-700 group-hover:text-[#0f3460] transition-colors duration-200 font-bold text-xs sm:text-sm md:text-[15px] text-center">{category.name}</div>
            </Link>
          ))}

          {hasMoreCategories && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="flex flex-col items-center justify-center h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 bg-gray-100 text-gray-500 hover:bg-[#0f3460] hover:text-white transition-all duration-200 cursor-pointer rounded-lg"
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
                <div className={`text-4xl mb-1 h-12 w-12 flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[(index + initialVisibleCount) % brightColors.length]} group-hover:text-[#0f3460]`}>
                  {category.icon === 'robot' && <i className="fas fa-robot"></i>}
                  {category.icon === 'palette' && <i className="fas fa-palette"></i>}
                  {category.icon === 'scissors' && <i className="fas fa-scissors"></i>}
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
                  {category.icon === 'home' && <i className="fas fa-home"></i>}
                  {category.icon === 'motorcycle' && <i className="fas fa-motorcycle"></i>}
                  {!category.icon && <i className="fas fa-circle"></i>}
                </div>
                <div className="text-gray-700 group-hover:text-[#0f3460] transition-colors duration-200 font-bold text-[15px]">{category.name}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
