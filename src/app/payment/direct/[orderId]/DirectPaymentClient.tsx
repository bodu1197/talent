'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Check, Loader2, ShieldCheck } from 'lucide-react';
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
  readonly order: Order;
  readonly seller: Seller | null;
  readonly buyer: Buyer | null;
}

export default function DirectPaymentClient({ order, seller, buyer }: Props) {
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
    if (order.amount < 1000 || order.amount > 100000000) {
      toast.error('유효하지 않은 결제 금액입니다');
      return;
    }

    setIsProcessing(true);

    try {
      // 카드 결제 (테스트용: 실제 결제 없이 바로 paid 상태로 변경)
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-xl">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">뒤로가기</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">결제하기</h1>
        </div>

        {/* 주문 정보 카드 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand-primary" />
            주문 정보
          </h2>

          <div className="space-y-4">
            {/* 상품명 */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">상품명</p>
              <p className="text-lg font-semibold text-gray-900">{order.title}</p>
            </div>

            {/* 상세 정보 그리드 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">판매자</p>
                <p className="font-semibold text-gray-900 text-sm">{sellerName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">작업기간</p>
                <p className="font-semibold text-gray-900 text-sm">{order.delivery_days}일</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">수정횟수</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {order.revision_count === 999 ? '무제한' : `${order.revision_count}회`}
                </p>
              </div>
            </div>

            {/* 총 결제금액 */}
            <div className="bg-gradient-to-r from-brand-primary to-blue-600 rounded-xl p-5 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-white/90 font-medium">총 결제금액</span>
                <span className="text-3xl font-bold text-white">
                  {order.amount.toLocaleString()}
                  <span className="text-lg ml-1">원</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 구매자 정보 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">구매자 정보</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">이름</span>
              <span className="font-medium text-gray-900">{buyer?.name || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">이메일</span>
              <span className="font-medium text-gray-900">{buyer?.email || '-'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">연락처</span>
              <span className="font-medium text-gray-900">{buyer?.phone || '-'}</span>
            </div>
          </div>
        </div>

        {/* 구매 조건 동의 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            구매 조건
          </h2>

          <div className="space-y-3 mb-5">
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                작업 완료 후 <strong>{order.delivery_days}일</strong> 이내 납품
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                최대{' '}
                <strong>
                  {order.revision_count === 999 ? '무제한' : `${order.revision_count}회`}
                </strong>{' '}
                수정 가능
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>환불은 판매자와 협의 필요</span>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
            />
            <span className="text-sm font-medium text-gray-900">
              위 구매 조건을 확인하였으며, 동의합니다
            </span>
          </label>
        </div>

        {/* 결제 버튼 */}
        <button
          onClick={handlePayment}
          disabled={!agreedToTerms || isProcessing}
          className="w-full py-5 bg-gradient-to-r from-brand-primary to-blue-600 text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              결제 처리 중...
            </span>
          ) : (
            <span>{order.amount.toLocaleString()}원 결제하기</span>
          )}
        </button>

        {/* 안전 결제 안내 */}
        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 안전한 결제 시스템으로 보호됩니다
        </p>
      </div>
    </div>
  );
}
