'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import ProfileImage from '@/components/common/ProfileImage';
import {
  Bike,
  Package,
  MapPin,
  Clock,
  Wallet,
  Star,
  Settings,
  ChevronRight,
  Home,
  User,
  Bell,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';

interface ErrandMypageLayoutProps {
  readonly children: ReactNode;
  readonly mode: 'requester' | 'helper';
}

interface BottomNavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  isExact?: boolean;
}

// 하단 네비게이션 아이템 (요청자)
const requesterBottomNavItems: BottomNavItem[] = [
  { href: '/errands/mypage', icon: Home, label: '홈', isExact: true },
  { href: '/errands/mypage/requests', icon: Package, label: '내 심부름' },
  { href: '/errands/mypage/history', icon: Clock, label: '완료' },
  { href: '/errands/mypage/settings', icon: User, label: '설정' },
];

// 하단 네비게이션 아이템 (헬퍼)
const helperBottomNavItems: BottomNavItem[] = [
  { href: '/errands/mypage/helper', icon: Home, label: '홈', isExact: true },
  { href: '/errands/mypage/helper/available', icon: MapPin, label: '찾기' },
  { href: '/errands/mypage/helper/jobs', icon: Bike, label: '내 작업' },
  { href: '/errands/mypage/helper/earnings', icon: Wallet, label: '수익' },
  { href: '/errands/mypage/helper/settings', icon: User, label: '설정' },
];

function BottomNavLink({ item, pathname }: { item: BottomNavItem; pathname: string }) {
  const isActive = item.isExact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs">{item.label}</span>
    </Link>
  );
}

// 사이드바 메뉴 아이템
const requesterMenuItems = [
  { href: '/errands/mypage', icon: Home, label: '대시보드', exact: true },
  { href: '/errands/mypage/requests', icon: Package, label: '내 심부름', exact: false },
  { href: '/errands/mypage/history', icon: Clock, label: '완료 내역', exact: false },
  { href: '/errands/mypage/settings', icon: Settings, label: '설정', exact: false },
];

const helperMenuItems = [
  { href: '/errands/mypage/helper', icon: Home, label: '대시보드', exact: true },
  { href: '/errands/mypage/helper/available', icon: MapPin, label: '심부름 찾기', exact: false },
  { href: '/errands/mypage/helper/jobs', icon: Bike, label: '내 작업', exact: false },
  { href: '/errands/mypage/helper/earnings', icon: Wallet, label: '수익 관리', exact: false },
  { href: '/errands/mypage/helper/reviews', icon: Star, label: '리뷰', exact: false },
  { href: '/errands/mypage/helper/settings', icon: Settings, label: '설정', exact: false },
];

