'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  ChevronLeft,
  Package,
  ShoppingCart,
  Navigation,
  Bike,
  Cloud,
  CloudRain,
  CloudSnow,
  AlertTriangle,
  Clock,
  Weight,
  MapPin,
  Search,
} from 'lucide-react';
import type { ErrandCategory, CreateErrandRequest } from '@/types/errand';
import {
  calculateErrandPrice,
  calculateDistance,
  getCurrentTimeCondition,
  WeatherCondition,
  TimeCondition,
  WeightClass,
  WEATHER_LABELS,
  TIME_LABELS,
  WEIGHT_LABELS,
  PriceBreakdown,
} from '@/lib/errand-pricing';

// Daum Postcode 결과 타입
interface DaumPostcodeResult {
  address: string;
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
  sido: string;
  sigungu: string;
}

// 심부름 카테고리
const CATEGORIES: { value: ErrandCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'DELIVERY', label: '배달', icon: <Package className="w-5 h-5" /> },
  { value: 'SHOPPING', label: '구매대행', icon: <ShoppingCart className="w-5 h-5" /> },
];

// 무게 옵션
const WEIGHT_OPTIONS: { value: WeightClass; label: string }[] = [
  { value: 'LIGHT', label: WEIGHT_LABELS.LIGHT },
  { value: 'MEDIUM', label: WEIGHT_LABELS.MEDIUM },
  { value: 'HEAVY', label: WEIGHT_LABELS.HEAVY },
];

// 날씨 아이콘 컴포넌트
const WeatherIcon = ({ weather }: { weather: WeatherCondition }) => {
  switch (weather) {
    case 'RAIN':
      return <CloudRain className="w-5 h-5 text-blue-500" />;
    case 'SNOW':
      return <CloudSnow className="w-5 h-5 text-cyan-500" />;
    case 'EXTREME':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    default:
      return <Cloud className="w-5 h-5 text-gray-400" />;
  }
};

