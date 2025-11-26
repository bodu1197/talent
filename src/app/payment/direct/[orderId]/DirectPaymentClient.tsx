'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaArrowLeft,
  FaCreditCard,
  FaUniversity,
  FaCheck,
  FaSpinner,
  FaInfoCircle,
} from 'react-icons/fa';
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

interface Buyer {
  user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface Props {
  order: Order;
  seller: Seller | null;
  buyer: Buyer | null;
}

export default function DirectPaymentClient({ order, seller, buyer }: Props) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');

  const handlePayment = async () => {
    if (!agreedToTerms) {
      toast.error('구매 조건을 확인하고 동의해주세요');
      return;
    }

    if (isProcessing) return;

    // 클라이언트 사이드 금액 검증
    if (order.amount < 1000 || order.amount > 100000000) {
      toast.error('유효하지 않은 결제 금액입니다');
      return;
    }

    setIsProcessing(true);

    try {
      // 무통장 입금 선택 시
      if (paymentMethod === 'bank') {
        router.push(`/payment/bank-transfer/${order.id}`);
        return;
      }

      // 카드 결제 (PortOne 건너뛰고 바로 결제 완료 처리)
      // 테스트용: 실제 결제 없이 바로 paid 상태로 변경
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

      // 성공
      toast.success('결제가 완료되었습니다! (테스트 모드)');
      router.push(`/mypage/buyer/orders/${order.id}`);
      return;

      // 실제 PortOne 결제 (나중에 사용)
      /*
      if (!process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY) {
        toast.error('결제 채널이 설정되지 않았습니다.')
        setIsProcessing(false)
        return
      }

        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        paymentId: order.merchant_uid,
        orderName: order.title,
        totalAmount: order.amount,
        currency: 'CURRENCY_KRW',
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY,
        payMethod: 'CARD',
        customer: {
          fullName: buyer?.name || '구매자',
          phoneNumber: buyer?.phone || undefined,
          email: buyer?.email || undefined
        },
        redirectUrl: `${window.location.origin}/payment/complete`,
        noticeUrls: [`${window.location.origin}/api/payments/webhook`],
        customData: {
          order_id: order.id,
          purchase_type: 'direct'
        }
      })

      if (response?.code != null) {
        toast.error(`결제 실패: ${response.message}`)
        setIsProcessing(false)
        return
      }

      const verifyResponse = await fetch('/api/payments/verify-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: response?.paymentId,
          order_id: order.id
        })
      })

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json()
        throw new Error(error.error || '결제 검증 실패')
      }

      toast.error('결제가 완료되었습니다!')
      router.push(`/mypage/buyer/orders/${order.id}`)
      */
    } catch (error) {
      logger.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : '결제 중 오류가 발생했습니다');
      setIsProcessing(false);
    }
  };

  const sellerName = seller?.display_name || seller?.business_name || '판매자';

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            <span>뒤로가기</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">결제하기</h1>
        </div>

        {/* 주문 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">주문 정보</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-gray-600">상품명</span>
              <span className="font-medium text-gray-900 text-right">{order.title}</span>
            </div>

            {order.description && (
              <div className="flex justify-between items-start">
                <span className="text-gray-600">설명</span>
                <span className="text-sm text-gray-700 text-right max-w-xs">
                  {order.description}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600">판매자</span>
              <span className="font-medium text-gray-900">{sellerName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">작업 기간</span>
              <span className="text-gray-900">{order.delivery_days}일</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">수정 횟수</span>
              <span className="text-gray-900">
                {order.revision_count === 999 ? '무제한' : `${order.revision_count}회`}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">총 결제금액</span>
                <span className="text-2xl font-bold text-brand-primary">
                  {order.amount.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 결제 수단 선택 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">결제 수단 선택</h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'card'
                  ? 'border-brand-primary bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <FaCreditCard className="text-2xl text-brand-primary" />
                <span className="font-medium">카드 결제</span>
                <span className="text-xs text-gray-500">PortOne 결제창</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('bank')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'bank'
                  ? 'border-brand-primary bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <FaUniversity className="text-2xl text-brand-primary" />
                <span className="font-medium">무통장 입금</span>
                <span className="text-xs text-gray-500">계좌 이체</span>
              </div>
            </button>
          </div>
        </div>

        {/* 구매자 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">구매자 정보</h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">이름</span>
              <span className="text-gray-900">{buyer?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">이메일</span>
              <span className="text-gray-900">{buyer?.email || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">연락처</span>
              <span className="text-gray-900">{buyer?.phone || '-'}</span>
            </div>
          </div>
        </div>

        {/* 구매 조건 동의 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">구매 조건 확인 및 동의</h2>

          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <FaCheck className="text-green-600 mt-1" />
              <span>작업 완료 후 {order.delivery_days}일 이내에 납품됩니다</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <FaCheck className="text-green-600 mt-1" />
              <span>
                최대 {order.revision_count === 999 ? '무제한' : `${order.revision_count}회`}
                까지 수정 요청이 가능합니다
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <FaCheck className="text-green-600 mt-1" />
              <span>결제 후 환불은 판매자와 협의가 필요합니다</span>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
            />
            <span className="text-sm text-gray-900">
              위 구매 조건을 확인하였으며, 이에 동의합니다
            </span>
          </label>
        </div>

        {/* 결제 버튼 */}
        <button
          onClick={handlePayment}
          disabled={!agreedToTerms || isProcessing}
          className="w-full py-4 bg-brand-primary text-white rounded-lg font-bold text-lg hover:bg-[#1a4d8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <FaSpinner className="fa-spin mr-2 inline" />
              결제 처리 중...
            </>
          ) : (
            <>{order.amount.toLocaleString()}원 결제하기</>
          )}
        </button>

        {/* 안내 메시지 */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-900">
            <FaInfoCircle className="mr-2 inline" />
            결제 후 작업이 시작되며, 판매자와의 소통은 채팅을 통해 진행됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
