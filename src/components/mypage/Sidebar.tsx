'use client';

import ProfileImage from '@/components/common/ProfileImage';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  FolderOpen,
  Star,
  DollarSign,
  Megaphone,
  IdCard,
  BarChart3,
  UserPlus,
  UserCircle,
  PieChart,
  ShoppingCart,
  FileText,
  Heart,
  User,
  ChevronDown,
  ChevronRight,
  Bike,
  MapPin,
  Clock,
  Wallet,
  FileCheck,
} from 'lucide-react';

// Icon mapping helper
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'fa-chart-line': TrendingUp,
  'fa-box': Package,
  'fa-shopping-bag': ShoppingBag,
  'fa-folder-open': FolderOpen,
  'fa-star': Star,
  'fa-sack-dollar': DollarSign,
  'fa-bullhorn': Megaphone,
  'fa-id-card': IdCard,
  'fa-chart-bar': BarChart3,
  'fa-user-plus': UserPlus,
  'fa-user-circle': UserCircle,
  'fa-chart-pie': PieChart,
  'fa-shopping-cart': ShoppingCart,
  'fa-file-invoice': FileText,
  'fa-heart': Heart,
  'fa-user': User,
  'fa-bike': Bike,
  'fa-map-pin': MapPin,
  'fa-clock': Clock,
  'fa-wallet': Wallet,
  'fa-file-check': FileCheck,
};

type UserRole = 'seller' | 'buyer' | 'helper';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

interface SidebarProps {
  readonly mode: UserRole;
  readonly profileData?: {
    readonly name: string;
    readonly profile_image?: string | null;
  } | null;
  readonly isRegisteredSeller?: boolean;
  readonly isRegisteredHelper?: boolean;
}

const sellerNavItems: NavItem[] = [
  {
    label: '판매 대시보드',
    href: '/mypage/seller/dashboard',
    icon: 'fa-chart-line',
  },
  {
    label: '주문 관리',
    href: '/mypage/seller/orders',
    icon: 'fa-box',
    children: [
      {
        label: '신규 주문',
        href: '/mypage/seller/orders?status=paid',
        icon: '',
        badge: 0,
      },
      {
        label: '진행중',
        href: '/mypage/seller/orders?status=in_progress',
        icon: '',
      },
      {
        label: '수정 요청',
        href: '/mypage/seller/orders?status=revision',
        icon: '',
      },
      {
        label: '완료 대기',
        href: '/mypage/seller/orders?status=delivered',
        icon: '',
      },
      {
        label: '완료',
        href: '/mypage/seller/orders?status=completed',
        icon: '',
      },
      {
        label: '취소/환불',
        href: '/mypage/seller/orders?status=cancelled',
        icon: '',
      },
    ],
  },
  {
    label: '서비스 관리',
    href: '/mypage/seller/services',
    icon: 'fa-shopping-bag',
    children: [
      { label: '내 서비스', href: '/mypage/seller/services', icon: '' },
      { label: '서비스 등록', href: '/mypage/seller/services/new', icon: '' },
    ],
  },
  {
    label: '포트폴리오',
    href: '/mypage/seller/portfolio',
    icon: 'fa-folder-open',
  },
  {
    label: '리뷰 관리',
    href: '/mypage/seller/reviews',
    icon: 'fa-star',
    badge: 0,
  },
  {
    label: '수익 관리',
    href: '/mypage/seller/earnings',
    icon: 'fa-sack-dollar',
    children: [
      { label: '정산 내역', href: '/mypage/seller/earnings', icon: '' },
      { label: '출금 내역', href: '/mypage/seller/earnings/history', icon: '' },
    ],
  },
  {
    label: '광고 관리',
    href: '/mypage/seller/advertising',
    icon: 'fa-bullhorn',
  },
  {
    label: '전문가 정보',
    href: '/mypage/seller/profile',
    icon: 'fa-id-card',
  },
  {
    label: '통계/분석',
    href: '/mypage/seller/statistics',
    icon: 'fa-chart-bar',
  },
  {
    label: '전문가 등록',
    href: '/mypage/seller/register',
    icon: 'fa-user-plus',
  },
  {
    label: '기본정보',
    href: '/mypage/settings',
    icon: 'fa-user-circle',
  },
];

