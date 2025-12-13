'use client';

import ProfileImage from '@/components/common/ProfileImage';
import SearchForm from '@/components/common/SearchForm';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { lazy, Suspense } from 'react';
import {
  ShoppingCart,
  Package,
  UserCircle,
  Settings,
  LogOut,
  ChevronDown,
  Heart,
  Bike,
  MapPin,
  Bell,
  MessageCircle,
} from 'lucide-react';

// React.lazy를 사용하여 Supabase 번들을 초기 로드에서 완전히 제외
const NotificationBell = lazy(() => import('@/components/notifications/NotificationBell'));
const ChatNotificationBadge = lazy(() => import('@/components/chat/ChatNotificationBadge'));

// Loading fallback 컴포넌트
const NotificationBellLoading = () => (
  <div className="relative flex items-center">
    <Bell className="w-6 h-6 text-gray-400 animate-pulse" aria-hidden="true" />
  </div>
);

const ChatBadgeLoading = () => (
  <div className="relative flex items-center text-gray-400">
    <MessageCircle className="w-6 h-6 animate-pulse" />
  </div>
);

export default function Header() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 메인 페이지에서는 헤더 검색창 숨김 (하단에 별도 검색 섹션 있음)
  const isHomePage = pathname === '/';

  // 통합 마이페이지 허브 URL
  const getMypageUrl = () => {
    if (!user) {
      return '/auth/login';
    }

    // 통합 마이페이지 허브로 이동 (LocalStorage 기반 자동 리다이렉트)
    return '/mypage';
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="container-1200">
        <div className="flex items-center justify-between h-[60px] lg:h-20 gap-4">
          {/* 로고 */}
          <Link
            href="/"
            className="flex items-center gap-1.5 lg:gap-2 flex-shrink-0"
            aria-label="돌파구 홈으로 이동"
          >
            <Image
              src="/icon.png"
              alt=""
              width={32}
              height={32}
              className="h-7 w-7 lg:h-8 lg:w-8"
              priority
            />
            <Image
              src="/logo.png"
              alt="돌파구"
              width={607}
              height={178}
              className="h-7 lg:h-8 w-auto"
              sizes="(max-width: 1024px) 120px, 150px"
              priority
            />
          </Link>
          {/* 검색창 - PC에서만 표시 (메인 페이지 제외) */}
          <div className={`flex-1 max-w-md ${isHomePage ? 'hidden' : 'hidden lg:block'}`}>
            <SearchForm
              onSubmit={(query) => {
                if (query.trim()) {
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                }
              }}
              inputClassName="px-4 py-2 pr-10 text-sm"
              iconClassName="w-5 h-5"
            />
          </div>
          {/* 모바일 버전 - 로그인 사용자만 표시 */}
          {user && (
            <div className="lg:hidden flex items-center">
              <Suspense fallback={<NotificationBellLoading />}>
                <NotificationBell />
              </Suspense>
            </div>
          )}
          {/* PC 버전: 네비게이션 메뉴 */}
          <nav className="hidden lg:flex items-center space-x-6">
            {user ? (
              // 로그인 상태
              <>
                {/* 주문/심부름 관리 드롭다운 */}
                <div className="relative group">
                  <button
                    className="px-3 py-2 text-gray-700 hover:text-brand-primary transition-colors"
                    aria-label={pathname?.startsWith('/errands') ? '심부름 관리' : '주문 관리'}
                  >
                    <span className="text-sm font-medium">
                      {pathname?.startsWith('/errands') ? '심부름 관리' : '주문 관리'}
                    </span>
                  </button>

                  {/* 드롭다운 메뉴 */}
                  <div
                    className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all"
                    role="menu"
                  >
                    {pathname?.startsWith('/errands') ? (
                      <>
                        <Link
                          href="/errands/mypage"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                          role="menuitem"
                        >
                          <MapPin className="inline w-4 h-4 mr-2" aria-hidden="true" />
                          요청자
                        </Link>
                        <Link
                          href="/errands/mypage/helper"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                          role="menuitem"
                        >
                          <Bike className="inline w-4 h-4 mr-2" aria-hidden="true" />
                          라이더
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/mypage/buyer/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                          role="menuitem"
                        >
                          <ShoppingCart className="inline w-4 h-4 mr-2" aria-hidden="true" />
                          구매 관리
                        </Link>
                        <Link
                          href="/mypage/seller/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                          role="menuitem"
                        >
                          <Package className="inline w-4 h-4 mr-2" aria-hidden="true" />
                          판매 관리
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* 찜한 서비스 */}
                <Link
                  href="/mypage/buyer/favorites"
                  className="flex items-center text-gray-900 hover:text-red-500 transition-colors"
                  aria-label="찜한 서비스"
                >
                  <Heart className="w-6 h-6" />
                </Link>

                {/* 채팅 */}
                <Suspense fallback={<ChatBadgeLoading />}>
                  <ChatNotificationBadge />
                </Suspense>

                {/* 알림 */}
                <Suspense fallback={<NotificationBellLoading />}>
                  <NotificationBell />
                </Suspense>

                {/* 사용자 정보 드롭다운 */}
                <div className="relative group">
                  <button
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="사용자 메뉴"
                    aria-haspopup="true"
                  >
                    {/* 프로필 이미지 */}
                    <ProfileImage
                      src={profile?.profile_image}
                      alt={profile?.name || '사용자 프로필'}
                      size={32}
                    />

                    {/* 드롭다운 아이콘 */}
                    <ChevronDown className="w-3 h-3 text-gray-400" aria-hidden="true" />
                  </button>

                  {/* 드롭다운 메뉴 */}
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all"
                    role="menu"
                  >
                    <Link
                      href={getMypageUrl()}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                      role="menuitem"
                    >
                      <UserCircle className="inline w-4 h-4 mr-2" aria-hidden="true" />
                      마이페이지
                    </Link>
                    <Link
                      href="/mypage/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      role="menuitem"
                    >
                      <Settings className="inline w-4 h-4 mr-2" aria-hidden="true" />
                      설정
                    </Link>
                    <hr className="border-gray-200" />
                    <button
                      onClick={async () => {
                        await signOut();
                        router.push('/auth/login');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                      role="menuitem"
                      aria-label="로그아웃"
                    >
                      <LogOut className="inline w-4 h-4 mr-2" aria-hidden="true" />
                      로그아웃
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // 비로그인 또는 로딩 상태
              (() => {
                // /errands 페이지에서는 "라이더 등록"으로 표시
                const isErrandsPage = pathname?.startsWith('/errands');

                if (loading) {
                  return (
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  );
                }
                return (
                  <>
                    <Link
                      href={isErrandsPage ? '/errands/register/guide' : '/expert/register'}
                      className="px-3 py-1.5 text-gray-700 hover:text-gray-900 font-medium text-sm"
                      aria-label={isErrandsPage ? '라이더 등록 안내' : '전문가로 등록하기'}
                    >
                      {isErrandsPage ? '라이더 등록' : '전문가등록'}
                    </Link>
                    <Link
                      href="/auth/login"
                      className="px-3 py-1.5 text-gray-700 hover:text-gray-900 font-medium text-sm"
                      aria-label="로그인 페이지로 이동"
                    >
                      로그인
                    </Link>
                    <Link
                      href="/auth/register"
                      className="px-3 py-1.5 bg-brand-primary text-white rounded-lg hover:bg-brand-light hover:shadow-lg transition-all font-medium text-sm"
                      aria-label="회원가입 페이지로 이동"
                    >
                      회원가입
                    </Link>
                  </>
                );
              })()
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
