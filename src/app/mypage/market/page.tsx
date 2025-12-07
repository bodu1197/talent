'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingBag,
  Store,
  Package,
  FileText,
  Star,
  Heart,
  BarChart3,
  Wallet,
  Megaphone,
  FolderOpen,
  User,
  ChevronRight,
  Plus,
} from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ServiceSwitcher from '@/components/mypage/ServiceSwitcher';

type TabType = 'buyer' | 'seller';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
}

export default function MarketMypagePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('buyer');
  const [isRegisteredSeller, setIsRegisteredSeller] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    orders: 0,
    quotes: 0,
    reviews: 0,
    favorites: 0,
    sales: 0,
    services: 0,
    earnings: 0,
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login?redirect=/mypage/market');
      return;
    }

    // URL에서 탭 파라미터 확인
    const tabParam = searchParams.get('tab');
    if (tabParam === 'seller') {
      setActiveTab('seller');
    }

    loadData();
  }, [user, authLoading, router, searchParams]);

  async function loadData() {
    try {
      setLoading(true);

      const [sellerRes, statsRes] = await Promise.all([
        fetch('/api/seller/check'),
        fetch('/api/mypage/market-stats'),
      ]);

      if (sellerRes.ok) {
        const sellerData = await sellerRes.json();
        setIsRegisteredSeller(sellerData.isRegistered);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleTabChange(tab: TabType) {
    setActiveTab(tab);
    router.replace(`/mypage/market?tab=${tab}`, { scroll: false });
  }

  const buyerMenuItems: MenuItem[] = [
    {
      icon: <Package className="w-5 h-5" />,
      label: '주문 내역',
      href: '/mypage/buyer/orders',
      badge: stats.orders,
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: '견적 요청',
      href: '/mypage/buyer/quotes',
      badge: stats.quotes,
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: '리뷰 관리',
      href: '/mypage/buyer/reviews',
      badge: stats.reviews,
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: '찜한 서비스',
      href: '/mypage/buyer/favorites',
      badge: stats.favorites,
    },
  ];

  const sellerMenuItems: MenuItem[] = [
    {
      icon: <Package className="w-5 h-5" />,
      label: '주문 관리',
      href: '/mypage/seller/orders',
      badge: stats.sales,
    },
    {
      icon: <Store className="w-5 h-5" />,
      label: '서비스 관리',
      href: '/mypage/seller/services',
      badge: stats.services,
    },
    {
      icon: <FolderOpen className="w-5 h-5" />,
      label: '포트폴리오',
      href: '/mypage/seller/portfolio',
    },
    { icon: <Star className="w-5 h-5" />, label: '리뷰 관리', href: '/mypage/seller/reviews' },
    { icon: <Wallet className="w-5 h-5" />, label: '수익 관리', href: '/mypage/seller/earnings' },
    {
      icon: <Megaphone className="w-5 h-5" />,
      label: '광고 관리',
      href: '/mypage/seller/advertising',
    },
    { icon: <BarChart3 className="w-5 h-5" />, label: '통계', href: '/mypage/seller/statistics' },
    { icon: <User className="w-5 h-5" />, label: '전문가 정보', href: '/mypage/seller/profile' },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="로딩 중..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center px-4 py-3">
            <Link
              href="/mypage"
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900 ml-2">재능마켓</h1>
          </div>

          {/* 탭 */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => handleTabChange('buyer')}
              className={`flex-1 py-3 text-sm font-medium text-center transition-colors relative ${
                activeTab === 'buyer' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>구매</span>
              </div>
              {activeTab === 'buyer' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => handleTabChange('seller')}
              className={`flex-1 py-3 text-sm font-medium text-center transition-colors relative ${
                activeTab === 'seller' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Store className="w-4 h-4" />
                <span>판매</span>
              </div>
              {activeTab === 'seller' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="p-4">
          {/* 구매자 메뉴 */}
          {activeTab === 'buyer' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {buyerMenuItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors ${
                    index !== buyerMenuItems.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500">{item.icon}</div>
                    <span className="text-gray-900 font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 판매자 메뉴 (등록됨) */}
          {activeTab === 'seller' && isRegisteredSeller && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {sellerMenuItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors ${
                    index !== sellerMenuItems.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500">{item.icon}</div>
                    <span className="text-gray-900 font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 판매자 등록 안내 */}
          {activeTab === 'seller' && !isRegisteredSeller && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">전문가로 활동해보세요!</h3>
              <p className="text-gray-500 text-sm mb-4">재능을 판매하고 수익을 올려보세요.</p>
              <Link
                href="/mypage/seller/register"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>전문가 등록하기</span>
              </Link>
            </div>
          )}

          {/* 설정 링크 */}
          <Link
            href="/mypage/settings"
            className="flex items-center justify-between px-4 py-4 mt-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-gray-900 font-medium">기본 정보 수정</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* 플로팅 서비스 전환 버튼 */}
      <ServiceSwitcher currentService="market" />
    </div>
  );
}
