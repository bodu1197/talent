'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import * as PortOne from '@portone/browser-sdk/v2';
import {
  ArrowLeft,
  Check,
  ImageIcon,
  Loader2,
  CreditCard,
  Building2,
  Smartphone,
  Globe,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';

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

type PaymentMethod = 'CARD' | 'TRANSFER' | 'VIRTUAL_ACCOUNT' | 'MOBILE' | 'EASY_PAY';
type EasyPayProvider = 'TOSSPAY' | 'NAVERPAY' | 'KAKAOPAY' | null;

interface Props {
  readonly order: Order;
  readonly seller: Seller | null;
}

export default function DirectPaymentClient({ order, seller }: Props) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CARD');
  const [easyPayProvider, setEasyPayProvider] = useState<EasyPayProvider>(null);
  const [isInternationalCard, setIsInternationalCard] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');

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
    if (!agreedToTerms || !agreedToPrivacy) {
      toast.error('필수 약관에 동의해주세요');
      return;
    }

    // 전화번호 확인 (이니시스 V2 필수)
    const phone = buyer?.phone || phoneInput;
    if (!phone) {
      toast.error('결제를 위해 휴대폰 번호가 필요합니다');
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // 환경변수 확인
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

      if (!storeId || !channelKey) {
        logger.error('PortOne configuration missing', {
          storeId: !!storeId,
          channelKey: !!channelKey,
        });
        toast.error('결제 설정이 올바르지 않습니다. 관리자에게 문의하세요.');
        setIsProcessing(false);
        return;
      }

      // PortOne V2 결제창 호출
      const paymentConfig: Parameters<typeof PortOne.requestPayment>[0] = {
        storeId,
        paymentId: order.merchant_uid,
        orderName: order.title,
        totalAmount: totalAmount,
        currency: 'CURRENCY_KRW',
        channelKey,
        payMethod: selectedPaymentMethod,
        customer: {
          fullName: buyer?.name || '구매자',
          phoneNumber: phone,
          email: buyer?.email || undefined,
        },
        customData: {
          order_id: order.id,
        },
      };

      // 간편결제 provider 설정 (해당 채널이 설정된 경우에만 동작)
      if (selectedPaymentMethod === 'EASY_PAY' && easyPayProvider) {
        paymentConfig.easyPay = { easyPayProvider };
      }

      logger.debug('Payment request config', {
        storeId,
        channelKey,
        payMethod: selectedPaymentMethod,
        easyPayProvider,
      });

      const response = await PortOne.requestPayment(paymentConfig);

      // 결제 결과 처리
      if (response?.code != null) {
        toast.error(`결제 실패: ${response.message}`);
        setIsProcessing(false);
        return;
      }

      // 결제 검증
      const verifyResponse = await fetch('/api/payments/verify-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: response?.paymentId,
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

  const sellerName = seller?.display_name || seller?.business_name || '판매자';
  const allAgreed = agreedToTerms && agreedToPrivacy;

  const paymentMethods = [
    { id: 'TRANSFER' as PaymentMethod, label: '퀵계좌이체', icon: Building2, badge: '혜택' },
    { id: 'CARD' as PaymentMethod, label: '신용카드', icon: CreditCard },
    { id: 'VIRTUAL_ACCOUNT' as PaymentMethod, label: '무통장입금', icon: Building2 },
    { id: 'MOBILE' as PaymentMethod, label: '휴대폰', icon: Smartphone },
    {
      id: 'EASY_PAY' as PaymentMethod,
      label: 'tosspay',
      icon: Wallet,
      provider: 'TOSSPAY' as EasyPayProvider,
    },
    {
      id: 'EASY_PAY' as PaymentMethod,
      label: 'N Pay',
      icon: Wallet,
      provider: 'NAVERPAY' as EasyPayProvider,
    },
    {
      id: 'EASY_PAY' as PaymentMethod,
      label: '카카오pay',
      icon: Wallet,
      provider: 'KAKAOPAY' as EasyPayProvider,
    },
    { id: 'CARD' as PaymentMethod, label: '해외신용카드', icon: Globe, isInternational: true },
  ];

  const handleSelectPaymentMethod = (
    method: PaymentMethod,
    provider?: EasyPayProvider,
    isIntl?: boolean
  ) => {
    setSelectedPaymentMethod(method);
    setEasyPayProvider(provider || null);
    setIsInternationalCard(isIntl || false);
  };

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
              <section className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">구매자 정보</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      휴대폰 번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="01012345678"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                      maxLength={11}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      결제 진행을 위해 휴대폰 번호가 필요합니다
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* 결제 방법 */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">결제 방법</h2>

              <div className="grid grid-cols-4 gap-3">
                {paymentMethods.map((method, index) => {
                  const Icon = method.icon;
                  let isSelected = false;
                  if (method.provider) {
                    isSelected =
                      selectedPaymentMethod === method.id && easyPayProvider === method.provider;
                  } else if (method.isInternational) {
                    isSelected = selectedPaymentMethod === method.id && isInternationalCard;
                  } else {
                    isSelected =
                      selectedPaymentMethod === method.id &&
                      !easyPayProvider &&
                      !isInternationalCard;
                  }
                  return (
                    <button
                      key={`${method.id}-${index}`}
                      type="button"
                      onClick={() =>
                        handleSelectPaymentMethod(
                          method.id,
                          method.provider,
                          method.isInternational
                        )
                      }
                      className={`relative flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-brand-primary bg-brand-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {method.badge && (
                        <span className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                          {method.badge}
                        </span>
                      )}
                      <Icon
                        className={`w-5 h-5 ${isSelected ? 'text-brand-primary' : 'text-gray-500'}`}
                      />
                      <span
                        className={`text-xs font-medium ${isSelected ? 'text-brand-primary' : 'text-gray-700'}`}
                      >
                        {method.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedPaymentMethod === 'TRANSFER' && (
                <p className="mt-3 text-sm text-green-600">계좌이체 결제 시 0.5% 즉시 할인</p>
              )}
            </section>

            {/* 약관 동의 (모바일) */}
            <section className="lg:hidden bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">약관 동의</h2>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">
                    <span className="text-red-500">[필수]</span> 구매 조건 및 환불 정책에 동의합니다
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToPrivacy}
                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">
                    <span className="text-red-500">[필수]</span> 개인정보 제3자 제공에 동의합니다
                  </span>
                </label>
              </div>

              {/* 모바일 결제 버튼 */}
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
                  `${totalAmount.toLocaleString()}원 결제하기`
                )}
              </button>
            </section>
          </div>

          {/* 오른쪽: 결제 요약 (PC) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
              {/* 금액 상세 */}
              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">주문 금액</span>
                  <span className="text-gray-900 font-medium">
                    {order.amount.toLocaleString()} 원
                  </span>
                </div>
              </div>

              {/* 총 결제 금액 */}
              <div className="flex justify-between items-center py-4 border-b border-gray-200">
                <span className="font-medium text-gray-900">
                  총 결제 금액 <span className="text-xs text-gray-500">(VAT 포함)</span>
                </span>
                <span className="text-2xl font-bold text-brand-primary">
                  {totalAmount.toLocaleString()}원
                </span>
              </div>

              {/* 약관 동의 */}
              <div className="py-4 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <span className="text-xs text-gray-600">결제 전 안내사항</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToPrivacy}
                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <span className="text-xs text-gray-600">개인정보 제3자 제공</span>
                </label>
              </div>

              <p className="text-xs text-gray-500 text-center mb-4">
                위 내용을 확인하였고, 결제에 동의합니다.
              </p>

              {/* 결제 버튼 */}
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
