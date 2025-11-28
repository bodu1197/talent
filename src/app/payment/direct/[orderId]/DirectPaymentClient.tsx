'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  service_id: string | null;
  amount: number;
  title: string;
  description: string | null;
  delivery_days: number;
  revision_count: number;
  status: string;
  merchant_uid: string;
  created_at: string;
}

interface Seller {
  id: string;
  business_name: string | null;
  display_name: string | null;
  profile_image: string | null;
  user_id: string;
}

interface Props {
  readonly order: Order;
  readonly seller: Seller | null;
}

export default function DirectPaymentClient({ order, seller }: Props) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleClose = () => {
    router.back();
  };

  const handlePayment = async () => {
    if (!agreedToTerms) {
      toast.error('구매 조건에 동의해주세요');
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);

    try {
      const verifyResponse = await fetch('/api/payments/mock-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order.id }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.error || '결제 처리 실패');
      }

      toast.success('결제가 완료되었습니다!');
      router.push(`/mypage/buyer/orders/${order.id}`);
    } catch (error) {
      logger.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : '결제 중 오류가 발생했습니다');
      setIsProcessing(false);
    }
  };

  const sellerName = seller?.display_name || seller?.business_name || '판매자';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* 모달 */}
      <div className="relative bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">결제 확인</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-5">
          {/* 상품 정보 */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">상품</p>
            <p className="font-medium text-gray-900">{order.title}</p>
          </div>

          <div className="flex gap-6 mb-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">판매자</p>
              <p className="font-medium">{sellerName}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">작업기간</p>
              <p className="font-medium">{order.delivery_days}일</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">수정</p>
              <p className="font-medium">
                {order.revision_count === 999 ? '무제한' : `${order.revision_count}회`}
              </p>
            </div>
          </div>

          {/* 결제 금액 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">결제 금액</span>
              <span className="text-2xl font-bold text-brand-primary">
                {order.amount.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 동의 체크박스 */}
          <label className="flex items-center gap-3 cursor-pointer mb-5">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
            />
            <span className="text-sm text-gray-700">구매 조건 및 환불 정책에 동의합니다</span>
          </label>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 h-12 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handlePayment}
              disabled={!agreedToTerms || isProcessing}
              className="flex-1 h-12 bg-brand-primary text-white rounded-xl font-bold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  처리 중
                </>
              ) : (
                '결제하기'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
