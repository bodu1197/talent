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

// 가격 상수
export const PRICING_CONSTANTS = {
  BASE_PRICE: 3000, // 기본 요금
  PRICE_PER_KM: 1200, // km당 요금
  WEATHER_RAIN_MULTIPLIER: 1.2, // 비 20% 할증
  WEATHER_SNOW_MULTIPLIER: 1.4, // 눈 40% 할증
  WEATHER_EXTREME_MULTIPLIER: 1.5, // 극한날씨 50% 할증
  TIME_LATE_NIGHT_SURCHARGE: 5000, // 심야 할증 (22시~6시)
  TIME_RUSH_HOUR_SURCHARGE: 2000, // 출퇴근 할증 (7-9시, 18-20시)
  WEIGHT_MEDIUM_SURCHARGE: 2000, // 보통 무게 할증
  WEIGHT_HEAVY_SURCHARGE: 10000, // 무거운 물품 할증
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
  let timeSurcharge = 0;
  if (timeOfDay === 'LATE_NIGHT') {
    timeSurcharge = PRICING_CONSTANTS.TIME_LATE_NIGHT_SURCHARGE;
  } else if (timeOfDay === 'RUSH_HOUR') {
    timeSurcharge = PRICING_CONSTANTS.TIME_RUSH_HOUR_SURCHARGE;
  }

  // 5. 날씨 할증 (기본 + 거리에 대해 적용)
  let weatherMultiplier = 1;
  if (weather === 'RAIN') {
    weatherMultiplier = PRICING_CONSTANTS.WEATHER_RAIN_MULTIPLIER;
  } else if (weather === 'SNOW') {
    weatherMultiplier = PRICING_CONSTANTS.WEATHER_SNOW_MULTIPLIER;
  } else if (weather === 'EXTREME') {
    weatherMultiplier = PRICING_CONSTANTS.WEATHER_EXTREME_MULTIPLIER;
  }

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

// 현재 시간대 판별
export const getCurrentTimeCondition = (): TimeCondition => {
  const hour = new Date().getHours();

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
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
