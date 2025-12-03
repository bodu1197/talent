'use client';

import { useState, useEffect, useCallback } from 'react';
import LocationHeroBanner from '@/components/errands/LocationHeroBanner';
import { getCurrentPosition, reverseGeocode } from '@/lib/location/address-api';
import Link from 'next/link';
import Image from 'next/image';

// 아이콘 컴포넌트
const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
    />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

interface NearbyExpert {
  seller_id: string;
  seller_name: string;
  seller_profile_image: string | null;
  seller_average_rating: number;
  seller_total_reviews: number;
  service_id: string;
  service_title: string;
  service_price: number;
  category_name: string;
  distance_km: number;
  seller_region: string;
}

interface LocationState {
  latitude: number;
  longitude: number;
  region: string;
  address: string;
}

export default function ErrandsPage() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [nearbyExperts, setNearbyExperts] = useState<NearbyExpert[]>([]);
  const [isLoadingExperts, setIsLoadingExperts] = useState(false);

  // 주변 전문가 가져오기
  const fetchNearbyExperts = useCallback(async (lat: number, lng: number) => {
    setIsLoadingExperts(true);
    try {
      const response = await fetch(`/api/experts/nearby?lat=${lat}&lng=${lng}&radius=10&limit=12`);
      if (response.ok) {
        const data = await response.json();
        setNearbyExperts(data.experts || []);
      }
    } catch (error) {
      console.error('주변 전문가 로딩 실패:', error);
    } finally {
      setIsLoadingExperts(false);
    }
  }, []);

  // 현재 위치 가져오기
  const handleGetLocation = useCallback(async () => {
    setIsLoadingLocation(true);

    try {
      const coords = await getCurrentPosition();
      const result = await reverseGeocode(coords.latitude, coords.longitude);

      if (result) {
        const newLocation = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          region: result.region || '알 수 없음',
          address: result.roadAddress || result.address || '',
        };
        setLocation(newLocation);
        await fetchNearbyExperts(coords.latitude, coords.longitude);
      }
    } catch (err) {
      console.error('위치 가져오기 실패:', err);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [fetchNearbyExperts]);

  // 컴포넌트 마운트 시 자동으로 위치 요청
  useEffect(() => {
    handleGetLocation();
  }, [handleGetLocation]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 배너 (실제 위치 데이터) */}
      <LocationHeroBanner />

      {/* 주변 전문가 리스트 */}
      <section className="py-8 md:py-12">
        <div className="container-1200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">가까운 전문가</h2>
              {location && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4 text-orange-500" />
                  {location.region} 기준 10km 이내
                </p>
              )}
            </div>
            {location && (
              <Link
                href={`/search?lat=${location.latitude}&lng=${location.longitude}&radius=10`}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                전체 보기
              </Link>
            )}
          </div>

          {(isLoadingLocation || isLoadingExperts) && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <LoadingSpinner className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <p className="text-gray-500">
                  {isLoadingLocation ? '위치 확인 중...' : '주변 전문가 찾는 중...'}
                </p>
              </div>
            </div>
          )}

          {!isLoadingLocation && !isLoadingExperts && nearbyExperts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {nearbyExperts.map((expert) => (
                <Link
                  key={expert.service_id}
                  href={`/services/${expert.service_id}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* 전문가 정보 */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {expert.seller_profile_image ? (
                          <Image
                            src={expert.seller_profile_image}
                            alt={expert.seller_name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-medium">
                            {expert.seller_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 truncate">{expert.seller_name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="flex items-center gap-0.5">
                            <StarIcon className="w-3.5 h-3.5 text-yellow-400" />
                            {expert.seller_average_rating.toFixed(1)}
                          </span>
                          <span>({expert.seller_total_reviews})</span>
                        </div>
                      </div>
                    </div>

                    {/* 서비스 정보 */}
                    <h4 className="text-sm text-gray-700 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {expert.service_title}
                    </h4>

                    {/* 카테고리 & 거리 */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {expert.category_name}
                      </span>
                      <span className="flex items-center gap-1 text-orange-600">
                        <MapPinIcon className="w-3.5 h-3.5" />
                        {expert.distance_km.toFixed(1)}km
                      </span>
                    </div>

                    {/* 가격 */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-lg font-bold text-gray-900">
                        {expert.service_price.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoadingLocation && !isLoadingExperts && nearbyExperts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <MapPinIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">주변에 전문가가 없습니다</h3>
              <p className="text-gray-500 mb-4">
                {location
                  ? '검색 범위를 넓혀서 다시 찾아보세요'
                  : '위치를 허용하면 가까운 전문가를 찾을 수 있어요'}
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                전체 서비스 둘러보기
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 오프라인 서비스 안내 */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="container-1200">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">심부름 서비스란?</h2>
            <p className="text-gray-600 mb-6">
              내 주변의 전문가가 직접 방문하여 서비스를 제공합니다.
              <br />
              청소, 수리, 이사, 뷰티, 이벤트 등 다양한 분야의 전문가를 만나보세요.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPinIcon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">위치 기반 검색</h3>
                <p className="text-sm text-gray-500">
                  내 위치에서 가까운 전문가를 자동으로 찾아드려요
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">검증된 전문가</h3>
                <p className="text-sm text-gray-500">리뷰와 평점으로 검증된 전문가만 만나보세요</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">안전한 결제</h3>
                <p className="text-sm text-gray-500">서비스 완료 후 안전하게 결제할 수 있어요</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