export default function ErrandMypageLayout({ children, mode }: ErrandMypageLayoutProps) {
  const { user, profile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helperProfile, setHelperProfile] = useState<{
    grade: string;
    subscription_status: string;
    subscription_expires_at: string | null;
  } | null>(null);

  const menuItems = mode === 'helper' ? helperMenuItems : requesterMenuItems;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirect=' + encodeURIComponent(pathname));
    }
  }, [user, loading, router, pathname]);

  // 헬퍼 프로필 로드
  useEffect(() => {
    if (mode === 'helper' && user) {
      loadHelperProfile();
    }
  }, [mode, user]);

  async function loadHelperProfile() {
    try {
      const response = await fetch('/api/helper');
      if (response.ok) {
        const data = await response.json();
        setHelperProfile(data.helperProfile);
      }
    } catch (error) {
      console.error('헬퍼 프로필 로드 실패:', error);
    }
  }

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const getGradeLabel = (grade: string) => {
    const gradeMap: Record<string, string> = {
      NEWBIE: '뉴비',
      BRONZE: '브론즈',
      SILVER: '실버',
      GOLD: '골드',
      PLATINUM: '플래티넘',
      DIAMOND: '다이아몬드',
    };
    return gradeMap[grade] || grade;
  };

  const getSubscriptionLabel = (status: string) => {
    switch (status) {
      case 'active':
        return { text: '구독 중', color: 'bg-green-100 text-green-700' };
      case 'trial':
        return { text: '무료 체험', color: 'bg-blue-100 text-blue-700' };
      case 'expired':
        return { text: '만료됨', color: 'bg-red-100 text-red-700' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 모바일 헤더 */}
      <header className="lg:hidden bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-gray-600"
            aria-label="메뉴 열기"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/errands" className="flex items-center gap-2">
            <Bike className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-gray-900">심부름</span>
          </Link>
          <Link href="/errands/mypage/notifications" className="p-2 -mr-2 text-gray-600">
            <Bell className="w-6 h-6" />
          </Link>
        </div>
      </header>

      {/* 모바일 사이드 메뉴 */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Bike className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-gray-900">심부름 마이페이지</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 text-gray-600"
                aria-label="메뉴 닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 프로필 섹션 */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <ProfileImage
                  src={profile?.profile_image}
                  alt={profile?.name || '사용자'}
                  size={48}
                />
                <div>
                  <p className="font-semibold text-gray-900">{profile?.name || '사용자'}</p>
                  {mode === 'helper' && helperProfile && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getSubscriptionLabel(helperProfile.subscription_status).color}`}
                    >
                      {getSubscriptionLabel(helperProfile.subscription_status).text}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 역할 전환 */}
            <div className="p-4 border-b border-gray-200">
              <p className="text-xs text-gray-500 mb-2">역할 전환</p>
              <div className="flex gap-2">
                <Link
                  href="/errands/mypage"
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium text-center ${
                    mode === 'requester'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  요청자
                </Link>
                <Link
                  href="/errands/mypage/helper"
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium text-center ${
                    mode === 'helper'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  라이더
                </Link>
              </div>
            </div>

            {/* 메뉴 */}
            <nav className="p-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    isActive(item.href, item.exact)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* 돌파구 마이페이지로 */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <Link
                href="/mypage/buyer/dashboard"
                className="flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="font-medium">돌파구 마이페이지</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="lg:flex lg:max-w-6xl lg:mx-auto">
        {/* PC 사이드바 */}
        <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
          <div className="p-4">
            {/* 로고 */}
            <Link href="/errands" className="flex items-center gap-2 mb-6">
              <Bike className="w-8 h-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">심부름</span>
            </Link>

            {/* 프로필 섹션 */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <ProfileImage
                  src={profile?.profile_image}
                  alt={profile?.name || '사용자'}
                  size={48}
                />
                <div>
                  <p className="font-semibold text-gray-900">{profile?.name || '사용자'}</p>
                  {mode === 'helper' && helperProfile && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-500">
                        {getGradeLabel(helperProfile.grade)}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getSubscriptionLabel(helperProfile.subscription_status).color}`}
                      >
                        {getSubscriptionLabel(helperProfile.subscription_status).text}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 역할 전환 */}
              <div className="flex gap-2">
                <Link
                  href="/errands/mypage"
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium text-center transition-colors ${
                    mode === 'requester'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  요청자
                </Link>
                <Link
                  href="/errands/mypage/helper"
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium text-center transition-colors ${
                    mode === 'helper'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  라이더
                </Link>
              </div>
            </div>

            {/* 네비게이션 */}
            <nav className="bg-white rounded-xl p-2 shadow-sm mb-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href, item.exact)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* 돌파구 마이페이지로 */}
            <Link
              href="/mypage/buyer/dashboard"
              className="flex items-center justify-between px-4 py-3 bg-white rounded-xl text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <span className="text-sm">돌파구 마이페이지</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 pt-14 lg:pt-0 pb-20 lg:pb-8">
          <div className="lg:p-6">{children}</div>
        </main>
      </div>

      {/* 모바일 하단 네비게이션 */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around h-16">
          {mode === 'requester' ? (
            <>
              <BottomNavLink item={requesterBottomNavItems[0]} pathname={pathname} />
              <BottomNavLink item={requesterBottomNavItems[1]} pathname={pathname} />
              <Link
                href="/errands/new"
                className="flex flex-col items-center gap-1 -mt-4 bg-blue-600 text-white rounded-full w-14 h-14 justify-center shadow-lg"
              >
                <span className="text-2xl leading-none">+</span>
              </Link>
              <BottomNavLink item={requesterBottomNavItems[2]} pathname={pathname} />
              <BottomNavLink item={requesterBottomNavItems[3]} pathname={pathname} />
            </>
          ) : (
            <>
              {helperBottomNavItems.map((item) => (
                <BottomNavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
