'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

export default function Header() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

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

          {/* 네비게이션 메뉴 */}
          <nav className="flex items-center space-x-2 sm:space-x-4">
            {loading ? (
              // 로딩 중
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="hidden sm:block w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            ) : user ? (
              // 로그인 상태
              <>
                <Link
                  href="/mypage/buyer/dashboard"
                  className="px-3 py-1.5 text-gray-700 hover:text-gray-900 font-medium text-sm"
                >
                  마이페이지
                </Link>
                <Link
                  href="/admin/dashboard"
                  className="px-3 py-1.5 text-gray-700 hover:text-gray-900 font-medium text-sm"
                >
                  관리자
                </Link>
                <button
                  onClick={async () => {
                    await signOut()
                    router.push('/auth/login')
                  }}
                  className="px-3 py-1.5 text-gray-700 hover:text-gray-900 font-medium text-sm"
                >
                  로그아웃
                </button>
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
