'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { MapPin, Send, X, Loader2, AlertCircle, HelpCircle, RefreshCw } from 'lucide-react';
import {
  parseGeolocationError,
  checkGeolocationAvailability,
  logGeolocationError,
  type GeolocationErrorDetails,
} from '@/lib/location/geolocation-error';

interface LocationSortToggleProps {
  readonly className?: string;
}

export default function LocationSortToggle({ className = '' }: LocationSortToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<GeolocationErrorDetails | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
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

  // 오류 초기화
  const clearError = useCallback(() => {
    setError(null);
    setErrorDetails(null);
    setShowErrorModal(false);
  }, []);

  // Get current location and update URL
  const enableLocationSort = useCallback(async () => {
    // 먼저 Geolocation 사용 가능 여부 확인
    const availability = checkGeolocationAvailability();
    if (!availability.available) {
      setError(availability.reason || '위치 기능을 사용할 수 없습니다');
      setErrorDetails({
        code: 0,
        type: 'unsupported',
        title: '위치 기능 사용 불가',
        message: availability.reason || '',
        userMessage: availability.reason || '위치 기능을 사용할 수 없습니다',
        solutions: ['최신 브라우저를 사용해주세요', 'HTTPS 연결이 필요합니다'],
        isRetryable: availability.canRetry,
        severity: 'error',
      });
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        // eslint-disable-next-line sonarjs/no-intrusive-permissions -- 거리순 정렬에 위치 권한 필요
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000, // 15초로 증가
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
      // 강력한 오류 처리
      const details = parseGeolocationError(err);
      logGeolocationError(err, 'LocationSortToggle');

      setError(details.userMessage);
      setErrorDetails(details);
    } finally {
      setIsLoading(false);
    }
  }, [router, pathname, searchParams, clearError]);

  // Disable location sort
  const disableLocationSort = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('lat');
    params.delete('lng');
    params.delete('page'); // Reset to first page

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }, [router, pathname, searchParams]);

  // 오류 심각도에 따른 아이콘 색상
  const getErrorIconColor = (severity?: string) => {
    switch (severity) {
      case 'warning':
        return 'text-amber-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  // 오류 심각도에 따른 배경 색상
  const getErrorBgColor = (severity?: string) => {
    switch (severity) {
      case 'warning':
        return 'bg-amber-100';
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-blue-100';
    }
  };

  return (
    <>
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
              className={`inline-flex transition-all duration-700 ease-out ${isAnimated
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

        {/* 간단한 오류 표시 (클릭하면 상세 정보) */}
        {error && (
          <button
            onClick={() => setShowErrorModal(true)}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
            title="오류 상세 정보 보기"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline max-w-[150px] truncate">{error}</span>
            <HelpCircle className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 오류 상세 모달 */}
      {showErrorModal && errorDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="presentation"
        >
          <dialog
            open
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200"
            aria-labelledby="error-dialog-title"
            aria-describedby="error-dialog-desc"
          >
            {/* 헤더 */}
            <div className="flex items-start gap-3 mb-4">
              <div className={`p-2 rounded-full ${getErrorBgColor(errorDetails.severity)}`}>
                <AlertCircle className={`w-6 h-6 ${getErrorIconColor(errorDetails.severity)}`} />
              </div>
              <div className="flex-1">
                <h3 id="error-dialog-title" className="font-bold text-gray-900">{errorDetails.title}</h3>
                <p id="error-dialog-desc" className="text-sm text-gray-600 mt-1">{errorDetails.userMessage}</p>
              </div>
              <button
                onClick={() => setShowErrorModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="닫기"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* 해결 방법 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                해결 방법
              </h4>
              <ul className="space-y-2">
                {errorDetails.solutions.map((solution) => (
                  <li key={solution} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-orange-500 font-bold mt-0.5">•</span>
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 기술적 정보 (접힌 상태) */}
            <details className="text-xs text-gray-500 mb-4">
              <summary className="cursor-pointer hover:text-gray-700">기술적 정보</summary>
              <div className="mt-2 p-2 bg-gray-100 rounded font-mono">
                <p>Error Code: {errorDetails.code}</p>
                <p>Type: {errorDetails.type}</p>
                <p>Retryable: {errorDetails.isRetryable ? 'Yes' : 'No'}</p>
              </div>
            </details>

            {/* 액션 버튼 */}
            <div className="flex gap-3">
              {errorDetails.isRetryable && (
                <button
                  onClick={() => {
                    setShowErrorModal(false);
                    enableLocationSort();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  다시 시도
                </button>
              )}
              <button
                onClick={() => setShowErrorModal(false)}
                className={`${errorDetails.isRetryable ? '' : 'flex-1'} px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors`}
              >
                닫기
              </button>
            </div>
          </dialog>
        </div>
      )}
    </>
  );
}
