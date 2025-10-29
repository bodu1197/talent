'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

export default function Header() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="container-1200">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0f3460] rounded-lg flex items-center justify-center">
              <i className="fas fa-star text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold">돌파구</span>
          </Link>

          {/* 모바일: 종 아이콘만 표시 */}
          <div className="lg:hidden">
            <button
              className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-[#0f3460] transition-colors"
              aria-label="알림"
            >
              <i className="fas fa-bell text-xl"></i>
            </button>
          </div>

          {/* PC 버전: 네비게이션 메뉴 */}
          <nav className="hidden lg:flex items-center space-x-4">
            {user ? (
              // 로그인 상태
              <>
                <button
                  className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-[#0f3460] transition-colors"
                  aria-label="알림"
                >
                  <i className="fas fa-bell text-lg"></i>
                </button>
                <Link
                  href="/mypage/buyer/dashboard"
                  className="px-3 py-1.5 text-gray-700 hover:text-gray-900 font-medium text-sm"
                >
                  마이페이지
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