const buyerNavItems: NavItem[] = [
  {
    label: '구매 대시보드',
    href: '/mypage/buyer/dashboard',
    icon: 'fa-chart-pie',
  },
  {
    label: '주문 내역',
    href: '/mypage/buyer/orders',
    icon: 'fa-shopping-cart',
    children: [
      { label: '전체', href: '/mypage/buyer/orders', icon: '' },
      {
        label: '결제완료',
        href: '/mypage/buyer/orders?status=paid',
        icon: '',
        badge: 0,
      },
      {
        label: '진행중',
        href: '/mypage/buyer/orders?status=in_progress',
        icon: '',
        badge: 0,
      },
      {
        label: '수정 요청',
        href: '/mypage/buyer/orders?status=revision',
        icon: '',
        badge: 0,
      },
      {
        label: '도착 확인 대기',
        href: '/mypage/buyer/orders?status=delivered',
        icon: '',
        badge: 0,
      },
      {
        label: '완료',
        href: '/mypage/buyer/orders?status=completed',
        icon: '',
      },
      {
        label: '취소/환불',
        href: '/mypage/buyer/orders?status=cancelled',
        icon: '',
      },
    ],
  },
  {
    label: '견적 요청 내역',
    href: '/mypage/buyer/quotes',
    icon: 'fa-file-invoice',
  },
  {
    label: '리뷰 관리',
    href: '/mypage/buyer/reviews',
    icon: 'fa-star',
    children: [
      {
        label: '작성 가능',
        href: '/mypage/buyer/reviews?tab=pending',
        icon: '',
        badge: 0,
      },
      {
        label: '작성한 리뷰',
        href: '/mypage/buyer/reviews?tab=written',
        icon: '',
      },
    ],
  },
  {
    label: '찜 목록',
    href: '/mypage/buyer/favorites',
    icon: 'fa-heart',
  },
  {
    label: '기본정보',
    href: '/mypage/settings',
    icon: 'fa-user-circle',
  },
];

const helperNavItems: NavItem[] = [
  {
    label: '라이더 대시보드',
    href: '/mypage/helper/dashboard',
    icon: 'fa-chart-pie',
  },
  {
    label: '심부름 찾기',
    href: '/mypage/helper/available',
    icon: 'fa-map-pin',
    children: [
      { label: '주변 심부름', href: '/mypage/helper/available', icon: '' },
      { label: '지원한 심부름', href: '/mypage/helper/applied', icon: '' },
    ],
  },
  {
    label: '내 심부름',
    href: '/mypage/helper/errands',
    icon: 'fa-bike',
    children: [
      { label: '전체', href: '/mypage/helper/errands', icon: '' },
      {
        label: '진행중',
        href: '/mypage/helper/errands?status=IN_PROGRESS',
        icon: '',
        badge: 0,
      },
      {
        label: '완료',
        href: '/mypage/helper/errands?status=COMPLETED',
        icon: '',
      },
    ],
  },
  {
    label: '수익 관리',
    href: '/mypage/helper/earnings',
    icon: 'fa-wallet',
    children: [
      { label: '정산 내역', href: '/mypage/helper/earnings', icon: '' },
      { label: '출금 요청', href: '/mypage/helper/earnings/withdraw', icon: '' },
    ],
  },
  {
    label: '리뷰 관리',
    href: '/mypage/helper/reviews',
    icon: 'fa-star',
  },
  {
    label: '구독 관리',
    href: '/mypage/helper/subscription',
    icon: 'fa-file-check',
  },
  {
    label: '라이더 정보',
    href: '/mypage/helper/profile',
    icon: 'fa-id-card',
  },
  {
    label: '라이더 등록',
    href: '/errands/register',
    icon: 'fa-user-plus',
  },
  {
    label: '기본정보',
    href: '/mypage/settings',
    icon: 'fa-user-circle',
  },
];

// 모드별 프로필 링크 결정
const getProfileHref = (mode: UserRole) => {
  if (mode === 'seller') return '/mypage/seller/profile';
  if (mode === 'helper') return '/mypage/helper/profile';
  return '/mypage/settings';
};

// 모드별 프로필 텍스트 결정
const getProfileText = (mode: UserRole) => {
  if (mode === 'seller') return '전문가 프로필';
  if (mode === 'helper') return '라이더 프로필';
  return '프로필 설정';
};

