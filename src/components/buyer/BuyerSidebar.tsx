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
  const { profile, user } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto z-10 pt-16">
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

    </aside>
  )
}
