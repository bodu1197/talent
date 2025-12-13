'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, Navigation, MapPin, RefreshCw, Star, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

// 카카오 지도 타입 선언
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: { center: unknown; level: number }) => KakaoMap;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Marker: new (options: {
          position: unknown;
          map?: KakaoMap;
          image?: unknown;
        }) => KakaoMarker;
        MarkerImage: new (src: string, size: unknown, options?: { offset?: unknown }) => unknown;
        Size: new (width: number, height: number) => unknown;
        Point: new (x: number, y: number) => unknown;
        CustomOverlay: new (options: {
          position: unknown;
          content: string | HTMLElement;
          yAnchor?: number;
          xAnchor?: number;
        }) => KakaoCustomOverlay;
        Circle: new (options: {
          center: unknown;
          radius: number;
          strokeWeight: number;
          strokeColor: string;
          strokeOpacity: number;
          strokeStyle: string;
          fillColor: string;
          fillOpacity: number;
        }) => KakaoCircle;
        event: {
          addListener: (target: unknown, type: string, handler: () => void) => void;
        };
      };
    };
  }
}

interface KakaoLatLng {
  getLat: () => number;
  getLng: () => number;
}

interface KakaoMap {
  setCenter: (latlng: KakaoLatLng) => void;
  getCenter: () => KakaoLatLng;
  setLevel: (level: number) => void;
  getLevel: () => number;
  panTo: (latlng: KakaoLatLng) => void;
}

interface KakaoMarker {
  setMap: (map: KakaoMap | null) => void;
  getPosition: () => KakaoLatLng;
}

interface KakaoCustomOverlay {
  setMap: (map: KakaoMap | null) => void;
  setPosition: (position: KakaoLatLng) => void;
}

interface KakaoCircle {
  setMap: (map: KakaoMap | null) => void;
}

// 라이더 정보 타입
interface HelperLocation {
  id: string;
  name: string;
  profileImage: string | null;
  lat: number;
  lng: number;
  distance: number;
  grade: string;
  rating: number;
}

interface ErrandsKakaoMapProps {
  className?: string;
  onHelperCountChange?: (count: number) => void;
}

