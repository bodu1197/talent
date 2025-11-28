'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
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
  servicePrice: number;
  hasPackages: boolean;
  packages: ServicePackage[];
  initialIsFavorite?: boolean;
}

export default function MobilePackageSelector({
  serviceId,
  sellerId,
  sellerUserId,
  servicePrice,
  hasPackages,
  packages,
  initialIsFavorite = false,
}: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  // 활성화된 패키지만 필터링하고 정렬
  const activePackages = PACKAGE_TYPE_ORDER.map((type) =>
    packages.find((pkg) => pkg.package_type === type)
  ).filter((pkg): pkg is ServicePackage => pkg !== undefined && pkg.is_active);

  const [selectedType, setSelectedType] = useState<PackageType>(
    activePackages[0]?.package_type || 'standard'
  );

  const selectedPackage = activePackages.find((pkg) => pkg.package_type === selectedType);

  // 선택된 패키지의 가격 (패키지 모드가 아니면 서비스 기본 가격)
  const displayPrice = hasPackages && selectedPackage ? selectedPackage.price : servicePrice;

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
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('service_id', serviceId);
        setIsFavorite(false);
      } else {
        await supabase.from('wishlists').insert({ user_id: user.id, service_id: serviceId });
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

  const handlePurchase = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.id === sellerUserId) {
      alert('본인의 서비스는 구매할 수 없습니다.');
      return;
    }

    // 패키지 모드일 때
    if (hasPackages && selectedPackage) {
      const params = new URLSearchParams({
        seller_id: sellerId,
        service_id: serviceId,
        package_type: selectedPackage.package_type,
        package_id: selectedPackage.id,
        amount: selectedPackage.price.toString(),
        delivery_days: selectedPackage.delivery_days.toString(),
        revision_count: selectedPackage.revision_count.toString(),
      });
      router.push(`/payment/checkout?${params.toString()}`);
    } else {
      // 단일 가격 모드
      router.push(`/payment?service=${serviceId}`);
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
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-semibold text-brand-primary">
                    {selectedPackage.price.toLocaleString()}원
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {selectedPackage.delivery_days}일 ·{' '}
                    {selectedPackage.revision_count === -1
                      ? '무제한 수정'
                      : `${selectedPackage.revision_count}회 수정`}
                  </span>
                </div>
              </div>
              {selectedPackage.description && (
                <p className="text-xs text-gray-600 mt-1">{selectedPackage.description}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 단일 가격 표시 (패키지가 없는 경우) */}
      {!hasPackages && (
        <div className="lg:hidden bg-white px-4 py-3 border-b border-gray-100">
          <div className="text-lg font-semibold text-brand-primary">
            {servicePrice.toLocaleString()}원
          </div>
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
            className="flex items-center justify-center flex-1 h-12 bg-brand-primary text-white font-semibold hover:bg-brand-dark transition-colors"
          >
            {hasPackages && selectedPackage ? (
              <span>{displayPrice.toLocaleString()}원 구매</span>
            ) : (
              <span>구매하기</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
