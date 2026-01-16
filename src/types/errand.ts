// 심부름 관련 타입 정의

// 심부름 = 어디 다녀오는 것
export type ErrandCategory =
  | 'DELIVERY' // 배달 (운반, 줄서기, 서류 등 모두 포함)
  | 'SHOPPING'; // 구매대행

export type ErrandStatus = 'OPEN' | 'MATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

// 구매대행 범위
export type ShoppingRange = 'LOCAL' | 'DISTRICT' | 'CITY' | 'SPECIFIC';

// 구매대행 품목
export interface ShoppingItem {
  name: string;
  quantity: number;
  note?: string;
}

// 다중 배달 정차지
export interface ErrandStop {
  id?: string;
  errand_id?: string;
  stop_order: number;
  address: string;
  address_detail?: string;
  lat?: number;
  lng?: number;
  recipient_name?: string;
  recipient_phone?: string;
  is_completed?: boolean;
  completed_at?: string;
}

export interface Errand {
  id: string;
  requester_id: string;
  helper_id: string | null;
  title: string;
  description: string | null;
  category: ErrandCategory;
  pickup_address: string;
  pickup_detail: string | null; // 상세주소 (동/호수, 층, 건물명 등)
  pickup_lat: number | null;
  pickup_lng: number | null;
  delivery_address: string;
  delivery_detail: string | null; // 상세주소 (동/호수, 층, 건물명 등)
  delivery_lat: number | null;
  delivery_lng: number | null;
  estimated_distance: number | null;
  base_price: number;
  distance_price: number;
  tip: number;
  total_price: number;
  status: ErrandStatus;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
  // 다중 배달
  is_multi_stop: boolean;
  total_stops: number;
  stop_fee: number;
  // 구매대행
  shopping_range: ShoppingRange | null;
  shopping_items: ShoppingItem[] | null;
  range_fee: number;
  item_fee: number;
  // Relations
  requester?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  helper?: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
}

export interface ErrandApplication {
  id: string;
  errand_id: string;
  helper_id: string;
  message: string | null;
  proposed_price: number | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  // Relations
  helper?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  errand?: Errand;
}

export interface ErrandLocation {
  id: string;
  errand_id: string;
  helper_id: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  recorded_at: string;
}

