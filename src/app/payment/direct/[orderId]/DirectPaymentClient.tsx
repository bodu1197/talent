'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, RefreshCw, Check, Loader2, ShieldCheck } from 'lucide-react';
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

  const handlePayment = async () => {
    if (!agreedToTerms) {
      toast.error('구매 조건에 동의해주세요');
      return;
    }

    if (isProcessing) return;

    if (order.amount < 1000 || order.amount > 100000000) {
      toast.error('유효하지 않은 결제 금액입니다');
      return;
    }

    setIsProcessing(true);

    try {
      const verifyResponse = await fetch('/api/payments/mock-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.id,
        }),
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
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-gray-900">주문 확인</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 pb-32">
        {/* 상품 정보 */}
        <div className="bg-white rounded-xl p-4 mb-3">
          <h2 className="font-semibold text-gray-900 mb-3">{order.title}</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{order.delivery_days}일</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4" />
              <span>
                {order.revision_count === 999 ? '무제한 수정' : `${order.revision_count}회 수정`}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t flex justify-between items-center">
            <span className="text-sm text-gray-500">판매자</span>
            <span className="font-medium text-gray-900">{sellerName}</span>
          </div>
        </div>

        {/* 결제 금액 */}
        <div className="bg-white rounded-xl p-4 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">결제 금액</span>
            <span className="text-xl font-bold text-gray-900">
              {order.amount.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 구매 조건 */}
        <div className="bg-white rounded-xl p-4 mb-3">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-900">구매 조건</span>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 mb-4">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>작업 완료 후 {order.delivery_days}일 이내 납품</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                {order.revision_count === 999 ? '무제한' : `최대 ${order.revision_count}회`} 수정
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>안전결제로 보호</span>
            </li>
          </ul>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
            />
            <span className="text-sm text-gray-700">구매 조건에 동의합니다</span>
          </label>
        </div>
      </div>

      {/* 하단 결제 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-bottom">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handlePayment}
            disabled={!agreedToTerms || isProcessing}
            className="w-full h-14 bg-brand-primary text-white rounded-xl font-bold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                처리 중...
              </>
            ) : (
              <>{order.amount.toLocaleString()}원 결제하기</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
