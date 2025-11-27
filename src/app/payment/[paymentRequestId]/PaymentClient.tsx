'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as PortOne from '@portone/browser-sdk/v2';
import { ArrowLeft, Check, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface PaymentRequest {
  id: string;
  room_id: string;
  seller_id: string;
  buyer_id: string;
  service_id: string | null;
  amount: number;
  title: string;
  description: string | null;
  delivery_days: number;
  revision_count: number;
  status: string;
  expires_at: string;
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
  readonly paymentRequest: PaymentRequest;
  readonly seller: Seller | null;
  readonly buyer: Buyer | null;
}

export default function PaymentClient({ paymentRequest, seller, buyer }: Props) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handlePayment = async () => {
    if (!agreedToTerms) {
      toast.error('구매 조건을 확인하고 동의해주세요');
      return;
    }

    if (isProcessing) return;

    // 클라이언트 사이드 금액 검증
    if (paymentRequest.amount < 1000 || paymentRequest.amount > 100000000) {
      toast.error('유효하지 않은 결제 금액입니다');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. 결제 준비 (주문 ID 생성)
      const prepareResponse = await fetch('/api/payments/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_request_id: paymentRequest.id,
          amount: paymentRequest.amount,
          title: paymentRequest.title,
        }),
      });

      if (!prepareResponse.ok) {
        const error = await prepareResponse.json();
        throw new Error(error.error || '결제 준비 실패');
      }

      const { order_id, merchant_uid } = await prepareResponse.json();

      // 2. PortOne 결제창 호출
      const response = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        paymentId: merchant_uid,
        orderName: paymentRequest.title,
        totalAmount: paymentRequest.amount,
        currency: 'CURRENCY_KRW',
        channelKey: 'channel-key-test', // 테스트 채널 키
        payMethod: 'CARD',
        customer: {
          fullName: buyer?.name || '구매자',
          phoneNumber: buyer?.phone || undefined,
          email: buyer?.email || undefined,
        },
        redirectUrl: `${globalThis.location.origin}/payment/complete`,
        noticeUrls: [`${globalThis.location.origin}/api/payments/webhook`],
        customData: {
          order_id,
          payment_request_id: paymentRequest.id,
          room_id: paymentRequest.room_id,
        },
      });

      // 3. 결제 결과 처리
      if (response?.code != null) {
        // 결제 실패
        toast.error(`결제 실패: ${response.message}`);
        setIsProcessing(false);
        return;
      }

      // 4. 결제 검증
      const verifyResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: response?.paymentId,
          order_id,
          payment_request_id: paymentRequest.id,
        }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.error || '결제 검증 실패');
      }

      const { order } = await verifyResponse.json();

      // 5. 성공 페이지로 이동
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
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
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
              <span className="font-medium text-gray-900 text-right">{paymentRequest.title}</span>
            </div>

            {paymentRequest.description && (
              <div className="flex justify-between items-start">
                <span className="text-gray-600">설명</span>
                <span className="text-sm text-gray-700 text-right max-w-xs">
                  {paymentRequest.description}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600">판매자</span>
              <span className="font-medium text-gray-900">{sellerName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">작업 기간</span>
              <span className="text-gray-900">{paymentRequest.delivery_days}일</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">수정 횟수</span>
              <span className="text-gray-900">{paymentRequest.revision_count}회</span>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">총 결제금액</span>
                <span className="text-2xl font-bold text-brand-primary">
                  {paymentRequest.amount.toLocaleString()}원
                </span>
              </div>
            </div>
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
              <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
              <span>작업 완료 후 {paymentRequest.delivery_days}일 이내에 납품됩니다</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
              <span>최대 {paymentRequest.revision_count}회까지 수정 요청이 가능합니다</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
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
              <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
              결제 처리 중...
            </>
          ) : (
            <>{paymentRequest.amount.toLocaleString()}원 결제하기</>
          )}
        </button>

        {/* 안내 메시지 */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-900">
            <Info className="w-4 h-4 mr-2 inline" />
            결제 후 작업이 시작되며, 판매자와의 소통은 채팅을 통해 진행됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
