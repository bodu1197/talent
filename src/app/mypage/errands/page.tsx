'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import {
  ArrowLeft,
  ClipboardList,
  Bike,
  MapPin,
  Clock,
  Star,
  Wallet,
  BarChart3,
  User,
  ChevronRight,
  Plus,
  History,
} from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ServiceSwitcher from '@/components/mypage/ServiceSwitcher';

type TabType = 'requester' | 'helper';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
}

export default function ErrandsMypagePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('requester');
  const [isRegisteredHelper, setIsRegisteredHelper] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    requests: 0,
    history: 0,
    deliveries: 0,
    earnings: 0,
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login?redirect=/mypage/errands');
      return;
    }

    // URL에서 탭 파라미터 확인
    const tabParam = searchParams.get('tab');
    if (tabParam === 'helper') {
      setActiveTab('helper');
    }

    loadData();
  }, [user, authLoading, router, searchParams]);

  async function loadData() {
    try {
      setLoading(true);

      const [helperRes, statsRes] = await Promise.all([
        fetch('/api/helper/check'),
        fetch('/api/mypage/errands-stats'),
      ]);

      if (helperRes.ok) {
        const helperData = await helperRes.json();
        setIsRegisteredHelper(helperData.isRegistered);
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
    router.replace(`/mypage/errands?tab=${tab}`, { scroll: false });
  }

  // 요청자 메뉴 - 기존 페이지 링크
  const requesterMenuItems: MenuItem[] = [
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: '내 심부름',
      href: '/errands/mypage/requests',
      badge: stats.requests,
    },
    {
      icon: <History className="w-5 h-5" />,
      label: '이용 내역',
      href: '/errands/mypage/history',
      badge: stats.history,
    },
    { icon: <Star className="w-5 h-5" />, label: '리뷰 관리', href: '/errands/mypage/reviews' },
  ];

  // 라이더 메뉴 - 기존 페이지 링크
  const helperMenuItems: MenuItem[] = [
    {
      icon: <MapPin className="w-5 h-5" />,
      label: '심부름 찾기',
      href: '/mypage/helper/available',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: '진행중 심부름',
      href: '/mypage/helper/errands',
      badge: stats.deliveries,
    },
    { icon: <Wallet className="w-5 h-5" />, label: '수익 관리', href: '/mypage/helper/earnings' },
    { icon: <Star className="w-5 h-5" />, label: '받은 리뷰', href: '/mypage/helper/reviews' },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: '활동 통계',
      href: '/mypage/helper/dashboard',
    },
    { icon: <User className="w-5 h-5" />, label: '라이더 정보', href: '/mypage/helper/profile' },
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
            <h1 className="text-lg font-bold text-gray-900 ml-2">심부름</h1>
          </div>

          {/* 탭 */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => handleTabChange('requester')}
              className={`flex-1 py-3 text-sm font-medium text-center transition-colors relative ${
                activeTab === 'requester' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ClipboardList className="w-4 h-4" />
                <span>요청</span>
              </div>
              {activeTab === 'requester' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
              )}
            </button>
            <button
              onClick={() => handleTabChange('helper')}
              className={`flex-1 py-3 text-sm font-medium text-center transition-colors relative ${
                activeTab === 'helper' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Bike className="w-4 h-4" />
                <span>라이더</span>
              </div>
              {activeTab === 'helper' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
              )}
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="p-4">
          {/* 요청자 메뉴 */}
          {activeTab === 'requester' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {requesterMenuItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors ${
                    index !== requesterMenuItems.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500">{item.icon}</div>
                    <span className="text-gray-900 font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 라이더 메뉴 (등록됨) */}
          {activeTab === 'helper' && isRegisteredHelper && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {helperMenuItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors ${
                    index !== helperMenuItems.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500">{item.icon}</div>
                    <span className="text-gray-900 font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 라이더 등록 안내 */}
          {activeTab === 'helper' && !isRegisteredHelper && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bike className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">라이더로 활동해보세요!</h3>
              <p className="text-gray-500 text-sm mb-4">
                심부름을 수행하고 수익을 올려보세요.
                <br />첫 달은 무료로 체험할 수 있습니다.
              </p>
              <Link
                href="/mypage/helper/register"
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>라이더 등록하기</span>
              </Link>
            </div>
          )}

          {/* 심부름 요청하기 버튼 */}
          {activeTab === 'requester' && (
            <Link
              href="/errands/create"
              className="flex items-center justify-center gap-2 w-full mt-4 py-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>새 심부름 요청하기</span>
            </Link>
          )}
        </div>
      </div>

      {/* 플로팅 서비스 전환 버튼 */}
      <ServiceSwitcher currentService="errands" />
    </div>
  );
}
