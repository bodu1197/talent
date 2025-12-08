// =====================================================
// 돌파구 동네 배달 - TypeScript 타입 정의
// =====================================================

// 음식점 카테고리
export type FoodStoreCategory =
  | 'korean' // 한식
  | 'chinese' // 중식
  | 'japanese' // 일식
  | 'western' // 양식
  | 'chicken' // 치킨
  | 'pizza' // 피자
  | 'burger' // 버거
  | 'snack' // 분식
  | 'cafe' // 카페/디저트
  | 'asian' // 아시안
  | 'lunchbox' // 도시락
  | 'nightfood' // 야식
  | 'etc'; // 기타

// 카테고리 한글 매핑
export const FOOD_CATEGORY_LABELS: Record<FoodStoreCategory, string> = {
  korean: '한식',
  chinese: '중식',
  japanese: '일식',
  western: '양식',
  chicken: '치킨',
  pizza: '피자',
  burger: '버거',
  snack: '분식',
  cafe: '카페/디저트',
  asian: '아시안',
  lunchbox: '도시락',
  nightfood: '야식',
  etc: '기타',
};

// 카테고리 아이콘 (이모지)
export const FOOD_CATEGORY_ICONS: Record<FoodStoreCategory, string> = {
  korean: '🍚',
  chinese: '🥟',
  japanese: '🍣',
  western: '🍝',
  chicken: '🍗',
  pizza: '🍕',
  burger: '🍔',
  snack: '🍜',
  cafe: '☕',
  asian: '🍛',
  lunchbox: '🍱',
  nightfood: '🌙',
  etc: '🍴',
};

// 주문 상태
export type FoodOrderStatus =
  | 'pending' // 주문 대기
  | 'accepted' // 접수 완료
  | 'preparing' // 조리 중
  | 'ready' // 조리 완료
  | 'picked_up' // 픽업 완료
  | 'delivering' // 배달 중
  | 'delivered' // 배달 완료
  | 'cancelled'; // 취소

// 주문 상태 한글 매핑
export const FOOD_ORDER_STATUS_LABELS: Record<FoodOrderStatus, string> = {
  pending: '주문 대기',
  accepted: '접수 완료',
  preparing: '조리 중',
  ready: '조리 완료',
  picked_up: '픽업 완료',
  delivering: '배달 중',
  delivered: '배달 완료',
  cancelled: '주문 취소',
};

// 주문 상태 색상
export const FOOD_ORDER_STATUS_COLORS: Record<FoodOrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-green-100 text-green-800',
  picked_up: 'bg-purple-100 text-purple-800',
  delivering: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

// 주문 상태 객체 (라벨 + 색상)
export const FOOD_ORDER_STATUS: Record<FoodOrderStatus, { label: string; color: string }> = {
  pending: { label: '주문 대기', color: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: '접수 완료', color: 'bg-blue-100 text-blue-800' },
  preparing: { label: '조리 중', color: 'bg-orange-100 text-orange-800' },
  ready: { label: '조리 완료', color: 'bg-green-100 text-green-800' },
  picked_up: { label: '픽업 완료', color: 'bg-purple-100 text-purple-800' },
  delivering: { label: '배달 중', color: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: '배달 완료', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: '주문 취소', color: 'bg-red-100 text-red-800' },
};

// 영업시간 타입
export interface BusinessHours {
  mon?: { open: string; close: string } | null;
  tue?: { open: string; close: string } | null;
  wed?: { open: string; close: string } | null;
  thu?: { open: string; close: string } | null;
  fri?: { open: string; close: string } | null;
  sat?: { open: string; close: string } | null;
  sun?: { open: string; close: string } | null;
}

// 음식점 타입
export interface FoodStore {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  category: FoodStoreCategory;
  address: string;
  detail_address: string | null; // 상세주소
  latitude: number | null;
  longitude: number | null;
  phone: string;
  business_hours?: BusinessHours;
  closed_days?: string[] | null;
  min_order_amount: number;
  delivery_fee: number;
  delivery_radius?: number;
  estimated_prep_time: number;
  thumbnail_url?: string | null; // 썸네일
  logo_url?: string | null;
  banner_url?: string | null;
  is_open: boolean;
  is_approved: boolean; // 승인 여부
  is_verified?: boolean;
  is_active?: boolean;
  rating: number;
  review_count: number;
  order_count: number;
  business_number?: string | null;
  business_name?: string | null;
  business_document_url?: string | null;
  is_premium?: boolean;
  premium_until?: string | null;
  created_at: string;
  updated_at: string;
  // 조인 데이터
  distance?: number; // 거리 (미터)
  is_favorite?: boolean; // 찜 여부
}

