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
    name: '구매 내역',
    path: '/buyer/orders',
    icon: 'fa-shopping-bag',
  },
  {
    name: '찜한 서비스',
    path: '/buyer/favorites',
    icon: 'fa-heart',
  },
  {
    name: '메시지',
    path: '/buyer/messages',
    icon: 'fa-comment',
  },
  {
    name: '알림',
    path: '/buyer/notifications',
    icon: 'fa-bell',
  },
  {
    name: '설정',
    path: '/buyer/settings',
    icon: 'fa-cog',
  },
]

export default function BuyerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile } = useAuth()

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-20">
      {/* 모드 전환 버튼 */}
      {(profile?.user_type === 'seller' || profile?.user_type === 'both') && (
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => router.push('/seller/dashboard')}
            className="w-full px-4 py-2.5 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold"
          >
            <i className="fas fa-store mr-2"></i>
            판매자 페이지로
          </button>
        </div>
      )}

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

      {/* 하단 정보 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p className="font-semibold mb-1">구매자 모드</p>
          <p>서비스를 구매하고 관리하세요</p>
        </div>
      </div>
    </aside>
  )
}
