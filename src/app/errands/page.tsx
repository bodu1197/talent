'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Zap,
  Navigation,
  Package,
  ArrowRight,
  Loader2,
  UtensilsCrossed,
} from 'lucide-react';
import HelperActiveToggle from '@/components/errands/HelperActiveToggle';
import ErrandsKakaoMap from '@/components/errands/ErrandsKakaoMap';

// 타입 정의
interface ErrandRequest {
  id: string;
  title: string;
  category: string;
  total_price: number;
  pickup_address: string;
  delivery_address: string;
  status: string;
  distance_km?: number | null;
  created_at: string;
  is_heavy?: boolean;
}

// 카테고리 정의
const CATEGORIES = [
  { value: 'ALL', label: '전체' },
  { value: 'DELIVERY', label: '배달', color: 'bg-blue-100 text-blue-700' },
  { value: 'SHOPPING', label: '구매대행', color: 'bg-green-100 text-green-700' },
];

// 카테고리 색상
const getCategoryColor = (category: string) => {
  const cat = CATEGORIES.find((c) => c.value === category);
  return cat?.color || 'bg-gray-100 text-gray-700';
};

// 심부름 상태 배지 렌더링
const renderStatusBadge = (status: string) => {
  if (status === 'IN_PROGRESS') {
    return (
      <span className="flex items-center gap-1 text-white text-xs font-bold bg-green-500 px-3 py-1.5 rounded-full shadow-sm">
        <Navigation size={12} />
        <span>진행중</span>
      </span>
    );
  }
  if (status === 'MATCHED') {
    return <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">매칭완료</span>;
  }
  return <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">대기중</span>;
};

export default function ErrandsPage() {
  const [helperCount, setHelperCount] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [errands, setErrands] = useState<ErrandRequest[]>([]);
  const [errandsLoading, setErrandsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 하이드레이션 완료
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 사용자 위치 가져오기
  useEffect(() => {
    /* eslint-disable sonarjs/no-intrusive-permissions -- Geolocation is required for distance-based errand sorting */
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        // 위치 권한 거부 시 서울 중심 좌표 사용
        setUserLocation({ lat: 37.5665, lng: 126.978 });
      }
    );
    /* eslint-enable sonarjs/no-intrusive-permissions */
  }, []);

  // 심부름 목록 가져오기
  const fetchErrands = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        mode: 'available',
        sort: 'distance',
        limit: '10',
      });

      if (userLocation) {
        params.set('lat', userLocation.lat.toString());
        params.set('lng', userLocation.lng.toString());
      }

      const response = await fetch(`/api/errands?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setErrands(data.errands || []);
      }
    } catch {
      // 에러 시 빈 목록 유지
    } finally {
      setErrandsLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    if (isHydrated && userLocation) {
      fetchErrands();
    } else if (isHydrated && !userLocation) {
      // 위치 없어도 일단 로딩
      const timer = setTimeout(() => {
        fetchErrands();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, userLocation, fetchErrands]);

  // 심부름 목록 렌더링
  const renderErrandsList = () => {
    if (errandsLoading) {
      return (
        <div className="flex items-center justify-center py-20 bg-white rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
    }

    if (errands.length === 0) {
      return (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">현재 대기 중인 심부름이 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">새로운 심부름을 요청해보세요!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {errands.map((errand) => (
          <Link
            key={errand.id}
            href={`/errands/${errand.id}`}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group overflow-hidden block"
          >
            {/* 헤더: 가격 & 카테고리 */}
            <div className="p-5 pb-2">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold ${getCategoryColor(errand.category)}`}
                  >
                    {errand.category === 'DELIVERY' ? '배달' : '구매대행'}
                  </span>
                  {errand.distance_km != null && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs flex items-center gap-1">
                      <MapPin size={10} />
                      {errand.distance_km.toFixed(1)}km
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {errand.total_price?.toLocaleString()}원
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition truncate">
                {errand.title}
              </h3>
            </div>

            {/* 경로 시각화 */}
            <div className="px-5 py-3 bg-gray-50 border-t border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1 text-gray-600 max-w-[40%] truncate">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="truncate">{errand.pickup_address}</span>
                </div>
                <ArrowRight size={14} className="text-gray-400 shrink-0" />
                <div className="flex items-center gap-1 text-gray-600 max-w-[40%] truncate">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="truncate">{errand.delivery_address}</span>
                </div>
              </div>
            </div>

            {/* 푸터: 태그 & 상태 */}
            <div className="p-4 pt-3 flex items-center justify-between">
              <div className="flex gap-1">
                {errand.is_heavy && (
                  <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-xs flex items-center gap-1">
                    <Package size={12} /> 무거움
                  </span>
                )}
              </div>

              {renderStatusBadge(errand.status)}
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-1200 py-6">
        {/* 지도 섹션 */}
        <section className="mb-6">
          <ErrandsKakaoMap className="mb-4" onHelperCountChange={setHelperCount} />

          {/* CTA 버튼 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 md:p-6 text-white">
            <div className="text-center sm:text-left">
              <h2 className="text-lg md:text-xl font-bold mb-1">
                내 주변 <span className="text-yellow-300">{helperCount}</span>명의 라이더가 대기 중
              </h2>
              <p className="text-blue-100 text-sm">
                지금 요청하면 평균 <span className="font-bold text-white">5분 내</span> 매칭됩니다
              </p>
            </div>
            <Link
              href="/errands/new"
              className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:bg-blue-50 transition transform active:scale-95 shrink-0"
            >
              <Zap size={20} fill="currentColor" />
              지금 호출하기
            </Link>
          </div>
        </section>

        {/* 음식 배달 서비스 배너 */}
        <section className="mb-6">
          <Link
            href="/food"
            className="block bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-5 text-white hover:from-orange-600 hover:to-orange-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <UtensilsCrossed className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs text-orange-100 mb-0.5">🆕 새로운 서비스</p>
                  <h3 className="text-lg font-bold">돌파구 동네배달</h3>
                  <p className="text-sm text-orange-100">
                    배달앱이 30% 가져갈 때, 우리는 300원만 받습니다
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </section>

        {/* 라이더 활성 토글 */}
        <HelperActiveToggle className="mb-8" />

        {/* 주변 요청 목록 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">주변 심부름 요청</h2>
              {userLocation && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <Navigation size={10} />
                  거리순
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">{errands.length}건</span>
          </div>

          {/* 요청 목록 */}
          {renderErrandsList()}
        </section>
      </div>
    </div>
  );
}
