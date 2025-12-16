'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Loader2, Megaphone, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { usePaymentState } from '@/hooks/usePaymentState';
import { requestPortOnePayment, validatePaymentPreconditions } from '@/lib/payment/portone';
import { extractNumbers } from '@/lib/validation/input';
import TermsAgreement from '@/components/payment/TermsAgreement';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';

interface Payment {
  id: string;
  seller_id: string;
  service_id: string;
  amount: number;
  supply_amount: number;
  vat_amount: number;
  months: number;
  monthly_price: number;
  merchant_uid: string;
  status: string;
  services: {
    id: string;
    title: string;
    thumbnail_url: string | null;
  } | null;
}

interface Buyer {
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface Props {
  readonly payment: Payment;
  readonly buyer: Buyer;
}

export default function AdvertisingPaymentClient({ payment, buyer }: Props) {
  const router = useRouter();

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
      const orderName = `광고 ${payment.months}개월 - ${payment.services?.title || '서비스'}`;

      // PortOne 결제 요청 (공통 유틸리티 사용)
      const result = await requestPortOnePayment({
        merchantUid: payment.merchant_uid,
        orderName,
        amount: payment.amount,
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
      const verifyResponse = await fetch('/api/payments/advertising/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: result.paymentId,
          advertising_payment_id: payment.id,
        }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.error || '결제 검증 실패');
      }

      toast.success('광고 결제가 완료되었습니다!');
      router.push('/mypage/seller/advertising');
    } catch (error) {
      logger.error('Advertising payment error:', error);
      toast.error(error instanceof Error ? error.message : '결제 중 오류가 발생했습니다');
      setIsProcessing(false);
    }
  };

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
            <span className="font-medium">광고 결제</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 왼쪽: 광고 정보 */}
          <div className="flex-1 space-y-6">
            {/* 광고 상품 정보 */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-brand-primary" />
                광고 상품
              </h2>

              <div className="flex gap-4 pb-4 border-b border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                  {payment.services?.thumbnail_url ? (
                    <Image
                      src={payment.services.thumbnail_url}
                      alt={payment.services.title}
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
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                    {payment.services?.title || '서비스'}
                  </h3>
                  <p className="text-sm text-brand-primary font-semibold">
                    {payment.months}개월 광고
                  </p>
                </div>
              </div>

              {/* 금액 상세 */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">월 광고비</span>
                  <span className="text-gray-900">{payment.monthly_price.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">광고 기간</span>
                  <span className="text-gray-900">{payment.months}개월</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">공급가액</span>
                  <span className="text-gray-900">{payment.supply_amount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">부가세 (10%)</span>
                  <span className="text-gray-900">{payment.vat_amount.toLocaleString()}원</span>
                </div>
              </div>
            </section>

            {/* 구매자 정보 - 전화번호 미입력 시 */}
            {!buyer?.phone && (
              <section className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">결제자 정보</h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="buyer-phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      휴대폰 번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="buyer-phone"
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(extractNumbers(e.target.value))}
                      placeholder="01012345678"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                      maxLength={11}
                    />
                  </div>
                </div>
              </section>
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
            <section className="lg:hidden bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">약관 동의</h2>
              <TermsAgreement
                agreedToTerms={agreedToTerms}
                agreedToPrivacy={agreedToPrivacy}
                onTermsChange={setAgreedToTerms}
                onPrivacyChange={setAgreedToPrivacy}
              />

              <button
                onClick={handlePayment}
                disabled={!allAgreed || isProcessing}
                className="w-full mt-6 h-14 bg-brand-primary text-white rounded-lg font-bold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  `${payment.amount.toLocaleString()}원 결제하기`
                )}
              </button>
            </section>
          </div>

          {/* 오른쪽: 결제 요약 (PC) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">공급가액</span>
                  <span className="text-gray-900 font-medium">
                    {payment.supply_amount.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">부가세</span>
                  <span className="text-gray-900 font-medium">
                    {payment.vat_amount.toLocaleString()}원
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-b border-gray-200">
                <span className="font-medium text-gray-900">총 결제 금액</span>
                <span className="text-2xl font-bold text-brand-primary">
                  {payment.amount.toLocaleString()}원
                </span>
              </div>

              <div className="py-4">
                <TermsAgreement
                  agreedToTerms={agreedToTerms}
                  agreedToPrivacy={agreedToPrivacy}
                  onTermsChange={setAgreedToTerms}
                  onPrivacyChange={setAgreedToPrivacy}
                />
              </div>

              <button
                onClick={handlePayment}
                disabled={!allAgreed || isProcessing}
                className="w-full h-14 bg-brand-primary text-white rounded-lg font-bold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors hover:bg-brand-dark"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  '결제하기'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
