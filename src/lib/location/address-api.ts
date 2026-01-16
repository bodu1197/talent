/**
 * 주소 및 좌표 변환 유틸리티
 * - Daum Postcode: 주소 검색 (프론트엔드에서 직접 사용)
 * - 카카오 API: 역지오코딩 (좌표 → 주소) - 서버 API 경유
 */

// ==================== 타입 정의 ====================

export interface ReverseGeocodeResult {
  address: string;
  roadAddress: string | null;
  region: string; // 시군구
  latitude: number;
  longitude: number;
}

// ==================== 카카오 역지오코딩 API (서버 API 경유) ====================

/**
 * 좌표로 주소 조회 (역지오코딩)
 * - 서버 API 경유 (카카오 REST API 키는 서버에서만 사용)
 * - GPS 좌표 → 주소 변환
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  try {
    const response = await fetch('/api/address/reverse-geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      address: data.address ?? '',
      roadAddress: data.roadAddress || null,
      region: data.region ?? '',
      latitude,
      longitude,
    };
  } catch (error) {
    console.error('역지오코딩 오류:', error);
    return null;
  }
}

// ==================== 현재 위치 가져오기 (Geolocation API) ====================

export interface GeoLocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean; // GPS 사용 여부 (기본: true)
  timeout?: number; // 타임아웃 (밀리초, 기본: 30000)
  maximumAge?: number; // 캐시 유효시간 (밀리초, 기본: 300000)
}

/**
 * 브라우저 Geolocation API로 현재 위치 가져오기
 * 오프라인 재능 거래 "내 주변" 기능에 최적화
 *
 * @param options - 위치 가져오기 옵션
 *   - enableHighAccuracy: GPS 사용 여부 (기본: true, 정확한 위치)
 *   - timeout: 타임아웃 (기본: 30초)
 *   - maximumAge: 캐시 유효시간 (기본: 5분)
 */
export function getCurrentPosition(options?: GeolocationOptions): Promise<GeoLocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: options?.enableHighAccuracy ?? true, // 기본: GPS 사용 (정확함)
      timeout: options?.timeout ?? 30000, // 기본: 30초
      maximumAge: options?.maximumAge ?? 300000, // 기본: 5분 캐시
    };

    // eslint-disable-next-line sonarjs/no-intrusive-permissions -- 위치 기반 서비스에 필수
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let message = '위치를 가져올 수 없습니다';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            message = '위치 요청 시간이 초과되었습니다.';
            break;
        }
        reject(new Error(message));
      },
      defaultOptions
    );
  });
}

// ==================== 헬퍼 함수 ====================

/**
 * 주소에서 시군구(구/군) 추출
 */
export function extractRegion(address: string): string {
  // "서울특별시 강남구 역삼동" → "강남구"
  // "경기도 성남시 분당구 정자동" → "분당구"
  // eslint-disable-next-line sonarjs/slow-regex -- 한글 주소 패턴 매칭에 필요
  const match = /([가-힣]+[시군구])\s/.exec(address);
  if (match) {
    // 시/군/구 중 구가 있으면 구 반환
    const parts = address.split(' ');
    for (const part of parts) {
      if (part.endsWith('구')) return part;
      if (part.endsWith('군')) return part;
    }
    return match[1];
  }
  return '';
}

/**
 * 두 좌표 간 거리 계산 (km)
 * Haversine 공식 사용
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 지구 반경 (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // 소수점 2자리
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
