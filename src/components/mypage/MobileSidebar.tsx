'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MobileSidebarProps {
  mode: 'buyer' | 'seller' | 'admin'
}

export default function MobileSidebar({ mode }: MobileSidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const buyerMenuItems = [
    {
      icon: 'fa-home',
      label: '대시보드',
      href: '/mypage/buyer/dashboard',
    },
    {
      icon: 'fa-shopping-cart',
      label: '주문내역',
      href: '/mypage/buyer/orders',
    },
    {
      icon: 'fa-file-alt',
      label: '견적 요청',
      href: '/mypage/buyer/quotes',
    },
    {
      icon: 'fa-heart',
      label: '찜한 서비스',
      href: '/mypage/buyer/favorites',
    },
    {
      icon: 'fa-star',
      label: '내 리뷰',
      href: '/mypage/buyer/reviews',
    },
  ]

  const sellerMenuItems = [
    {
      icon: 'fa-home',
      label: '대시보드',
      href: '/mypage/seller/dashboard',
    },
    {
      icon: 'fa-box',
      label: '내 서비스',
      href: '/mypage/seller/services',
    },
    {
      icon: 'fa-clipboard-list',
      label: '주문 관리',
      href: '/mypage/seller/orders',
    },
    {
      icon: 'fa-chart-line',
      label: '수익 관리',
      href: '/mypage/seller/earnings',
    },
    {
      icon: 'fa-chart-bar',
      label: '통계/분석',
      href: '/mypage/seller/statistics',
    },
    {
      icon: 'fa-folder',
      label: '포트폴리오',
      href: '/mypage/seller/portfolio',
    },
    {
      icon: 'fa-star',
      label: '리뷰 관리',
      href: '/mypage/seller/reviews',
    },
  ]

  const adminMenuItems = [
    {
      icon: 'fa-home',
      label: '대시보드',
      href: '/admin/dashboard',
    },
    {
      icon: 'fa-users',
      label: '회원 관리',
      href: '/admin/users',
    },
    {
      icon: 'fa-box',
      label: '서비스 관리',
      href: '/admin/services',
    },
    {
      icon: 'fa-file-invoice',
      label: '주문 관리',
      href: '/admin/orders',
    },
    {
      icon: 'fa-tags',
      label: '카테고리 관리',
      href: '/admin/categories',
    },
    {
      icon: 'fa-dollar-sign',
      label: '정산 관리',
      href: '/admin/settlements',
    },
    {
      icon: 'fa-bullhorn',
      label: '광고 관리',
      href: '/admin/advertisements',
    },
    {
      icon: 'fa-question-circle',
      label: '문의 관리',
      href: '/admin/inquiries',
    },
    {
      icon: 'fa-flag',
      label: '신고 관리',
      href: '/admin/reports',
    },
  ]

  const menuItems = mode === 'buyer' ? buyerMenuItems : mode === 'seller' ? sellerMenuItems : adminMenuItems

  const getModeLabel = () => {
    switch (mode) {
      case 'buyer':
        return '구매자 페이지'
      case 'seller':
        return '판매자 페이지'
      case 'admin':
        return '관리자 페이지'
    }
  }

  return (
    <>
      {/* 햄버거 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        aria-label="메뉴 열기"
      >
        <i className="fas fa-bars text-xl text-gray-700"></i>
      </button>

      {/* 오버레이 */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 드로어 사이드바 */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-brand-primary text-white">
          <div>
            <div className="font-bold text-lg">{getModeLabel()}</div>
            <div className="text-sm opacity-90">메뉴</div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="메뉴 닫기"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* 메뉴 아이템 */}
        <nav className="p-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <i className={`fas ${item.icon} text-lg w-5 text-center`}></i>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <i className="fas fa-chevron-right ml-auto text-sm"></i>
                )}
              </Link>
            )
          })}
        </nav>

        {/* 하단 공통 메뉴 */}
        <div className="mt-auto p-4 border-t border-gray-200">
          <Link
            href="/chat"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
              pathname.startsWith('/chat')
                ? 'bg-brand-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <i className="fas fa-envelope text-lg w-5 text-center"></i>
            <span className="font-medium">메시지</span>
          </Link>

          <Link
            href="/mypage/settings"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
              pathname === '/mypage/settings'
                ? 'bg-brand-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <i className="fas fa-user text-lg w-5 text-center"></i>
            <span className="font-medium">프로필 설정</span>
          </Link>

          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <i className="fas fa-home text-lg w-5 text-center"></i>
            <span className="font-medium">홈으로</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
