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
  Plus,
  Trash2,
  User,
  Phone,
} from 'lucide-react';
import type { ErrandCategory, CreateErrandRequest, ErrandStop, ShoppingItem, ShoppingRange } from '@/types/errand';
import {
  calculateErrandPrice,
  calculateDistance,
  getCurrentTimeCondition,
  calculateMultiStopPrice,
  calculateShoppingPrice,
  WeatherCondition,
  TimeCondition,
  WeightClass,
  WEATHER_LABELS,
  TIME_LABELS,
  WEIGHT_LABELS,
  SHOPPING_RANGE_LABELS,
  PriceBreakdown,
  MultiStopPriceBreakdown,
  ShoppingPriceBreakdown,
  PRICING_CONSTANTS,
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

// 구매대행 범위 옵션
const SHOPPING_RANGE_OPTIONS: { value: ShoppingRange; label: string; price: number }[] = [
  { value: 'LOCAL', label: '🏠 동네 (1km 이내)', price: 0 },
  { value: 'DISTRICT', label: '🏪 우리동네 (3km 이내)', price: 3000 },
  { value: 'CITY', label: '🏙️ 넓은 범위 (10km 이내)', price: 8000 },
  { value: 'SPECIFIC', label: '📍 특정 장소 지정', price: 0 },
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
    detail: string; // 상세주소 (동/호수, 층, 건물명 등)
    lat?: number;
    lng?: number;
  }>({ address: '', detail: '' });
  const [delivery, setDelivery] = useState<{
    address: string;
    detail: string; // 상세주소 (동/호수, 층, 건물명 등)
    lat?: number;
    lng?: number;
  }>({ address: '', detail: '' });

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

  // 다중 배달 상태
  const [isMultiStop, setIsMultiStop] = useState(false);
  const [stops, setStops] = useState<ErrandStop[]>([]);
  const [multiStopPrice, setMultiStopPrice] = useState<MultiStopPriceBreakdown | null>(null);

  // 구매대행 상태
  const [shoppingRange, setShoppingRange] = useState<ShoppingRange>('LOCAL');
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([{ name: '', quantity: 1 }]);
  const [shoppingLocation, setShoppingLocation] = useState<{
    address: string;
    detail?: string;
    lat?: number;
    lng?: number;
  }>({ address: '', detail: '' });
  const [hasHeavyItem, setHasHeavyItem] = useState(false);
  const [shoppingPrice, setShoppingPrice] = useState<ShoppingPriceBreakdown | null>(null);

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

  // 가격 계산 (카테고리별 분기)
  useEffect(() => {
    if (formData.category === 'DELIVERY') {
      // 배달 카테고리
      if (isMultiStop && stops.length > 0) {
        // 다중 배달
        const breakdown = calculateMultiStopPrice({
          distance,
          weather,
          timeOfDay: timeCondition,
          weight,
          totalStops: stops.length + 1, // 첫 번째 도착지 + 추가 정차지
        });
        setMultiStopPrice(breakdown);
        setPriceBreakdown(breakdown);
        setShoppingPrice(null);
      } else {
        // 단일 배달
        const breakdown = calculateErrandPrice({
          distance,
          weather,
          timeOfDay: timeCondition,
          weight,
        });
        setPriceBreakdown(breakdown);
        setMultiStopPrice(null);
        setShoppingPrice(null);
      }
    } else if (formData.category === 'SHOPPING') {
      // 구매대행 카테고리
      let shoppingDistance = 0;
      if (shoppingRange === 'SPECIFIC' && shoppingLocation.lat && shoppingLocation.lng && delivery.lat && delivery.lng) {
        shoppingDistance = calculateDistance(
          shoppingLocation.lat,
          shoppingLocation.lng,
          delivery.lat,
          delivery.lng
        );
      }

      const validItems = shoppingItems.filter((item) => item.name.trim() !== '');
      const breakdown = calculateShoppingPrice({
        range: shoppingRange,
        itemCount: validItems.length,
        distance: shoppingDistance,
        weather,
        timeOfDay: timeCondition,
        hasHeavyItem,
      });
      setShoppingPrice(breakdown);
      setPriceBreakdown(null);
      setMultiStopPrice(null);
    }
  }, [
    formData.category,
    distance,
    weather,
    timeCondition,
    weight,
    isMultiStop,
    stops.length,
    shoppingRange,
    shoppingItems,
    shoppingLocation,
    delivery.lat,
    delivery.lng,
    hasHeavyItem,
  ]);

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
        setPickup((prev) => ({
          ...prev,
          address,
          lat: coords?.lat,
          lng: coords?.lng,
        }));
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
        setDelivery((prev) => ({
          ...prev,
          address,
          lat: coords?.lat,
          lng: coords?.lng,
        }));
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
        setPickup((prev) => ({
          ...prev,
          address,
          lat: latitude,
          lng: longitude,
        }));
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
    // 카테고리 변경 시 관련 상태 초기화
    if (category === 'DELIVERY') {
      setShoppingRange('LOCAL');
      setShoppingItems([{ name: '', quantity: 1 }]);
      setHasHeavyItem(false);
    } else {
      setIsMultiStop(false);
      setStops([]);
    }
  };

  // 다중 배달 정차지 추가
  const addStop = () => {
    setStops((prev) => [
      ...prev,
      {
        stop_order: prev.length + 2, // 첫 번째 도착지 다음부터
        address: '',
        address_detail: '',
        recipient_name: '',
        recipient_phone: '',
      },
    ]);
  };

  // 다중 배달 정차지 삭제
  const removeStop = (index: number) => {
    setStops((prev) =>
      prev.filter((_, i) => i !== index).map((stop, i) => ({ ...stop, stop_order: i + 2 }))
    );
  };

  // 다중 배달 정차지 업데이트
  const updateStop = (index: number, field: keyof ErrandStop, value: string) => {
    setStops((prev) => prev.map((stop, i) => (i === index ? { ...stop, [field]: value } : stop)));
  };

  // 정차지 주소 검색
  const handleStopAddressSearch = (index: number) => {
    if (!isScriptLoaded || !window.daum) return;

    new (window.daum as typeof window.daum).Postcode({
      oncomplete: async (data: DaumPostcodeResult) => {
        const address = data.roadAddress || data.jibunAddress || data.address;
        const coords = await getCoordinates(address);
        setStops((prev) =>
          prev.map((stop, i) =>
            i === index ? { ...stop, address, lat: coords?.lat, lng: coords?.lng } : stop
          )
        );
      },
    }).open();
  };

  // 구매대행 품목 추가
  const addShoppingItem = () => {
    setShoppingItems((prev) => [...prev, { name: '', quantity: 1 }]);
  };

  // 구매대행 품목 삭제
  const removeShoppingItem = (index: number) => {
    if (shoppingItems.length <= 1) return;
    setShoppingItems((prev) => prev.filter((_, i) => i !== index));
  };

  // 구매대행 품목 업데이트
  const updateShoppingItem = (index: number, field: keyof ShoppingItem, value: string | number) => {
    setShoppingItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // 구매대행 특정 장소 주소 검색
  const handleShoppingLocationSearch = () => {
    if (!isScriptLoaded || !window.daum) return;

    new (window.daum as typeof window.daum).Postcode({
      oncomplete: async (data: DaumPostcodeResult) => {
        const address = data.roadAddress || data.jibunAddress || data.address;
        const coords = await getCoordinates(address);
        setShoppingLocation({
          address,
          lat: coords?.lat,
          lng: coords?.lng,
        });
      },
    }).open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error('카테고리를 선택해주세요');
      return;
    }
    // 배달 카테고리일 때만 출발지 검증
    if (formData.category === 'DELIVERY' && !pickup.address.trim()) {
      toast.error('출발지를 입력해주세요');
      return;
    }
    if (!delivery.address.trim()) {
      const errorMsg = formData.category === 'SHOPPING' ? '배달 받을 주소를 입력해주세요' : '도착지를 입력해주세요';
      toast.error(errorMsg);
      return;
    }
    if (!formData.title?.trim()) {
      toast.error('요청 내용을 입력해주세요');
      return;
    }

    // 구매대행 카테고리 검증
    if (formData.category === 'SHOPPING') {
      const validItems = shoppingItems.filter((item) => item.name.trim() !== '');
      if (validItems.length === 0) {
        toast.error('최소 1개 이상의 품목을 입력해주세요');
        return;
      }
      if (shoppingRange === 'SPECIFIC' && !shoppingLocation.address) {
        toast.error('구매 장소를 지정해주세요');
        return;
      }
    }

    // 다중 배달 검증
    if (formData.category === 'DELIVERY' && isMultiStop) {
      const validStops = stops.filter((stop) => stop.address.trim() !== '');
      if (validStops.length === 0) {
        toast.error('최소 1개 이상의 추가 정차지를 입력해주세요');
        return;
      }
    }

    try {
      setLoading(true);

      // 배달 카테고리 데이터
      const deliveryData: CreateErrandRequest = {
        ...formData,
        title: formData.title || '',
        category: formData.category || 'DELIVERY',
        pickup_address: pickup.address,
        pickup_detail: pickup.detail || undefined,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        delivery_address: delivery.address,
        delivery_detail: delivery.detail || undefined,
        delivery_lat: delivery.lat,
        delivery_lng: delivery.lng,
        estimated_price: priceBreakdown?.totalPrice,
        distance_km: distance,
        weather_condition: weather,
        time_condition: timeCondition,
        weight_class: weight,
        // 다중 배달
        is_multi_stop: isMultiStop,
        stops: isMultiStop ? stops.filter((stop) => stop.address.trim() !== '') : undefined,
      };

      // 구매대행 카테고리 데이터
      // SPECIFIC: 지정된 구매처 주소 사용
      // 그 외: 구매처는 범위 내 헬퍼가 결정 (배달지 주소를 출발지로 사용)
      const shoppingPickupAddress = shoppingRange === 'SPECIFIC' ? shoppingLocation.address : delivery.address;
      const shoppingPickupLat = shoppingRange === 'SPECIFIC' ? shoppingLocation.lat : delivery.lat;
      const shoppingPickupLng = shoppingRange === 'SPECIFIC' ? shoppingLocation.lng : delivery.lng;

      const shoppingData: CreateErrandRequest = {
        ...formData,
        title: formData.title || '',
        category: 'SHOPPING',
        pickup_address: shoppingPickupAddress,
        pickup_detail: shoppingRange === 'SPECIFIC' ? shoppingLocation.detail : undefined,
        pickup_lat: shoppingPickupLat,
        pickup_lng: shoppingPickupLng,
        delivery_address: delivery.address,
        delivery_detail: delivery.detail || undefined,
        delivery_lat: delivery.lat,
        delivery_lng: delivery.lng,
        estimated_price: shoppingPrice?.totalPrice,
        weather_condition: weather,
        time_condition: timeCondition,
        // 구매대행 전용
        shopping_range: shoppingRange,
        shopping_items: shoppingItems.filter((item) => item.name.trim() !== ''),
      };

      const submitData: CreateErrandRequest =
        formData.category === 'SHOPPING' ? shoppingData : deliveryData;

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

            {/* 출발지 (배달 카테고리만) */}
            {formData.category === 'DELIVERY' && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  출발지
                </label>
                <div className="flex gap-2 mb-2">
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
                {pickup.address && (
                  <input
                    type="text"
                    value={pickup.detail}
                    onChange={(e) => setPickup((prev) => ({ ...prev, detail: e.target.value }))}
                    placeholder="상세주소 (동/호수, 층, 건물명 등)"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            )}

            {/* 도착지 / 배달 받을 주소 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <div className={`w-2 h-2 rounded-full ${formData.category === 'SHOPPING' ? 'bg-green-500' : 'bg-red-500'}`} />
                {formData.category === 'SHOPPING' ? '배달 받을 주소' : '도착지'}
              </label>
              <button
                type="button"
                onClick={handleDeliverySearch}
                disabled={!isScriptLoaded}
                className={`w-full flex items-center gap-2 px-4 py-3 border rounded-lg text-left transition-all mb-2 ${
                  delivery.address
                    ? 'bg-red-50 border-red-200 text-gray-900'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-red-300'
                }`}
              >
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-sm truncate">{delivery.address || '주소 검색'}</span>
              </button>
              {delivery.address && (
                <input
                  type="text"
                  value={delivery.detail}
                  onChange={(e) => setDelivery((prev) => ({ ...prev, detail: e.target.value }))}
                  placeholder="상세주소 (동/호수, 층, 건물명 등)"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              )}
            </div>

            {/* 다중 배달 옵션 (배달 카테고리만) */}
            {formData.category === 'DELIVERY' && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Package className="w-4 h-4" />
                    다중 배달
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMultiStop(!isMultiStop);
                      if (!isMultiStop) {
                        // 다중 배달 활성화 시 첫 번째 추가 정차지 생성
                        setStops([
                          {
                            stop_order: 2,
                            address: '',
                            address_detail: '',
                            recipient_name: '',
                            recipient_phone: '',
                          },
                        ]);
                      } else {
                        setStops([]);
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isMultiStop ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isMultiStop ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  여러 곳에 배달해야 할 때 사용하세요 (정차당 +{PRICING_CONSTANTS.STOP_FEE.toLocaleString()}원)
                </p>

                {/* 추가 정차지 목록 */}
                {isMultiStop && (
                  <div className="space-y-4">
                    {stops.map((stop, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">
                            추가 정차지 #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeStop(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {/* 주소 */}
                        <button
                          type="button"
                          onClick={() => handleStopAddressSearch(index)}
                          disabled={!isScriptLoaded}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 border rounded-lg text-left text-sm mb-2 ${
                            stop.address
                              ? 'bg-white border-gray-300 text-gray-900'
                              : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
                          }`}
                        >
                          <Search className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{stop.address || '주소 검색'}</span>
                        </button>
                        {/* 상세주소 */}
                        {stop.address && (
                          <input
                            type="text"
                            value={stop.address_detail || ''}
                            onChange={(e) => updateStop(index, 'address_detail', e.target.value)}
                            placeholder="상세주소"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2"
                          />
                        )}
                        {/* 수령인 정보 */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={stop.recipient_name || ''}
                              onChange={(e) => updateStop(index, 'recipient_name', e.target.value)}
                              placeholder="수령인"
                              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                          </div>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={stop.recipient_phone || ''}
                              onChange={(e) => updateStop(index, 'recipient_phone', e.target.value)}
                              placeholder="연락처"
                              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* 정차지 추가 버튼 */}
                    <button
                      type="button"
                      onClick={addStop}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      정차지 추가
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 구매대행 범위 선택 (구매대행 카테고리만) */}
            {formData.category === 'SHOPPING' && (
              <>
                {/* 범위 선택 */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <MapPin className="w-4 h-4" />
                    구매 범위
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    라이더가 물건을 구매할 범위를 선택해주세요
                  </p>
                  <div className="space-y-2">
                    {SHOPPING_RANGE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setShoppingRange(opt.value)}
                        className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-sm transition-all ${
                          shoppingRange === opt.value
                            ? 'bg-green-50 border-green-400 text-gray-900'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-green-300'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {opt.price > 0 && (
                          <span className="text-green-600 font-medium">+{opt.price.toLocaleString()}원</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 특정 장소 지정 시 주소 입력 */}
                {shoppingRange === 'SPECIFIC' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      구매 장소
                    </label>
                    <button
                      type="button"
                      onClick={handleShoppingLocationSearch}
                      disabled={!isScriptLoaded}
                      className={`w-full flex items-center gap-2 px-4 py-3 border rounded-lg text-left transition-all mb-2 ${
                        shoppingLocation.address
                          ? 'bg-green-50 border-green-200 text-gray-900'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-green-300'
                      }`}
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-sm truncate">
                        {shoppingLocation.address || '구매할 장소 검색'}
                      </span>
                    </button>
                    {shoppingLocation.address && (
                      <input
                        type="text"
                        value={shoppingLocation.detail || ''}
                        onChange={(e) => setShoppingLocation((prev) => ({ ...prev, detail: e.target.value }))}
                        placeholder="상세주소 (층, 매장명 등)"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    )}
                  </div>
                )}

                {/* 구매 품목 리스트 */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <ShoppingCart className="w-4 h-4" />
                    구매 품목
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    {PRICING_CONSTANTS.SHOPPING_FREE_ITEMS}개까지 무료, 이후 품목당 +{PRICING_CONSTANTS.SHOPPING_ITEM_PRICE.toLocaleString()}원
                  </p>
                  <div className="space-y-2">
                    {shoppingItems.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateShoppingItem(index, 'name', e.target.value)}
                          placeholder={`품목 ${index + 1} (예: 우유 1개)`}
                          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateShoppingItem(index, 'quantity', parseInt(e.target.value) || 1)
                          }
                          min={1}
                          className="w-16 px-2 py-2.5 border border-gray-200 rounded-lg text-sm text-center"
                        />
                        {shoppingItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeShoppingItem(index)}
                            className="text-red-500 hover:text-red-700 px-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addShoppingItem}
                    className="w-full flex items-center justify-center gap-2 py-2.5 mt-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    품목 추가
                  </button>
                </div>

                {/* 무거운 물품 여부 */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Weight className="w-4 h-4" />
                        무거운 물품 포함
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        쌀, 음료 박스 등 (+{PRICING_CONSTANTS.WEIGHT_HEAVY_SURCHARGE.toLocaleString()}원)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasHeavyItem(!hasHeavyItem)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        hasHeavyItem ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          hasHeavyItem ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* 거리 표시 (배달 카테고리만) */}
            {formData.category === 'DELIVERY' && (distance > 0 || distanceLoading) && (
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

            {/* 무게 선택 (배달 카테고리만) */}
            {formData.category === 'DELIVERY' && (
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
            )}

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

              {/* 요금 breakdown - 배달 */}
              {formData.category === 'DELIVERY' && priceBreakdown && (
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
                  {/* 다중 배달 정차 요금 */}
                  {multiStopPrice && multiStopPrice.stopFee > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>정차 요금 ({stops.length}곳)</span>
                      <span>+{multiStopPrice.stopFee.toLocaleString()}원</span>
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

              {/* 요금 breakdown - 구매대행 */}
              {formData.category === 'SHOPPING' && shoppingPrice && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>구매대행 기본료</span>
                    <span>{shoppingPrice.basePrice.toLocaleString()}원</span>
                  </div>
                  {shoppingPrice.rangeFee > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>범위 요금 ({SHOPPING_RANGE_LABELS[shoppingRange].split(' ')[0]})</span>
                      <span>+{shoppingPrice.rangeFee.toLocaleString()}원</span>
                    </div>
                  )}
                  {shoppingPrice.distancePrice > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>거리 요금</span>
                      <span>+{shoppingPrice.distancePrice.toLocaleString()}원</span>
                    </div>
                  )}
                  {shoppingPrice.itemFee > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>품목 추가 요금</span>
                      <span>+{shoppingPrice.itemFee.toLocaleString()}원</span>
                    </div>
                  )}
                  {shoppingPrice.weightSurcharge > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>무거운 물품 할증</span>
                      <span>+{shoppingPrice.weightSurcharge.toLocaleString()}원</span>
                    </div>
                  )}
                  {shoppingPrice.weatherSurcharge > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>날씨 할증 ({WEATHER_LABELS[weather]})</span>
                      <span>+{shoppingPrice.weatherSurcharge.toLocaleString()}원</span>
                    </div>
                  )}
                  {shoppingPrice.timeSurcharge > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>시간대 할증 ({TIME_LABELS[timeCondition]})</span>
                      <span>+{shoppingPrice.timeSurcharge.toLocaleString()}원</span>
                    </div>
                  )}
                  <div className="border-t border-green-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">예상 총액</span>
                      <span className="text-2xl font-bold text-green-600">
                        {shoppingPrice.totalPrice.toLocaleString()}원
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
              className={`w-full py-4 text-white rounded-xl transition-colors font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                formData.category === 'SHOPPING'
                  ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30'
              }`}
            >
              {loading ? (
                '요청 중...'
              ) : (
                <>
                  {formData.category === 'SHOPPING' ? (
                    <ShoppingCart className="w-5 h-5" />
                  ) : (
                    <Bike className="w-5 h-5" />
                  )}
                  {formData.category === 'SHOPPING' && (
                    shoppingPrice
                      ? `${shoppingPrice.totalPrice.toLocaleString()}원 구매대행 요청`
                      : '구매대행 요청하기'
                  )}
                  {formData.category === 'DELIVERY' && (
                    priceBreakdown
                      ? `${priceBreakdown.totalPrice.toLocaleString()}원 배달 요청`
                      : '배달 요청하기'
                  )}
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
