'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [showSearch, setShowSearch] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* 모바일 하단 네비게이션 - 모바일에서만 표시 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-40 safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          {/* 홈 */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              isActive('/') ? 'text-[#0f3460]' : 'text-gray-500'
            }`}
          >
            <i className="fas fa-home text-xl"></i>
            <span className="text-xs font-medium">홈</span>
          </Link>

          {/* 카테고리 */}
          <Link
            href="/categories"
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              pathname.startsWith('/categories') ? 'text-[#0f3460]' : 'text-gray-500'
            }`}
          >
            <i className="fas fa-th text-xl"></i>
            <span className="text-xs font-medium">카테고리</span>
          </Link>

          {/* 검색 */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex flex-col items-center justify-center space-y-1 text-gray-500 transition-colors active:text-[#0f3460]"
          >
            <i className="fas fa-search text-xl"></i>
            <span className="text-xs font-medium">검색</span>
          </button>

          {/* 마이페이지 */}
          <Link
            href={user ? "/mypage/buyer/dashboard" : "/auth/login"}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              pathname.startsWith('/mypage') ? 'text-[#0f3460]' : 'text-gray-500'
            }`}
          >
            <i className="fas fa-user text-xl"></i>
            <span className="text-xs font-medium">MY</span>
          </Link>

          {/* 메뉴 */}
          <Link
            href="/menu"
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              pathname === '/menu' ? 'text-[#0f3460]' : 'text-gray-500'
            }`}
          >
            <i className="fas fa-bars text-xl"></i>
            <span className="text-xs font-medium">메뉴</span>
          </Link>
        </div>
      </nav>

      {/* 하단 네비게이션 공간 확보 */}
      <div className="h-16 lg:hidden"></div>

      {/* 모바일 검색 오버레이 */}
      {showSearch && (
        <div className="fixed inset-0 bg-white z-50 lg:hidden">
          <div className="flex items-center p-4 border-b border-gray-200">
            <button
              aria-label="뒤로가기"
              onClick={() => setShowSearch(false)}
              className="mr-4"
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <div className="flex-1 relative">
              <input
                id="search-mobile"
                name="search"
                type="text"
                placeholder="찾으시는 재능을 검색해보세요"
                className="w-full px-4 py-2 pr-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                autoComplete="off"
                autoFocus
              />
              <button
                aria-label="검색"
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <i className="fas fa-search text-gray-500"></i>
              </button>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-semibold mb-4">인기 검색어</h3>
            <div className="flex flex-wrap gap-2">
              {['로고 디자인', 'AI 이미지', '영상 편집', '번역', '블로그 작성', 'PPT 디자인'].map((keyword) => (
                <button
                  key={keyword}
                  className="px-3 py-1.5 bg-gray-100 rounded-full text-sm hover:bg-gray-200 hover:text-[#0f3460]"
                  onClick={() => {
                    // 검색 실행
                    setShowSearch(false)
                  }}
                >
                  {keyword}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="font-semibold mb-4">최근 검색</h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between">
                  <span className="text-gray-600">웹 개발</span>
                  <button aria-label="삭제" className="text-gray-400">
                    <i className="fas fa-times text-sm"></i>
                  </button>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-gray-600">로고 디자인</span>
                  <button aria-label="삭제" className="text-gray-400">
                    <i className="fas fa-times text-sm"></i>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  )
}