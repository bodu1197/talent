'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

interface MenuItem {
  name: string
  path: string
  icon: string
  badge?: number
}

const menuItems: MenuItem[] = [
  {
    name: '대시보드',
    path: '/seller/dashboard',
    icon: 'fa-chart-line',
  },
  {
    name: '서비스 등록',
    path: '/services/new',
    icon: 'fa-plus-circle',
  },
  {
    name: '서비스 관리',
    path: '/seller/services',
    icon: 'fa-briefcase',
  },
  {
    name: '주문 관리',
    path: '/seller/orders',
    icon: 'fa-shopping-cart',
  },
  {
    name: '수익/정산',
    path: '/seller/settlements',
    icon: 'fa-money-bill-wave',
  },
  {
    name: '리뷰 관리',
    path: '/seller/reviews',
    icon: 'fa-star',
  },
  {
    name: '통계',
    path: '/seller/statistics',
    icon: 'fa-chart-pie',
  },
  {
    name: '프로필 설정',
    path: '/seller/profile',
    icon: 'fa-user-cog',
  },
]

export default function SellerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, user } = useAuth()

  return (
    <aside className="w-64 bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-20 self-start">
      {/* 프로필 섹션 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#0f3460] rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {profile?.name?.[0] || <i className="fas fa-user text-sm"></i>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{profile?.name || '사용자'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* 구매자 페이지로 전환 버튼 - 항상 표시 */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => router.push('/buyer/orders')}
          className="w-full px-4 py-2.5 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
        >
          <i className="fas fa-shopping-bag mr-2"></i>
          구매자 페이지로
        </button>
      </div>

      {/* 메뉴 항목 */}
      <nav className="py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/')

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-[#0f3460] text-white border-r-4 border-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              <span className="flex-1">{item.name}</span>
              {item.badge && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

    </aside>
  )
}
