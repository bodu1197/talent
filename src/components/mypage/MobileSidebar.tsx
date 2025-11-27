'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  ShoppingCart,
  FileText,
  Heart,
  Star,
  Package,
  ClipboardList,
  TrendingUp,
  BarChart3,
  Folder,
  Users,
  Receipt,
  Tags,
  DollarSign,
  Megaphone,
  HelpCircle,
  Flag,
  ChevronRight,
  Mail,
  User,
} from 'lucide-react';

interface MobileSidebarProps {
  readonly mode: 'buyer' | 'seller' | 'admin';
  readonly isRegisteredSeller?: boolean;
}

export default function MobileSidebar({ mode }: MobileSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // ESC 키로 사이드바 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const buyerMenuItems = [
    {
      icon: Home,
      label: '대시보드',
      href: '/mypage/buyer/dashboard',
    },
    {
      icon: ShoppingCart,
      label: '주문내역',
      href: '/mypage/buyer/orders',
    },
    {
      icon: FileText,
      label: '견적 요청',
      href: '/mypage/buyer/quotes',
    },
    {
      icon: Heart,
      label: '찜한 서비스',
      href: '/mypage/buyer/favorites',
    },
    {
      icon: Star,
      label: '내 리뷰',
      href: '/mypage/buyer/reviews',
    },
  ];

  const sellerMenuItems = [
    {
      icon: Home,
      label: '대시보드',
      href: '/mypage/seller/dashboard',
    },
    {
      icon: Package,
      label: '내 서비스',
      href: '/mypage/seller/services',
    },
    {
      icon: ClipboardList,
      label: '주문 관리',
      href: '/mypage/seller/orders',
    },
    {
      icon: TrendingUp,
      label: '수익 관리',
      href: '/mypage/seller/earnings',
    },
    {
      icon: BarChart3,
      label: '통계/분석',
      href: '/mypage/seller/statistics',
    },
    {
      icon: Folder,
      label: '포트폴리오',
      href: '/mypage/seller/portfolio',
    },
    {
      icon: Star,
      label: '리뷰 관리',
      href: '/mypage/seller/reviews',
    },
  ];

  const adminMenuItems = [
    {
      icon: Home,
      label: '대시보드',
      href: '/admin/dashboard',
    },
    {
      icon: Users,
      label: '회원 관리',
      href: '/admin/users',
    },
    {
      icon: Package,
      label: '서비스 관리',
      href: '/admin/services',
    },
    {
      icon: Receipt,
      label: '주문 관리',
      href: '/admin/orders',
    },
    {
      icon: Tags,
      label: '카테고리 관리',
      href: '/admin/categories',
    },
    {
      icon: DollarSign,
      label: '정산 관리',
      href: '/admin/settlements',
    },
    {
      icon: Megaphone,
      label: '광고 관리',
      href: '/admin/advertisements',
    },
    {
      icon: HelpCircle,
      label: '문의 관리',
      href: '/admin/inquiries',
    },
    {
      icon: Flag,
      label: '신고 관리',
      href: '/admin/reports',
    },
  ];

  const getMenuItems = () => {
    switch (mode) {
      case 'buyer':
        return buyerMenuItems;
      case 'seller':
        return sellerMenuItems;
      default:
        return adminMenuItems;
    }
  };
  const menuItems = getMenuItems();

  const getModeLabel = () => {
    switch (mode) {
      case 'buyer':
        return '구매자 페이지';
      case 'seller':
        return '판매자 페이지';
      case 'admin':
        return '관리자 페이지';
    }
  };

  return (
    <>
      {/* 햄버거 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        aria-label="메뉴 열기"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* 오버레이 */}
      {isOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity cursor-default"
          onClick={() => setIsOpen(false)}
          aria-label="사이드바 닫기"
        />
      )}

      {/* 드로어 사이드바 */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-brand-primary text-white">
          <div>
            <div className="font-bold text-lg">{getModeLabel()}</div>
            <div className="text-sm opacity-90">메뉴</div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="메뉴 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 메뉴 아이템 */}
        <nav className="p-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        {/* 하단 공통 메뉴 */}
        <div className="mt-auto p-4 border-t border-gray-200">
          <Link
            href="/chat"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
              pathname.startsWith('/chat')
                ? 'bg-brand-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium">메시지</span>
          </Link>

          <Link
            href="/mypage/settings"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
              pathname === '/mypage/settings'
                ? 'bg-brand-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">프로필 설정</span>
          </Link>

          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">홈으로</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
