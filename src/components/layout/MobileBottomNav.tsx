'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useChatUnreadCount } from '@/components/providers/ChatUnreadProvider';
import { Home, Search, Heart, User, MessageCircle } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  requiresAuth: boolean;
  authRedirect?: string;
  isActiveCheck: (pathname: string) => boolean;
}

function NavLink({
  item,
  pathname,
  user,
  badge,
}: {
  item: NavItem;
  pathname: string;
  user: unknown;
  badge?: React.ReactNode;
}) {
  const isActive = item.isActiveCheck(pathname);
  const href = item.requiresAuth && !user ? (item.authRedirect ?? '/auth/login') : item.path;

  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
        isActive ? 'text-brand-primary' : 'text-gray-500'
      }`}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
    >
      {badge ? (
        <div className="relative">
          {item.icon}
          {badge}
        </div>
      ) : (
        item.icon
      )}
      <span className="text-xs font-medium">{item.label}</span>
    </Link>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { unreadCount } = useChatUnreadCount();

  const navItems: NavItem[] = [
    {
      path: '/',
      label: '홈',
      icon: <Home className="w-5 h-5" aria-hidden="true" />,
      requiresAuth: false,
      isActiveCheck: (p) => p === '/',
    },
    {
      path: '/search',
      label: '검색',
      icon: <Search className="w-5 h-5" aria-hidden="true" />,
      requiresAuth: false,
      isActiveCheck: (p) => p === '/search',
    },
    {
      path: '/mypage/buyer/favorites',
      label: '찜 목록',
      icon: <Heart className="w-5 h-5" aria-hidden="true" />,
      requiresAuth: true,
      isActiveCheck: (p) => p === '/mypage/buyer/favorites',
    },
    {
      path: '/chat',
      label: unreadCount > 0 ? `메시지 ${unreadCount}개` : '메시지',
      icon: <MessageCircle className="w-5 h-5" aria-hidden="true" />,
      requiresAuth: true,
      isActiveCheck: (p) => p.startsWith('/chat'),
    },
    {
      path: '/mypage',
      label: user ? '마이페이지' : '로그인',
      icon: <User className="w-5 h-5" aria-hidden="true" />,
      requiresAuth: true,
      isActiveCheck: (p) => p.startsWith('/mypage') || p === '/auth/login',
    },
  ];

  const messageBadge =
    unreadCount > 0 ? (
      <span
        className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center"
        aria-hidden="true"
      >
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    ) : null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 lg:hidden z-[9999] shadow-lg pb-[env(safe-area-inset-bottom)]"
      style={{ touchAction: 'manipulation' }}
    >
      <div
        className="grid grid-cols-5 h-16 max-w-full mx-auto"
        style={{ touchAction: 'manipulation' }}
      >
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            item={item}
            pathname={pathname}
            user={user}
            badge={index === 3 ? messageBadge : undefined}
          />
        ))}
      </div>
    </nav>
  );
}
