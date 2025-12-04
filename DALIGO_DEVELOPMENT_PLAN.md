# 달리고 (Daligo) - 독립 심부름 서비스 개발 계획서

> 작성일: 2025-12-03
> 버전: 1.0
> 상태: 기획 완료

---

## 1. 프로젝트 개요

### 1.1 서비스 정보

| 항목 | 내용 |
|------|------|
| 서비스명 | 달리고 (Daligo) |
| 도메인 | daligo.com (예정) |
| 성격 | 완전 독립 심부름 매칭 플랫폼 |
| 타겟 | 심부름 의뢰자 + 헬퍼 (배달원) |

### 1.2 핵심 원칙

```
❌ 돌파구(dolpagu.com) 연동 없음
❌ 회원 공유 없음
❌ DB 공유 없음
❌ 코드 공유 없음

✅ 100% 독립 서비스
✅ 별도 Supabase 프로젝트
✅ 별도 카카오/구글 OAuth 앱
✅ 별도 결제 시스템 (PortOne)
```

### 1.3 핵심 가치

1. **AI 자연어 분석**: 사용자가 자연스럽게 요청하면 AI가 자동 분석
2. **동적 가격 책정**: 거리 + 날씨 + 시간대 + 무게 기반 실시간 가격 계산
3. **실시간 추적**: 헬퍼 위치를 지도에서 실시간 확인

---

## 2. 기술 스택

### 2.1 프론트엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 15+ | App Router 기반 프레임워크 |
| TypeScript | 5+ | 타입 안정성 |
| Tailwind CSS | 3+ | 스타일링 |
| Zustand | 4+ | 상태 관리 |
| React Query | 5+ | 서버 상태 관리 |
| Lucide React | - | 아이콘 |

### 2.2 백엔드

| 기술 | 용도 |
|------|------|
| Supabase | PostgreSQL, Auth, Realtime, Storage |
| Edge Functions | 서버리스 함수 |
| PortOne | 결제 처리 |

### 2.3 외부 API

| API | 용도 | 발급처 |
|-----|------|--------|
| 카카오맵 API | Geocoding, 경로 계산, 지도 표시 | developers.kakao.com |
| 기상청 API | 실시간 날씨 조회 | data.go.kr |
| Firebase Cloud Messaging | 푸시 알림 | firebase.google.com |

### 2.4 배포

| 서비스 | 용도 |
|--------|------|
| Vercel | 프론트엔드 호스팅 |
| Supabase Cloud | 백엔드 호스팅 |

---

## 3. 프로젝트 구조

