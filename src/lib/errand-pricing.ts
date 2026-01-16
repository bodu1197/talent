// 심부름 스마트 요금 계산 로직

export type WeatherCondition = 'CLEAR' | 'RAIN' | 'SNOW' | 'EXTREME';
export type TimeCondition = 'DAY' | 'LATE_NIGHT' | 'RUSH_HOUR';
export type WeightClass = 'LIGHT' | 'MEDIUM' | 'HEAVY';

export interface PriceFactors {
  distance: number; // km
  weather: WeatherCondition;
  timeOfDay: TimeCondition;
  weight: WeightClass;
}

export interface PriceBreakdown {
  basePrice: number;
  distancePrice: number;
  weatherSurcharge: number;
  timeSurcharge: number;
  weightSurcharge: number;
  totalPrice: number;
}

// 구매대행 범위 타입
export type ShoppingRange = 'LOCAL' | 'DISTRICT' | 'CITY' | 'SPECIFIC';

// 가격 상수
export const PRICING_CONSTANTS = {
  // 배달 기본
  BASE_PRICE: 3000, // 기본 요금
  PRICE_PER_KM: 1200, // km당 요금
  // 할증
  WEATHER_RAIN_MULTIPLIER: 1.2, // 비 20% 할증
  WEATHER_SNOW_MULTIPLIER: 1.4, // 눈 40% 할증
  WEATHER_EXTREME_MULTIPLIER: 1.5, // 극한날씨 50% 할증
  TIME_LATE_NIGHT_SURCHARGE: 5000, // 심야 할증 (22시~6시)
  TIME_RUSH_HOUR_SURCHARGE: 2000, // 출퇴근 할증 (7-9시, 18-20시)
  WEIGHT_MEDIUM_SURCHARGE: 2000, // 보통 무게 할증
  WEIGHT_HEAVY_SURCHARGE: 10000, // 무거운 물품 할증
  // 다중 배달
  STOP_FEE: 1500, // 정차당 추가 요금
  // 구매대행
  SHOPPING_BASE_PRICE: 5000, // 구매대행 기본료
  SHOPPING_RANGE_LOCAL: 0, // 동네 (1km)
  SHOPPING_RANGE_DISTRICT: 3000, // 우리동네 (3km)
  SHOPPING_RANGE_CITY: 8000, // 넓은 범위 (10km)
  SHOPPING_ITEM_PRICE: 500, // 품목당 추가 (무료 품목 초과 시)
  SHOPPING_FREE_ITEMS: 2, // 무료 품목 수
};

// 날씨 할증 multiplier 계산
const getWeatherMultiplier = (weather: WeatherCondition): number => {
  switch (weather) {
    case 'RAIN':
      return PRICING_CONSTANTS.WEATHER_RAIN_MULTIPLIER;
    case 'SNOW':
      return PRICING_CONSTANTS.WEATHER_SNOW_MULTIPLIER;
    case 'EXTREME':
      return PRICING_CONSTANTS.WEATHER_EXTREME_MULTIPLIER;
    default:
      return 1;
  }
};

// 시간대 할증 계산
const getTimeSurcharge = (timeOfDay: TimeCondition): number => {
  switch (timeOfDay) {
    case 'LATE_NIGHT':
      return PRICING_CONSTANTS.TIME_LATE_NIGHT_SURCHARGE;
    case 'RUSH_HOUR':
      return PRICING_CONSTANTS.TIME_RUSH_HOUR_SURCHARGE;
    default:
      return 0;
  }
};

// 가격 계산 함수
export const calculateErrandPrice = (factors: PriceFactors): PriceBreakdown => {
  const { distance, weather, timeOfDay, weight } = factors;

  // 1. 기본 요금
  const basePrice = PRICING_CONSTANTS.BASE_PRICE;

  // 2. 거리 요금
  const distancePrice = Math.round(distance * PRICING_CONSTANTS.PRICE_PER_KM);

  // 3. 무게 할증
  let weightSurcharge = 0;
  if (weight === 'MEDIUM') {
    weightSurcharge = PRICING_CONSTANTS.WEIGHT_MEDIUM_SURCHARGE;
  } else if (weight === 'HEAVY') {
    weightSurcharge = PRICING_CONSTANTS.WEIGHT_HEAVY_SURCHARGE;
  }

  // 4. 시간대 할증
  const timeSurcharge = getTimeSurcharge(timeOfDay);

  // 5. 날씨 할증 (기본 + 거리에 대해 적용)
  const weatherMultiplier = getWeatherMultiplier(weather);
  const weatherSurcharge = Math.round((basePrice + distancePrice) * (weatherMultiplier - 1));

  // 6. 총 요금 계산
  const subtotal = basePrice + distancePrice + weightSurcharge + timeSurcharge + weatherSurcharge;

  // 100원 단위 반올림
  const totalPrice = Math.round(subtotal / 100) * 100;

  return {
    basePrice,
    distancePrice,
    weatherSurcharge,
    timeSurcharge,
    weightSurcharge,
    totalPrice,
  };
};

// 현재 시간대 판별 (한국 시간 KST 기준)
export const getCurrentTimeCondition = (): TimeCondition => {
  // 한국 시간으로 변환 (UTC+9)
  const now = new Date();
  const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const hour = koreaTime.getHours();

  // 심야: 22시~6시
  if (hour >= 22 || hour < 6) {
    return 'LATE_NIGHT';
  }

  // 출퇴근: 7-9시, 18-20시
  if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 20)) {
    return 'RUSH_HOUR';
  }

  return 'DAY';
};

