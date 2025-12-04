'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import { useAuth } from '@/components/providers/AuthProvider';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { logger } from '@/lib/logger';
import {
  MapPin,
  Clock,
  ChevronRight,
  Package,
  ShoppingCart,
  Bike,
  RefreshCw,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Errand, ErrandCategory, ERRAND_CATEGORY_LABELS } from '@/types/errand';

const CATEGORY_ICONS: Record<ErrandCategory, React.ReactNode> = {
  DELIVERY: <Package className="w-5 h-5" />,
  SHOPPING: <ShoppingCart className="w-5 h-5" />,
};

export default function AvailableErrandsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [errands, setErrands] = useState<Errand[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ErrandCategory | 'ALL'>('ALL');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/mypage/helper/available');
      return;
    }

    if (user) {
      loadAvailableErrands();
    }
  }, [user, authLoading, router]);

  async function loadAvailableErrands() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        mode: 'available',
        limit: '50',
      });

      if (selectedCategory !== 'ALL') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/errands?${params.toString()}`);

      if (!response.ok) {
        throw new Error('심부름 목록을 불러올 수 없습니다');
      }

      const data = await response.json();
      setErrands(data.errands || []);
    } catch (err) {
      logger.error('심부름 목록 로드 실패:', err);
      setError('심부름 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadAvailableErrands();
    setRefreshing(false);
  }

  useEffect(() => {
    if (user && !authLoading) {
      loadAvailableErrands();
    }
  }, [selectedCategory]);

  const formatTimeAgo = (dateStr: string) => {
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

  if (authLoading || loading) {
    return (
      <MypageLayoutWrapper mode="helper">
        <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
          <LoadingSpinner message="심부름 목록을 불러오는 중..." />
        </div>
      </MypageLayoutWrapper>
    );
  }

  return (
    <MypageLayoutWrapper mode="helper">
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">심부름 찾기</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            전체
          </button>
          {(Object.keys(ERRAND_CATEGORY_LABELS) as ErrandCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {CATEGORY_ICONS[cat]}
              {ERRAND_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-sm text-red-600 underline hover:no-underline"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 심부름 목록 */}
        {errands.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Bike className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              지금은 진행 가능한 심부름이 없어요
            </h3>
            <p className="text-gray-500 mb-4">
              새로운 심부름이 등록되면 여기에 표시됩니다.
              <br />
              잠시 후 새로고침 해보세요!
            </p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {errands.map((errand) => (
              <Link
                key={errand.id}
                href={`/errands/${errand.id}`}
                className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* 카테고리 & 시간 */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {CATEGORY_ICONS[errand.category]}
                        {ERRAND_CATEGORY_LABELS[errand.category]}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(errand.created_at)}
                      </span>
                    </div>

                    {/* 제목 */}
                    <h3 className="font-medium text-gray-900 mb-2 truncate">{errand.title}</h3>

                    {/* 주소 정보 */}
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="w-14 text-green-600 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          출발
                        </span>
                        <span className="truncate">{errand.pickup_address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="w-14 text-red-600 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          도착
                        </span>
                        <span className="truncate">{errand.delivery_address}</span>
                      </div>
                    </div>
                  </div>

                  {/* 가격 & 화살표 */}
                  <div className="flex items-center gap-2 ml-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">
                        {errand.total_price?.toLocaleString()}원
                      </p>
                      {errand.estimated_distance && (
                        <p className="text-xs text-gray-500">
                          약 {errand.estimated_distance.toFixed(1)}km
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 안내 문구 */}
        <div className="mt-6 bg-orange-50 rounded-lg border border-orange-200 p-4">
          <h3 className="font-semibold text-orange-700 mb-2">심부름 지원 안내</h3>
          <ul className="space-y-1 text-sm text-orange-600">
            <li>- 심부름을 클릭하면 상세 정보를 확인할 수 있어요</li>
            <li>- 상세 페이지에서 &apos;지원하기&apos; 버튼을 눌러 지원하세요</li>
            <li>- 요청자가 수락하면 바로 심부름을 시작할 수 있어요</li>
          </ul>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
