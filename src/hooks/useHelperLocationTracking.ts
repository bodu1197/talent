'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { calculateDistance } from '@/lib/geo';

interface LocationState {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: Date;
}

interface UseHelperLocationTrackingOptions {
  /** 위치 업데이트 간격 (밀리초, 기본 5분) */
  updateInterval?: number;
  /** 자동 추적 활성화 여부 */
  autoStart?: boolean;
  /** 추적 활성화 여부 (라이더 활동 상태) */
  isActive?: boolean;
  /** 위치 업데이트 성공 콜백 */
  onLocationUpdate?: (location: LocationState) => void;
  /** 에러 콜백 */
  onError?: (error: string) => void;
}

interface UseHelperLocationTrackingResult {
  /** 현재 위치 */
  location: LocationState | null;
  /** 에러 메시지 */
  error: string | null;
  /** 추적 중 여부 */
  isTracking: boolean;
  /** 온라인 상태 */
  isOnline: boolean;
  /** 마지막 업데이트 시간 */
  lastUpdate: Date | null;
  /** 추적 시작 (활동 시작) */
  startTracking: () => Promise<void>;
  /** 추적 중지 (활동 종료) */
  stopTracking: () => Promise<void>;
  /** 수동 위치 업데이트 */
  updateLocation: () => Promise<void>;
  /** 위치 권한 상태 */
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
}

const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000; // 5분

export function useHelperLocationTracking(
  options: UseHelperLocationTrackingOptions = {}
): UseHelperLocationTrackingResult {
  const {
    updateInterval = LOCATION_UPDATE_INTERVAL,
    autoStart = false,
    isActive = true,
    onLocationUpdate,
    onError,
  } = options;

  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    'granted' | 'denied' | 'prompt' | 'unknown'
  >('unknown');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // 위치 권한 확인
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      setPermissionStatus('unknown');
      return;
    }

    try {
      // eslint-disable-next-line sonarjs/no-intrusive-permissions -- 위치 권한 상태 확인용
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');

      result.addEventListener('change', () => {
        setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
      });
    } catch {
      setPermissionStatus('unknown');
    }
  }, []);

  // 현재 위치 가져오기
  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('이 브라우저에서는 위치 서비스를 지원하지 않습니다'));
        return;
      }

      // eslint-disable-next-line sonarjs/no-intrusive-permissions -- 라이더 위치 추적에 필수적인 기능
      navigator.geolocation.getCurrentPosition(
        resolve,
        (err) => {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              reject(
                new Error('위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.')
              );
              break;
            case err.POSITION_UNAVAILABLE:
              reject(new Error('위치 정보를 사용할 수 없습니다. GPS를 켜주세요.'));
              break;
            case err.TIMEOUT:
              reject(new Error('위치 정보 요청 시간이 초과되었습니다'));
              break;
            default:
              reject(new Error('알 수 없는 위치 오류가 발생했습니다'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000, // 30초 캐시
        }
      );
    });
  }, []);

  // 서버에 위치 업데이트 전송
  const sendLocationToServer = useCallback(async (lat: number, lng: number, online?: boolean) => {
    try {
      const body: { lat: number; lng: number; isOnline?: boolean } = { lat, lng };
      if (typeof online === 'boolean') {
        body.isOnline = online;
      }

      const response = await fetch('/api/helper/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '위치 업데이트 실패');
      }

      return response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : '위치 업데이트 실패';
      throw new Error(message);
    }
  }, []);

  // 위치 업데이트 실행
  const updateLocation = useCallback(async () => {
    try {
      setError(null);
      const position = await getCurrentPosition();

      const newLocation: LocationState = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(),
      };

      setLocation(newLocation);
      setLastUpdate(new Date());

      // 서버에 전송
      await sendLocationToServer(newLocation.lat, newLocation.lng);

      onLocationUpdate?.(newLocation);
    } catch (err) {
      const message = err instanceof Error ? err.message : '위치 업데이트 실패';
      setError(message);
      onError?.(message);
    }
  }, [getCurrentPosition, sendLocationToServer, onLocationUpdate, onError]);

  // 추적 시작 (활동 시작)
  const startTracking = useCallback(async () => {
    if (!isActive) {
      setError('라이더 활동이 비활성화 상태입니다');
      return;
    }

    try {
      setError(null);

      // 즉시 현재 위치 전송
      const position = await getCurrentPosition();
      const newLocation: LocationState = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(),
      };

      // 서버에 온라인 상태와 함께 전송
      await sendLocationToServer(newLocation.lat, newLocation.lng, true);

      setLocation(newLocation);
      setLastUpdate(new Date());
      setIsOnline(true);
      setIsTracking(true);

      onLocationUpdate?.(newLocation);

      // 주기적 업데이트 설정
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(updateLocation, updateInterval);

      // watchPosition으로 이동 시 위치 업데이트 (배터리 절약을 위해 선택적)
      // 사용자 이동이 감지되면 즉시 업데이트
      if (navigator.geolocation) {
        // eslint-disable-next-line sonarjs/no-intrusive-permissions -- 라이더 이동 추적에 필수적인 기능
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (pos) => {
            // 50m 이상 이동 시 즉시 업데이트
            if (location) {
              const distance = calculateDistance(
                location.lat,
                location.lng,
                pos.coords.latitude,
                pos.coords.longitude
              );

              if (distance > 0.05) {
                // 50m
                const movedLocation: LocationState = {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                  accuracy: pos.coords.accuracy,
                  timestamp: new Date(),
                };

                setLocation(movedLocation);
                await sendLocationToServer(movedLocation.lat, movedLocation.lng);
                setLastUpdate(new Date());
              }
            }
          },
          () => {}, // 에러는 무시 (주기적 업데이트가 백업)
          {
            enableHighAccuracy: false, // 배터리 절약
            timeout: 30000,
            maximumAge: 60000,
          }
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '추적 시작 실패';
      setError(message);
      onError?.(message);
    }
  }, [
    isActive,
    getCurrentPosition,
    sendLocationToServer,
    updateInterval,
    updateLocation,
    location,
    onLocationUpdate,
    onError,
  ]);

  // 추적 중지 (활동 종료)
  const stopTracking = useCallback(async () => {
    try {
      // 서버에 오프라인 상태 전송
      await fetch('/api/helper/location', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: false }),
      });

      setIsOnline(false);
      setIsTracking(false);

      // 인터벌 정리
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // watchPosition 정리
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '추적 중지 실패';
      setError(message);
      onError?.(message);
    }
  }, [onError]);

  // 컴포넌트 마운트 시 권한 확인
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // autoStart 옵션 처리
  useEffect(() => {
    if (autoStart && isActive) {
      startTracking();
    }
  }, [autoStart, isActive]); // startTracking은 의존성에서 제외 (무한 루프 방지)

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // 페이지 가시성 변화 처리 (탭 전환 시)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isTracking) {
        // 탭으로 돌아왔을 때 즉시 위치 업데이트
        updateLocation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTracking, updateLocation]);

  return {
    location,
    error,
    isTracking,
    isOnline,
    lastUpdate,
    startTracking,
    stopTracking,
    updateLocation,
    permissionStatus,
  };
}

// Haversine formula로 두 지점 간 거리 계산 (km)