```
daligo/
├── src/
│   ├── app/                          # App Router
│   │   ├── (auth)/                   # 인증 라우트 그룹
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── callback/
│   │   │       └── route.ts
│   │   │
│   │   ├── (main)/                   # 메인 라우트 그룹
│   │   │   ├── page.tsx              # 홈 (레이더 뷰)
│   │   │   │
│   │   │   ├── errands/              # 심부름
│   │   │   │   ├── page.tsx          # 목록
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx      # 생성
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # 상세
│   │   │   │       └── track/
│   │   │   │           └── page.tsx  # 추적
│   │   │   │
│   │   │   └── helper/               # 헬퍼
│   │   │       ├── register/
│   │   │       │   └── page.tsx      # 등록
│   │   │       ├── dashboard/
│   │   │       │   └── page.tsx      # 대시보드
│   │   │       └── earnings/
│   │   │           └── page.tsx      # 수익
│   │   │
│   │   ├── mypage/                   # 마이페이지
│   │   │   ├── page.tsx
│   │   │   ├── orders/
│   │   │   │   └── page.tsx
│   │   │   ├── payments/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── admin/                    # 관리자
│   │   │   ├── page.tsx
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   ├── errands/
│   │   │   │   └── page.tsx
│   │   │   └── settlements/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                      # API Routes
│   │       ├── errands/
│   │       │   ├── route.ts          # GET, POST
│   │       │   └── [id]/
│   │       │       ├── route.ts      # GET, PATCH, DELETE
│   │       │       ├── apply/
│   │       │       │   └── route.ts
│   │       │       ├── accept/
│   │       │       │   └── route.ts
│   │       │       ├── start/
│   │       │       │   └── route.ts
│   │       │       ├── complete/
│   │       │       │   └── route.ts
│   │       │       └── location/
│   │       │           └── route.ts
│   │       │
│   │       ├── helpers/
│   │       │   ├── route.ts
│   │       │   ├── register/
│   │       │   │   └── route.ts
│   │       │   └── nearby/
│   │       │       └── route.ts
│   │       │
│   │       ├── payments/
│   │       │   ├── route.ts
│   │       │   ├── verify/
│   │       │   │   └── route.ts
│   │       │   └── webhook/
│   │       │       └── route.ts
│   │       │
│   │       └── admin/
│   │           └── ...
│   │
│   ├── components/
│   │   ├── ui/                       # 공통 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Badge.tsx
│   │   │
│   │   ├── layout/                   # 레이아웃
│   │   │   ├── Header.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── errands/                  # 심부름 전용
│   │   │   ├── ErrandHero.tsx        # 레이더 뷰
│   │   │   ├── ErrandList.tsx
│   │   │   ├── ErrandCard.tsx
│   │   │   ├── ErrandForm.tsx
│   │   │   ├── ErrandTracker.tsx
│   │   │   ├── PriceCalculator.tsx
│   │   │   └── CategoryFilter.tsx
│   │   │
│   │   ├── map/                      # 지도 관련
│   │   │   ├── KakaoMap.tsx
│   │   │   ├── LocationPicker.tsx
│   │   │   └── RouteDisplay.tsx
│   │   │
│   │   ├── helper/                   # 헬퍼 관련
│   │   │   ├── HelperCard.tsx
│   │   │   ├── HelperList.tsx
│   │   │   └── HelperProfile.tsx
│   │   │
│   │   └── payment/                  # 결제 관련
│   │       ├── PaymentForm.tsx
│   │       └── PaymentResult.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   │
│   │   ├── kakao/
│   │   │   ├── geocoding.ts          # 주소 → 좌표
│   │   │   ├── directions.ts         # 경로 계산
│   │   │   └── map.ts                # 지도 초기화
│   │   │
│   │   ├── weather/
│   │   │   └── api.ts                # 기상청 API
│   │   │
│   │   ├── pricing/
│   │   │   ├── constants.ts          # 가격 상수
│   │   │   ├── calculator.ts         # 가격 계산
│   │   │   └── types.ts
│   │   │
│   │   ├── payment/
│   │   │   └── portone.ts            # PortOne 연동
│   │   │
│   │   └── utils/
│   │       ├── format.ts             # 포맷팅
│   │       ├── validation.ts         # 유효성 검사
│   │       └── helpers.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLocation.ts
│   │   ├── useWeather.ts
│   │   └── useRealtime.ts
│   │
│   ├── stores/                       # Zustand 스토어
│   │   ├── authStore.ts
│   │   ├── errandStore.ts
│   │   └── locationStore.ts
│   │
│   └── types/
│       ├── database.ts               # Supabase 타입
│       ├── errand.ts
│       ├── helper.ts
│       ├── payment.ts
│       └── common.ts
│
├── supabase/
│   └── migrations/                   # DB 마이그레이션
│       ├── 00001_create_enums.sql
│       ├── 00002_create_profiles.sql
│       ├── 00003_create_helpers.sql
│       ├── 00004_create_errands.sql
│       ├── 00005_create_payments.sql
│       ├── 00006_create_reviews.sql
│       ├── 00007_create_notifications.sql
│       └── 00008_create_rls_policies.sql
│
├── tests/
│   ├── unit/
│   └── e2e/
│
├── public/
│   ├── icons/
│   └── images/
│
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. 데이터베이스 스키마

### 4.1 ENUM 타입

```sql
-- 사용자 역할
CREATE TYPE user_role AS ENUM ('USER', 'HELPER', 'ADMIN');

