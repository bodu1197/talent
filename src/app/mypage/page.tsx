'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { ShoppingBag, Bike, ChevronRight, Clock, Settings, Bell } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const LAST_SERVICE_KEY = 'dolpagu_last_mypage_service';

interface RecentActivity {
  id: string;
  type: 'order' | 'errand' | 'sale' | 'delivery';
  title: string;
  time: string;
}

export default function MypageHubPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    market: { buy: 0, sell: 0 },
    errands: { request: 0, delivery: 0 },
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegisteredSeller, setIsRegisteredSeller] = useState(false);
  const [isRegisteredHelper, setIsRegisteredHelper] = useState(false);

  // 로그인 체크 및 마지막 방문 서비스 확인
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login?redirect=/mypage');
      return;
    }

    // 마지막 방문 서비스 확인 - 바로 해당 마이페이지로 이동
    const lastService = localStorage.getItem(LAST_SERVICE_KEY);
    if (lastService === 'market') {
      router.replace('/mypage/buyer/dashboard');
      return;
    } else if (lastService === 'errands') {
      router.replace('/errands/mypage');
      return;
    }

    // 첫 방문이면 허브 페이지 표시
    setIsFirstVisit(true);
    loadDashboardData();
  }, [user, authLoading, router]);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // 통계 및 최근 활동 로드
      const [statsRes, activitiesRes, sellerRes, helperRes] = await Promise.all([
        fetch('/api/mypage/hub-stats'),
        fetch('/api/mypage/recent-activities'),
        fetch('/api/seller/check'),
        fetch('/api/helper/check'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setRecentActivities(activitiesData.activities || []);
      }

      if (sellerRes.ok) {
        const sellerData = await sellerRes.json();
        setIsRegisteredSeller(sellerData.isRegistered);
      }

      if (helperRes.ok) {
        const helperData = await helperRes.json();
        setIsRegisteredHelper(helperData.isRegistered);
      }
    } catch (error) {
      console.error('Dashboard data load error:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleServiceSelect(service: 'market' | 'errands') {
    localStorage.setItem(LAST_SERVICE_KEY, service);
    // 바로 해당 서비스의 마이페이지로 이동
    if (service === 'market') {
      router.push('/mypage/buyer/dashboard');
    } else {
      router.push('/errands/mypage');
    }
  }

  function getActivityIcon(type: string) {
    switch (type) {
      case 'order':
        return '📦';
      case 'sale':
        return '💰';
      case 'errand':
        return '📋';
      case 'delivery':
        return '🏍️';
      default:
        return '📌';
    }
  }

  if (authLoading || isFirstVisit === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="로딩 중..." />
      </div>
    );
  }

  if (!isFirstVisit) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/mypage/settings"
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Link>
            <Link
              href="/mypage/notifications"
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        </div>

        {/* 서비스 선택 카드 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* 재능마켓 카드 */}
          <button
            onClick={() => handleServiceSelect('market')}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">재능마켓</h2>
            <div className="text-sm text-gray-500 space-y-0.5">
              <p>구매 {stats.market.buy}건</p>
              {isRegisteredSeller && <p>판매 {stats.market.sell}건</p>}
            </div>
            <div className="flex items-center gap-1 text-blue-600 text-sm font-medium mt-3 group-hover:gap-2 transition-all">
              <span>바로가기</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* 심부름 카드 */}
          <button
            onClick={() => handleServiceSelect('errands')}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
              <Bike className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">심부름</h2>
            <div className="text-sm text-gray-500 space-y-0.5">
              <p>요청 {stats.errands.request}건</p>
              {isRegisteredHelper && <p>배달 {stats.errands.delivery}건</p>}
            </div>
            <div className="flex items-center gap-1 text-orange-600 text-sm font-medium mt-3 group-hover:gap-2 transition-all">
              <span>바로가기</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* 최근 활동 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-gray-900">최근 활동</h3>
          </div>

          {loading && <div className="py-8 text-center text-gray-400">로딩 중...</div>}
          {!loading && recentActivities.length === 0 && (
            <div className="py-8 text-center text-gray-400">
              <p>아직 활동 내역이 없습니다</p>
              <p className="text-sm mt-1">서비스를 이용해보세요!</p>
            </div>
          )}
          {!loading && recentActivities.length > 0 && (
            <ul className="space-y-3">
              {recentActivities.slice(0, 5).map((activity) => (
                <li key={activity.id} className="flex items-center gap-3 py-2">
                  <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{activity.title}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 안내 문구 */}
        <p className="text-center text-xs text-gray-400 mt-6">
          선택한 서비스는 다음 방문 시 자동으로 이동됩니다
        </p>
      </div>
    </div>
  );
}