// 날씨 조건 한글 라벨
export const WEATHER_LABELS: Record<WeatherCondition, string> = {
  CLEAR: '맑음',
  RAIN: '비',
  SNOW: '눈',
  EXTREME: '악천후',
};

// 시간대 한글 라벨
export const TIME_LABELS: Record<TimeCondition, string> = {
  DAY: '일반',
  LATE_NIGHT: '심야',
  RUSH_HOUR: '출퇴근',
};

// 무게 한글 라벨
export const WEIGHT_LABELS: Record<WeightClass, string> = {
  LIGHT: '가벼움 (서류/음식)',
  MEDIUM: '보통 (장바구니/박스)',
  HEAVY: '무거움 (가구/가전)',
};

// 두 좌표 간 거리 계산 (Haversine 공식)
export { calculateDistance } from './geo';

// ============================================
// 다중 배달 요금 계산
// ============================================
export interface MultiStopPriceFactors extends PriceFactors {
  totalStops: number; // 총 정차 수 (첫 번째 포함)
}

export interface MultiStopPriceBreakdown extends PriceBreakdown {
  stopFee: number; // 정차 요금
}

export const calculateMultiStopPrice = (
  factors: MultiStopPriceFactors
): MultiStopPriceBreakdown => {
  // 기본 배달 요금 계산
  const baseBreakdown = calculateErrandPrice(factors);

  // 정차 요금 (첫 번째 제외)
  const additionalStops = Math.max(0, factors.totalStops - 1);
  const stopFee = additionalStops * PRICING_CONSTANTS.STOP_FEE;

  // 총 요금
  const subtotal = baseBreakdown.totalPrice + stopFee;
  const totalPrice = Math.round(subtotal / 100) * 100;

  return {
    ...baseBreakdown,
    stopFee,
    totalPrice,
  };
};

// ============================================
// 구매대행 요금 계산
// ============================================
export interface ShoppingPriceFactors {
  range: ShoppingRange;
  itemCount: number;
  distance?: number; // SPECIFIC인 경우에만
  weather: WeatherCondition;
  timeOfDay: TimeCondition;
  hasHeavyItem: boolean;
}

export interface ShoppingPriceBreakdown {
  basePrice: number;
  rangeFee: number;
  itemFee: number;
  distancePrice: number;
  weatherSurcharge: number;
  timeSurcharge: number;
  weightSurcharge: number;
  totalPrice: number;
}

export const calculateShoppingPrice = (factors: ShoppingPriceFactors): ShoppingPriceBreakdown => {
  const { range, itemCount, distance = 0, weather, timeOfDay, hasHeavyItem } = factors;

  // 1. 기본료
  const basePrice = PRICING_CONSTANTS.SHOPPING_BASE_PRICE;

  // 2. 범위 요금
  let rangeFee = 0;
  let distancePrice = 0;

  if (range === 'LOCAL') {
    rangeFee = PRICING_CONSTANTS.SHOPPING_RANGE_LOCAL;
  } else if (range === 'DISTRICT') {
    rangeFee = PRICING_CONSTANTS.SHOPPING_RANGE_DISTRICT;
  } else if (range === 'CITY') {
    rangeFee = PRICING_CONSTANTS.SHOPPING_RANGE_CITY;
  } else if (range === 'SPECIFIC' && distance > 0) {
    // 특정 장소: 거리 기반 요금
    distancePrice = Math.round(distance * PRICING_CONSTANTS.PRICE_PER_KM);
  }

  // 3. 품목 요금 (무료 품목 초과 시)
  const chargeableItems = Math.max(0, itemCount - PRICING_CONSTANTS.SHOPPING_FREE_ITEMS);
  const itemFee = chargeableItems * PRICING_CONSTANTS.SHOPPING_ITEM_PRICE;

  // 4. 무게 할증
  const weightSurcharge = hasHeavyItem ? PRICING_CONSTANTS.WEIGHT_HEAVY_SURCHARGE : 0;

  // 5. 시간대 할증
  const timeSurcharge = getTimeSurcharge(timeOfDay);

  // 6. 날씨 할증
  const weatherMultiplier = getWeatherMultiplier(weather);
  const weatherSurcharge = Math.round(
    (basePrice + rangeFee + distancePrice) * (weatherMultiplier - 1)
  );

  // 7. 총 요금
  const subtotal =
    basePrice +
    rangeFee +
    distancePrice +
    itemFee +
    weightSurcharge +
    timeSurcharge +
    weatherSurcharge;
  const totalPrice = Math.round(subtotal / 100) * 100;

  return {
    basePrice,
    rangeFee,
    itemFee,
    distancePrice,
    weatherSurcharge,
    timeSurcharge,
    weightSurcharge,
    totalPrice,
  };
};

// 구매대행 범위 라벨
export const SHOPPING_RANGE_LABELS: Record<ShoppingRange, string> = {
  LOCAL: '🏠 동네 (1km 이내)',
  DISTRICT: '🏪 우리동네 (3km 이내)',
  CITY: '🏙️ 넓은 범위 (10km 이내)',
  SPECIFIC: '📍 특정 장소 지정',
};
