'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useChatUnreadCount } from '@/components/providers/ChatUnreadProvider';
import {
  FaHome,
  FaSearch,
  FaHeart,
  FaUser,
  FaRegComments,
} from 'react-icons/fa';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { unreadCount } = useChatUnreadCount();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* 모바일 하단 네비게이션 - 모바일에서만 표시 */}
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 lg:hidden z-50 shadow-lg pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16 max-w-full mx-auto">
          {/* 홈 */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              isActive('/') ? 'text-brand-primary' : 'text-gray-500'
            }`}
            aria-label="홈으로 이동"
            aria-current={isActive('/') ? 'page' : undefined}
          >
            <FaHome className="text-xl" aria-hidden="true" />
            <span className="text-xs font-medium">홈</span>
          </Link>

          {/* 검색 */}
          <Link
            href="/search"
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              pathname === '/search' ? 'text-brand-primary' : 'text-gray-500'
            }`}
            aria-label="검색 페이지로 이동"
            aria-current={pathname === '/search' ? 'page' : undefined}
          >
            <FaSearch className="text-xl" aria-hidden="true" />
            <span className="text-xs font-medium">검색</span>
          </Link>

          {/* 찜목록 */}
          <Link
            href={user ? '/mypage/buyer/favorites' : '/auth/login'}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              pathname === '/mypage/buyer/favorites' ? 'text-brand-primary' : 'text-gray-500'
            }`}
            aria-label="찜목록 보기"
            aria-current={pathname === '/mypage/buyer/favorites' ? 'page' : undefined}
          >
            <FaHeart className="text-xl" aria-hidden="true" />
            <span className="text-xs font-medium">찜목록</span>
          </Link>

          {/* 메시지 */}
          <Link
            href={user ? '/chat' : '/auth/login'}
            className={`relative flex flex-col items-center justify-center space-y-1 transition-colors ${
              pathname.startsWith('/chat') ? 'text-brand-primary' : 'text-gray-500'
            }`}
            aria-label={unreadCount > 0 ? `메시지 ${unreadCount}개` : '메시지'}
            aria-current={pathname.startsWith('/chat') ? 'page' : undefined}
          >
            <div className="relative">
              <FaRegComments className="text-xl" aria-hidden="true" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  aria-hidden="true"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">메시지</span>
          </Link>

          {/* 마이페이지 / 로그인 */}
          <Link
            href={user ? '/mypage/buyer/dashboard' : '/auth/login'}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              pathname.startsWith('/mypage') || pathname === '/auth/login' ? 'text-brand-primary' : 'text-gray-500'
            }`}
            aria-label={user ? '마이페이지로 이동' : '로그인 페이지로 이동'}
            aria-current={pathname.startsWith('/mypage') ? 'page' : undefined}
          >
            <FaUser className="text-xl" aria-hidden="true" />
            <span className="text-xs font-medium">{user ? '마이페이지' : '로그인'}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
