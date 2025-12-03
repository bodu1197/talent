'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Bike,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Dog,
  Sparkles,
  FileText,
  MoreHorizontal,
} from 'lucide-react';
import type { ErrandCategory, CreateErrandRequest } from '@/types/errand';
import { ERRAND_PRICING } from '@/types/errand';

const CATEGORIES: { value: ErrandCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'DELIVERY', label: '배달', icon: <Package className="w-6 h-6" /> },
  { value: 'SHOPPING', label: '구매대행', icon: <ShoppingCart className="w-6 h-6" /> },
  { value: 'MOVING', label: '이사/운반', icon: <Truck className="w-6 h-6" /> },
  { value: 'QUEUEING', label: '줄서기', icon: <Users className="w-6 h-6" /> },
  { value: 'PET_CARE', label: '반려동물', icon: <Dog className="w-6 h-6" /> },
  { value: 'CLEANING', label: '청소', icon: <Sparkles className="w-6 h-6" /> },
  { value: 'DOCUMENT', label: '서류', icon: <FileText className="w-6 h-6" /> },
  { value: 'OTHER', label: '기타', icon: <MoreHorizontal className="w-6 h-6" /> },
];

export default function NewErrandPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<Partial<CreateErrandRequest> & { tip: number }>({
    title: '',
    description: '',
    category: undefined,
    pickup_address: '',
    pickup_lat: undefined,
    pickup_lng: undefined,
    delivery_address: '',
    delivery_lat: undefined,
    delivery_lng: undefined,
    tip: 0,
    scheduled_at: undefined,
  });

  const [estimatedPrice, setEstimatedPrice] = useState({
    base: ERRAND_PRICING.BASE_PRICE,
    distance: 0,
    tip: 0,
    total: ERRAND_PRICING.BASE_PRICE,
  });

  const handleCategorySelect = (category: ErrandCategory) => {
    setFormData((prev) => ({ ...prev, category }));
    setStep(2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'tip') {
      const tipValue = parseInt(value) || 0;
      setFormData((prev) => ({ ...prev, [name]: tipValue }));
      setEstimatedPrice((prev) => ({
        ...prev,
        tip: tipValue,
        total: prev.base + prev.distance + tipValue,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddressSearch = async (type: 'pickup' | 'delivery') => {
    // 임시로 입력한 주소 사용 (실제로는 Kakao/Naver 주소 검색 API 연동 필요)
    const addressField = type === 'pickup' ? 'pickup_address' : 'delivery_address';
    const address = formData[addressField];

    if (!address) {
      toast.error('주소를 입력해주세요');
      return;
    }

    try {
      // 주소 → 좌표 변환 (Geocoding)
      const response = await fetch('/api/address/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (response.ok) {
        const { lat, lng } = await response.json();
        if (type === 'pickup') {
          setFormData((prev) => ({ ...prev, pickup_lat: lat, pickup_lng: lng }));
        } else {
          setFormData((prev) => ({ ...prev, delivery_lat: lat, delivery_lng: lng }));
        }

        // 거리 계산 및 가격 업데이트
        calculatePrice();
      }
    } catch (err) {
      logger.error('주소 검색 실패:', err);
    }
  };

  const calculatePrice = () => {
    if (
      formData.pickup_lat &&
      formData.pickup_lng &&
      formData.delivery_lat &&
      formData.delivery_lng
    ) {
      // Haversine formula
      const R = 6371;
      const dLat = ((formData.delivery_lat - formData.pickup_lat) * Math.PI) / 180;
      const dLng = ((formData.delivery_lng - formData.pickup_lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((formData.pickup_lat * Math.PI) / 180) *
          Math.cos((formData.delivery_lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      const distancePrice = Math.round(distance * ERRAND_PRICING.PRICE_PER_KM);

      setEstimatedPrice((prev) => ({
        ...prev,
        distance: distancePrice,
        total: ERRAND_PRICING.BASE_PRICE + distancePrice + prev.tip,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title?.trim()) {
      toast.error('제목을 입력해주세요');
      return;
    }
    if (!formData.pickup_address?.trim()) {
      toast.error('출발지 주소를 입력해주세요');
      return;
    }
    if (!formData.delivery_address?.trim()) {
      toast.error('도착지 주소를 입력해주세요');
      return;
    }
    if (!formData.category) {
      toast.error('카테고리를 선택해주세요');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/errands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
    router.push('/login?redirect=/errands/new');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link href="/mypage/buyer/errands" className="mr-4">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">심부름 요청</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 스텝 인디케이터 */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${
                step >= s ? 'bg-brand-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* 스텝 1: 카테고리 선택 */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
              어떤 심부름이 필요하세요?
            </h2>
            <p className="text-gray-600 text-center mb-6">카테고리를 선택해주세요</p>

            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategorySelect(cat.value)}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:border-brand-primary hover:shadow-md transition-all flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-3 text-brand-primary">
                    {cat.icon}
                  </div>
                  <span className="font-medium text-gray-900">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 스텝 2: 주소 입력 */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
              어디서 어디로 가나요?
            </h2>
            <p className="text-gray-600 text-center mb-6">출발지와 도착지를 입력해주세요</p>

            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline text-blue-500 mr-1" />
                  출발지
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="pickup_address"
                    value={formData.pickup_address || ''}
                    onChange={handleChange}
                    placeholder="출발지 주소 입력"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddressSearch('pickup')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm whitespace-nowrap"
                  >
                    검색
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline text-red-500 mr-1" />
                  도착지
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="delivery_address"
                    value={formData.delivery_address || ''}
                    onChange={handleChange}
                    placeholder="도착지 주소 입력"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddressSearch('delivery')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm whitespace-nowrap"
                  >
                    검색
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                이전
              </button>
              <button
                onClick={() => {
                  if (!formData.pickup_address || !formData.delivery_address) {
                    toast.error('출발지와 도착지를 모두 입력해주세요');
                    return;
                  }
                  setStep(3);
                }}
                className="flex-1 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium flex items-center justify-center gap-2"
              >
                다음
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 스텝 3: 상세 정보 */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
              상세 내용을 알려주세요
            </h2>
            <p className="text-gray-600 text-center mb-6">심부름에 대한 상세 정보를 입력해주세요</p>

            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  placeholder="예: 편의점에서 물건 가져다주세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상세 설명</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder="심부름에 대한 상세한 설명을 작성해주세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  희망 시간 (선택)
                </label>
                <input
                  type="datetime-local"
                  name="scheduled_at"
                  value={formData.scheduled_at || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  추가 팁 (선택)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="tip"
                    value={formData.tip || 0}
                    onChange={handleChange}
                    min="0"
                    step="500"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                  <span className="text-gray-600">원</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  팁을 추가하면 더 빠르게 심부름꾼을 찾을 수 있어요
                </p>
              </div>
            </div>

            {/* 예상 금액 */}
            <div className="bg-brand-primary/5 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">예상 금액</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">기본 요금</span>
                  <span>{estimatedPrice.base.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">거리 요금</span>
                  <span>{estimatedPrice.distance.toLocaleString()}원</span>
                </div>
                {estimatedPrice.tip > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">추가 팁</span>
                    <span>{estimatedPrice.tip.toLocaleString()}원</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-base">
                  <span>총 예상 금액</span>
                  <span className="text-brand-primary">
                    {estimatedPrice.total.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                이전
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  '등록 중...'
                ) : (
                  <>
                    <Bike className="w-4 h-4" />
                    심부름 요청하기
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