-- 심부름 카테고리
CREATE TYPE errand_category AS ENUM (
  'DELIVERY',       -- 배달/운반
  'CLEANING',       -- 청소/집안일
  'QUEUEING',       -- 줄서기
  'BUG_CATCHING',   -- 벌레잡기
  'PET_CARE',       -- 반려동물 케어
  'SHOPPING',       -- 구매대행
  'OTHER'           -- 기타
);

-- 심부름 상태
CREATE TYPE errand_status AS ENUM (
  'OPEN',           -- 대기중
  'MATCHED',        -- 매칭됨
  'IN_PROGRESS',    -- 진행중
  'COMPLETED',      -- 완료
  'CANCELLED'       -- 취소됨
);

-- 결제 상태
CREATE TYPE payment_status AS ENUM (
  'PENDING',        -- 대기
  'PAID',           -- 완료
  'CANCELLED',      -- 취소
  'REFUNDED'        -- 환불
);

-- 정산 상태
CREATE TYPE settlement_status AS ENUM (
  'PENDING',        -- 대기
  'COMPLETED'       -- 완료
);
```

### 4.2 profiles 테이블 (사용자)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(100),
  display_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  role user_role DEFAULT 'USER',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_profiles_role ON profiles(role);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

### 4.3 helpers 테이블 (헬퍼)

```sql
CREATE TABLE helpers (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  specialties errand_category[] DEFAULT '{}',
  service_area TEXT,                    -- "강남구, 서초구"

  -- 활동 상태
  is_active BOOLEAN DEFAULT false,
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  last_location_at TIMESTAMPTZ,

  -- 통계
  total_completed INTEGER DEFAULT 0,
  rating DECIMAL(2, 1) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,

  -- 인증
  is_verified BOOLEAN DEFAULT false,
  id_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,

  -- 정산 계좌 (암호화)
  bank_name VARCHAR(20),
  bank_account_encrypted TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_helpers_is_active ON helpers(is_active);
CREATE INDEX idx_helpers_location ON helpers(current_lat, current_lng);

-- RLS
ALTER TABLE helpers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Helpers are viewable by everyone"
  ON helpers FOR SELECT USING (true);

CREATE POLICY "Helpers can update own profile"
  ON helpers FOR UPDATE USING (auth.uid() = id);
```

### 4.4 errands 테이블 (심부름 요청)

```sql
CREATE TABLE errands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- 기본 정보
  title VARCHAR(100) NOT NULL,
  description TEXT,
  category errand_category NOT NULL,

  -- 출발지
  start_address TEXT NOT NULL,
  start_lat DECIMAL(10, 8),
  start_lng DECIMAL(11, 8),

  -- 도착지
  end_address TEXT NOT NULL,
  end_lat DECIMAL(10, 8),
  end_lng DECIMAL(11, 8),

  -- 거리 (km)
  distance_km DECIMAL(5, 2),

  -- 가격 계산 요소
  weather VARCHAR(20) DEFAULT 'CLEAR',        -- CLEAR, RAIN, SNOW, EXTREME
  time_condition VARCHAR(20) DEFAULT 'DAY',   -- DAY, LATE_NIGHT, RUSH_HOUR
  weight_class VARCHAR(30) DEFAULT 'LIGHT',   -- LIGHT, MEDIUM, HEAVY

  -- 가격
  base_price INTEGER NOT NULL,
  final_price INTEGER NOT NULL,

  -- 상태
  status errand_status DEFAULT 'OPEN',

  -- 매칭된 헬퍼
  helper_id UUID REFERENCES helpers(id),
  matched_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- 취소
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_errands_status ON errands(status);
CREATE INDEX idx_errands_requester ON errands(requester_id);
CREATE INDEX idx_errands_helper ON errands(helper_id);
CREATE INDEX idx_errands_created ON errands(created_at DESC);

-- RLS
ALTER TABLE errands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Open errands are viewable by everyone"
  ON errands FOR SELECT USING (
    status = 'OPEN' OR
    auth.uid() = requester_id OR
    auth.uid() = helper_id
  );

CREATE POLICY "Users can create errands"
  ON errands FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Requester and helper can update"
  ON errands FOR UPDATE USING (
    auth.uid() = requester_id OR
    auth.uid() = helper_id
  );
```

### 4.5 helper_locations 테이블 (실시간 위치)

```sql
CREATE TABLE helper_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  errand_id UUID NOT NULL REFERENCES errands(id) ON DELETE CASCADE,
  helper_id UUID NOT NULL REFERENCES helpers(id) ON DELETE CASCADE,

  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_helper_locations_errand ON helper_locations(errand_id);
CREATE INDEX idx_helper_locations_created ON helper_locations(created_at DESC);

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE helper_locations;

-- RLS
ALTER TABLE helper_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Location visible to requester and helper"
  ON helper_locations FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM errands
      WHERE errands.id = errand_id
      AND (errands.requester_id = auth.uid() OR errands.helper_id = auth.uid())
    )
  );