export default function Sidebar({
  mode,
  profileData,
  isRegisteredSeller,
  isRegisteredHelper,
}: SidebarProps) {
  const pathname = usePathname();

  // 모드별 네비게이션 아이템 가져오기
  const getNavItems = () => {
    if (mode === 'seller') return sellerNavItems;
    if (mode === 'helper') return helperNavItems;
    return buyerNavItems;
  };

  // 전문가 모드에서 등록 완료 시 "전문가 등록" 메뉴 숨김
  // 라이더 모드에서 등록 완료 시 "라이더 등록" 메뉴 숨김
  const navItems = getNavItems().filter((item) => {
    if (mode === 'seller' && isRegisteredSeller && item.href === '/mypage/seller/register') {
      return false;
    }
    if (mode === 'helper' && isRegisteredHelper && item.href === '/errands/register') {
      return false;
    }
    return true;
  });

  // Initialize with currently active parent items expanded
  const getInitialExpandedItems = () => {
    const expanded = new Set<string>();
    for (const item of navItems) {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => {
          if (child.href === pathname) return true;
          if (pathname.startsWith(child.href) && child.href !== '/mypage') return true;
          return false;
        });
        if (hasActiveChild) {
          expanded.add(item.href);
        }
      }
    }
    return expanded;
  };

  const [expandedItems, setExpandedItems] = useState<Set<string>>(getInitialExpandedItems);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(href)) {
        newSet.delete(href);
      } else {
        newSet.add(href);
      }
      return newSet;
    });
  };

  const isActive = (href: string) => {
    if (href === pathname) return true;
    if (pathname.startsWith(href) && href !== '/mypage') return true;
    return false;
  };

  return (
    <aside className="hidden lg:flex w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto flex-col">
      <div className="p-4 flex-1">
        {/* 프로필 정보 카드 */}
        <div className="mb-4">
          <Link
            href={getProfileHref(mode)}
            className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 card-interactive"
          >
            <ProfileImage
              src={profileData?.profile_image}
              alt={profileData?.name || '회원'}
              size={48}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{profileData?.name || '회원'}</p>
              <p className="text-xs text-gray-500">{getProfileText(mode)}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>

        {/* 모드 전환 버튼들 */}
        <div className="mb-6 space-y-2">
          {mode !== 'buyer' && (
            <Link
              href="/mypage/buyer/dashboard"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium click-pop btn-ripple"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>구매자 페이지로</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
          {mode !== 'seller' && (
            <Link
              href="/mypage/seller/dashboard"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium click-pop btn-ripple"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>전문가 페이지로</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* 네비게이션 메뉴 */}
        <nav>
          {navItems.map((item) => (
            <div key={item.href} className="mb-1">
              {/* 메인 아이템 */}
              {item.children ? (
                // 하위 메뉴가 있는 경우: button로 렌더링하고 클릭 시 확장/축소만
                <button
                  type="button"
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition-colors w-full ${
                    isActive(item.href)
                      ? 'bg-brand-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => toggleExpand(item.href)}
                  aria-expanded={expandedItems.has(item.href)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {React.createElement(iconMap[item.icon] || User, {
                      className: 'w-4 h-4',
                    })}
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full badge-pulse">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      expandedItems.has(item.href) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              ) : (
                // 하위 메뉴가 없는 경우: Link로 렌더링하여 정상 네비게이션
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-brand-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {React.createElement(iconMap[item.icon] || User, {
                      className: 'w-4 h-4',
                    })}
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full badge-pulse">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              )}

              {/* 하위 메뉴 */}
              {item.children && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedItems.has(item.href) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="ml-4 mt-1 border-l-2 border-gray-200 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center justify-between px-3 py-2 text-sm rounded transition-colors ${
                          isActive(child.href)
                            ? 'text-brand-primary font-medium bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <span>{child.label}</span>
                        {child.badge !== undefined && child.badge > 0 && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* 심부름 마이페이지로 이동 (buyer/seller 모드일 때만) */}
        {(mode === 'buyer' || mode === 'seller') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              href="/errands/mypage"
              className="flex items-center justify-between px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-xl text-orange-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4" />
                <span className="text-sm font-medium">심부름 마이페이지</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
