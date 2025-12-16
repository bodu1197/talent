'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';
import { usePaymentState } from '@/hooks/usePaymentState';
import { requestPortOnePayment, validatePaymentPreconditions } from '@/lib/payment/portone';
import PaymentPageLayout from '@/components/payment/PaymentPageLayout';
import DirectOrderProductInfo from '@/components/payment/DirectOrderProductInfo';

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

  return (
    <PaymentPageLayout
      title="결제하기"
      onBack={handleBack}
      productInfoSection={
        <DirectOrderProductInfo order={order} service={service} sellerName={sellerName} />
      }
      buyer={buyer}
      phoneInput={phoneInput}
      onPhoneChange={setPhoneInput}
      phoneInputId="buyer-phone-direct"
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
      totalAmount={totalAmount}
      priceBreakdown={[{ label: '주문 금액', amount: order.amount }]}
      sidebarTotalLabel="총 결제 금액 (VAT 포함)"
    />
  );
}
