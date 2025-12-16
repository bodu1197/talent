'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import { Megaphone, CheckCircle, X, Crown, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { logger } from '@/lib/logger';

// 광고 상품 정의
const AD_PRODUCTS = [
  {
    id: 1,
    months: 1,
    price: 150000, // 공급가액
    discountRate: 0,
    label: '1개월',
    description: '부담없이 시작하기',
    popular: false,
  },
  {
    id: 2,
    months: 3,
    price: 127500, // 150,000 * 0.85
    discountRate: 15,
    label: '3개월',
    description: '가장 인기있는 선택',
    popular: true,
  },
  {
    id: 3,
    months: 6,
    price: 120000, // 150,000 * 0.80
    discountRate: 20,
    label: '6개월',
    description: '최대 할인 혜택',
    popular: false,
  },
];

interface Service {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  hasActiveAd: boolean;
}

export default function AdvertisingPurchasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<(typeof AD_PRODUCTS)[0] | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [purchasing, setPurchasing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  async function loadServices() {
    try {
      const response = await fetch('/api/seller/advertising/dashboard');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      logger.error('서비스 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  function openPurchaseModal(product: (typeof AD_PRODUCTS)[0]) {
    // 광고 가능한 서비스가 없으면 안내
    const availableServices = services.filter((s) => !s.hasActiveAd);
    if (availableServices.length === 0) {
      if (services.length === 0) {
        toast.error('먼저 서비스를 등록해주세요');
      } else {
        toast.error('모든 서비스가 이미 광고 중입니다');
      }
      return;
    }

    setSelectedProduct(product);
    setSelectedService(availableServices[0].id); // 기본 선택
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setSelectedService('');
  }

  async function handlePurchase() {
    if (!selectedProduct || !selectedService) {
      toast.error('서비스를 선택해주세요');
      return;
    }

    try {
      setPurchasing(true);

      // prepare API 호출하여 결제 준비
      const response = await fetch('/api/payments/advertising/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: selectedService,
          months: selectedProduct.months,
          monthly_price: selectedProduct.price,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '결제 준비 실패');
      }

      const data = await response.json();

      // 결제 페이지로 이동
      router.push(`/payment/advertising/${data.order_id}`);
    } catch (error: unknown) {
      logger.error('광고 결제 준비 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '광고 신청에 실패했습니다';
      toast.error(errorMessage);
      setPurchasing(false);
    }
  }

  if (loading) {
    return (
      <MypageLayoutWrapper mode="seller">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </MypageLayoutWrapper>
    );
  }

  const availableServices = services.filter((s) => !s.hasActiveAd);

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        {/* 헤더 */}
        <div className="text-center mb-6 lg:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Megaphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">광고 신청</h1>
          <p className="text-gray-600 text-sm lg:text-base">
            카테고리 1페이지에 서비스를 노출하세요
          </p>
        </div>

        {/* 광고 혜택 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 lg:p-6 mb-6 lg:mb-8">
          <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-3">광고 혜택</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>카테고리 1페이지 노출</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>무제한 노출 &amp; 클릭</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>공정한 랜덤 노출</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>실시간 통계 제공</span>
            </div>
          </div>
        </div>

        {/* 광고 상품 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
          {AD_PRODUCTS.map((product) => {
            const totalPrice = product.price * product.months;
            const totalWithVat = Math.round(totalPrice * 1.1);
            const originalPrice = 150000 * product.months;

            return (
              <button
                key={product.id}
                type="button"
                className={`relative bg-white rounded-xl border-2 p-5 lg:p-6 transition-all hover:shadow-lg cursor-pointer text-left w-full ${
                  product.popular
                    ? 'border-brand-primary shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => openPurchaseModal(product)}
              >
                {/* 인기 배지 */}
                {product.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary text-white text-xs font-semibold rounded-full">
                      <Crown className="w-3 h-3" />
                      인기
                    </span>
                  </div>
                )}

                {/* 할인 배지 */}
                {product.discountRate > 0 && (
                  <div className="absolute -top-2 -right-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      <Sparkles className="w-3 h-3" />
                      {product.discountRate}% 할인
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">
                    {product.label}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-500 mb-4">{product.description}</p>

                  {/* 가격 */}
                  <div className="mb-4">
                    <div className="text-2xl lg:text-3xl font-bold text-brand-primary">
                      {product.price.toLocaleString()}원
                    </div>
                    <div className="text-xs text-gray-500">/ 월 (VAT 별도)</div>
                  </div>

                  {/* 총 결제금액 */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-xs text-gray-500 mb-1">총 결제금액 (VAT 포함)</div>
                    <div className="text-lg font-bold text-gray-900">
                      {totalWithVat.toLocaleString()}원
                    </div>
                    {product.discountRate > 0 && (
                      <div className="text-xs text-red-500 line-through">
                        {Math.round(originalPrice * 1.1).toLocaleString()}원
                      </div>
                    )}
                  </div>

                  {/* 구매 버튼 */}
                  <div
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      product.popular
                        ? 'bg-brand-primary text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    신청하기
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 안내 문구 */}
        <div className="text-center text-xs lg:text-sm text-gray-500">
          <p>신용카드, 계좌이체, 간편결제 등 다양한 결제수단 지원</p>
        </div>
      </div>

      {/* 서비스 선택 모달 */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black bg-opacity-50 cursor-default"
            onClick={closeModal}
            aria-label="모달 닫기"
          />
          <dialog
            open
            className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            aria-labelledby="service-select-title"
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-xl">
              <h2
                id="service-select-title"
                className="text-base lg:text-lg font-semibold text-gray-900"
              >
                광고할 서비스 선택
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-4">
              {/* 선택한 상품 정보 */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedProduct.label} 광고
                    </div>
                    <div className="text-xs text-gray-500">
                      월 {selectedProduct.price.toLocaleString()}원 (VAT 별도)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-brand-primary">
                      {Math.round(
                        selectedProduct.price * selectedProduct.months * 1.1
                      ).toLocaleString()}
                      원
                    </div>
                    <div className="text-xs text-gray-500">VAT 포함</div>
                  </div>
                </div>
              </div>

              {/* 서비스 목록 */}
              <div className="space-y-2 mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  광고할 서비스를 선택하세요
                </div>
                {availableServices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Megaphone className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>광고 가능한 서비스가 없습니다</p>
                  </div>
                ) : (
                  availableServices.map((service) => (
                    <label
                      key={service.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedService === service.id
                          ? 'border-brand-primary bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="service"
                        value={service.id}
                        checked={selectedService === service.id}
                        onChange={() => setSelectedService(service.id)}
                        className="w-4 h-4 text-brand-primary"
                      />
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <Image
                          src={service.thumbnailUrl || '/placeholder-service.png'}
                          alt={service.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {service.title}
                      </span>
                    </label>
                  ))
                )}
              </div>

              {/* 구매 버튼 */}
              <button
                onClick={handlePurchase}
                disabled={purchasing || !selectedService}
                className="w-full bg-brand-primary text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-base"
              >
                {purchasing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    결제 준비 중...
                  </span>
                ) : (
                  '결제하기'
                )}
              </button>
            </div>
          </dialog>
        </div>
      )}
    </MypageLayoutWrapper>
  );
}
