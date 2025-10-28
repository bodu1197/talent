'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
  children?: NavItem[]
}

interface SidebarProps {
  mode: 'seller' | 'buyer'
}

const sellerNavItems: NavItem[] = [
  {
    label: '판매 대시보드',
    href: '/mypage/seller/dashboard',
    icon: 'fa-chart-line'
  },
  {
    label: '주문 관리',
    href: '/mypage/seller/orders',
    icon: 'fa-box',
    children: [
      { label: '신규 주문', href: '/mypage/seller/orders?status=new', icon: '', badge: 0 },
      { label: '진행중', href: '/mypage/seller/orders?status=in_progress', icon: '' },
      { label: '수정 요청', href: '/mypage/seller/orders?status=revision', icon: '' },
      { label: '완료 대기', href: '/mypage/seller/orders?status=delivered', icon: '' },
      { label: '완료', href: '/mypage/seller/orders?status=completed', icon: '' },
      { label: '취소/환불', href: '/mypage/seller/orders?status=cancelled', icon: '' }
    ]
  },
  {
    label: '서비스 관리',
    href: '/mypage/seller/services',
    icon: 'fa-shopping-bag',
    children: [
      { label: '내 서비스', href: '/mypage/seller/services', icon: '' },
      { label: '서비스 등록', href: '/mypage/seller/services/new', icon: '' },
      { label: '통계', href: '/mypage/seller/services/statistics', icon: '' }
    ]
  },
  {
    label: '수익 관리',
    href: '/mypage/seller/earnings',
    icon: 'fa-sack-dollar',
    children: [
      { label: '정산 내역', href: '/mypage/seller/earnings', icon: '' },
      { label: '출금 신청', href: '/mypage/seller/earnings/withdraw', icon: '' },
      { label: '출금 내역', href: '/mypage/seller/earnings/history', icon: '' }
    ]
  },
  {
    label: '리뷰 관리',
    href: '/mypage/seller/reviews',
    icon: 'fa-star',
    badge: 0
  },
  {
    label: '메시지',
    href: '/mypage/messages',
    icon: 'fa-comment',
    badge: 0
  },
  {
    label: '포트폴리오',
    href: '/mypage/seller/portfolio',
    icon: 'fa-folder-open'
  },
  {
    label: '통계/분석',
    href: '/mypage/seller/statistics',
    icon: 'fa-chart-bar'
  },
  {
    label: '전문가 등급',
    href: '/mypage/seller/grade',
    icon: 'fa-trophy'
  },
  {
    label: '설정',
    href: '/mypage/settings',
    icon: 'fa-cog'
  }
]

const buyerNavItems: NavItem[] = [
  {
    label: '구매 대시보드',
    href: '/mypage/buyer/dashboard',
    icon: 'fa-chart-pie'
  },
  {
    label: '주문 내역',
    href: '/mypage/buyer/orders',
    icon: 'fa-shopping-cart',
    children: [
      { label: '전체', href: '/mypage/buyer/orders', icon: '' },
      { label: '진행중', href: '/mypage/buyer/orders?status=in_progress', icon: '', badge: 0 },
      { label: '도착 확인 대기', href: '/mypage/buyer/orders?status=delivered', icon: '', badge: 0 },
      { label: '완료', href: '/mypage/buyer/orders?status=completed', icon: '' },
      { label: '취소/환불', href: '/mypage/buyer/orders?status=cancelled', icon: '' }
    ]
  },
  {
    label: '리뷰 관리',
    href: '/mypage/buyer/reviews',
    icon: 'fa-star',
    children: [
      { label: '작성 가능', href: '/mypage/buyer/reviews?tab=pending', icon: '', badge: 0 },
      { label: '작성한 리뷰', href: '/mypage/buyer/reviews?tab=written', icon: '' }
    ]
  },
  {
    label: '찜 목록',
    href: '/mypage/buyer/favorites',
    icon: 'fa-heart'
  },
  {
    label: '쿠폰/캐시',
    href: '/mypage/buyer/coupons',
    icon: 'fa-ticket',
    children: [
      { label: '보유 쿠폰', href: '/mypage/buyer/coupons', icon: '' },
      { label: '캐시 충전', href: '/mypage/buyer/coupons/charge', icon: '' },
      { label: '사용 내역', href: '/mypage/buyer/coupons/history', icon: '' }
    ]
  },
  {
    label: '메시지',
    href: '/mypage/messages',
    icon: 'fa-comment',
    badge: 0
  },
  {
    label: '견적 요청 내역',
    href: '/mypage/buyer/quotes',
    icon: 'fa-file-invoice'
  },
  {
    label: '설정',
    href: '/mypage/settings',
    icon: 'fa-cog'
  }
]

export default function Sidebar({ mode }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const navItems = mode === 'seller' ? sellerNavItems : buyerNavItems

  const toggleExpand = (href: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(href)) {
        newSet.delete(href)
      } else {
        newSet.add(href)
      }
      return newSet
    })
  }

  const isActive = (href: string) => {
    if (href === pathname) return true
    if (pathname.startsWith(href) && href !== '/mypage') return true
    return false
  }

  return (
    <aside className="hidden lg:flex w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto flex-col">
      <div className="p-4 flex-1">
        {/* 홈으로 가기 버튼 */}
        <div className="mb-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#0f3460] text-white hover:bg-[#1a4b7d] rounded-lg transition-colors text-sm font-medium"
          >
            <i className="fas fa-home"></i>
            <span>홈으로</span>
          </Link>
        </div>

        {/* 모드 전환 버튼 */}
        <div className="mb-6">
          <Link
            href={mode === 'seller' ? '/mypage/buyer/dashboard' : '/mypage/seller/dashboard'}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
          >
            <i className={`fas ${mode === 'seller' ? 'fa-shopping-cart' : 'fa-store'}`}></i>
            <span>{mode === 'seller' ? '구매자 페이지로' : '판매자 페이지로'}</span>
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav>
          {navItems.map((item) => (
            <div key={item.href} className="mb-1">
              {/* 메인 아이템 */}
              <div
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  isActive(item.href)
                    ? 'bg-[#0f3460] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => {
                  if (item.children) {
                    toggleExpand(item.href)
                  }
                }}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-3 flex-1"
                  onClick={(e) => {
                    if (item.children) {
                      e.preventDefault()
                    }
                  }}
                >
                  <i className={`fas ${item.icon} text-base`}></i>
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
                {item.children && (
                  <i
                    className={`fas fa-chevron-down text-xs transition-transform duration-200 ${
                      expandedItems.has(item.href) ? 'rotate-180' : ''
                    }`}
                  ></i>
                )}
              </div>

              {/* 하위 메뉴 */}
              {item.children && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedItems.has(item.href) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="ml-4 mt-1 border-l-2 border-gray-200 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center justify-between px-3 py-2 text-sm rounded transition-colors ${
                          isActive(child.href)
                            ? 'text-[#0f3460] font-medium bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <span>{child.label}</span>
                        {child.badge !== undefined && child.badge > 0 && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
