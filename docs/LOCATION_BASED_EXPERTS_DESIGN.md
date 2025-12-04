# 내 주변의 프리미엄 전문가 - 위치 기반 전환 설계서

## 0. 카테고리 온라인/오프라인 구분 (핵심 원칙)

### 0.1 구분 기준

| 구분 | 위치 기반 | 카테고리 | 특징 |
|------|----------|----------|------|
| **🌐 온라인** | ❌ 불필요 | 디자인, 개발/IT, 영상/사진, 마케팅, 번역, 음악, 글쓰기, AI | 원격 작업, 전국 고객 대상 |
| **📍 오프라인** | ✅ 필수 | 생활서비스, 이벤트, 뷰티/패션, 주문제작, 취미/클래스, 심부름 | 대면 필요, 지역 고객 대상 |
| **🔄 둘 다** | 선택적 | 상담/코칭 | 대면/비대면 선택 가능 |

### 0.2 적용 원칙

```
온라인 카테고리:
  - 위치 기반 기능 적용 안함
  - 전국 단위 검색/매칭
  - 정렬: 평점순, 가격순, 최신순

오프라인 카테고리:
  - 위치 기반 기능 필수 적용
  - 반경 내 전문가 검색
  - 정렬: 거리순, 평점순
  - "내 주변 N명" 표시
```

### 0.3 DB 스키마

```sql
-- categories 테이블에 service_type 필드 추가
ALTER TABLE categories ADD COLUMN IF NOT EXISTS service_type TEXT
  DEFAULT 'online'
  CHECK (service_type IN ('online', 'offline', 'both'));

-- 오프라인 카테고리 설정
UPDATE categories SET service_type = 'offline'
WHERE slug IN (
  'life-service',      -- 생활 서비스
  'event',             -- 이벤트
  'beauty-fashion',    -- 뷰티/패션
  'custom-order',      -- 주문제작
  'hobby-handmade',    -- 취미/핸드메이드
  'errands'            -- 심부름
);

-- 둘 다 가능 카테고리
UPDATE categories SET service_type = 'both'
WHERE slug = 'counseling-coaching';  -- 상담/코칭

-- 나머지는 기본값 'online' 유지
```

### 0.4 홈페이지 구조

```
┌────────────────────────────────────────────────────────────┐
│  🔍 히어로 섹션 (검색바)                                    │
├────────────────────────────────────────────────────────────┤
│  🔥 실시간 인기재능 (전체)                                  │
├────────────────────────────────────────────────────────────┤
│  🌐 온라인 전문가 (위치 기반 X)                             │
│  "전국 어디서나 원격으로"                                   │
│  디자인 | 개발 | 영상 | 마케팅 | AI ...                    │
├────────────────────────────────────────────────────────────┤
│  📍 오프라인 전문가 (위치 기반 O)                           │
│  "서울시 강남구 기준"  [위치 변경]                          │
│  생활서비스 18명 | 이벤트 12명 | 뷰티 24명 ...             │
├────────────────────────────────────────────────────────────┤
│  ⚡ 심부름 헬퍼 (위치 기반 O)                               │
└────────────────────────────────────────────────────────────┘
```

---

## 1. 개요

### 1.1 현재 상태
| 컴포넌트 | 현재 구현 | 문제점 |
|---------|----------|--------|
| ThirdHeroBanner | nearbyCount 하드코딩 (18, 12, 24...) | 실제 데이터 아님 |
| SecondHeroBanner | "서울시 강남구 역삼동" 하드코딩 | 실제 위치 미반영 |
| 헬퍼 위치 | 랜덤 시뮬레이션 | 가짜 데이터 |

### 1.2 목표
- 사용자 실제 위치 기반 주변 전문가 수 표시
- 전문가/헬퍼 위치 데이터베이스 관리
- 거리 계산 및 실시간 업데이트
- 프라이버시 보호

---

## 2. 데이터베이스 설계

### 2.1 seller_profiles 테이블 확장

```sql
-- 위치 필드 추가 마이그레이션
ALTER TABLE seller_profiles ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE seller_profiles ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE seller_profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE seller_profiles ADD COLUMN IF NOT EXISTS service_radius_km INTEGER DEFAULT 10;
ALTER TABLE seller_profiles ADD COLUMN IF NOT EXISTS is_location_public BOOLEAN DEFAULT false;
ALTER TABLE seller_profiles ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ;

-- 위치 인덱스 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_seller_location
ON seller_profiles(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND is_location_public = true;

-- RLS 정책
CREATE POLICY "Users can update own location" ON seller_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 2.2 Haversine 거리 계산 함수

```sql
-- 두 좌표 간 거리 계산 (km 단위)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  R CONSTANT DECIMAL := 6371; -- 지구 반경 (km)
  dLat DECIMAL;
  dLon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dLat := RADIANS(lat2 - lat1);
  dLon := RADIANS(lon2 - lon1);
  a := SIN(dLat/2)^2 + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dLon/2)^2;
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### 2.3 카테고리별 주변 전문가 수 조회 함수

