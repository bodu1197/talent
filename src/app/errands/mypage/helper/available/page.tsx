'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ErrandMypageLayout from '@/components/errands/ErrandMypageLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { MapPin, ChevronRight, Bike, Package, ShoppingBag, RefreshCw } from 'lucide-react';

interface Errand {
  id: string;
  title: string;
  category: string;
  total_price: number;
  pickup_address: string;
  delivery_address: string;
  created_at: string;
  scheduled_at: string | null;
  hasApplied?: boolean;
}

type CategoryFilter = 'all' | 'DELIVERY' | 'SHOPPING' | 'OTHER';

export default function HelperAvailableErrandsPage() {
  const { user } = useAuth();
  const [errands, setErrands] = useState<Errand[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadAvailableErrands();
    }
  }, [user, categoryFilter]);

  async function loadAvailableErrands() {
    try {
      setLoading(true);
      const categoryParam = categoryFilter === 'all' ? '' : `&category=${categoryFilter}`;
      const response = await fetch(`/api/errands?mode=available${categoryParam}`);
      if (response.ok) {
        const data = await response.json();
        setErrands(data.errands || []);
      }
    } catch (error) {
      console.error('심부름 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadAvailableErrands();
    setRefreshing(false);
  }

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      DELIVERY: '배달',
      SHOPPING: '구매대행',
      MOVING: '이사/운반',
      QUEUEING: '줄서기',
      PET_CARE: '반려동물',
      CLEANING: '청소',
      BUG_CATCHING: '벌레 잡기',
      DOCUMENT: '서류',
      OTHER: '기타',
    };
    return categoryMap[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DELIVERY':
        return Bike;
      case 'SHOPPING':
        return ShoppingBag;
      default:
        return Package;
    }
  };

  const categoryTabs: { value: CategoryFilter; label: string; icon: typeof Bike }[] = [
    { value: 'all', label: '전체', icon: Package },
    { value: 'DELIVERY', label: '배달', icon: Bike },
    { value: 'SHOPPING', label: '구매대행', icon: ShoppingBag },
    { value: 'OTHER', label: '기타', icon: Package },
  ];

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
  };

  return (
    <ErrandMypageLayout mode="helper">
      <div className="p-4 lg:p-0">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">심부름 찾기</h1>
            <p className="text-sm text-gray-600">주변의 새로운 심부름을 찾아보세요</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            aria-label="새로고침"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setCategoryFilter(tab.value)}
                className={`flex items-center gap-2 flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoryFilter === tab.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 심부름 목록 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          </div>
        )}
        {!loading && errands.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-2">현재 가능한 심부름이 없습니다</p>
            <p className="text-sm text-gray-400">나중에 다시 확인해주세요</p>
          </div>
        )}
        {!loading && errands.length > 0 && (
          <div className="space-y-3">
            {errands.map((errand) => {
              const CategoryIcon = getCategoryIcon(errand.category);
              return (
                <Link
                  key={errand.id}
                  href={`/errands/${errand.id}`}
                  className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CategoryIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">
                          {getCategoryLabel(errand.category)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {getTimeAgo(errand.created_at)}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">{errand.title}</h3>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span className="truncate">{errand.pickup_address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span className="truncate">{errand.delivery_address}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <p className="font-bold text-blue-600 text-lg">
                          {errand.total_price.toLocaleString()}원
                        </p>
                        {errand.hasApplied ? (
                          <span className="text-sm text-green-600 font-medium">지원 완료</span>
                        ) : (
                          <span className="flex items-center gap-1 text-sm text-blue-600">
                            지원하기
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </ErrandMypageLayout>
  );
}
