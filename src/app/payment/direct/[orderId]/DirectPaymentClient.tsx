'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Check, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';
import { usePaymentState } from '@/hooks/usePaymentState';
import { requestPortOnePayment, validatePaymentPreconditions } from '@/lib/payment/portone';
import BuyerPhoneInput from '@/components/payment/BuyerPhoneInput';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';
import PaymentTermsSection from '@/components/payment/PaymentTermsSection';
import PaymentSummarySidebar from '@/components/payment/PaymentSummarySidebar';

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

interface Service {
  id: string;
  title: string;
  thumbnail_url: string | null;
}

interface Buyer {
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface Props {
  readonly order: Order;
  readonly seller: Seller | null;
}

export default function DirectPaymentClient({ order, seller }: Props) {
  const router = useRouter();
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [service, setService] = useState<Service | null>(null);

  // 결제 상태 관리 (공통 hook 사용)
  const {
    isProcessing,
    setIsProcessing,
    agreedToTerms,
    setAgreedToTerms,
    agreedToPrivacy,
    setAgreedToPrivacy,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    easyPayProvider,
    setEasyPayProvider,
    isInternationalCard,
    setIsInternationalCard,
    phoneInput,
    setPhoneInput,
  } = usePaymentState();

  // 총 결제 금액 (수수료 없음)
  const totalAmount = order.amount;

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // 구매자 정보
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('name, phone')
          .eq('id', user.id)
          .single();

        setBuyer({
          name: userData?.name || user.user_metadata?.name || null,
          email: user.email || null,
          phone: userData?.phone || null,
        });
      }

      // 서비스 정보
      if (order.service_id) {
        const { data: serviceData } = await supabase
          .from('services')
          .select('id, title, thumbnail_url')
          .eq('id', order.service_id)
          .single();

        if (serviceData) {
          setService(serviceData);
        }
      }
    };
    fetchData();
  }, [order.service_id]);

  const handleBack = () => {
    router.back();
  };

  const handlePayment = async () => {
    // 전화번호 확인
    const phone = buyer?.phone || phoneInput;

    // 결제 전 유효성 검사 (공통 유틸리티 사용)
    if (!validatePaymentPreconditions(agreedToTerms, agreedToPrivacy, phone)) {
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // PortOne 결제 요청 (공통 유틸리티 사용)
      const result = await requestPortOnePayment({
        merchantUid: order.merchant_uid,
        orderName: order.title,
        amount: totalAmount,
        buyerName: buyer?.name || '구매자',
        buyerEmail: buyer?.email || null,
        buyerPhone: phone,
        paymentMethod: selectedPaymentMethod,
        easyPayProvider,
        isInternationalCard,
      });

      if (!result.success) {
        toast.error(result.error || '결제에 실패했습니다');
        setIsProcessing(false);
        return;
      }

      // 결제 검증
      const verifyResponse = await fetch('/api/payments/verify-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: result.paymentId,
          order_id: order.id,
        }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.error || '결제 검증 실패');
      }

      toast.success('결제가 완료되었습니다!');
      router.push(`/mypage/buyer/orders/${order.id}`);
    } catch (error) {
      logger.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : '결제 중 오류가 발생했습니다');
      setIsProcessing(false);
    }
  };

  const sellerName = seller?.display_name || seller?.business_name || '전문가';
  const allAgreed = agreedToTerms && agreedToPrivacy;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">결제하기</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 왼쪽: 주문 정보 */}
          <div className="flex-1 space-y-6">
            {/* 주문 내역 */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">주문 내역</h2>

              {/* 상품 정보 */}
              <div className="flex gap-4 pb-4 border-b border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                  {service?.thumbnail_url ? (
                    <Image
                      src={service.thumbnail_url}
                      alt={order.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{order.title}</h3>
                  <p className="text-sm text-gray-500">{sellerName}</p>
                </div>
              </div>

              {/* 기본항목 테이블 */}
              <div className="mt-4">
                <div className="grid grid-cols-4 text-sm text-gray-500 pb-2 border-b border-gray-100">
                  <span>기본항목</span>
                  <span className="text-center">수량</span>
                  <span className="text-center">작업일</span>
                  <span className="text-right">가격</span>
                </div>
                <div className="grid grid-cols-4 text-sm py-3 items-center">
                  <span className="text-gray-900 font-medium">{order.title}</span>
                  <span className="text-center text-gray-700">1</span>
                  <span className="text-center text-gray-700">{order.delivery_days}일</span>
                  <span className="text-right font-semibold text-gray-900">
                    {order.amount.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* 포함 사항 */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>작업기간: {order.delivery_days}일</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>
                    수정: {order.revision_count === 999 ? '무제한' : `${order.revision_count}회`}
                  </span>
                </div>
              </div>
            </section>

            {/* 구매자 정보 - 전화번호 미입력 시 */}
            {!buyer?.phone && (
              <BuyerPhoneInput
                phoneInput={phoneInput}
                onPhoneChange={setPhoneInput}
                title="구매자 정보"
                showHelperText={true}
                inputId="buyer-phone-direct"
              />
            )}

            {/* 결제 방법 */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                easyPayProvider={easyPayProvider}
                isInternationalCard={isInternationalCard}
                onMethodChange={setSelectedPaymentMethod}
                onEasyPayProviderChange={setEasyPayProvider}
                onInternationalCardChange={setIsInternationalCard}
              />
            </section>

            {/* 약관 동의 (모바일) */}
            <PaymentTermsSection
              agreedToTerms={agreedToTerms}
              agreedToPrivacy={agreedToPrivacy}
              onTermsChange={setAgreedToTerms}
              onPrivacyChange={setAgreedToPrivacy}
              onPayment={handlePayment}
              isProcessing={isProcessing}
              disabled={!allAgreed}
              amount={totalAmount}
            />
          </div>

          {/* 오른쪽: 결제 요약 (PC) */}
          <PaymentSummarySidebar
            priceBreakdown={[{ label: '주문 금액', amount: order.amount }]}
            totalAmount={totalAmount}
            totalLabel="총 결제 금액 (VAT 포함)"
            agreedToTerms={agreedToTerms}
            agreedToPrivacy={agreedToPrivacy}
            onTermsChange={setAgreedToTerms}
            onPrivacyChange={setAgreedToPrivacy}
            onPayment={handlePayment}
            isProcessing={isProcessing}
            disabled={!allAgreed}
          />
        </div>
      </div>
    </div>
  );
}