```sql
CREATE OR REPLACE FUNCTION get_nearby_experts_count(
  user_lat DECIMAL,
  user_lon DECIMAL,
  radius_km INTEGER DEFAULT 10
) RETURNS TABLE(
  category_slug TEXT,
  category_name TEXT,
  expert_count BIGINT
) AS $$
  SELECT
    c.slug,
    c.name,
    COUNT(DISTINCT sp.id)
  FROM seller_profiles sp
  JOIN services s ON s.seller_id = sp.id
  JOIN service_categories sc ON sc.service_id = s.id
  JOIN categories c ON c.id = sc.category_id
  WHERE
    sp.latitude IS NOT NULL
    AND sp.longitude IS NOT NULL
    AND sp.is_location_public = true
    AND s.status = 'active'
    AND calculate_distance(user_lat, user_lon, sp.latitude, sp.longitude) <= radius_km
    AND c.parent_id IS NULL
  GROUP BY c.slug, c.name
  ORDER BY expert_count DESC;
$$ LANGUAGE sql STABLE;
```

### 2.4 주변 헬퍼 조회 함수

```sql
CREATE OR REPLACE FUNCTION get_nearby_helpers(
  user_lat DECIMAL,
  user_lon DECIMAL,
  radius_km INTEGER DEFAULT 5,
  limit_count INTEGER DEFAULT 20
) RETURNS TABLE(
  id UUID,
  display_name TEXT,
  distance_km DECIMAL,
  latitude DECIMAL,
  longitude DECIMAL,
  rating DECIMAL
) AS $$
  SELECT
    sp.id,
    sp.display_name,
    ROUND(calculate_distance(user_lat, user_lon, sp.latitude, sp.longitude)::DECIMAL, 2) as distance_km,
    sp.latitude,
    sp.longitude,
    COALESCE(AVG(r.rating), 0) as rating
  FROM seller_profiles sp
  JOIN services s ON s.seller_id = sp.id
  JOIN service_categories sc ON sc.service_id = s.id
  JOIN categories c ON c.id = sc.category_id
  LEFT JOIN reviews r ON r.seller_id = sp.id
  WHERE
    sp.latitude IS NOT NULL
    AND sp.longitude IS NOT NULL
    AND sp.is_location_public = true
    AND s.status = 'active'
    AND c.slug = 'errands'
    AND calculate_distance(user_lat, user_lon, sp.latitude, sp.longitude) <= radius_km
  GROUP BY sp.id, sp.display_name, sp.latitude, sp.longitude
  ORDER BY distance_km ASC
  LIMIT limit_count;
$$ LANGUAGE sql STABLE;
```

---

## 3. API 설계

### 3.1 주변 전문가 수 조회

**Endpoint:** `GET /api/nearby/experts`

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|-----|------|
| lat | number | O | 사용자 위도 |
| lon | number | O | 사용자 경도 |
| radius | number | X | 반경 (km), 기본값 10 |

**Response:**
```typescript
interface NearbyExpertsResponse {
  success: boolean;
  location: {
    address: string;        // "서울시 강남구 역삼동"
    lat: number;
    lon: number;
  };
  categories: {
    [slug: string]: number; // { "life-service": 18, "event": 12, ... }
  };
  totalExperts: number;
  radius: number;
  cachedAt: string;         // ISO timestamp
}
```

**구현 파일:** `src/app/api/nearby/experts/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// 입력 검증
function validateCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || '');
  const lon = parseFloat(searchParams.get('lon') || '');
  const radius = parseInt(searchParams.get('radius') || '10', 10);

  // 검증
  if (isNaN(lat) || isNaN(lon) || !validateCoordinates(lat, lon)) {
    return NextResponse.json(
      { success: false, error: 'Invalid coordinates' },
      { status: 400 }
    );
  }

  if (radius < 1 || radius > 100) {
    return NextResponse.json(
      { success: false, error: 'Radius must be between 1 and 100 km' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // 주변 전문가 수 조회
  const { data, error } = await supabase.rpc('get_nearby_experts_count', {
    user_lat: lat,
    user_lon: lon,
    radius_km: radius,
  });

  if (error) {
    console.error('Nearby experts query error:', error);
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    );
  }

  // 결과 변환
  const categories: Record<string, number> = {};
  let totalExperts = 0;

  for (const row of data || []) {
    categories[row.category_slug] = Number(row.expert_count);
    totalExperts += Number(row.expert_count);
  }

  return NextResponse.json({
    success: true,
    location: {
      address: await reverseGeocode(lat, lon), // Kakao API
      lat,
      lon,
    },
    categories,
    totalExperts,
    radius,
    cachedAt: new Date().toISOString(),
  });
}
```

### 3.2 주변 헬퍼 조회

**Endpoint:** `GET /api/nearby/helpers`

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|-----|------|
| lat | number | O | 사용자 위도 |
| lon | number | O | 사용자 경도 |
| radius | number | X | 반경 (km), 기본값 5 |

**Response:**
```typescript
interface NearbyHelpersResponse {
  success: boolean;
  totalHelpers: number;
  nearbyHelpers: Array<{
    id: string;
    displayName: string;    // "김**" (익명화)
    distance: number;       // km
    latitude: number;       // 근사값 (프라이버시)
    longitude: number;      // 근사값 (프라이버시)
    rating: number;
  }>;
  averageResponseTime: string;
}
```

### 3.3 전문가 위치 업데이트

**Endpoint:** `POST /api/seller/location`

