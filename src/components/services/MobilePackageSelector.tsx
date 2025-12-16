'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';
import {
  PackageType,
  ServicePackage,
  PACKAGE_TYPE_LABELS,
  PACKAGE_TYPE_ORDER,
} from '@/types/package';

interface Props {
  serviceId: string;
  sellerId: string;
  sellerUserId: string;
  serviceTitle: string;
  serviceDescription?: string;
  servicePrice: number;
  deliveryDays: number;
  revisionCount: number;
  hasPackages: boolean;
  packages: ServicePackage[];
  initialIsFavorite?: boolean;
  isBusiness?: boolean; // 사업자 여부 (VAT 계산용)
}

// VAT 포함 가격 계산 함수
const calculateDisplayPrice = (price: number, isBusiness: boolean): number => {
  return isBusiness ? Math.floor(price * 1.1) : price;
};

export default function MobilePackageSelector({
  serviceId,
  sellerId,
  sellerUserId,
  serviceTitle,
  serviceDescription,
  servicePrice,
  deliveryDays,
  revisionCount,
  hasPackages,
  packages,
  initialIsFavorite = false,
  isBusiness = false,
}: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // 활성화된 패키지만 필터링하고 정렬
  const activePackages = PACKAGE_TYPE_ORDER.map((type) =>
    packages.find((pkg) => pkg.package_type === type)
  ).filter((pkg): pkg is ServicePackage => pkg?.is_active === true);

  const [selectedType, setSelectedType] = useState<PackageType>(
    activePackages[0]?.package_type || 'standard'
  );

  const selectedPackage = activePackages.find((pkg) => pkg.package_type === selectedType);

  const handleFavorite = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();

      if (isFavorite) {
        await supabase
          .from('service_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('service_id', serviceId);
        setIsFavorite(false);
      } else {
        await supabase
          .from('service_favorites')
          .insert({ user_id: user.id, service_id: serviceId });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('찜 처리 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.id === sellerUserId) {
      alert('본인의 서비스입니다.');
      return;
    }

    router.push(`/chat?seller=${sellerId}&service=${serviceId}`);
  };

  // 구매 버튼 텍스트 렌더링
  const renderPurchaseButtonContent = () => {
    if (isPurchasing) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          처리 중...
        </>
      );
    }
    if (hasPackages && selectedPackage) {
      return <span>{PACKAGE_TYPE_LABELS[selectedPackage.package_type]} 구매</span>;
    }
    return <span>구매하기</span>;
  };

  const handlePurchase = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/services/${serviceId}`);
      return;
    }

    if (user.id === sellerUserId) {
      toast.error('본인의 서비스는 구매할 수 없습니다.');
      return;
    }

    setIsPurchasing(true);

    try {
      // 패키지 모드일 때
      const amount = hasPackages && selectedPackage ? selectedPackage.price : servicePrice;
      const days = hasPackages && selectedPackage ? selectedPackage.delivery_days : deliveryDays;
      const revisions =
        hasPackages && selectedPackage ? selectedPackage.revision_count : revisionCount;

      // 바로 결제 준비 API 호출 (주문 생성)
      const prepareResponse = await fetch('/api/payments/direct-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: sellerId,
          service_id: serviceId,
          title: serviceTitle,
          amount,
          description: serviceDescription,
          delivery_days: days,
          revision_count: revisions,
        }),
      });

      if (!prepareResponse.ok) {
        const error = await prepareResponse.json();
        throw new Error(error.error || '결제 준비 실패');
      }

      const { order_id } = await prepareResponse.json();

      // 결제 페이지로 이동
      router.push(`/payment/direct/${order_id}`);
    } catch (error) {
      logger.error('Purchase error:', error);
      toast.error(error instanceof Error ? error.message : '구매 진행 중 오류가 발생했습니다');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <>
      {/* 패키지 선택 탭 (패키지가 있는 경우만) */}
      {hasPackages && activePackages.length > 0 && (
        <div className="lg:hidden bg-white border-b border-gray-100">
          <div className="flex">
            {activePackages.map((pkg) => (
              <button
                key={pkg.package_type}
                type="button"
                onClick={() => setSelectedType(pkg.package_type)}
                className={`flex-1 py-3 text-center transition-colors ${
                  selectedType === pkg.package_type
                    ? 'bg-brand-primary text-white font-semibold'
                    : 'bg-gray-50 text-gray-600'
                }`}
              >
                <div className="text-xs">{PACKAGE_TYPE_LABELS[pkg.package_type]}</div>
              </button>
            ))}
          </div>
          {/* 선택된 패키지 정보 */}
          {selectedPackage && (
            <div className="px-4 py-4 bg-gray-50 border-t border-gray-100">
              {/* 가격 */}
              <div className="text-xl font-bold text-brand-primary mb-1">
                {calculateDisplayPrice(selectedPackage.price, isBusiness).toLocaleString()}원
              </div>
              {isBusiness && (
                <div className="text-xs text-gray-500 mb-2">
                  (공급가액 {selectedPackage.price.toLocaleString()}원 + VAT 10%)
                </div>
              )}

              {/* 패키지명 */}
              {selectedPackage.name && (
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{selectedPackage.name}</h3>
              )}

              {/* 작업기간, 수정횟수 */}
              <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                <span>작업기간: {selectedPackage.delivery_days}일</span>
                <span>·</span>
                <span>
                  수정:{' '}
                  {selectedPackage.revision_count === -1
                    ? '무제한'
                    : `${selectedPackage.revision_count}회`}
                </span>
              </div>

              {/* 패키지 설명 */}
              {selectedPackage.description && (
                <p className="text-xs text-gray-600 mb-3">{selectedPackage.description}</p>
              )}

              {/* 포함 기능 */}
              {selectedPackage.features && selectedPackage.features.length > 0 && (
                <div className="space-y-1.5">
                  {selectedPackage.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-700">
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 단일 가격 표시 (패키지가 없는 경우) */}
      {!hasPackages && (
        <div className="lg:hidden bg-white px-4 py-3 border-b border-gray-100">
          <div className="text-lg font-semibold text-brand-primary">
            {calculateDisplayPrice(servicePrice, isBusiness).toLocaleString()}원
          </div>
          {isBusiness && (
            <div className="text-xs text-gray-500">
              (공급가액 {servicePrice.toLocaleString()}원 + VAT 10%)
            </div>
          )}
        </div>
      )}

      {/* 하단 고정 버튼 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center">
          {/* 찜 버튼 */}
          <button
            type="button"
            onClick={handleFavorite}
            disabled={isLoading}
            className="flex flex-col items-center justify-center w-14 h-12 border-r border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label={isFavorite ? '찜 해제' : '찜하기'}
          >
            {isFavorite ? (
              <Heart className="w-6 h-6 text-red-500 fill-current" />
            ) : (
              <Heart className="w-6 h-6 text-gray-500" />
            )}
          </button>

          {/* 문의하기 버튼 */}
          <button
            type="button"
            onClick={handleContact}
            className="flex items-center justify-center gap-2 flex-1 h-12 border-r border-gray-200 text-brand-primary font-semibold hover:bg-brand-primary/5 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            문의하기
          </button>

          {/* 구매하기 버튼 */}
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isPurchasing}
            className="flex items-center justify-center flex-1 h-12 bg-brand-primary text-white font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {renderPurchaseButtonContent()}
          </button>
        </div>
      </div>
    </>
  );
}