CREATE POLICY "Helper can insert location"
  ON helper_locations FOR INSERT WITH CHECK (auth.uid() = helper_id);
```

### 4.6 payments 테이블 (결제)

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  errand_id UUID NOT NULL REFERENCES errands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- PortOne 연동
  payment_key VARCHAR(100),
  order_id VARCHAR(100) UNIQUE NOT NULL,

  -- 금액
  amount INTEGER NOT NULL,

  -- 상태
  status payment_status DEFAULT 'PENDING',

  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_payments_errand ON payments(errand_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT USING (auth.uid() = user_id);
```

### 4.7 settlements 테이블 (헬퍼 정산)

```sql
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helper_id UUID NOT NULL REFERENCES helpers(id) ON DELETE CASCADE,
  errand_id UUID NOT NULL REFERENCES errands(id) ON DELETE CASCADE,

  -- 금액
  errand_price INTEGER NOT NULL,        -- 심부름 금액
  platform_fee INTEGER NOT NULL,        -- 플랫폼 수수료 (10%)
  settlement_amount INTEGER NOT NULL,   -- 정산 금액

  -- 상태
  status settlement_status DEFAULT 'PENDING',
  settled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_settlements_helper ON settlements(helper_id);
CREATE INDEX idx_settlements_status ON settlements(status);

-- RLS
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Helpers can view own settlements"
  ON settlements FOR SELECT USING (auth.uid() = helper_id);
```

