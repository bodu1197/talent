'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FULL_CATEGORIES } from '@/data/categories-full'

export default function AllCategories() {
  const [showAllCategories, setShowAllCategories] = useState(false)

  // 20개 카테고리 데이터
  const categories = FULL_CATEGORIES

  return (
    <>
      {/* 전체 카테고리 섹션 */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">전체 카테고리</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="bg-white rounded-xl p-7 text-center cursor-pointer transition-all duration-300 border border-gray-200 hover:-translate-y-3 hover:shadow-2xl hover:border-[#0f3460]"
              >
                <div className="text-3xl mb-3 h-12 flex items-center justify-center" style={{ color: '#0f3460' }}>
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
                <div className="font-bold text-base mb-2">{category.name}</div>
                <div className="text-xs text-gray-500 font-medium">{category.service_count || 0}개 서비스</div>
              </Link>
            ))}

            {/* 더보기 버튼 */}
            <button
              onClick={() => setShowAllCategories(true)}
              className="bg-white rounded-xl p-7 text-center cursor-pointer transition-all duration-300 border border-gray-200 hover:-translate-y-3 hover:shadow-2xl hover:border-[#0f3460] flex flex-col items-center justify-center"
            >
              <div className="text-3xl mb-2 text-[#0f3460]">
                <i className="fas fa-ellipsis-h"></i>
              </div>
              <div className="font-bold text-base text-[#0f3460]">더보기</div>
            </button>
          </div>
        </div>
      </section>

      {/* 전체 카테고리 오버레이 */}
      {showAllCategories && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[80vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">전체 카테고리</h2>
              <button
                onClick={() => setShowAllCategories(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="border-b pb-4">
                  <h3 className="font-bold text-lg mb-3 flex items-center">
                    <span className="mr-2" style={{ color: '#0f3460' }}>
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
                    </span>
                    {category.name}
                  </h3>
                  <ul className="space-y-2">
                    {category.children?.slice(0, 4).map((subcategory) => (
                      <li key={subcategory.id}>
                        <Link
                          href={`/categories/${category.slug}/${subcategory.slug}`}
                          className="text-sm text-gray-600 hover:text-[#0f3460] hover:underline"
                          onClick={() => setShowAllCategories(false)}
                        >
                          {subcategory.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}