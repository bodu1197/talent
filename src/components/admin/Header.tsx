'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminHeader() {
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex-shrink-0 z-20">
      <div className="h-full flex items-center justify-between px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="사용자, 서비스, 주문 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <i className="fas fa-bell text-gray-600 text-xl"></i>
          </button>

          {/* Quick Actions */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <i className="fas fa-plus text-gray-600 text-xl"></i>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white font-semibold">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-semibold text-gray-700">{user?.email || '관리자'}</div>
                <div className="text-xs text-gray-500">관리자</div>
              </div>
              <i className="fas fa-chevron-down text-gray-400 text-sm"></i>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <Link
                    href="/mypage/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <i className="fas fa-user w-5"></i> 프로필
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <i className="fas fa-cog w-5"></i> 설정
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={async () => {
                      await signOut()
                      router.push('/')
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <i className="fas fa-sign-out-alt w-5"></i> 로그아웃
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
