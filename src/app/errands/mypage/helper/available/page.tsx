'use client';

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ErrandMypageLayout from '@/components/errands/ErrandMypageLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { getCategoryLabel } from '@/lib/errands/category';
import {
  MapPin,
  ChevronRight,
  Bike,
  Package,
  ShoppingBag,
  RefreshCw,
  Navigation,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Loader2,
} from 'lucide-react';

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
  distance_km?: number | null;
}

type CategoryFilter = 'all' | 'DELIVERY' | 'SHOPPING' | 'OTHER';
type SortOption = 'recent' | 'distance' | 'price';

interface LocationState {
  lat: number;
  lng: number;
}

export default function HelperAvailableErrandsPage() {
  const { user } = useAuth();
  const [errands, setErrands] = useState<Errand[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [maxDistance, setMaxDistance] = useState<number>(0); // 0 = 제한 없음
  const [showFilterModal, setShowFilterModal] = useState(false);

  // 위치 관련 상태
  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // 위치 가져오기
  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError('위치 서비스를 지원하지 않는 브라우저입니다');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        // eslint-disable-next-line sonarjs/no-intrusive-permissions -- 위치 기반 심부름 매칭에 필수적인 기능
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000, // 1분 캐시
        });
      });

      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    } catch (err) {
      const geoError = err as GeolocationPositionError;
      if (geoError.code === geoError.PERMISSION_DENIED) {
        setLocationError('위치 권한을 허용해주세요');
      } else {
        setLocationError('위치를 확인할 수 없습니다');
      }
    } finally {
      setLocationLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 위치 가져오기
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // 심부름 목록 로드
  const loadAvailableErrands = useCallback(async () => {
    try {
      setLoading(true);

      // 쿼리 파라미터 구성
      const params = new URLSearchParams();
      params.set('mode', 'available');

      if (categoryFilter !== 'all') {
        params.set('category', categoryFilter);
      }

      // 위치 기반 파라미터
      if (location) {
        params.set('lat', location.lat.toString());
        params.set('lng', location.lng.toString());
        params.set('sort', sortBy);

        if (maxDistance > 0) {
          params.set('maxDistance', maxDistance.toString());
        }
      }

      const response = await fetch(`/api/errands?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setErrands(data.errands || []);
      }
    } catch (error) {
      logger.error('심부름 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, location, sortBy, maxDistance]);

  useEffect(() => {
    if (user) {
      loadAvailableErrands();
    }
  }, [user, loadAvailableErrands]);

  async function handleRefresh() {
    setRefreshing(true);
    await getLocation();
    await loadAvailableErrands();
    setRefreshing(false);
  }

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

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'recent', label: '최신순' },
    { value: 'distance', label: '거리순' },
    { value: 'price', label: '가격순' },
  ];

  const distanceOptions = [
    { value: 0, label: '제한 없음' },
    { value: 1, label: '1km 이내' },
    { value: 3, label: '3km 이내' },
    { value: 5, label: '5km 이내' },
    { value: 10, label: '10km 이내' },
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

  const formatDistance = (km: number | null | undefined) => {
    if (km === null || km === undefined) return null;
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
  };

  const getSortLabel = () => {
    const option = sortOptions.find((o) => o.value === sortBy);
    return option?.label || '최신순';
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

        {/* 위치 상태 표시 */}
        {locationLoading && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg mb-4">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700">위치 확인 중...</span>
          </div>
        )}

        {locationError && (
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">{locationError}</span>
            </div>
            <button
              onClick={getLocation}
              className="text-sm text-yellow-700 font-medium hover:text-yellow-800"
            >
              재시도
            </button>
          </div>
        )}

        {location && !locationLoading && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg mb-4">
            <Navigation className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">내 위치 기준으로 거리가 표시됩니다</span>
          </div>
        )}

        {/* 정렬/필터 버튼 */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            필터
            {maxDistance > 0 && (
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">
                1
              </span>
            )}
          </button>
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          >
            <ArrowUpDown className="w-4 h-4" />
            {getSortLabel()}
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
              const distanceText = formatDistance(errand.distance_km);

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
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {getCategoryLabel(errand.category)}
                          </span>
                          {distanceText && (
                            <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                              <Navigation className="w-3 h-3" />
                              {distanceText}
                            </span>
                          )}
                        </div>
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

        {/* 필터 모달 */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center">
            <div className="bg-white w-full lg:w-[400px] lg:rounded-xl rounded-t-xl max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">정렬 및 필터</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-6 overflow-y-auto">
                {/* 정렬 옵션 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">정렬</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        disabled={option.value === 'distance' && !location}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          sortBy === option.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {!location && (
                    <p className="text-xs text-gray-500 mt-2">
                      * 거리순 정렬은 위치 권한이 필요합니다
                    </p>
                  )}
                </div>

                {/* 거리 필터 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">최대 거리</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {distanceOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setMaxDistance(option.value)}
                        disabled={option.value > 0 && !location}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          maxDistance === option.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {!location && (
                    <p className="text-xs text-gray-500 mt-2">
                      * 거리 필터는 위치 권한이 필요합니다
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  적용하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrandMypageLayout>
  );
}
