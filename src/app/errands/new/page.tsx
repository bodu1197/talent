'use client';

import { useState } from 'react';
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
  Truck,
  Users,
  FileText,
  MoreHorizontal,
  Navigation,
  Bike,
} from 'lucide-react';
import type { ErrandCategory, CreateErrandRequest } from '@/types/errand';
import { ERRAND_PRICING } from '@/types/errand';

// 심부름 카테고리 (어디 다녀오는 것만)
const CATEGORIES: { value: ErrandCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'DELIVERY', label: '배달', icon: <Package className="w-5 h-5" /> },
  { value: 'SHOPPING', label: '구매대행', icon: <ShoppingCart className="w-5 h-5" /> },
  { value: 'MOVING', label: '운반', icon: <Truck className="w-5 h-5" /> },
  { value: 'QUEUEING', label: '줄서기', icon: <Users className="w-5 h-5" /> },
  { value: 'DOCUMENT', label: '서류', icon: <FileText className="w-5 h-5" /> },
  { value: 'OTHER', label: '기타', icon: <MoreHorizontal className="w-5 h-5" /> },
];

export default function NewErrandPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<CreateErrandRequest> & { tip: number }>({
    title: '',
    description: '',
    category: 'DELIVERY',
    pickup_address: '',
    pickup_lat: undefined,
    pickup_lng: undefined,
    delivery_address: '',
    delivery_lat: undefined,
    delivery_lng: undefined,
    tip: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (category: ErrandCategory) => {
    setFormData((prev) => ({ ...prev, category }));
  };

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
        setFormData((prev) => ({
          ...prev,
          pickup_address: address,
          pickup_lat: latitude,
          pickup_lng: longitude,
        }));
        toast.success('현재 위치를 가져왔습니다');
      }
    } catch {
      toast.error('위치를 가져올 수 없습니다');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error('카테고리를 선택해주세요');
      return;
    }
    if (!formData.pickup_address?.trim()) {
      toast.error('출발지를 입력해주세요');
      return;
    }
    if (!formData.delivery_address?.trim()) {
      toast.error('도착지를 입력해주세요');
      return;
    }
    if (!formData.title?.trim()) {
      toast.error('요청 내용을 입력해주세요');
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
    router.push('/auth/login?redirect=/errands/new');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <Link href="/errands" className="mr-4">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">심부름 요청</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
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
              <input
                type="text"
                name="pickup_address"
                value={formData.pickup_address || ''}
                onChange={handleChange}
                placeholder="출발지 주소 입력"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
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
            <input
              type="text"
              name="delivery_address"
              value={formData.delivery_address || ''}
              onChange={handleChange}
              placeholder="도착지 주소 입력"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
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

          {/* 예상 금액 */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">예상 금액</span>
              <span className="text-lg font-bold text-blue-600">
                {ERRAND_PRICING.BASE_PRICE.toLocaleString()}원~
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">거리에 따라 추가 요금이 발생할 수 있습니다</p>
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
                심부름 요청하기
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
