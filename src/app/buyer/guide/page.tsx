import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Search,
  FileText,
  CreditCard,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Shield,
  Clock,
  Star,
  HelpCircle,
} from 'lucide-react';
import BenefitsSection from '@/components/seller/BenefitsSection';

export const metadata: Metadata = {
  title: '구매자 가이드 | 돌파구',
  description:
    '돌파구에서 서비스를 구매하는 방법을 안내합니다. 검색부터 결제, 리뷰 작성까지 단계별로 알려드립니다.',
  keywords: ['구매자 가이드', '서비스 구매', '이용 방법', '돌파구'],
  openGraph: {
    title: '구매자 가이드 | 돌파구',
    description: '돌파구에서 서비스를 구매하는 방법을 안내합니다.',
    type: 'website',
    url: 'https://dolpagu.com/buyer/guide',
    siteName: '돌파구',
  },
  alternates: {
    canonical: 'https://dolpagu.com/buyer/guide',
  },
};

export default function BuyerGuidePage() {
  const steps = [
    {
      icon: Search,
      step: '1단계',
      title: '서비스 검색',
      description: '검색어 또는 카테고리를 통해 원하는 서비스를 찾으세요.',
    },
    {
      icon: FileText,
      step: '2단계',
      title: '상세 정보 확인',
      description: '서비스 설명, 가격, 리뷰를 꼼꼼히 확인하세요.',
    },
    {
      icon: CreditCard,
      step: '3단계',
      title: '결제하기',
      description: '원하는 결제 수단을 선택하고 안전하게 결제하세요.',
    },
    {
      icon: MessageSquare,
      step: '4단계',
      title: '전문가와 소통',
      description: '채팅으로 요구사항을 전달하고 진행 상황을 확인하세요.',
    },
    {
      icon: CheckCircle,
      step: '5단계',
      title: '작업물 확인',
      description: '완료된 작업물을 검수하고 최종 확인합니다.',
    },
    {
      icon: Star,
      step: '6단계',
      title: '리뷰 작성',
      description: '서비스 이용 후기를 남겨 다른 분들께 도움을 주세요.',
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: '안전한 결제',
      description: '에스크로로 결제 대금이 보호됩니다',
    },
    {
      icon: Clock,
      title: '빠른 응답',
      description: '전문가의 신속한 응대를 받으세요',
    },
    {
      icon: Star,
      title: '검증된 품질',
      description: '실제 이용자 리뷰를 확인하세요',
    },
  ];

  const faqs = [
    {
      question: '결제 후 취소가 가능한가요?',
      answer:
        '작업 시작 전에는 전액 환불이 가능합니다. 작업 진행 중인 경우 전문가와 협의가 필요합니다.',
    },
    {
      question: '전문가와 어떻게 소통하나요?',
      answer: '주문 후 채팅 기능을 통해 전문가와 직접 소통할 수 있습니다.',
    },
    {
      question: '작업물이 마음에 들지 않으면 어떻게 하나요?',
      answer:
        '서비스 설명에 명시된 수정 횟수 내에서 수정 요청이 가능합니다. 심각한 문제가 있는 경우 고객센터에 문의하세요.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark text-white py-10 md:py-12">
        <div className="container-1200 px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">구매자 가이드</h1>
          <p className="text-base md:text-lg text-blue-100 max-w-xl">
            돌파구에서 원하는 서비스를 쉽고 안전하게 구매하는 방법을 알려드립니다.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <BenefitsSection benefits={benefits} gridClassName="grid-cols-3" />

      {/* Steps */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-8">서비스 구매 6단계</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {steps.map((step) => (
              <div key={step.step} className="bg-white rounded-lg p-4 shadow-sm text-center">
                <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-brand-primary">{step.step}</span>
                <h3 className="text-sm font-semibold mt-1 mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 md:py-12 bg-white">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-6">자주 묻는 질문</h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold mb-1">{faq.question}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-6">관련 안내</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            <Link
              href="/buyer/payment"
              className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-sm font-medium">결제 안내</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/buyer/refund"
              className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-sm font-medium">환불 정책</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/help/faq"
              className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-sm font-medium">FAQ</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 md:py-12 bg-brand-primary text-white text-center">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold mb-3">지금 바로 시작하세요</h2>
          <p className="text-sm text-blue-100 mb-6">다양한 전문가의 서비스를 만나보세요</p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-brand-primary text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            서비스 둘러보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