**Request Body:**
```typescript
interface UpdateLocationRequest {
  latitude: number;
  longitude: number;
  address: string;
  serviceRadius: number;    // 1-100 km
  isPublic: boolean;
}
```

**Response:**
```typescript
interface UpdateLocationResponse {
  success: boolean;
  message: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    serviceRadius: number;
    isPublic: boolean;
    updatedAt: string;
  };
}
```

---

## 4. 프론트엔드 설계

### 4.1 Location Context

**파일:** `src/contexts/LocationContext.tsx`

```typescript
'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  loading: boolean;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | null;
}

interface LocationContextType extends LocationState {
  requestLocation: () => Promise<void>;
  refreshLocation: () => Promise<void>;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | null>(null);

// 기본 위치 (서울 강남역)
const DEFAULT_LOCATION = {
  latitude: 37.498095,
  longitude: 127.027610,
  address: '서울시 강남구',
};

// 캐시 유효 시간 (1시간)
const CACHE_DURATION = 60 * 60 * 1000;

export function LocationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: null,
    loading: true,
    error: null,
    permissionStatus: null,
  });

  // 캐시된 위치 확인
  useEffect(() => {
    const cached = localStorage.getItem('user_location');
    if (cached) {
      const { latitude, longitude, address, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        setState({
          latitude,
          longitude,
          address,
          loading: false,
          error: null,
          permissionStatus: 'granted',
        });
        return;
      }
    }
    // 캐시 없으면 기본값 사용
    setState(prev => ({
      ...prev,
      ...DEFAULT_LOCATION,
      loading: false,
    }));
  }, []);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: '브라우저가 위치 서비스를 지원하지 않습니다.',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5분 캐시
        });
      });

      const { latitude, longitude } = position.coords;

      // Kakao 역지오코딩으로 주소 변환
      const address = await reverseGeocodeKakao(latitude, longitude);

      // localStorage 캐싱
      localStorage.setItem('user_location', JSON.stringify({
        latitude,
        longitude,
        address,
        timestamp: Date.now(),
      }));

      setState({
        latitude,
        longitude,
        address,
        loading: false,
        error: null,
        permissionStatus: 'granted',
      });
    } catch (error) {
      const geoError = error as GeolocationPositionError;
      let errorMessage = '위치를 가져올 수 없습니다.';

      if (geoError.code === geoError.PERMISSION_DENIED) {
        errorMessage = '위치 권한이 거부되었습니다.';
        setState(prev => ({
          ...prev,
          ...DEFAULT_LOCATION,
          loading: false,
          error: errorMessage,
          permissionStatus: 'denied',
        }));
      } else {
        setState(prev => ({
          ...prev,
          ...DEFAULT_LOCATION,
          loading: false,
          error: errorMessage,
        }));
      }
    }
  }, []);

  const refreshLocation = useCallback(async () => {
    localStorage.removeItem('user_location');
    await requestLocation();
  }, [requestLocation]);

  const clearLocation = useCallback(() => {
    localStorage.removeItem('user_location');
    setState({
      ...DEFAULT_LOCATION,
      loading: false,
      error: null,
      permissionStatus: null,
    });
  }, []);

  return (
    <LocationContext.Provider
      value={{
        ...state,
        requestLocation,
        refreshLocation,
        clearLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

// Kakao 역지오코딩
async function reverseGeocodeKakao(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lon}&y=${lat}`,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}`,
        },
      }
    );
    const data = await response.json();
    if (data.documents?.[0]) {
      const addr = data.documents[0].address;
      return `${addr.region_1depth_name} ${addr.region_2depth_name} ${addr.region_3depth_name}`;
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
  }
  return '위치 확인 중...';
}
```

### 4.2 useNearbyExperts Hook

**파일:** `src/hooks/useNearbyExperts.ts`

```typescript
import useSWR from 'swr';
import { useLocation } from '@/contexts/LocationContext';

interface NearbyExpertsData {
  categories: Record<string, number>;
  totalExperts: number;
  address: string;
}

const fetcher = async (url: string): Promise<NearbyExpertsData> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch nearby experts');
  const data = await res.json();
  return {
    categories: data.categories,
    totalExperts: data.totalExperts,
    address: data.location.address,
  };
};

export function useNearbyExperts(radius: number = 10) {
  const { latitude, longitude, loading: locationLoading } = useLocation();

  const shouldFetch = !locationLoading && latitude !== null && longitude !== null;

  const { data, error, isLoading, mutate } = useSWR<NearbyExpertsData>(
    shouldFetch ? `/api/nearby/experts?lat=${latitude}&lon=${longitude}&radius=${radius}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5분 캐싱
    }
  );

  return {
    categories: data?.categories || {},
    totalExperts: data?.totalExperts || 0,
    address: data?.address || '위치 확인 중...',
    isLoading: locationLoading || isLoading,
    error,
    refresh: mutate,
  };
}
```

### 4.3 ThirdHeroBanner 수정

**파일:** `src/components/home/ThirdHeroBanner.tsx` (수정)

```typescript
'use client';

import { useNearbyExperts } from '@/hooks/useNearbyExperts';
import { useLocation } from '@/contexts/LocationContext';
// ... 기존 import

// 카테고리 slug 매핑
const CATEGORY_SLUGS = {
  living: 'life-service',
  event: 'event',
  beauty: 'beauty-fashion',
  'custom-order': 'custom-order',
  'counseling-coaching': 'counseling-coaching',
  'hobby-handmade': 'hobby-handmade',
};

