import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CreditCard,
  Building,
  Smartphone,
  Wallet,
  ArrowRight,
  Shield,
  CheckCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: '결제 안내 | 돌파구',
  description:
    '돌파구의 안전한 결제 시스템을 안내합니다. 신용카드, 계좌이체, 간편결제 등 다양한 결제 수단을 지원합니다.',
  keywords: ['결제 안내', '결제 수단', '안전 결제', '돌파구'],
  openGraph: {
    title: '결제 안내 | 돌파구',
    description: '돌파구의 안전한 결제 시스템을 안내합니다.',
    type: 'website',
    url: 'https://dolpagu.com/buyer/payment',
    siteName: '돌파구',
  },
  alternates: {
    canonical: 'https://dolpagu.com/buyer/payment',
  },
};

export default function BuyerPaymentPage() {
  const paymentMethods = [
    {
      icon: CreditCard,
      title: '신용카드',
      description: '국내 모든 신용카드 사용 가능',
    },
    {
      icon: Building,
      title: '계좌이체',
      description: '실시간 계좌이체 지원',
    },
    {
      icon: Smartphone,
      title: '간편결제',
      description: '카카오페이, 네이버페이, 토스',
    },
    {
      icon: Wallet,
      title: '캐시',
      description: '충전된 캐시로 결제',
    },
  ];

  const securityFeatures = [
    'PG사를 통한 안전한 결제 처리',
    'SSL 암호화로 결제 정보 보호',
    '에스크로로 구매 대금 보호',
    '카드 정보 저장 없음',
  ];

  const steps = [
    { step: '1', title: '서비스 선택', desc: '옵션 및 수량 선택' },
    { step: '2', title: '결제 수단', desc: '원하는 방법 선택' },
    { step: '3', title: '결제 진행', desc: '안전한 결제 창' },
    { step: '4', title: '결제 완료', desc: '작업 시작' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark text-white py-10 md:py-12">
        <div className="container-1200 px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">결제 안내</h1>
          <p className="text-base md:text-lg text-blue-100 max-w-xl">
            다양한 결제 수단으로 안전하게 결제하세요.
          </p>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-6">이용 가능한 결제 수단</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {paymentMethods.map((method) => (
              <div
                key={method.title}
                className="bg-white rounded-lg p-4 shadow-sm text-center hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <method.icon className="w-5 h-5 text-brand-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-1">{method.title}</h3>
                <p className="text-xs text-gray-500">{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Process */}
      <section className="py-10 md:py-12 bg-white">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-6">결제 프로세스</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 max-w-3xl mx-auto">
            {steps.map((item, index) => (
              <div key={item.step} className="flex items-center gap-3 md:gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center min-w-[120px]">
                  <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-2 text-white text-sm font-bold">
                    {item.step}
                  </div>
                  <p className="text-sm font-semibold mb-0.5">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-300 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-6">안전한 결제</h2>
          <div className="max-w-xl mx-auto bg-blue-50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">보안 결제 시스템</span>
            </div>
            <ul className="space-y-2">
              {securityFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-blue-800">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Cash Info */}
      <section className="py-10 md:py-12 bg-white">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-6">캐시 충전</h2>
          <div className="max-w-xl mx-auto">
            <p className="text-sm text-gray-600 text-center mb-4">
              캐시를 미리 충전하여 빠르고 편리하게 결제하세요.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex justify-between">
                  <span>충전 금액</span>
                  <span className="font-medium">10,000원 ~ 1,000,000원</span>
                </li>
                <li className="flex justify-between">
                  <span>충전 보너스</span>
                  <span className="font-medium">100,000원 이상 시 추가 적립</span>
                </li>
                <li className="flex justify-between">
                  <span>유효기간</span>
                  <span className="font-medium">충전일로부터 5년</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
            <Link
              href="/buyer/refund"
              className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-sm font-medium">환불 정책</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/buyer/guide"
              className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-sm font-medium">구매자 가이드</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
