'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Zap,
  Shield,
  Navigation,
  Package,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import HelperActiveToggle from '@/components/errands/HelperActiveToggle';

// 타입 정의
interface Helper {
  id: number;
  name: string;
  avatar: string;
  angle: number;
  radius: number;
  distance: number;
  isVisible: boolean;
}

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

// 초기 헬퍼 데이터 (레이더용)
const createInitialHelpers = (): Helper[] => {
  const names = ['김민수', '이지은', '박철민', '최영희', '정대현', '한소연'];
  const seeds = ['Felix', 'Aneka', 'John', 'Sarah', 'Mike', 'Luna'];
  const angles = [30, 120, 210, 300, 75, 255];
  const radii = [0.4, 0.6, 0.5, 0.7, 0.45, 0.65];

  return names.map((name, i) => ({
    id: i,
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seeds[i]}`,
    angle: angles[i],
    radius: radii[i],
    distance: radii[i] * 1.5,
    isVisible: i < 3,
  }));
};

// 위치 계산 함수
const getPosition = (angle: number, radius: number) => {
  const centerOffset = 50;
  const maxOffset = 42;
  const rad = (angle * Math.PI) / 180;
  const x = centerOffset + Math.cos(rad) * radius * maxOffset;
  const y = centerOffset + Math.sin(rad) * radius * maxOffset;
  return { x, y };
};

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
    return (
      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
        매칭완료
      </span>
    );
  }
  return (
    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
      대기중
    </span>
  );
};

export default function ErrandsPage() {
  const [helpers, setHelpers] = useState<Helper[]>(createInitialHelpers());
  const [totalCount, setTotalCount] = useState(24);
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

  /* eslint-disable sonarjs/pseudo-random */
  // 헬퍼 동적 업데이트 (UI 애니메이션용 랜덤 - 보안과 무관)
  const updateHelpers = useCallback(() => {
    setHelpers((prev) => {
      const newHelpers = [...prev];
      newHelpers.forEach((h, idx) => {
        if (h.isVisible) {
          newHelpers[idx] = {
            ...h,
            angle: h.angle + (Math.random() - 0.5) * 15,
            radius: Math.max(0.2, Math.min(0.9, h.radius + (Math.random() - 0.5) * 0.1)),
          };
        }
      });

      // 랜덤하게 visible 토글
      const randomIdx = Math.floor(Math.random() * newHelpers.length);
      if (Math.random() > 0.7) {
        newHelpers[randomIdx] = {
          ...newHelpers[randomIdx],
          isVisible: !newHelpers[randomIdx].isVisible,
        };
      }

      return newHelpers;
    });
    setTotalCount(20 + Math.floor(Math.random() * 10));
  }, []);
  /* eslint-enable sonarjs/pseudo-random */

  useEffect(() => {
    if (!isHydrated) return;
    const interval = setInterval(updateHelpers, 3000);
    return () => clearInterval(interval);
  }, [isHydrated, updateHelpers]);

  const visibleHelpers = helpers.filter((h) => h.isVisible);

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
        {/* 히어로 섹션 */}
        <section className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gray-900 border border-gray-800 shadow-2xl mb-8">
          {/* 배경 도트 패턴 */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#4B5563 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 p-6 md:p-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* 좌측: 레이더 시각화 */}
              <div className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center flex-shrink-0 order-2 md:order-1">
                {/* 중앙 사용자 위치 */}
                <div className="absolute w-4 h-4 bg-blue-500 rounded-full z-20 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse" />
                <div className="absolute bg-blue-500/20 w-16 h-16 rounded-full blur-md" />

                {/* Ripple 효과 */}
                <div
                  className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping"
                  style={{ animationDuration: '3s' }}
                />
                <div
                  className="absolute inset-6 rounded-full border border-blue-500/20 animate-ping"
                  style={{ animationDuration: '3s', animationDelay: '1s' }}
                />
                <div
                  className="absolute inset-12 rounded-full border border-blue-500/10 animate-ping"
                  style={{ animationDuration: '3s', animationDelay: '2s' }}
                />

                {/* 헬퍼들 */}
                {visibleHelpers.map((helper) => {
                  const pos = getPosition(helper.angle, helper.radius);
                  return (
                    <div
                      key={helper.id}
                      className="absolute z-10 transition-all duration-1000 ease-in-out"
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-full bg-white border-2 border-green-500 flex items-center justify-center overflow-hidden shadow-lg animate-bounce"
                        style={{ animationDuration: `${1.5 + helper.id * 0.2}s` }}
                      >
                        <Image
                          src={helper.avatar}
                          alt={helper.name}
                          width={36}
                          height={36}
                          className="w-full h-full"
                          unoptimized
                        />
                      </div>
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap">
                        {(helper.radius * 1.5).toFixed(1)}km
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 우측: 텍스트 콘텐츠 */}
              <div className="text-center md:text-left max-w-md order-1 md:order-2">
                <div className="inline-flex items-center gap-2 bg-gray-800/80 backdrop-blur border border-gray-700 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-4">
                  <MapPin size={14} className="animate-pulse" />
                  <span>내 위치 기준</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3">
                  내 주변{' '}
                  <span className="text-green-400 transition-all duration-500 inline-block min-w-[2ch] tabular-nums">
                    {totalCount}
                  </span>
                  명의 라이더가
                  <br />
                  대기하고 있어요
                </h1>

                <p className="text-gray-400 text-sm md:text-base mb-6">
                  지금 요청하면 평균 <span className="text-white font-bold">5분 내</span>{' '}
                  매칭됩니다.
                </p>

                <Link
                  href="/errands/new"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg shadow-blue-900/50 transition transform active:scale-95"
                >
                  <Zap size={20} fill="currentColor" />
                  지금 호출하기
                </Link>
              </div>
            </div>
          </div>

          {/* 하단 특징 바 */}
          <div className="relative z-10 bg-gray-900/90 border-t border-gray-800 px-6 py-4">
            <div className="flex flex-wrap justify-center md:justify-around gap-4 md:gap-6 text-xs md:text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-green-500" />
                <span>신원검증 완료</span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation size={14} className="text-blue-500" />
                <span>실시간 위치 추적</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-purple-500" />
                <span>평균 5분 내 매칭</span>
              </div>
            </div>
          </div>
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
