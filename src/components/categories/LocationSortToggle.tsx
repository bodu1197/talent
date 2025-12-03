'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { MapPin, Send, X, Loader2 } from 'lucide-react';

interface LocationSortToggleProps {
  className?: string;
}

export default function LocationSortToggle({ className = '' }: LocationSortToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);

  // 마운트 시 애니메이션 시작
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Check if location sorting is currently active
  const currentLat = searchParams.get('lat');
  const currentLng = searchParams.get('lng');
  const hasLocation = !!(currentLat && currentLng);

  // Get current location and update URL
  const enableLocationSort = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('이 브라우저에서는 위치 기능을 지원하지 않습니다');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        // eslint-disable-next-line sonarjs/no-intrusive-permissions -- 거리순 정렬에 위치 권한 필요
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5분 캐시
        });
      });

      const { latitude, longitude } = position.coords;

      // Build new URL with location params
      const params = new URLSearchParams(searchParams.toString());
      params.set('lat', latitude.toFixed(6));
      params.set('lng', longitude.toFixed(6));
      params.delete('page'); // Reset to first page when enabling location sort

      router.push(`${pathname}?${params.toString()}`);
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('위치 권한이 거부되었습니다');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('위치 정보를 사용할 수 없습니다');
            break;
          case err.TIMEOUT:
            setError('위치 요청 시간이 초과되었습니다');
            break;
          default:
            setError('위치를 가져올 수 없습니다');
        }
      } else {
        setError('위치를 가져올 수 없습니다');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, pathname, searchParams]);

  // Disable location sort
  const disableLocationSort = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('lat');
    params.delete('lng');
    params.delete('page'); // Reset to first page

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }, [router, pathname, searchParams]);

  // Auto-enable location on mount (optional - can be enabled if desired)
  // useEffect(() => {
  //   if (!hasLocation) {
  //     enableLocationSort();
  //   }
  // }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {hasLocation ? (
        <button
          onClick={disableLocationSort}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-pink-500 rounded-full hover:from-orange-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
          title="거리순 정렬 해제"
        >
          <MapPin className="w-4 h-4" />
          <span>거리순</span>
          <X className="w-3.5 h-3.5 ml-0.5" />
        </button>
      ) : (
        <button
          onClick={enableLocationSort}
          disabled={isLoading}
          className="group relative flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-orange-600 bg-gradient-to-r from-orange-50 to-pink-50 border-2 border-orange-300 rounded-full hover:from-orange-100 hover:to-pink-100 hover:border-orange-400 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          title="내 위치 기반으로 가까운 서비스 먼저 보기"
        >
          {/* 종이비행기 날아오는 애니메이션 */}
          <span
            className={`inline-flex transition-all duration-700 ease-out ${
              isAnimated
                ? 'translate-x-0 translate-y-0 rotate-0 opacity-100'
                : '-translate-x-8 -translate-y-4 -rotate-45 opacity-0'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            ) : (
              <Send className="w-4 h-4 text-orange-500 group-hover:text-orange-600 transition-colors" />
            )}
          </span>
          <span className="text-orange-600 group-hover:text-orange-700">
            {isLoading ? '위치 확인 중...' : '거리순'}
          </span>
          {/* 반짝임 효과 */}
          {!isLoading && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          )}
        </button>
      )}

      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
    </div>
  );
}
