'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { usePaymentState } from '@/hooks/usePaymentState';
import { requestPortOnePayment, validatePaymentPreconditions } from '@/lib/payment/portone';
import PaymentPageLayout from '@/components/payment/PaymentPageLayout';
import AdvertisingProductInfo from '@/components/payment/AdvertisingProductInfo';

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

  return (
    <PaymentPageLayout
      title="광고 결제"
      onBack={handleBack}
      productInfoSection={<AdvertisingProductInfo payment={payment} />}
      buyer={buyer}
      phoneInput={phoneInput}
      onPhoneChange={setPhoneInput}
      phoneInputId="buyer-phone"
      selectedPaymentMethod={selectedPaymentMethod}
      easyPayProvider={easyPayProvider}
      isInternationalCard={isInternationalCard}
      onMethodChange={setSelectedPaymentMethod}
      onEasyPayProviderChange={setEasyPayProvider}
      onInternationalCardChange={setIsInternationalCard}
      agreedToTerms={agreedToTerms}
      agreedToPrivacy={agreedToPrivacy}
      onTermsChange={setAgreedToTerms}
      onPrivacyChange={setAgreedToPrivacy}
      onPayment={handlePayment}
      isProcessing={isProcessing}
      totalAmount={payment.amount}
      priceBreakdown={[
        { label: '공급가액', amount: payment.supply_amount },
        { label: '부가세', amount: payment.vat_amount },
      ]}
    />
  );
}
