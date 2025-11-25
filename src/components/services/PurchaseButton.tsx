'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface PurchaseButtonProps {
  readonly sellerId: string;
  readonly serviceId: string;
  readonly currentUserId: string;
  readonly sellerUserId: string;
  readonly serviceTitle: string;
  readonly servicePrice: number;
  readonly deliveryDays: number;
  readonly revisionCount: number;
  readonly serviceDescription?: string;
}

export default function PurchaseButton({
  sellerId,
  serviceId,
  currentUserId,
  sellerUserId,
  serviceTitle,
  servicePrice,
  deliveryDays,
  revisionCount,
  serviceDescription,
}: PurchaseButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    // 자신의 서비스인 경우
    if (currentUserId === sellerUserId) {
      toast.error('자신의 서비스는 구매할 수 없습니다');
      return;
    }

    setIsLoading(true);

    try {
      // 바로 결제 준비 API 호출 (주문 생성)
      const prepareResponse = await fetch('/api/payments/direct-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: sellerId,
          service_id: serviceId,
          title: serviceTitle,
          amount: servicePrice,
          description: serviceDescription,
          delivery_days: deliveryDays,
          revision_count: revisionCount,
        }),
      });

      if (!prepareResponse.ok) {
        const error = await prepareResponse.json();
        const errorMsg = error.details
          ? `${error.error}: ${error.details} (${error.code})`
          : error.error || '결제 준비 실패';
        throw new Error(errorMsg);
      }

      const { order_id } = await prepareResponse.json();

      // 결제 페이지로 이동
      router.push(`/payment/direct/${order_id}`);
    } catch (error) {
      logger.error('Purchase error:', error);
      toast.error(error instanceof Error ? error.message : '구매 진행 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={isLoading}
      className="w-full py-3 bg-brand-primary text-white rounded-lg font-medium hover:bg-[#1a4d8f] transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <FaSpinner className="fa-spin mr-2 inline" />
          처리 중...
        </>
      ) : (
        '구매하기'
      )}
    </button>
  );
}
