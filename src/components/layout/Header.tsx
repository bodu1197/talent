'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false)
        return
      }

      const { data } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setIsAdmin(!!data)
    }

    checkAdmin()
  }, [user, supabase])

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container-1200">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0f3460] rounded-lg flex items-center justify-center">
              <i className="fas fa-star text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold hidden sm:inline">돌파구</span>
            <span className="text-xl font-bold sm:hidden">돌파구</span>
          </Link>

          {/* 검색바 (데스크톱) */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="찾으시는 재능을 검색해보세요"
                className="w-full pl-4 pr-10 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f3460] focus:bg-white transition-all text-sm"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0f3460]">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>

          {/* 모바일 검색 버튼 */}
          <button className="lg:hidden p-2 text-gray-600 hover:text-gray-900">
            <i className="fas fa-search text-xl"></i>
          </button>

          {/* 네비게이션 메뉴 */}
          <nav className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              // 로그인 상태
              <>
                {/* 알림 */}
                <button className="relative p-2 text-gray-600 hover:text-gray-900">
                  <i className="far fa-bell text-xl"></i>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* 메시지 - 데스크톱만 */}
                <button className="hidden sm:block relative p-2 text-gray-600 hover:text-gray-900">
                  <i className="far fa-comment text-xl"></i>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* 프로필 드롭다운 */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-[#0f3460] rounded-full flex items-center justify-center text-white font-semibold">
                      {profile?.name?.[0] || <i className="fas fa-user text-sm"></i>}
                    </div>
                    <i className="fas fa-chevron-down text-xs text-gray-500 hidden sm:inline"></i>
                  </button>

                  {/* 드롭다운 메뉴 */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-semibold">{profile?.name || '사용자'}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>

                      {isAdmin && (
                        <>
                          <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-3 px-4 py-2 text-white bg-[#0f3460] hover:bg-[#1a4b7d] font-semibold"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <i className="fas fa-shield-alt w-4"></i>
                            관리자 페이지
                          </Link>
                          <div className="border-t border-gray-100 my-2"></div>
                        </>
                      )}

                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <i className="fas fa-user-circle w-4"></i>
                        마이페이지
                      </Link>

                      <button
                        onClick={async () => {
                          setIsMenuOpen(false)
                          await signOut()
                          router.push('/auth/login')
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        <i className="fas fa-sign-out-alt w-4"></i>
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // 비로그인 상태
              <>
                <Link
                  href="/expert/register"
                  className="px-3 py-1.5 text-gray-700 hover:text-gray-900 font-medium text-sm"
                >
                  전문가등록
                </Link>
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 text-gray-700 hover:text-gray-900 font-medium text-sm"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3 py-1.5 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] hover:shadow-lg transition-all font-medium text-sm"
                >
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}