export default function ErrandsKakaoMap({
  className = '',
  onHelperCountChange,
}: ErrandsKakaoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const overlaysRef = useRef<KakaoCustomOverlay[]>([]);
  const circleRef = useRef<KakaoCircle | null>(null);
  const userMarkerRef = useRef<KakaoMarker | null>(null);
  const sdkCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [helpers, setHelpers] = useState<HelperLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHelper, setSelectedHelper] = useState<HelperLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [sdkError, setSdkError] = useState<string | null>(null);

  // 사용자 위치 가져오기 (타임아웃 3초로 단축)
  useEffect(() => {
    // 위치 권한 상관없이 바로 서울 좌표 설정 (빠른 로딩을 위해)
    const fallbackTimer = setTimeout(() => {
      if (!userLocation) {
        setUserLocation({ lat: 37.5665, lng: 126.978 });
      }
    }, 3000);

    if (!navigator.geolocation) {
      setLocationError('위치 서비스를 지원하지 않는 브라우저입니다.');
      setUserLocation({ lat: 37.5665, lng: 126.978 });
      clearTimeout(fallbackTimer);
      return;
    }

    /* eslint-disable sonarjs/no-intrusive-permissions */
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(fallbackTimer);
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      },
      () => {
        clearTimeout(fallbackTimer);
        setLocationError('위치 권한이 거부되었습니다. 서울 중심으로 표시합니다.');
        setUserLocation({ lat: 37.5665, lng: 126.978 });
      },
      {
        enableHighAccuracy: false,
        timeout: 3000,
        maximumAge: 300000, // 5분 캐시
      }
    );
    /* eslint-enable sonarjs/no-intrusive-permissions */

    return () => clearTimeout(fallbackTimer);
  }, []);

  // 라이더 목록 가져오기
  const fetchHelpers = useCallback(async () => {
    if (!userLocation) return;

    try {
      const params = new URLSearchParams({
        lat: userLocation.lat.toString(),
        lng: userLocation.lng.toString(),
        radius: '5',
        limit: '30',
      });

      const response = await fetch(`/api/errands/nearby-helpers/list?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setHelpers(data.helpers || []);
        onHelperCountChange?.(data.count || 0);
      }
    } catch {
      // 에러 시 빈 목록 유지
    } finally {
      setLoading(false);
    }
  }, [userLocation, onHelperCountChange]);

  useEffect(() => {
    if (userLocation) {
      fetchHelpers();
    }
  }, [userLocation, fetchHelpers]);

  // 카카오맵 SDK 초기화 헬퍼
  const initializeKakaoMaps = useCallback(() => {
    if (!window.kakao?.maps) return;
    window.kakao.maps.load(() => {
      setIsLoaded(true);
    });
  }, []);

  // 카카오 SDK 동적 로드 (컴포넌트 내에서 직접 로드)
  useEffect(() => {
    if (isLoaded) return;

    // 이미 SDK가 로드되어 있으면 바로 사용
    if (window.kakao?.maps) {
      initializeKakaoMaps();
      return;
    }

    // 폴링 함수 (이미 로드 중인 스크립트를 기다림)
    const startPolling = () => {
      let attempts = 0;
      const maxAttempts = 40; // 20초

      sdkCheckIntervalRef.current = setInterval(() => {
        attempts++;

        if (window.kakao?.maps) {
          clearInterval(sdkCheckIntervalRef.current!);
          initializeKakaoMaps();
        } else if (attempts >= maxAttempts) {
          clearInterval(sdkCheckIntervalRef.current!);
          setSdkError('카카오맵 로드 시간이 초과되었습니다.');
        }
      }, 500);
    };

    // 이미 스크립트가 추가되어 있는지 확인
    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
    if (existingScript) {
      startPolling();
      return;
    }

    // SDK 스크립트 동적 로드
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`;
    script.async = true;
    // CORS 문제 해결을 위해 crossorigin 제거 (카카오 SDK는 CORS 헤더 미제공)
    // script.crossOrigin = 'anonymous';  // 이 줄을 추가하면 오히려 문제가 됨

    script.onload = () => {
      if (window.kakao) {
        initializeKakaoMaps();
      } else {
        console.error('[KakaoMap] kakao object not found after load');
        setSdkError('카카오맵 초기화에 실패했습니다.');
      }
    };

    script.onerror = (e) => {
      console.error('[KakaoMap] SDK load error:', e);
      console.error(
        '[KakaoMap] This may be caused by domain not registered in Kakao Developer Console'
      );
      setSdkError('카카오맵 SDK 로드에 실패했습니다. 도메인 설정을 확인해주세요.');
    };

    document.head.appendChild(script);

    return () => {
      if (sdkCheckIntervalRef.current) {
        clearInterval(sdkCheckIntervalRef.current);
      }
    };
  }, [isLoaded, initializeKakaoMaps]);

  // 지도 초기화
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || !userLocation) {
      return;
    }

    try {
      const { kakao } = window;
      const container = mapContainerRef.current;
      const options = {
        center: new kakao.maps.LatLng(userLocation.lat, userLocation.lng),
        level: 5,
      };

      const map = new kakao.maps.Map(container, options);
      mapRef.current = map;

      // 사용자 위치 마커 (파란색 점)
      const userMarkerContent = document.createElement('div');
      userMarkerContent.innerHTML = `
        <div style="
          width: 20px;
          height: 20px;
          background: #3B82F6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
          animation: pulse 2s infinite;
        "></div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
          }
        </style>
      `;

      const userOverlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(userLocation.lat, userLocation.lng),
        content: userMarkerContent,
        yAnchor: 0.5,
        xAnchor: 0.5,
      });
      userOverlay.setMap(map);

      // 반경 표시 (5km)
      const circle = new kakao.maps.Circle({
        center: new kakao.maps.LatLng(userLocation.lat, userLocation.lng),
        radius: 5000,
        strokeWeight: 2,
        strokeColor: '#3B82F6',
        strokeOpacity: 0.3,
        strokeStyle: 'dashed',
        fillColor: '#3B82F6',
        fillOpacity: 0.05,
      });
      circle.setMap(map);
      circleRef.current = circle;

      setIsMapReady(true);
    } catch {
      setSdkError('지도 초기화 중 오류가 발생했습니다.');
    }

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      overlaysRef.current.forEach((overlay) => overlay.setMap(null));
      if (circleRef.current) circleRef.current.setMap(null);
      if (userMarkerRef.current) userMarkerRef.current.setMap(null);
    };
  }, [isLoaded, userLocation]);

  // 라이더 마커 추가
  useEffect(() => {
    if (!isMapReady || !mapRef.current || helpers.length === 0) return;

    const { kakao } = window;
    const map = mapRef.current;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];

    // 라이더 마커 추가
    helpers.forEach((helper) => {
      const position = new kakao.maps.LatLng(helper.lat, helper.lng);

      // 커스텀 마커 콘텐츠
      const markerContent = document.createElement('div');
      markerContent.innerHTML = `
        <div class="helper-marker" data-helper-id="${helper.id}" style="
          width: 44px;
          height: 44px;
          background: white;
          border: 3px solid #22C55E;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s, box-shadow 0.2s;
          overflow: hidden;
        ">
          ${
            helper.profileImage
              ? `<img src="${helper.profileImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="${helper.name}" />`
              : `<div style="
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 16px;
                ">${helper.name.charAt(0)}</div>`
          }
        </div>
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: #22C55E;
          color: white;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 8px;
          white-space: nowrap;
        ">${helper.distance.toFixed(1)}km</div>
      `;

      const overlay = new kakao.maps.CustomOverlay({
        position,
        content: markerContent,
        yAnchor: 1.3,
        xAnchor: 0.5,
      });

      overlay.setMap(map);
      overlaysRef.current.push(overlay);

      // 클릭 이벤트
      markerContent.addEventListener('click', () => {
        setSelectedHelper(helper);
      });

      // 호버 효과
      markerContent.addEventListener('mouseenter', () => {
        const markerDiv = markerContent.querySelector('.helper-marker') as HTMLElement;
        if (markerDiv) {
          markerDiv.style.transform = 'scale(1.15)';
          markerDiv.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
        }
      });

      markerContent.addEventListener('mouseleave', () => {
        const markerDiv = markerContent.querySelector('.helper-marker') as HTMLElement;
        if (markerDiv) {
          markerDiv.style.transform = 'scale(1)';
          markerDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }
      });
    });
  }, [isMapReady, helpers]);

  // 내 위치로 이동
  const moveToMyLocation = useCallback(() => {
    if (!mapRef.current || !userLocation) return;
    const { kakao } = window;
    mapRef.current.panTo(new kakao.maps.LatLng(userLocation.lat, userLocation.lng));
    mapRef.current.setLevel(5);
  }, [userLocation]);

  // 새로고침
  const handleRefresh = useCallback(() => {
    setLoading(true);
    fetchHelpers();
  }, [fetchHelpers]);

  // 페이지 새로고침
  const handlePageReload = useCallback(() => {
    window.location.reload();
  }, []);

  // 등급 배지 색상
  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'GOLD':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'SILVER':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'BRONZE':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  const getGradeLabel = (grade: string) => {
    switch (grade) {
      case 'GOLD':
        return '골드';
      case 'SILVER':
        return '실버';
      case 'BRONZE':
        return '브론즈';
      default:
        return '뉴비';
    }
  };

  // SDK 로드 에러 - 지도 없이 라이더 목록만 표시
  if (sdkError) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-6 ${className}`}>
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">주변 라이더</h3>
              <p className="text-sm text-gray-500">
                {helpers.length > 0 ? `${helpers.length}명 대기 중` : '로딩 중...'}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* 라이더 목록 */}
        {helpers.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {helpers.slice(0, 8).map((helper) => (
              <button
                key={helper.id}
                type="button"
                className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition cursor-pointer text-left"
                onClick={() => setSelectedHelper(helper)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold shrink-0">
                    {helper.profileImage ? (
                      <Image
                        src={helper.profileImage}
                        alt={helper.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      helper.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate text-sm">{helper.name}</p>
                    <p className="text-xs text-gray-500">{helper.distance.toFixed(1)}km</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-gray-600">{helper.rating?.toFixed(1) || '신규'}</span>
                  <span
                    className={`ml-auto px-1.5 py-0.5 rounded text-[10px] ${getGradeBadgeColor(helper.grade)}`}
                  >
                    {getGradeLabel(helper.grade)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {helpers.length === 0 && loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}

        {helpers.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <p>주변에 활동 중인 라이더가 없습니다</p>
          </div>
        )}

        {/* 지도 로드 실패 안내 (작게) */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            지도를 불러올 수 없습니다
          </p>
          <button onClick={handlePageReload} className="text-xs text-blue-500 hover:text-blue-600">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-lg ${className}`}>
      {/* 지도 컨테이너 */}
      <div ref={mapContainerRef} className="w-full h-[400px] md:h-[500px] bg-gray-200" />

      {/* 로딩 오버레이 */}
      {(loading || !isMapReady) && !sdkError && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              {(() => {
                if (!userLocation) return '위치를 확인하는 중...';
                if (!isLoaded) return '카카오맵 로드 중...';
                return '주변 라이더를 찾는 중...';
              })()}
            </p>
            <p className="text-gray-400 text-sm mt-2">{!isLoaded && '잠시만 기다려주세요...'}</p>
          </div>
        </div>
      )}

      {/* 위치 오류 메시지 */}
      {locationError && isMapReady && (
        <div className="absolute top-4 left-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm text-yellow-700 z-20">
          {locationError}
        </div>
      )}

      {/* 컨트롤 버튼들 */}
      {isMapReady && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          <button
            onClick={moveToMyLocation}
            className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition"
            title="내 위치로"
          >
            <Navigation className="w-5 h-5 text-blue-500" />
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-50"
            title="새로고침"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* 라이더 수 표시 */}
      {isMapReady && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-xl px-4 py-2 shadow-md z-20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="font-bold text-gray-800">
              주변 <span className="text-green-600">{helpers.length}</span>명의 라이더
            </span>
          </div>
        </div>
      )}

      {/* 선택된 라이더 정보 카드 */}
      {selectedHelper && (
        <div className="absolute bottom-4 right-4 left-4 md:left-auto md:w-80 bg-white rounded-xl shadow-xl p-4 z-30 animate-in slide-in-from-bottom-4">
          <button
            onClick={() => setSelectedHelper(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>

          <div className="flex items-center gap-3">
            {/* 프로필 이미지 */}
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {selectedHelper.profileImage ? (
                <Image
                  src={selectedHelper.profileImage}
                  alt={selectedHelper.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                selectedHelper.name.charAt(0)
              )}
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900 truncate">{selectedHelper.name}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${getGradeBadgeColor(selectedHelper.grade)}`}
                >
                  {getGradeLabel(selectedHelper.grade)}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {selectedHelper.rating?.toFixed(1) || '신규'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {selectedHelper.distance.toFixed(1)}km
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