### 4.8 reviews 테이블 (리뷰)

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  errand_id UUID NOT NULL REFERENCES errands(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_errand ON reviews(errand_id);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for completed errands"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
```

### 4.9 notifications 테이블 (알림)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  message TEXT,
  data JSONB,

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);
```

---

## 5. 가격 계산 로직

### 5.1 가격 상수

```typescript
// lib/pricing/constants.ts

export const PRICING = {
  // 기본료
  BASE_PRICE: 3000,

  // 거리 (km당)
  PRICE_PER_KM: 1200,

  // 무게 할증
  WEIGHT_SURCHARGE: {
    LIGHT: 0,       // 가벼움
    MEDIUM: 2000,   // 보통
    HEAVY: 10000,   // 무거움
  },

  // 날씨 할증 (배율)
  WEATHER_MULTIPLIER: {
    CLEAR: 1.0,
    RAIN: 1.2,      // +20%
    SNOW: 1.4,      // +40%
    EXTREME: 1.5,   // +50%
  },

  // 시간대 할증
  TIME_SURCHARGE: {
    DAY: 0,
    RUSH_HOUR: 2000,    // 출퇴근
    LATE_NIGHT: 5000,   // 심야 (22시~06시)
  },

  // 플랫폼 수수료
  PLATFORM_FEE_RATE: 0.1,  // 10%
} as const;
```

### 5.2 가격 계산 함수

```typescript
// lib/pricing/calculator.ts

import { PRICING } from './constants';

interface PriceInput {
  distance: number;      // km
  weather: 'CLEAR' | 'RAIN' | 'SNOW' | 'EXTREME';
  timeCondition: 'DAY' | 'RUSH_HOUR' | 'LATE_NIGHT';
  weightClass: 'LIGHT' | 'MEDIUM' | 'HEAVY';
}

interface PriceBreakdown {
  basePrice: number;
  distancePrice: number;
  weightSurcharge: number;
  subtotal: number;
  weatherMultiplier: number;
  afterWeather: number;
  timeSurcharge: number;
  finalPrice: number;
}

export function calculatePrice(input: PriceInput): PriceBreakdown {
  // 1. 기본료
  const basePrice = PRICING.BASE_PRICE;

  // 2. 거리 요금
  const distancePrice = Math.round(input.distance * PRICING.PRICE_PER_KM);

  // 3. 무게 할증
  const weightSurcharge = PRICING.WEIGHT_SURCHARGE[input.weightClass];

  // 4. 소계
  const subtotal = basePrice + distancePrice + weightSurcharge;

  // 5. 날씨 배율 적용
  const weatherMultiplier = PRICING.WEATHER_MULTIPLIER[input.weather];
  const afterWeather = Math.round(subtotal * weatherMultiplier);

  // 6. 시간대 할증
  const timeSurcharge = PRICING.TIME_SURCHARGE[input.timeCondition];

  // 7. 최종 가격 (100원 단위 반올림)
  const finalPrice = Math.round((afterWeather + timeSurcharge) / 100) * 100;

  return {
    basePrice,
    distancePrice,
    weightSurcharge,
    subtotal,
    weatherMultiplier,
    afterWeather,
    timeSurcharge,
    finalPrice,
  };
}

// 헬퍼 정산 금액 계산
export function calculateSettlement(errandPrice: number): {
  platformFee: number;
  settlementAmount: number;
} {
  const platformFee = Math.round(errandPrice * PRICING.PLATFORM_FEE_RATE);
  const settlementAmount = errandPrice - platformFee;

  return { platformFee, settlementAmount };
}
```

---

## 6. 핵심 기능 목록

### 6.1 사용자(의뢰자) 기능

| 기능 | 설명 |
|------|------|
| 회원가입 | 카카오, 구글, 이메일 |
| 로그인 | OAuth + 이메일/비밀번호 |
| 심부름 요청 생성 | 자연어 입력 → AI 분석 → 가격 계산 |
| 위치 선택 | 카카오맵에서 출발지/도착지 선택 |
| 요청 목록 | 주변 요청 목록 조회 |
| 실시간 추적 | 헬퍼 위치 실시간 확인 |
| 결제 | PortOne 결제 |
| 리뷰 작성 | 완료 후 헬퍼 리뷰 |
| 내 요청 내역 | 과거 요청 조회 |

### 6.2 헬퍼 기능

| 기능 | 설명 |
|------|------|
| 헬퍼 등록 | 신분증 인증, 휴대폰 인증 |
| 주변 요청 조회 | 현재 위치 기반 요청 목록 |
| 요청 수락 | 심부름 수락 |
| 위치 전송 | 실시간 GPS 위치 전송 |
| 시작/완료 처리 | 상태 변경 |
| 수익 대시보드 | 수익 현황 조회 |
| 정산 신청 | 계좌로 정산 |

### 6.3 관리자 기능

| 기능 | 설명 |
|------|------|
| 사용자 관리 | 사용자 목록, 상세, 정지 |
| 헬퍼 인증 | 인증 요청 승인/거절 |
| 요청 모니터링 | 전체 요청 현황 |
| 정산 처리 | 정산 승인 |
| 통계 대시보드 | 매출, 사용자, 요청 통계 |

---

## 7. 개발 일정

### 7.1 전체 일정 (10주)

| 주차 | 단계 | 작업 내용 |
|------|------|----------|
| **1** | 초기화 | 프로젝트 생성, Supabase 설정, OAuth 설정, 기본 레이아웃 |
| **2** | 인증 | 로그인/회원가입, 프로필 설정, 세션 관리 |
| **3** | DB/로직 | 마이그레이션, 가격계산, 위치API, 날씨API + 테스트 |
| **4** | 심부름 | 요청 생성/목록/상세, AI 분석, 카테고리 필터 |
| **5** | 헬퍼 | 헬퍼 등록/인증, 대시보드, 요청 수락 |
| **6** | 실시간 | 카카오맵 연동, 위치추적, Supabase Realtime |
| **7** | 결제 | PortOne 연동, 결제/환불, 정산 시스템 |
| **8** | 부가기능 | 리뷰, 알림 (푸시/인앱), 채팅 |
| **9** | 관리자 | 관리자 대시보드, 사용자/헬퍼/정산 관리 |
| **10** | 배포 | E2E 테스트, 성능 최적화, SEO, Vercel 배포 |

### 7.2 상세 작업 목록

#### Week 1: 초기화
```
□ Next.js 15 프로젝트 생성
□ TypeScript strict 설정
□ Tailwind CSS 설정
□ ESLint + Prettier 설정
□ Supabase 프로젝트 생성
□ 환경 변수 설정
□ 카카오 개발자 앱 생성
□ 구글 OAuth 앱 생성
□ Header, MobileNav 컴포넌트
□ 기본 레이아웃
```

#### Week 2: 인증
```
□ Supabase Auth 설정
□ 카카오 OAuth 연동
□ 구글 OAuth 연동
□ 이메일 회원가입
□ 로그인 페이지
□ 회원가입 페이지
□ 프로필 설정 페이지
□ AuthProvider 구현
□ 미들웨어 (인증 체크)
□ 테스트 작성
```

#### Week 3: DB & 핵심 로직
```
□ ENUM 타입 마이그레이션
□ profiles 테이블
□ helpers 테이블
□ errands 테이블
□ RLS 정책 설정
□ 타입 정의 (database.ts)
□ 가격 계산 모듈 + 테스트
□ 카카오맵 Geocoding + 테스트
□ 카카오맵 Directions + 테스트
□ 기상청 API 연동 + 테스트
```

#### Week 4: 심부름 CRUD
```
□ 심부름 API (CRUD)
□ 요청 생성 폼
□ AI 분석 연동 (Gemini)
□ 위치 선택 (LocationPicker)
□ 가격 계산 UI (PriceCalculator)
□ 요청 목록 페이지
□ 요청 카드 컴포넌트
□ 카테고리 필터
□ 검색 기능
□ 요청 상세 페이지
```

#### Week 5: 헬퍼 시스템
```
□ 헬퍼 등록 페이지
□ 신분증 인증 (이미지 업로드)
□ 휴대폰 인증
□ 헬퍼 대시보드
□ 주변 요청 목록
□ 요청 수락 API
□ 요청 거절 기능
□ 헬퍼 프로필 페이지
□ 전문 분야 설정
□ 활동 상태 토글
```

#### Week 6: 실시간 추적
```
□ 카카오맵 SDK 설정
□ KakaoMap 컴포넌트
□ 헬퍼 위치 전송 (watchPosition)
□ helper_locations 테이블
□ Supabase Realtime 설정
□ 실시간 위치 구독
□ 지도 마커 이동
□ ETA 계산
□ ErrandTracker 컴포넌트
□ 추적 페이지
```

#### Week 7: 결제 시스템
```
□ PortOne 연동
□ 결제 요청 API
□ 결제 승인 API
□ 결제 취소/환불
□ 웹훅 처리
□ payments 테이블
□ settlements 테이블
□ 정산 계산 로직
□ 정산 대시보드 (헬퍼)
□ 정산 신청 기능
```

#### Week 8: 부가 기능
```
□ reviews 테이블
□ 리뷰 작성 UI
□ 리뷰 목록
□ 별점 표시
□ notifications 테이블
□ FCM 설정
□ 푸시 알림 전송
□ 인앱 알림 목록
□ 알림 읽음 처리
□ 이메일 알림
```

#### Week 9: 관리자
```
□ 관리자 레이아웃
□ 관리자 인증 (role 체크)
□ 사용자 목록/상세
□ 헬퍼 인증 승인
□ 요청 모니터링
□ 정산 처리
□ 통계 대시보드
□ 매출 차트
□ 사용자 차트
□ 요청 차트
```

#### Week 10: 배포
```
□ E2E 테스트 작성
□ 테스트 커버리지 80% 달성
□ SonarQube 점검
□ 보안 취약점 0
□ 성능 최적화
□ 이미지 최적화
□ SEO 설정
□ sitemap, robots.txt
□ Vercel 배포
□ 도메인 연결
□ SSL 설정
```

---

## 8. 품질 기준 (SonarQube)

### 8.1 필수 준수 사항

| 항목 | 기준 | 설명 |
|------|------|------|
| 보안 취약점 | 0개 | SQL Injection, XSS 등 없음 |
| 버그 | 0개 | null 참조, 타입 오류 등 없음 |
| 코드 중복 | ≤5% | 중복 코드 최소화 |
| 테스트 커버리지 | ≥80% | 핵심 로직 테스트 |
| 복잡도 | ≤15 | Cognitive Complexity |

### 8.2 코딩 규칙

```typescript
// ❌ BAD - 매직 넘버
if (distance > 10) price *= 1.5;

// ✅ GOOD - 상수 사용
const MAX_NORMAL_DISTANCE = 10;
const LONG_DISTANCE_MULTIPLIER = 1.5;
if (distance > MAX_NORMAL_DISTANCE) price *= LONG_DISTANCE_MULTIPLIER;
```

```typescript
// ❌ BAD - null 체크 없음
const name = user.profile.name;

// ✅ GOOD - Optional chaining
const name = user?.profile?.name ?? '익명';
```

```typescript
// ❌ BAD - 복잡한 중첩
function calc(a) {
  if (a) {
    if (a.b) {
      if (a.b.c) {
        return a.b.c;
      }
    }
  }
}

// ✅ GOOD - Early return
function calc(a) {
  if (!a?.b?.c) return null;
  return a.b.c;
}
```

---

## 9. 예상 비용

### 9.1 월간 운영 비용

| 항목 | 비용 | 비고 |
|------|------|------|
| Supabase Pro | $25 | DB, Auth, Realtime |
| Vercel Pro | $20 | 호스팅 |
| 도메인 | ~$1 | 연 $12 |
| 카카오맵 API | $0 | 월 30만 콜 무료 |
| 기상청 API | $0 | 무료 |
| FCM | $0 | 무료 |
| **합계** | **~$46/월** | |

### 9.2 초기 비용

| 항목 | 비용 |
|------|------|
| 도메인 구매 | ~$12 |
| **합계** | **~$12** |

---

## 10. 환경 변수

```bash
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Kakao
NEXT_PUBLIC_KAKAO_APP_KEY=xxx
KAKAO_REST_API_KEY=xxx

# Weather (기상청)
WEATHER_API_KEY=xxx

# PortOne
NEXT_PUBLIC_PORTONE_STORE_ID=xxx
PORTONE_API_SECRET=xxx

# FCM
NEXT_PUBLIC_FCM_VAPID_KEY=xxx
FCM_SERVER_KEY=xxx

# AI (Gemini)
GEMINI_API_KEY=xxx
```

---

## 11. 참고 자료

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [카카오맵 API](https://apis.map.kakao.com)
- [기상청 공공데이터](https://data.go.kr)
- [PortOne 개발자 문서](https://developers.portone.io)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-03 | 최초 작성 |