export default function ThirdHeroBanner() {
  const { address, permissionStatus, requestLocation } = useLocation();
  const { categories, isLoading } = useNearbyExperts(10);

  // 카테고리별 주변 전문가 수 매핑
  const getCategoryCount = (id: string): number => {
    const slug = CATEGORY_SLUGS[id as keyof typeof CATEGORY_SLUGS];
    return categories[slug] || 0;
  };

  return (
    <section className="py-6 md:py-10">
      <div className="container-1200">
        {/* 헤더 */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
            <span className="text-orange-500">내 주변</span>의 프리미엄 전문가
          </h2>
          <p className="text-gray-500 text-sm md:text-base mb-2">
            가까운 곳에서 직접 만나는 전문가 서비스
          </p>

          {/* 위치 표시 및 권한 요청 버튼 */}
          <button
            onClick={requestLocation}
            className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
          >
            <MapPinIcon className="w-3.5 h-3.5 text-orange-500" />
            <span>
              {isLoading ? '위치 확인 중...' : address || '내 위치 설정하기'}
            </span>
          </button>
        </div>

        {/* 카드 그리드 */}
        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-3 gap-4 ...">
          {categories.map((category) => {
            const nearbyCount = getCategoryCount(category.id);
            // ... 렌더링
            return (
              <Link key={category.id} href={category.href} className="...">
                {/* 주변 전문가 수 배지 */}
                <div className="flex items-center gap-1 bg-white/25 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <MapPinIcon className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-medium">
                    {isLoading ? (
                      <span className="animate-pulse">---</span>
                    ) : (
                      `주변 ${nearbyCount}명`
                    )}
                  </span>
                </div>
                {/* ... */}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

---

## 5. 서비스 등록 시 위치 입력 (핵심 변경)

> **중요 원칙**: 위치 설정은 별도의 설정 페이지가 아니라, **서비스 등록 시 오프라인 카테고리를 선택하면 자동으로 위치 입력 섹션이 나타나는 방식**으로 구현합니다.

### 5.1 위치 입력 시나리오

#### 시나리오 1: 신규 판매자가 첫 번째 오프라인 서비스 등록
```
[1차 카테고리 선택: 생활서비스] ← 오프라인 카테고리
         ↓
┌─────────────────────────────────────────────┐
│ 📍 서비스 위치 설정                           │
│ 오프라인 서비스는 위치 정보가 필요합니다         │
│                                             │
│ [🎯 현재 위치 사용]  [🔍 주소 검색]            │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 서울시 강남구 역삼동                      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ☑ 이 위치를 내 서비스 위치로 저장             │
└─────────────────────────────────────────────┘
         ↓
[2차 카테고리 선택: 청소]
         ↓
[3차 카테고리 선택: 가정집 청소]
```

#### 시나리오 2: 기존 판매자가 두 번째 오프라인 서비스 등록 (이미 위치 있음)
```
[1차 카테고리 선택: 이벤트] ← 오프라인 카테고리
         ↓
┌─────────────────────────────────────────────┐
│ 📍 서비스 위치                               │
│                                             │
│ 기존 위치: 서울시 강남구 역삼동                │
│                                             │
│ ◉ 기존 위치 사용                             │
│ ○ 다른 위치 설정하기                          │
└─────────────────────────────────────────────┘
         ↓
[2차, 3차 카테고리 선택 계속...]
```

#### 시나리오 3: 온라인 서비스 등록 (위치 입력 없음)
```
[1차 카테고리 선택: 디자인] ← 온라인 카테고리
         ↓
(위치 입력 섹션 표시 안함)
         ↓
[2차 카테고리 선택: 로고 디자인]
         ↓
[3차 카테고리 선택 계속...]
```

#### 시나리오 4: "둘 다" 카테고리 선택 (상담/코칭)
```
[1차 카테고리 선택: 상담/코칭] ← 둘 다 가능
         ↓
┌─────────────────────────────────────────────┐
│ 서비스 제공 방식을 선택하세요                  │
│                                             │
│ ○ 🌐 온라인 (화상/전화 상담)                  │
│ ○ 📍 오프라인 (대면 상담)                     │
│ ○ 🔄 둘 다 가능                              │
└─────────────────────────────────────────────┘
         ↓
(오프라인 또는 둘 다 선택 시 → 위치 입력 섹션 표시)
```

### 5.2 DB 스키마 변경

```sql
-- sellers 테이블에 위치 필드 추가 (seller_profiles 대신)
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS location_address VARCHAR(200);
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8);
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8);
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS location_region VARCHAR(50);  -- 구/군 단위
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ;

-- services 테이블에 제공 방식 필드 추가 (둘 다 가능 카테고리용)
ALTER TABLE services ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(20)
  DEFAULT 'online'
  CHECK (delivery_method IN ('online', 'offline', 'both'));

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_sellers_location
ON sellers(location_latitude, location_longitude)
WHERE location_latitude IS NOT NULL AND location_longitude IS NOT NULL;
```

### 5.3 NewServiceClient.tsx 수정 계획

**파일:** `src/app/mypage/seller/services/new/NewServiceClient.tsx`

```typescript
// 1. 카테고리의 service_type 조회를 위한 상태 추가
const [categoryServiceType, setCategoryServiceType] = useState<'online' | 'offline' | 'both' | null>(null);

// 2. 기존 판매자 위치 조회
const [existingLocation, setExistingLocation] = useState<{
  address: string;
  latitude: number;
  longitude: number;
} | null>(null);

// 3. 새로운 위치 입력 상태
const [newLocation, setNewLocation] = useState<{
  address: string;
  latitude: number;
  longitude: number;
} | null>(null);

// 4. 위치 사용 옵션 (기존 판매자용)
const [useExistingLocation, setUseExistingLocation] = useState(true);

// 5. 1차 카테고리 선택 시 service_type 확인
useEffect(() => {
  if (selectedLevel1) {
    const fetchServiceType = async () => {
      const response = await fetch(`/api/categories/${selectedLevel1}/service-type`);
      const data = await response.json();
      setCategoryServiceType(data.serviceType);
    };
    fetchServiceType();
  }
}, [selectedLevel1]);

// 6. 조건부 위치 입력 섹션 렌더링
{categoryServiceType === 'offline' && (
  <LocationInputSection
    existingLocation={existingLocation}
    onLocationChange={setNewLocation}
    useExisting={useExistingLocation}
    onUseExistingChange={setUseExistingLocation}
  />
)}

{categoryServiceType === 'both' && (
  <DeliveryMethodSelector
    onMethodChange={(method) => {
      if (method === 'offline' || method === 'both') {
        // 위치 입력 섹션 표시
      }
    }}
  />
)}
```

### 5.4 위치 입력 API 전략 (확정)

> **핵심 원칙**: 주소 입력 시 1회만 API 호출하여 좌표를 DB에 저장. 이후 거리 계산은 DB 내에서 처리.

#### API 역할 분담

| 기능 | 사용 API | 이유 |
|-----|---------|------|
| **주소 검색** | 도로명주소 API (juso.go.kr) | 무료, 정부 공식, 좌표 포함 |
| **GPS → 주소 변환** | 카카오 역지오코딩 API | juso.go.kr은 역지오코딩 미지원 |
| **거리 계산** | PostgreSQL Haversine 함수 | API 호출 없이 DB 내 계산 |

#### 데이터 흐름

```
[방법 1: 주소 검색]
판매자 입력: "역삼역"
    ↓
도로명주소 API (juso.go.kr) 호출
    ↓
응답: { address: "서울시 강남구 역삼동", lat: 37.500, lng: 127.036 }
    ↓
DB 저장 (sellers 테이블)
    ↓
✅ 완료 - 이후 API 호출 없음

[방법 2: GPS 현재 위치]
브라우저 GPS: { lat: 37.500, lng: 127.036 }
    ↓
카카오 역지오코딩 API 호출
    ↓
응답: { address: "서울시 강남구 역삼동" }
    ↓
DB 저장 (sellers 테이블) - 좌표는 GPS에서 이미 획득
    ↓
✅ 완료 - 이후 API 호출 없음
```

#### API 호출 횟수 최적화

| 시점 | API 호출 | 비고 |
|-----|---------|------|
| 판매자 위치 등록 (주소검색) | juso.go.kr 1회 | 좌표 포함 응답 |
| 판매자 위치 등록 (GPS) | 카카오 1회 | 역지오코딩만 |
| 고객 주변 전문가 조회 | 0회 | DB Haversine |
| 홈페이지 "주변 N명" | 0회 | DB Haversine |

### 5.5 도로명주소 API 유틸 함수

**파일:** `src/lib/address/juso-api.ts`

```typescript
/**
 * 도로명주소 API (juso.go.kr)
 * - 무료, 정부 공식
 * - 좌표(위도/경도) 포함 응답
 */

interface JusoSearchResult {
  roadAddr: string;      // 도로명주소
  jibunAddr: string;     // 지번주소
  siNm: string;          // 시도명
  sggNm: string;         // 시군구명
  emdNm: string;         // 읍면동명
  entX: string;          // 경도 (longitude)
  entY: string;          // 위도 (latitude)
}

interface AddressResult {
  address: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
  region: string;  // 시군구 (예: 강남구)
}

export async function searchAddress(keyword: string): Promise<AddressResult[]> {
  const confmKey = process.env.NEXT_PUBLIC_JUSO_API_KEY;

  if (!confmKey) {
    throw new Error('JUSO API key not configured');
  }

  const response = await fetch(
    `https://www.juso.go.kr/addrlink/addrLinkApi.do?` +
    `confmKey=${confmKey}&` +
    `currentPage=1&` +
    `countPerPage=10&` +
    `keyword=${encodeURIComponent(keyword)}&` +
    `resultType=json&` +
    `addInfoYn=Y`  // 좌표 정보 포함
  );

  const data = await response.json();

  if (data.results.common.errorCode !== '0') {
    throw new Error(data.results.common.errorMessage);
  }

  return data.results.juso.map((item: JusoSearchResult) => ({
    address: `${item.siNm} ${item.sggNm} ${item.emdNm}`,
    roadAddress: item.roadAddr,
    latitude: parseFloat(item.entY),
    longitude: parseFloat(item.entX),
    region: item.sggNm,
  }));
}
```

### 5.6 카카오 역지오코딩 유틸 함수

**파일:** `src/lib/address/kakao-api.ts`

```typescript
/**
 * 카카오 역지오코딩 API
 * - GPS 좌표 → 주소 변환 전용
 * - juso.go.kr은 역지오코딩 미지원이므로 카카오 사용
 */

interface ReverseGeocodeResult {
  address: string;
  region: string;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> {
  const apiKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;

  if (!apiKey) {
    throw new Error('Kakao API key not configured');
  }

  const response = await fetch(
    `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
    {
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
    }
  );

  const data = await response.json();

  if (!data.documents?.[0]) {
    throw new Error('주소를 찾을 수 없습니다.');
  }

  const addr = data.documents[0].address;

  return {
    address: `${addr.region_1depth_name} ${addr.region_2depth_name} ${addr.region_3depth_name}`,
    region: addr.region_2depth_name,  // 구/군
  };
}
```

### 5.7 LocationInputSection 컴포넌트

**파일:** `src/components/seller/LocationInputSection.tsx`

```typescript
'use client';

import { useState } from 'react';
import { searchAddress } from '@/lib/address/juso-api';
import { reverseGeocode } from '@/lib/address/kakao-api';

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
  region: string;
}

interface Props {
  onLocationChange: (location: LocationData) => void;
}

export default function LocationInputSection({ onLocationChange }: Props) {
  const [inputMethod, setInputMethod] = useState<'gps' | 'search'>('gps');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GPS 현재 위치 사용
  const handleUseGPS = async () => {
    if (!navigator.geolocation) {
      setError('브라우저가 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. 브라우저 GPS로 좌표 획득
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;

      // 2. 카카오 역지오코딩으로 주소 변환
      const { address, region } = await reverseGeocode(latitude, longitude);

      const location = { address, latitude, longitude, region };
      setSelectedLocation(location);
      onLocationChange(location);

    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        if (err.code === err.PERMISSION_DENIED) {
          setError('위치 권한이 거부되었습니다. 주소 검색을 이용해주세요.');
        } else {
          setError('위치를 가져올 수 없습니다. 주소 검색을 이용해주세요.');
        }
      } else {
        setError('위치 확인 중 오류가 발생했습니다.');
      }
      setInputMethod('search');
    } finally {
      setIsLoading(false);
    }
  };

  // 주소 검색 (도로명주소 API)
  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const results = await searchAddress(searchKeyword);
      setSearchResults(results);

      if (results.length === 0) {
        setError('검색 결과가 없습니다. 다른 키워드로 검색해주세요.');
      }
    } catch (err) {
      setError('주소 검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 결과 선택
  const handleSelectAddress = (location: LocationData) => {
    setSelectedLocation(location);
    onLocationChange(location);
    setSearchResults([]);
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 my-4">
      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <span className="text-orange-500">📍</span>
        서비스 위치 설정
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        오프라인 서비스는 위치 정보가 필요합니다.
      </p>

      {/* 입력 방식 선택 */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => { setInputMethod('gps'); handleUseGPS(); }}
          disabled={isLoading}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            inputMethod === 'gps'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          {isLoading && inputMethod === 'gps' ? '확인 중...' : '🎯 현재 위치'}
        </button>
        <button
          type="button"
          onClick={() => setInputMethod('search')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            inputMethod === 'search'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔍 주소 검색
        </button>
      </div>

      {/* 주소 검색 UI */}
      {inputMethod === 'search' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="주소 또는 건물명 검색 (예: 역삼역, 테헤란로)"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
            >
              검색
            </button>
          </div>

          {/* 검색 결과 목록 */}
          {searchResults.length > 0 && (
            <div className="bg-white border rounded-lg max-h-48 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectAddress(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{result.address}</div>
                  <div className="text-sm text-gray-500">{result.roadAddress}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 선택된 위치 표시 */}
      {selectedLocation && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <span className="text-green-600 text-lg">✓</span>
          <div>
            <div className="font-medium text-green-800">{selectedLocation.address}</div>
            <div className="text-xs text-green-600">
              위도: {selectedLocation.latitude.toFixed(6)}, 경도: {selectedLocation.longitude.toFixed(6)}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">
        ※ 정확한 주소는 공개되지 않으며, 구/동 단위만 고객에게 표시됩니다.
      </p>
    </div>
  );
}
```

### 5.8 필요한 API 키 설정

```env
# .env.local

# 도로명주소 API (juso.go.kr)
# 발급: https://www.juso.go.kr/addrlink/devAddrLinkRequestWrite.do
NEXT_PUBLIC_JUSO_API_KEY=your_juso_api_key

# 카카오 REST API (역지오코딩용)
# 발급: https://developers.kakao.com/
NEXT_PUBLIC_KAKAO_REST_API_KEY=your_kakao_api_key
```

---

> **참고**: 별도의 위치 설정 페이지(`/mypage/seller/settings/location`)는 구현하지 않습니다.
> 위치 입력은 서비스 등록 시 오프라인 카테고리 선택 시에만 나타납니다.

## 6. 개발 일정

| 주차 | 작업 내용 | 산출물 |
|-----|----------|--------|
| **1주차** | DB 스키마 마이그레이션, 함수 생성 | SQL 마이그레이션 파일 |
| **1주차** | 전문가 위치 설정 페이지 개발 | /mypage/seller/settings/location |
| **2주차** | LocationContext, useGeolocation 개발 | src/contexts/LocationContext.tsx |
| **2주차** | API 엔드포인트 개발 | /api/nearby/experts, /api/nearby/helpers |
| **3주차** | ThirdHeroBanner 위치 기반 전환 | 실제 데이터 연동 |
| **3주차** | SecondHeroBanner 위치 기반 전환 | 실제 헬퍼 데이터 연동 |
| **4주차** | 테스트 및 버그 수정, 성능 최적화 | 테스트 코드, 캐싱 적용 |

---

## 7. 성능 및 보안 고려사항

### 7.1 성능 최적화

| 항목 | 전략 |
|-----|-----|
| API 캐싱 | SWR 5분 캐싱 + 서버 사이드 Redis 캐싱 |
| DB 쿼리 | 공간 인덱스 활용, LIMIT 적용 |
| 위치 캐싱 | localStorage 1시간 캐싱 |
| 그리드 캐싱 | 위도/경도 소수점 2자리 반올림 → 동일 그리드 캐시 공유 |

### 7.2 보안 및 프라이버시

| 항목 | 조치 |
|-----|-----|
| 전문가 정확한 좌표 | 노출 안함, 동/읍 단위만 표시 |
| Rate Limiting | IP당 분당 30회 제한 |
| 입력 검증 | 위도 -90~90, 경도 -180~180, 반경 1~100km |
| 위치 동의 | is_location_public 플래그로 명시적 동의 필요 |

### 7.3 SonarQube 규칙 준수

- 함수 복잡도: 15 이하
- 중복 코드: 3% 미만
- 테스트 커버리지: 80% 이상
- 보안 취약점: 0개

---

## 8. 테스트 계획

### 8.1 단위 테스트

```typescript
// __tests__/hooks/useNearbyExperts.test.ts
describe('useNearbyExperts', () => {
  it('위치 정보가 있으면 API 호출', async () => { ... });
  it('위치 정보가 없으면 API 미호출', async () => { ... });
  it('에러 발생 시 빈 객체 반환', async () => { ... });
});

// __tests__/api/nearby/experts.test.ts
describe('GET /api/nearby/experts', () => {
  it('유효한 좌표로 전문가 수 반환', async () => { ... });
  it('잘못된 좌표는 400 에러', async () => { ... });
  it('반경 초과 시 400 에러', async () => { ... });
});
```

### 8.2 통합 테스트

- 전문가 위치 등록 → 주변 전문가 검색 → 결과 확인
- 위치 권한 거부 → 기본 위치 사용 확인
- 다양한 반경에서 결과 변화 확인

---

## 9. 예상 효과

| 지표 | 현재 | 목표 |
|-----|-----|-----|
| 전문가 위치 등록률 | 0% | 70% |
| 위치 권한 허용률 | N/A | 50% |
| 주변 전문가 클릭률 | 현재 기준 | +30% |
| API 응답 시간 | N/A | < 200ms |

---

---

## 10. 상세 작업 순서 및 의존성 분석

### 10.1 전체 의존성 그래프

```
Phase 1 (DB 스키마)
├── 1.1 categories.service_type 컬럼 추가 ─┐
├── 1.2 기존 카테고리 데이터 마이그레이션 ────┼─→ Phase 2.1, 2.2
└── 1.3 sellers 위치 필드 추가 ─────────────┘
                                            │
Phase 2 (API 개발)                          │
├── 2.1 판매자 위치 API ────────────────────┼─→ Phase 4.1
├── 2.2 주변 전문가 수 API ─────────────────┼─→ Phase 5.1
└── 2.3 지역별 전문가 API ──────────────────┴─→ Phase 5.2
                                            │
Phase 3 (컴포넌트) ← Phase 1과 병렬 가능     │
├── 3.1 LocationInputSection 컴포넌트 ──────┼─→ Phase 4.1
└── 3.2 Kakao API 유틸 함수 ────────────────┘
                                            │
Phase 4 (서비스 등록 수정)                   │
├── 4.1 NewServiceClient.tsx 수정 ←─────────┘
└── 4.2 기존 위치 표시 및 변경 UI

Phase 5 (홈페이지) ← Phase 2 완료 후 가능
├── 5.1 ThirdHeroBanner 위치 기반 전환
└── 5.2 SecondHeroBanner 위치 기반 전환
```

### 10.2 Phase 1: 데이터베이스 스키마 (선행 작업 없음)

| Task ID | 작업 내용 | 예상 시간 | 결과물 |
|---------|----------|----------|--------|
| 1.1 | categories 테이블에 service_type 컬럼 추가 | 30분 | SQL 마이그레이션 |
| 1.2 | 기존 카테고리에 service_type 값 설정 | 30분 | 데이터 업데이트 쿼리 |
| 1.3 | sellers 테이블에 위치 필드 추가 | 30분 | SQL 마이그레이션 |
| 1.4 | services 테이블에 delivery_method 추가 | 20분 | SQL 마이그레이션 |
| 1.5 | Haversine 거리 계산 함수 생성 | 30분 | PostgreSQL 함수 |
| 1.6 | 주변 전문가 수 조회 RPC 함수 생성 | 45분 | PostgreSQL 함수 |

**총 예상 시간: 약 3시간**

### 10.3 Phase 2: API 개발 (Phase 1 완료 후)

| Task ID | 작업 내용 | 의존 작업 | 예상 시간 |
|---------|----------|----------|----------|
| 2.1 | GET /api/sellers/me/location | 1.3 | 1시간 |
| 2.2 | PUT /api/sellers/me/location | 1.3 | 1시간 |
| 2.3 | GET /api/categories/[slug]/service-type | 1.1 | 30분 |
| 2.4 | GET /api/experts/nearby-counts | 1.6 | 1.5시간 |
| 2.5 | GET /api/experts/by-region | 1.3 | 1시간 |

**총 예상 시간: 약 5시간**

### 10.4 Phase 3: 컴포넌트 개발 (Phase 1과 병렬 가능)

| Task ID | 작업 내용 | 의존 작업 | 예상 시간 |
|---------|----------|----------|----------|
| 3.1 | Kakao API 유틸 함수 (주소검색, 역지오코딩) | 없음 | 1시간 |
| 3.2 | LocationInputSection 컴포넌트 | 3.1 | 2시간 |
| 3.3 | DeliveryMethodSelector 컴포넌트 | 없음 | 1시간 |
| 3.4 | AddressSearchModal 컴포넌트 | 3.1 | 1.5시간 |

**총 예상 시간: 약 5.5시간**

### 10.5 Phase 4: 서비스 등록 페이지 수정 (Phase 2, 3 완료 후)

| Task ID | 작업 내용 | 의존 작업 | 예상 시간 |
|---------|----------|----------|----------|
| 4.1 | NewServiceClient.tsx에 service_type 조회 로직 추가 | 2.3 | 1시간 |
| 4.2 | 조건부 LocationInputSection 렌더링 | 3.2, 4.1 | 1.5시간 |
| 4.3 | 조건부 DeliveryMethodSelector 렌더링 | 3.3, 4.1 | 1시간 |
| 4.4 | 위치 저장 API 연동 | 2.2, 4.2 | 1시간 |
| 4.5 | 폼 유효성 검사 (오프라인 시 위치 필수) | 4.2 | 30분 |

**총 예상 시간: 약 5시간**

### 10.6 Phase 5: 홈페이지 컴포넌트 수정 (Phase 2 완료 후)

| Task ID | 작업 내용 | 의존 작업 | 예상 시간 |
|---------|----------|----------|----------|
| 5.1 | ThirdHeroBanner - 하드코딩 nearbyCount 제거 | 2.4 | 1시간 |
| 5.2 | ThirdHeroBanner - API 연동 및 로딩 상태 | 5.1 | 1시간 |
| 5.3 | SecondHeroBanner - 실제 지역 표시 | 2.5 | 1시간 |
| 5.4 | SecondHeroBanner - 실제 전문가 데이터 연동 | 5.3 | 1.5시간 |
| 5.5 | 위치 권한 요청 UI/UX 개선 | 5.1 | 1시간 |

**총 예상 시간: 약 5.5시간**

### 10.7 총 예상 시간 요약

| Phase | 작업 내용 | 예상 시간 |
|-------|----------|----------|
| 1 | DB 스키마 | 3시간 |
| 2 | API 개발 | 5시간 |
| 3 | 컴포넌트 개발 | 5.5시간 |
| 4 | 서비스 등록 수정 | 5시간 |
| 5 | 홈페이지 수정 | 5.5시간 |
| **합계** | | **24시간** |

### 10.8 권장 작업 순서

```
Day 1 (8시간)
├── Phase 1 전체 (3시간) - DB 스키마 변경
├── Phase 3.1 (1시간) - Kakao API 유틸 (병렬)
├── Phase 2.1-2.3 (2.5시간) - 기본 API
└── Phase 3.2 (2시간) - LocationInputSection

Day 2 (8시간)
├── Phase 2.4-2.5 (2.5시간) - 위치 기반 API
├── Phase 3.3-3.4 (2.5시간) - 추가 컴포넌트
└── Phase 4 전체 (5시간) - 서비스 등록 수정

Day 3 (8시간)
├── Phase 5 전체 (5.5시간) - 홈페이지 수정
└── 테스트 및 버그 수정 (2.5시간)
```

### 10.9 테스트 시나리오

#### 핵심 테스트 케이스

| 시나리오 | 테스트 내용 | 예상 결과 |
|---------|------------|----------|
| TC-1 | 신규 판매자가 오프라인 서비스 등록 시 위치 입력 | 위치 입력 UI 표시, sellers 테이블 저장 |
| TC-2 | 기존 판매자가 두 번째 오프라인 서비스 등록 | 기존 위치 표시, 변경 옵션 제공 |
| TC-3 | 온라인 서비스 등록 | 위치 입력 섹션 숨김 |
| TC-4 | "둘 다" 카테고리 선택 후 오프라인 선택 | 제공 방식 선택 → 위치 입력 표시 |
| TC-5 | 홈페이지에서 위치 권한 허용 | 실제 위치 기반 주변 전문가 수 표시 |
| TC-6 | 홈페이지에서 위치 권한 거부 | 기본 위치(서울 강남) 기준 표시 |

---

*작성일: 2025-12-03*
*버전: 2.0*
*업데이트: 서비스 등록 시 위치 입력 로직 추가, 상세 작업 순서 및 의존성 분석 추가*
