'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import ChatNotificationBadge from '@/components/chat/ChatNotificationBadge'
import NotificationBell from '@/components/notifications/NotificationBell'

export default function Header() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  // 사용자 역할에 따른 마이페이지 URL
  const getMypageUrl = () => {
    if (!user) {
      return '/auth/login'
    }

    // seller 활동이 있으면 seller dashboard로
    if (profile?.is_seller) {
      return '/mypage/seller/dashboard'
    }

    // 아니면 buyer dashboard로 (기본값)
    return '/mypage/buyer/dashboard'
  }

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="container-1200">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-star text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold">돌파구</span>
          </Link>

          {/* 모바일 버전 */}
          <div className="lg:hidden flex items-center space-x-2">
            {user ? (
              <>
                <NotificationBell />
                <Link
                  href={getMypageUrl()}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                    {profile?.profile_image ? (
                      <img
                        src={profile.profile_image}
                        alt={profile?.name || '사용자'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <i className="fas fa-user text-gray-600"></i>
                    )}
                  </div>
                </Link>
              </>
            ) : !loading && (
              <Link
                href="/auth/login"
                className="px-3 py-1.5 bg-brand-primary text-white rounded-lg text-sm font-medium"
              >
                로그인
              </Link>
            )}
          </div>

          {/* PC 버전: 네비게이션 메뉴 */}
          <nav className="hidden lg:flex items-center space-x-4">
            {user ? (
              // 로그인 상태
              <>
                {/* 주문 관리 드롭다운 */}
                <div className="relative group">
                  <button
                    className="px-3 py-2 text-gray-700 hover:text-brand-primary transition-colors"
                    aria-label="주문 관리"
                  >
                    <span className="text-sm font-medium">주문관리</span>
                  </button>

                  {/* 드롭다운 메뉴 */}
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                    <Link
                      href="/mypage/buyer/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    >
                      <i className="fas fa-shopping-cart mr-2"></i>
                      구매 관리
                    </Link>
                    <Link
                      href="/mypage/seller/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                    >
                      <i className="fas fa-box mr-2"></i>
                      판매 관리
                    </Link>
                  </div>
                </div>

                {/* 찜한 서비스 */}
                <Link
                  href="/mypage/buyer/favorites"
                  className="text-gray-900 hover:text-red-500 transition-colors"
                  aria-label="찜한 서비스"
                >
                  <i className="far fa-heart text-xl"></i>
                </Link>

                {/* 채팅 */}
                <ChatNotificationBadge />

                {/* 알림 */}
                <NotificationBell />

                {/* 사용자 정보 드롭다운 */}
                <div className="relative group">
                  <button
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="사용자 메뉴"
                    aria-haspopup="true"
                  >
                    {/* 프로필 이미지 */}
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                      {profile?.profile_image ? (
                        <img
                          src={profile.profile_image}
                          alt={profile.name || '사용자 프로필'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className="fas fa-user text-gray-600" aria-hidden="true"></i>
                      )}
                    </div>

                    {/* 드롭다운 아이콘 */}
                    <i className="fas fa-chevron-down text-xs text-gray-400" aria-hidden="true"></i>
                  </button>

                  {/* 드롭다운 메뉴 */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                    <Link
                      href={getMypageUrl()}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    >
                      <i className="fas fa-user-circle mr-2"></i>
                      마이페이지
                    </Link>
                    <Link
                      href="/mypage/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <i className="fas fa-cog mr-2"></i>
                      설정
                    </Link>
                    <hr className="border-gray-200" />
                    <button
                      onClick={async () => {
                        await signOut()
                        router.push('/auth/login')
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      로그아웃
                    </button>
                  </div>
                </div>
              </>
            ) : loading ? (
              // 로딩 중 - 스켈레톤 UI (깜빡임 방지)
              <div className="flex items-center space-x-4">
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
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
                  className="px-3 py-1.5 bg-brand-primary text-white rounded-lg hover:bg-brand-light hover:shadow-lg transition-all font-medium text-sm"
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
