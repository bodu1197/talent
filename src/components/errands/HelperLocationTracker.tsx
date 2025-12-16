'use client';

import { useState } from 'react';
import { useHelperLocationTracking } from '@/hooks/useHelperLocationTracking';
import { MapPin, Power, Loader2, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';

interface HelperLocationTrackerProps {
  /** 라이더 활동 가능 여부 (구독 상태 등) */
  readonly isActiveHelper?: boolean;
  /** 클래스 이름 */
  readonly className?: string;
}

// eslint-disable-next-line sonarjs/cognitive-complexity -- 위치 추적 UI 상태 분기로 인한 예외 처리
export default function HelperLocationTracker({
  isActiveHelper = true,
  className = '',
}: HelperLocationTrackerProps) {
  const [showDetails, setShowDetails] = useState(false);

  const {
    location,
    error,
    isTracking,
    isOnline,
    lastUpdate,
    startTracking,
    stopTracking,
    permissionStatus,
  } = useHelperLocationTracking({
    isActive: isActiveHelper,
    onError: (err) => {
      console.error('위치 오류:', err);
    },
  });

  const handleToggle = async () => {
    if (isOnline) {
      await stopTracking();
    } else {
      await startTracking();
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 권한이 거부된 경우
  if (permissionStatus === 'denied') {
    return (
      <div className={`bg-red-50 rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-700">위치 권한이 필요합니다</p>
            <p className="text-sm text-red-600 mt-1">
              심부름 매칭을 위해 위치 권한을 허용해주세요. 브라우저 설정에서 위치 권한을 변경할 수
              있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 라이더 활동 불가 상태
  if (!isActiveHelper) {
    return (
      <div className={`bg-gray-100 rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700">활동 불가</p>
            <p className="text-sm text-gray-500 mt-1">
              구독이 만료되었거나 활성화되지 않았습니다. 구독을 갱신하면 활동을 시작할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}>
      {/* 메인 토글 영역 */}
      <div className={`p-4 transition-colors ${isOnline ? 'bg-green-500' : 'bg-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isOnline ? 'bg-white/20' : 'bg-gray-200'
              }`}
            >
              {isTracking ? (
                <Navigation className={`w-6 h-6 ${isOnline ? 'text-white' : 'text-gray-500'}`} />
              ) : (
                <MapPin className={`w-6 h-6 ${isOnline ? 'text-white' : 'text-gray-500'}`} />
              )}
            </div>
            <div>
              <p className={`font-bold ${isOnline ? 'text-white' : 'text-gray-900'}`}>
                {isOnline ? '활동 중' : '활동 대기'}
              </p>
              <p className={`text-sm ${isOnline ? 'text-green-100' : 'text-gray-500'}`}>
                {isOnline
                  ? '주변 심부름 요청을 받을 수 있습니다'
                  : '활동 시작하여 심부름을 받아보세요'}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggle}
            disabled={!isActiveHelper}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isOnline
                ? 'bg-white text-green-500 hover:bg-green-50'
                : 'bg-green-500 text-white hover:bg-green-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isTracking && !isOnline ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Power className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* 상태 정보 */}
      {isOnline && (
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => setShowDetails(!showDetails)} className="w-full text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">위치 추적 활성화됨</span>
              </div>
              <span className="text-xs text-gray-400">{showDetails ? '접기' : '상세보기'}</span>
            </div>
          </button>

          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">현재 위치</span>
                <span className="text-gray-900 font-mono text-xs">
                  {location
                    ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                    : '확인 중...'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">정확도</span>
                <span className="text-gray-900">
                  {location?.accuracy ? `${Math.round(location.accuracy)}m` : '-'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">마지막 업데이트</span>
                <span className="text-gray-900">{formatTime(lastUpdate)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">* 5분마다 자동 업데이트됩니다</p>
            </div>
          )}
        </div>
      )}

      {/* 에러 표시 */}
      {error && (
        <div className="p-4 bg-red-50 border-t border-red-100">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
