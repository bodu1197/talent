'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const menuItems = [
  { name: '대시보드', path: '/admin/dashboard', icon: 'fa-chart-line' },
  { name: '사용자 관리', path: '/admin/users', icon: 'fa-users' },
  { name: '서비스 관리', path: '/admin/services', icon: 'fa-briefcase' },
  { name: '수정 요청 관리', path: '/admin/service-revisions', icon: 'fa-edit' },
  { name: '주문 관리', path: '/admin/orders', icon: 'fa-shopping-cart' },
  { name: '정산 관리', path: '/admin/settlements', icon: 'fa-money-bill-wave' },
  { name: '리뷰 관리', path: '/admin/reviews', icon: 'fa-star' },
  { name: '신고 관리', path: '/admin/reports', icon: 'fa-flag' },
  { name: '분쟁 관리', path: '/admin/disputes', icon: 'fa-gavel' },
  { name: '카테고리 관리', path: '/admin/categories', icon: 'fa-folder-tree' },
  { name: '통계 분석', path: '/admin/statistics', icon: 'fa-chart-pie' },
  { name: '활동 로그', path: '/admin/logs', icon: 'fa-history' },
  { name: '시스템 설정', path: '/admin/settings', icon: 'fa-cog' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`flex-shrink-0 h-full bg-brand-primary text-white transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <i className="fas fa-shield-alt text-xl"></i>
            <span className="font-bold text-lg">Admin</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-white/10 rounded transition-colors"
        >
          <i className={`fas fa-${collapsed ? 'angle-right' : 'angle-left'}`}></i>
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 min-h-0">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/')

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors ${
                isActive ? 'bg-white/20 border-r-4 border-white' : ''
              }`}
              title={collapsed ? item.name : undefined}
            >
              <i className={`fas ${item.icon} ${collapsed ? 'text-lg' : 'w-5'}`}></i>
              {!collapsed && <span className="flex-1">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-white/10 p-4">
        {!collapsed && (
          <Link
            href="/"
            className="flex items-center gap-2 p-2 hover:bg-white/10 rounded transition-colors"
          >
            <i className="fas fa-home"></i>
            <span className="text-sm">사이트로 이동</span>
          </Link>
        )}
      </div>
    </aside>
  )
}
