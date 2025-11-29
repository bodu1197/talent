'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PackageSelector from '@/components/service/PackageSelector';
import PurchaseButton from '@/components/services/PurchaseButton';
import { ServicePackage } from '@/types/package';

interface Props {
  serviceId: string;
  sellerId: string;
  sellerUserId: string;
  serviceTitle: string;
  serviceDescription?: string;
  // 단일 가격 모드용
  servicePrice: number;
  deliveryDays: number;
  revisionCount: number;
  // 패키지 모드용
  hasPackages: boolean;
  packages: ServicePackage[];
  // 사용자 정보
  currentUserId?: string;
  // 추가 버튼 (문의/찜/공유)
  children?: React.ReactNode;
  // 사업자 여부 (VAT 계산용)
  isBusiness?: boolean;
}

// VAT 포함 가격 계산 함수
const calculateDisplayPrice = (price: number, isBusiness: boolean): number => {
  return isBusiness ? Math.floor(price * 1.1) : price;
};

export default function ServicePackageSelector({
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
  currentUserId,
  children,
  isBusiness = false,
}: Props) {
  const router = useRouter();

  // 패키지 구매 핸들러
  const handlePackagePurchase = (pkg: ServicePackage) => {
    // 로그인 확인
    if (!currentUserId) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    // 자기 자신의 서비스 구매 불가
    if (currentUserId === sellerUserId) {
      toast.error('자신의 서비스는 구매할 수 없습니다.');
      return;
    }

    // 결제 페이지로 이동 (패키지 정보 포함)
    const params = new URLSearchParams({
      seller_id: sellerId,
      service_id: serviceId,
      package_type: pkg.package_type,
      package_id: pkg.id,
      amount: pkg.price.toString(),
      delivery_days: pkg.delivery_days.toString(),
      revision_count: pkg.revision_count.toString(),
    });

    router.push(`/payment/checkout?${params.toString()}`);
  };

  // 패키지 모드일 때
  if (hasPackages && packages.length > 0) {
    return (
      <PackageSelector
        packages={packages}
        serviceId={serviceId}
        sellerId={sellerId}
        serviceTitle={serviceTitle}
        onPurchase={handlePackagePurchase}
        disabled={currentUserId === sellerUserId}
        isBusiness={isBusiness}
      >
        {children}
      </PackageSelector>
    );
  }

  // 단일 가격 모드일 때 (기존 UI)
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="text-xl font-semibold mb-1">
          {calculateDisplayPrice(servicePrice, isBusiness).toLocaleString()}원
        </div>
        {isBusiness && (
          <div className="text-xs text-gray-500 mb-1">
            (공급가액 {servicePrice.toLocaleString()}원 + VAT 10%)
          </div>
        )}
        <div className="text-sm text-gray-600 mb-5">
          {deliveryDays}일 이내 완료 · {revisionCount === -1 ? '무제한' : `${revisionCount}회`} 수정
        </div>

        {/* 버튼 영역 - 모든 버튼 동일한 간격 */}
        <div className="flex flex-col gap-3">
          <PurchaseButton
            sellerId={sellerId}
            serviceId={serviceId}
            currentUserId={currentUserId}
            sellerUserId={sellerUserId}
            serviceTitle={serviceTitle}
            servicePrice={servicePrice}
            deliveryDays={deliveryDays}
            revisionCount={revisionCount}
            serviceDescription={serviceDescription}
          />
          {children}
        </div>
      </div>
    </div>
  );
}
