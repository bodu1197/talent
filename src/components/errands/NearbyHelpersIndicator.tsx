'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bike, MapPin, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface NearbyHelpersIndicatorProps {
  /** 클래스 이름 */
  className?: string;
  /** 반경 (km, 기본 5) */
  radiusKm?: number;
  /** 컴팩트 모드 (작은 표시) */
  compact?: boolean;
}

interface NearbyHelpersData {
  count: number;
  message: string;
  location?: { lat: number; lng: number };
}

export default function NearbyHelpersIndicator({
  className = '',
  radiusKm = 5,
  compact = false,
}: NearbyHelpersIndicatorProps) {
  const [data, setData] = useState<NearbyHelpersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const fetchNearbyHelpers = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `/api/errands/nearby-helpers?lat=${lat}&lng=${lng}&radius=${radiusKm}`
      );

      if (!response.ok) {
        throw new Error('라이더 정보를 불러올 수 없습니다');
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }, [radiusKm]);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('이 브라우저에서는 위치 서비스를 지원하지 않습니다');
      setLoading(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchNearbyHelpers(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true);
          setError('위치 권한을 허용하면 주변 라이더 수를 확인할 수 있습니다');
        } else {
          setError('위치를 확인할 수 없습니다');
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000, // 1분 캐시
      }
    );
  }, [fetchNearbyHelpers]);

  // 컴포넌트 마운트 시 위치 요청
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // 컴팩트 모드
  if (compact) {
    if (loading) {
      return (
        <div className={`inline-flex items-center gap-1.5 text-sm text-gray-500 ${className}`}>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>라이더 확인중...</span>
        </div>
      );
    }

    if (error || !data) {
      return null; // 컴팩트 모드에서는 에러 시 숨김
    }

    return (
      <div
        className={`inline-flex items-center gap-1.5 text-sm ${
          data.count > 0 ? 'text-green-600' : 'text-gray-500'
        } ${className}`}
      >
        <Bike className="w-4 h-4" />
        <span>
          주변 {data.count}명 활동 중
        </span>
      </div>
    );
  }

  // 전체 모드
  if (loading) {
    return (
      <div className={`bg-blue-50 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
          <div>
            <p className="font-medium text-blue-900">주변 라이더 확인 중...</p>
            <p className="text-sm text-blue-600">위치 정보를 가져오고 있습니다</p>
          </div>
        </div>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className={`bg-gray-50 rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-700">위치 권한이 필요합니다</p>
            <p className="text-sm text-gray-500 mt-0.5">
              브라우저에서 위치 권한을 허용하면 주변 라이더 수를 확인할 수 있습니다
            </p>
            <button
              onClick={getLocation}
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-50 rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-700">정보를 불러올 수 없습니다</p>
            <p className="text-sm text-gray-500 mt-0.5">{error}</p>
            <button
              onClick={getLocation}
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // 라이더가 있는 경우
  if (data.count > 0) {
    return (
      <div className={`bg-green-50 rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Bike className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-green-900">
                주변에 <span className="text-green-600">{data.count}명</span>의 라이더가 활동 중!
              </p>
              <p className="text-sm text-green-600">{data.message}</p>
            </div>
          </div>
          <button
            onClick={getLocation}
            className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
            title="새로고침"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // 라이더가 없는 경우
  return (
    <div className={`bg-yellow-50 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <Bike className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="font-bold text-yellow-900">현재 주변에 라이더가 없습니다</p>
            <p className="text-sm text-yellow-700">
              요청을 등록하면 라이더가 활동을 시작할 때 알림을 받게 됩니다
            </p>
          </div>
        </div>
        <button
          onClick={getLocation}
          className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors"
          title="새로고침"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
