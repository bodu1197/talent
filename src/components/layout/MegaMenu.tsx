'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { FULL_CATEGORIES } from '@/data/categories-full'
import { CategoryItem } from '@/data/categories-full'

export default function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // 마우스 벗어날 때 지연 후 닫기
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null)
      setIsOpen(false)
    }, 300)
  }

  // 마우스 진입 시 타이머 취소
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  // 카테고리 호버
  const handleCategoryHover = (categoryId: string) => {
    handleMouseEnter()
    setActiveCategory(categoryId)
    setIsOpen(true)
  }

  // 카테고리 클릭 시 메뉴 닫기
  const handleCategoryClick = () => {
    setIsOpen(false)
    setActiveCategory(null)
  }

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setActiveCategory(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 현재 활성 카테고리의 하위 카테고리 가져오기
  const getActiveSubCategories = (): CategoryItem['children'] => {
    if (!activeCategory) return []
    const category = FULL_CATEGORIES.find(cat => cat.id === activeCategory)
    return category?.children || []
  }

  return (
    <div className="relative max-lg:hidden" ref={menuRef}>
      {/* 메인 카테고리 바 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-1200">
          <nav className="flex items-center justify-between">
            <div className="flex items-center">
              {/* 전체 카테고리 버튼 */}
              <button
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 font-medium border-r border-gray-200 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>전체 카테고리</span>
              </button>

              {/* 인기 카테고리 퀵링크 - AI와 IT는 고정, 나머지는 인기도 순 */}
              <div className="flex items-center gap-6 px-6">
                {/* AI 서비스 (고정) */}
                <Link href="/categories/ai-services" className="text-[#0f3460] font-medium hover:text-[#1a4b7d] flex items-center gap-1">
                  <i className="fas fa-robot"></i> AI 서비스
                </Link>

                {/* IT/프로그래밍 (고정) */}
                <Link href="/categories/it-programming" className="hover:text-gray-900">
                  IT/프로그래밍
                </Link>

                {/* 인기도 순으로 상위 4개 표시 (AI, IT 제외) */}
                {FULL_CATEGORIES
                  .filter(cat => cat.id !== 'ai-services' && cat.id !== 'it-programming' && cat.popularity_score)
                  .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
                  .slice(0, 4)
                  .map(cat => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      className="hover:text-gray-900"
                    >
                      {cat.name}
                    </Link>
                  ))
                }
              </div>
            </div>

            {/* AI Hub 버튼 */}
            <Link
              href="/ai"
              className="flex items-center gap-2 px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm mr-4"
            >
              <i className="fas fa-robot"></i>
              <span>AI Hub</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* 메가 메뉴 드롭다운 */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="container-1200 py-6">
            <div className="grid grid-cols-12 gap-8">
              {/* 왼쪽: 대분류 카테고리 */}
              <div className="col-span-3 border-r border-gray-200 pr-6">
                <div>
                  {FULL_CATEGORIES.map((category) => (
                    <div key={category.id} className="mb-1">
                      <Link
                        href={`/categories/${category.slug}`}
                        className={`flex items-center justify-between px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                          activeCategory === category.id
                            ? 'bg-gray-100 text-gray-800'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onMouseEnter={() => handleCategoryHover(category.id)}
                        onClick={handleCategoryClick}
                      >
                        <div className="flex items-center gap-3">
                          {category.icon && (
                            <i className={`fas fa-${category.icon} text-lg`}></i>
                          )}
                          <span>{category.name}</span>
                          {category.is_ai && (
                            <span className="text-xs bg-blue-100 text-[#0f3460] px-1.5 py-0.5 rounded">AI</span>
                          )}
                        </div>
                        <i className="fas fa-chevron-right text-xs text-gray-400"></i>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* 오른쪽: 하위 카테고리 */}
              <div className="col-span-9">
                {activeCategory && (
                  <>


                    <div className="grid grid-cols-4 gap-4">
                      {getActiveSubCategories()?.map((subCategory) => (
                        <div key={subCategory.id} className="flex flex-col gap-2">
                          <h4 className="font-semibold text-sm">
                            <Link
                              href={`/categories/${subCategory.slug}`}
                              className="hover:text-[#0f3460]"
                              onClick={handleCategoryClick}
                            >
                              {subCategory.name}
                            </Link>
                          </h4>
                          {subCategory.children && (
                            <ul className="flex flex-col gap-1">
                              {subCategory.children.map((item) => (
                                <li key={item.id}>
                                  <Link
                                    href={`/categories/${item.slug}`}
                                    className="text-xs text-gray-600 hover:text-[#0f3460] flex items-center gap-1"
                                    onClick={handleCategoryClick}
                                  >
                                    {item.name}
                                    {item.is_popular && (
                                      <span className="text-xs text-red-500">HOT</span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* AI 카테고리인 경우 키워드 표시 */}
                    {FULL_CATEGORIES.find(cat => cat.id === activeCategory)?.is_ai && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">인기 AI 툴</h4>
                        <div className="flex flex-wrap gap-2">
                          {getActiveSubCategories()?.map(sub =>
                            sub.keywords?.map(keyword => (
                              <span
                                key={keyword}
                                className="px-3 py-1 bg-blue-50 text-[#0f3460] text-sm rounded-full"
                              >
                                {keyword}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 기본 상태 - 인기 카테고리 */}
                {!activeCategory && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <i className="fas fa-fire text-red-500"></i> 인기 카테고리
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      {FULL_CATEGORIES.flatMap(cat =>
                        cat.children?.flatMap(sub =>
                          sub.children?.filter(item => item.is_popular) || []
                        ) || []
                      ).slice(0, 16).map((item) => (
                        <Link
                          key={item.id}
                          href={`/categories/${item.slug}`}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-[#0f3460] transition-colors"
                          onClick={handleCategoryClick}
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-red-500">HOT</span>
                        </Link>
                      ))}
                    </div>


                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}