export interface ErrandMessage {
  id: string;
  errand_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'image' | 'location' | 'system';
  is_read: boolean;
  created_at: string;
  // Relations
  sender?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

// 스마트 요금 관련 타입
export type WeatherCondition = 'CLEAR' | 'RAIN' | 'SNOW' | 'EXTREME';
export type TimeCondition = 'DAY' | 'LATE_NIGHT' | 'RUSH_HOUR';
export type WeightClass = 'LIGHT' | 'MEDIUM' | 'HEAVY';

// API Request/Response Types
export interface CreateErrandRequest {
  title: string;
  description?: string;
  category: ErrandCategory;
  // 배달용 (단순/다중)
  pickup_address: string;
  pickup_detail?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  delivery_address: string;
  delivery_detail?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  // 다중 배달
  is_multi_stop?: boolean;
  stops?: ErrandStop[];
  // 구매대행
  shopping_range?: ShoppingRange;
  shopping_items?: ShoppingItem[];
  // 공통
  tip?: number;
  scheduled_at?: string;
  // 스마트 요금 계산 필드
  estimated_price?: number;
  distance_km?: number;
  weather_condition?: WeatherCondition;
  time_condition?: TimeCondition;
  weight_class?: WeightClass;
}

export interface ApplyErrandRequest {
  errand_id: string;
  message?: string;
  proposed_price?: number;
}

export interface UpdateErrandStatusRequest {
  status: ErrandStatus;
  cancel_reason?: string;
}

// Category Labels (Korean)
export const ERRAND_CATEGORY_LABELS: Record<ErrandCategory, string> = {
  DELIVERY: '배달',
  SHOPPING: '구매대행',
};

export const ERRAND_STATUS_LABELS: Record<ErrandStatus, string> = {
  OPEN: '모집중',
  MATCHED: '매칭완료',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
};

// Pricing Constants (스마트 요금과 일치)
export const ERRAND_PRICING = {
  BASE_PRICE: 3000, // 기본 요금
  PRICE_PER_KM: 1200, // km당 추가 요금
  MIN_PRICE: 3000, // 최소 요금
  SUBSCRIPTION_FEE: 30000, // 월 구독료
  // 할증
  WEATHER_RAIN_MULTIPLIER: 1.2, // 비 20%
  WEATHER_SNOW_MULTIPLIER: 1.4, // 눈 40%
  WEATHER_EXTREME_MULTIPLIER: 1.5, // 극한 50%
  TIME_LATE_NIGHT_SURCHARGE: 5000, // 심야 (22시~6시)
  TIME_RUSH_HOUR_SURCHARGE: 2000, // 출퇴근 (7-9시, 18-20시)
  WEIGHT_MEDIUM_SURCHARGE: 2000, // 보통 무게
  WEIGHT_HEAVY_SURCHARGE: 10000, // 무거운 물품
  // 다중 배달
  STOP_FEE: 1500, // 정차당 추가 요금
  // 구매대행
  SHOPPING_BASE_PRICE: 5000, // 구매대행 기본료
  SHOPPING_RANGE_LOCAL: 0, // 동네 (1km)
  SHOPPING_RANGE_DISTRICT: 3000, // 우리동네 (3km)
  SHOPPING_RANGE_CITY: 8000, // 넓은 범위 (10km)
  SHOPPING_ITEM_PRICE: 500, // 품목당 (3개 초과 시)
  SHOPPING_FREE_ITEMS: 2, // 무료 품목 수
};

// 구매대행 범위 라벨
export const SHOPPING_RANGE_LABELS: Record<ShoppingRange, string> = {
  LOCAL: '🏠 동네 (1km 이내)',
  DISTRICT: '🏪 우리동네 (3km 이내)',
  CITY: '🏙️ 넓은 범위 (10km 이내)',
  SPECIFIC: '📍 특정 장소 지정',
};

// Helper Types
export type HelperGrade = 'NEWBIE' | 'REGULAR' | 'PRO' | 'MASTER';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trial';

export type HelperVerificationStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export interface HelperProfile {
  id: string;
  user_id: string;
  is_verified: boolean;
  id_card_verified_at: string | null;
  bank_name: string | null;
  bank_account: string | null;
  account_holder: string | null;
  grade: HelperGrade;
  total_completed: number;
  total_cancelled: number;
  average_rating: number;
  total_reviews: number;
  subscription_status: SubscriptionStatus;
  subscription_expires_at: string | null;
  billing_key: string | null;
  preferred_categories: ErrandCategory[] | null;
  preferred_areas: string[] | null;
  bio: string | null;
  is_active: boolean;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
  // 문서 관련 필드
  id_card_url: string | null;
  selfie_url: string | null;
  criminal_record_url: string | null;
  documents_submitted_at: string | null;
  documents_verified_at: string | null;
  documents_rejected_reason: string | null;
  verification_status: HelperVerificationStatus;
  // Relations
  user?: {
    id: string;
    name: string;
    avatar_url: string | null;
    phone: string | null;
  };
}

export interface HelperSubscription {
  id: string;
  helper_id: string;
  payment_id: string | null;
  amount: number;
  paid_at: string;
  expires_at: string;
  status: 'paid' | 'failed' | 'refunded' | 'pending';
  payment_method: string | null;
  receipt_url: string | null;
  created_at: string;
}

export interface ErrandSettlement {
  id: string;
  errand_id: string;
  helper_id: string;
  total_amount: number;
  status: 'pending' | 'available' | 'withdrawn';
  available_at: string | null;
  withdrawn_at: string | null;
  created_at: string;
  // Relations
  errand?: Errand;
}

export interface HelperWithdrawal {
  id: string;
  helper_id: string;
  amount: number;
  bank_name: string;
  bank_account: string;
  account_holder: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  reject_reason: string | null;
  requested_at: string;
  processed_at: string | null;
  processed_by: string | null;
}

export interface ErrandReview {
  id: string;
  errand_id: string;
  reviewer_id: string;
  helper_id: string;
  rating: number;
  speed_rating: number | null;
  kindness_rating: number | null;
  accuracy_rating: number | null;
  content: string | null;
  created_at: string;
  // Relations
  reviewer?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  errand?: Errand;
}

export interface ErrandDispute {
  id: string;
  errand_id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  description: string;
  evidence_urls: string[] | null;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  admin_note: string | null;
  resolution: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
}

// Helper Grade Labels
export const HELPER_GRADE_LABELS: Record<HelperGrade, string> = {
  NEWBIE: '새내기',
  REGULAR: '일반',
  PRO: '프로',
  MASTER: '마스터',
};

// Category Icons (for UI)
export const ERRAND_CATEGORY_ICONS: Record<ErrandCategory, string> = {
  DELIVERY: 'Package',
  SHOPPING: 'ShoppingCart',
};