// 메뉴 카테고리 타입
export interface FoodMenuCategory {
  id: string;
  store_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

// 메뉴 타입
export interface FoodMenu {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  is_popular: boolean;
  is_new: boolean;
  is_sold_out: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // 조인 데이터
  option_groups?: FoodMenuOptionGroup[];
}

// 메뉴 옵션 그룹 타입
export interface FoodMenuOptionGroup {
  id: string;
  menu_id: string;
  name: string;
  is_required: boolean;
  min_select: number;
  max_select: number;
  sort_order: number;
  created_at: string;
  // 조인 데이터
  items?: FoodMenuOptionItem[];
}

// 메뉴 옵션 항목 타입
export interface FoodMenuOptionItem {
  id: string;
  option_group_id: string;
  name: string;
  price: number;
  is_sold_out: boolean;
  sort_order: number;
  created_at: string;
}

// 선택된 옵션 아이템 타입
export interface SelectedOption {
  name: string;
  price: number;
}

// 장바구니 아이템 타입
export interface CartItem {
  menu: FoodMenu;
  quantity: number;
  selectedOptions?: SelectedOption[];
}

// 장바구니 타입
export interface FoodCart {
  id: string;
  user_id: string;
  store_id: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
  // 조인 데이터
  store?: FoodStore;
}

// 주문 아이템 타입 (주문 저장용)
export interface OrderItem {
  menu_id: string;
  menu_name: string;
  price: number;
  quantity: number;
  options: {
    name: string;
    price: number;
  }[];
  total_price: number;
}

// 주문 타입
export interface FoodOrder {
  id: string;
  order_number: string;
  store_id: string;
  customer_id: string;
  rider_id?: string | null;
  errand_id?: string | null;
  status: FoodOrderStatus;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  platform_fee: number;
  total_amount: number;
  delivery_address: string;
  delivery_detail_address?: string | null;
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  delivery_phone: string;
  request_to_store?: string | null;
  request_to_rider?: string | null;
  payment_method: string;
  payment_status: string;
  payment_id?: string | null;
  estimated_prep_time?: number | null;
  estimated_delivery_time?: string | null; // ISO 문자열
  accepted_at?: string | null;
  preparing_at?: string | null;
  ready_at?: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  created_at: string;
  updated_at: string;
  // 조인 데이터
  store?: FoodStore;
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
  rider?: {
    id: string;
    name: string;
    phone: string;
  };
}

// 리뷰 타입
export interface FoodReview {
  id: string;
  order_id: string;
  store_id: string;
  customer_id: string;
  rating: number;
  content: string | null;
  image_urls: string[] | null;
  reply: string | null;
  reply_at: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  // 조인 데이터
  customer?: {
    id: string;
    nickname: string;
    profile_image: string | null;
  };
  order?: {
    items: OrderItem[];
  };
}

// 찜하기 타입
export interface FoodStoreFavorite {
  id: string;
  user_id: string;
  store_id: string;
  created_at: string;
}

// 정렬 옵션
export type FoodStoreSortOption =
  | 'distance' // 거리순
  | 'rating' // 별점순
  | 'review' // 리뷰많은순
  | 'order' // 주문많은순
  | 'delivery'; // 배달빠른순

// 정렬 옵션 라벨
export const FOOD_STORE_SORT_LABELS: Record<FoodStoreSortOption, string> = {
  distance: '거리순',
  rating: '별점높은순',
  review: '리뷰많은순',
  order: '주문많은순',
  delivery: '배달빠른순',
};

// 플랫폼 수수료 상수
export const PLATFORM_FEE = {
  STORE: 300, // 음식점 건당 300원
  RIDER: 100, // 라이더 건당 100원
} as const;