export default function NewErrandPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // 위치 데이터
  const [pickup, setPickup] = useState<{
    address: string;
    lat?: number;
    lng?: number;
  }>({ address: '' });
  const [delivery, setDelivery] = useState<{
    address: string;
    lat?: number;
    lng?: number;
  }>({ address: '' });

  // 폼 데이터
  const [formData, setFormData] = useState<Partial<CreateErrandRequest> & { tip: number }>({
    title: '',
    description: '',
    category: 'DELIVERY',
    tip: 0,
  });

  // 가격 계산 요소
  const [weight, setWeight] = useState<WeightClass>('LIGHT');
  const [weather, setWeather] = useState<WeatherCondition>('CLEAR');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [timeCondition, setTimeCondition] = useState<TimeCondition>('DAY');
  const [distance, setDistance] = useState<number>(0);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0); // 예상 소요 시간 (분)
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);

  // Daum Postcode 스크립트 로드
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as Window & { daum?: unknown }).daum) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // 시간대 체크
  useEffect(() => {
    setTimeCondition(getCurrentTimeCondition());
  }, []);

  // 날씨 조회
  const fetchWeather = useCallback(async (lat: number, lng: number) => {
    setWeatherLoading(true);
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      if (response.ok) {
        const data = await response.json();
        setWeather(data.weather as WeatherCondition);
      }
    } catch (err) {
      logger.error('날씨 조회 실패:', err);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // 도로 거리 계산 (카카오 모빌리티 API)
  const fetchRoadDistance = useCallback(async () => {
    if (!pickup.lat || !pickup.lng || !delivery.lat || !delivery.lng) {
      setDistance(0);
      setEstimatedDuration(0);
      return;
    }

    setDistanceLoading(true);
    try {
      const response = await fetch('/api/address/directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originLat: pickup.lat,
          originLng: pickup.lng,
          destLat: delivery.lat,
          destLng: delivery.lng,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDistance(data.distanceKm);
        setEstimatedDuration(data.durationMin);
      } else {
        // API 오류 시 직선 거리 × 1.4 보정계수 적용
        const straightDist = calculateDistance(pickup.lat, pickup.lng, delivery.lat, delivery.lng);
        setDistance(Math.round(straightDist * 1.4 * 10) / 10);
        setEstimatedDuration(Math.round(((straightDist * 1.4) / 30) * 60));
      }
    } catch (err) {
      logger.error('도로 거리 계산 실패:', err);
      // 오류 시 직선 거리 × 1.4 보정계수 적용
      const straightDist = calculateDistance(pickup.lat, pickup.lng, delivery.lat, delivery.lng);
      setDistance(Math.round(straightDist * 1.4 * 10) / 10);
      setEstimatedDuration(Math.round(((straightDist * 1.4) / 30) * 60));
    } finally {
      setDistanceLoading(false);
    }
  }, [pickup.lat, pickup.lng, delivery.lat, delivery.lng]);

  // 거리 계산 및 날씨 조회
  useEffect(() => {
    if (pickup.lat && pickup.lng && delivery.lat && delivery.lng) {
      fetchRoadDistance();
      // 출발지 기준 날씨 조회
      fetchWeather(pickup.lat, pickup.lng);
    } else {
      setDistance(0);
      setEstimatedDuration(0);
    }
  }, [pickup.lat, pickup.lng, delivery.lat, delivery.lng, fetchRoadDistance, fetchWeather]);

  // 가격 계산
  useEffect(() => {
    const breakdown = calculateErrandPrice({
      distance,
      weather,
      timeOfDay: timeCondition,
      weight,
    });
    setPriceBreakdown(breakdown);
  }, [distance, weather, timeCondition, weight]);

  // 좌표 조회
  const getCoordinates = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch('/api/address/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.latitude && data.longitude) {
          return { lat: data.latitude, lng: data.longitude };
        }
      }
    } catch (err) {
      logger.error('좌표 조회 실패:', err);
    }
    return null;
  };

  // 주소 검색 (출발지)
  const handlePickupSearch = () => {
    if (!isScriptLoaded || !window.daum) return;

    new (window.daum as typeof window.daum).Postcode({
      oncomplete: async (data: DaumPostcodeResult) => {
        const address = data.roadAddress || data.jibunAddress || data.address;
        const coords = await getCoordinates(address);
        setPickup({
          address,
          lat: coords?.lat,
          lng: coords?.lng,
        });
      },
    }).open();
  };

  // 주소 검색 (도착지)
  const handleDeliverySearch = () => {
    if (!isScriptLoaded || !window.daum) return;

    new (window.daum as typeof window.daum).Postcode({
      oncomplete: async (data: DaumPostcodeResult) => {
        const address = data.roadAddress || data.jibunAddress || data.address;
        const coords = await getCoordinates(address);
        setDelivery({
          address,
          lat: coords?.lat,
          lng: coords?.lng,
        });
      },
    }).open();
  };

  // 현재 위치 가져오기
  const handleCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('위치 서비스를 지원하지 않습니다');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        // 사용자 위치 기반 심부름 서비스에서 위치 권한은 필수 기능
        // eslint-disable-next-line sonarjs/no-intrusive-permissions
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;

      // 역지오코딩으로 주소 가져오기
      const response = await fetch('/api/address/reverse-geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: latitude, lng: longitude }),
      });

      if (response.ok) {
        const { address } = await response.json();
        setPickup({
          address,
          lat: latitude,
          lng: longitude,
        });
        toast.success('현재 위치를 가져왔습니다');
      }
    } catch {
      toast.error('위치를 가져올 수 없습니다');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (category: ErrandCategory) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error('카테고리를 선택해주세요');
      return;
    }
    if (!pickup.address.trim()) {
      toast.error('출발지를 입력해주세요');
      return;
    }
    if (!delivery.address.trim()) {
      toast.error('도착지를 입력해주세요');
      return;
    }
    if (!formData.title?.trim()) {
      toast.error('요청 내용을 입력해주세요');
      return;
    }

    try {
      setLoading(true);

      const submitData: CreateErrandRequest = {
        ...formData,
        title: formData.title || '',
        category: formData.category || 'DELIVERY',
        pickup_address: pickup.address,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        delivery_address: delivery.address,
        delivery_lat: delivery.lat,
        delivery_lng: delivery.lng,
        estimated_price: priceBreakdown?.totalPrice,
        distance_km: distance,
        weather_condition: weather,
        time_condition: timeCondition,
        weight_class: weight,
      };

      const response = await fetch('/api/errands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '심부름 요청에 실패했습니다');
      }

      const { errand } = await response.json();
      toast.success('심부름이 등록되었습니다!');
      router.push(`/errands/${errand.id}`);
    } catch (err) {
      logger.error('심부름 등록 실패:', err);
      toast.error(err instanceof Error ? err.message : '심부름 등록에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="로딩 중..." />
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login?redirect=/errands/new');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-1200 h-14 flex items-center">
          <Link href="/errands" className="mr-4">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">심부름 요청</h1>
        </div>
      </header>

      <main className="container-1200 py-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 카테고리 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                어떤 심부름이 필요하세요?
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCategorySelect(cat.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      formData.category === cat.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {cat.icon}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 출발지 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                출발지
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePickupSearch}
                  disabled={!isScriptLoaded}
                  className={`flex-1 flex items-center gap-2 px-4 py-3 border rounded-lg text-left transition-all ${
                    pickup.address
                      ? 'bg-blue-50 border-blue-200 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
                  }`}
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-sm truncate">{pickup.address || '주소 검색'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCurrentLocation}
                  className="px-3 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  title="현재 위치"
                >
                  <Navigation className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 도착지 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                도착지
              </label>
              <button
                type="button"
                onClick={handleDeliverySearch}
                disabled={!isScriptLoaded}
                className={`w-full flex items-center gap-2 px-4 py-3 border rounded-lg text-left transition-all ${
                  delivery.address
                    ? 'bg-red-50 border-red-200 text-gray-900'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-red-300'
                }`}
              >
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-sm truncate">{delivery.address || '주소 검색'}</span>
              </button>
            </div>

            {/* 거리 표시 */}
            {(distance > 0 || distanceLoading) && (
              <div className="flex items-center gap-4 px-4 py-2.5 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {distanceLoading ? (
                    <span className="text-sm text-gray-500">거리 계산 중...</span>
                  ) : (
                    <span className="text-sm text-gray-600">
                      도로 거리: <strong className="text-blue-600">{distance.toFixed(1)}km</strong>
                    </span>
                  )}
                </div>
                {!distanceLoading && estimatedDuration > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      예상: <strong className="text-blue-600">{estimatedDuration}분</strong>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 무게 선택 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Weight className="w-4 h-4" />
                물품 무게
              </label>
              <div className="flex flex-wrap gap-2">
                {WEIGHT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setWeight(opt.value)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      weight === opt.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 요청 내용 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                요청 내용 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                placeholder="예: 편의점에서 물건 가져다주세요"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-3"
              />
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                placeholder="상세 설명 (선택)"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              />
            </div>

            {/* 스마트 요금 계산기 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                  ₩
                </span>
                스마트 요금 계산
              </h3>

              {/* 현재 조건 */}
              <div className="flex flex-wrap gap-3 mb-4">
                {/* 날씨 */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full text-sm">
                  {weatherLoading ? (
                    <span className="text-gray-400">날씨 확인 중...</span>
                  ) : (
                    <>
                      <WeatherIcon weather={weather} />
                      <span>{WEATHER_LABELS[weather]}</span>
                      {weather !== 'CLEAR' && (
                        <span className="text-orange-600 text-xs font-medium">할증</span>
                      )}
                    </>
                  )}
                </div>

                {/* 시간대 */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{TIME_LABELS[timeCondition]}</span>
                  {timeCondition !== 'DAY' && (
                    <span className="text-orange-600 text-xs font-medium">할증</span>
                  )}
                </div>
              </div>

              {/* 요금 breakdown */}
              {priceBreakdown && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>기본 요금</span>
                    <span>{priceBreakdown.basePrice.toLocaleString()}원</span>
                  </div>
                  {priceBreakdown.distancePrice > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>거리 요금 ({distance.toFixed(1)}km)</span>
                      <span>+{priceBreakdown.distancePrice.toLocaleString()}원</span>
                    </div>
                  )}
                  {priceBreakdown.weightSurcharge > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>무게 할증</span>
                      <span>+{priceBreakdown.weightSurcharge.toLocaleString()}원</span>
                    </div>
                  )}
                  {priceBreakdown.weatherSurcharge > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>날씨 할증 ({WEATHER_LABELS[weather]})</span>
                      <span>+{priceBreakdown.weatherSurcharge.toLocaleString()}원</span>
                    </div>
                  )}
                  {priceBreakdown.timeSurcharge > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>시간대 할증 ({TIME_LABELS[timeCondition]})</span>
                      <span>+{priceBreakdown.timeSurcharge.toLocaleString()}원</span>
                    </div>
                  )}
                  <div className="border-t border-blue-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">예상 총액</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {priceBreakdown.totalPrice.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
            >
              {loading ? (
                '요청 중...'
              ) : (
                <>
                  <Bike className="w-5 h-5" />
                  {priceBreakdown
                    ? `${priceBreakdown.totalPrice.toLocaleString()}원 심부름 요청`
                    : '심부름 요청하기'}
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
