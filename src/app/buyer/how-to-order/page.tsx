import type { Metadata } from 'next';
import Link from 'next/link';
import {
  UserPlus,
  Search,
  FileText,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  CheckCircle,
  Star,
  ArrowRight,
  Shield,
  Clock,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: '서비스 구매 방법 | 돌파구',
  description:
    '돌파구에서 서비스를 구매하는 방법을 단계별로 안내합니다. 회원가입부터 리뷰 작성까지 상세히 알려드립니다.',
  keywords: ['주문 방법', '서비스 구매', '이용 방법', '돌파구'],
  openGraph: {
    title: '서비스 구매 방법 | 돌파구',
    description: '돌파구에서 서비스를 구매하는 방법을 안내합니다.',
    type: 'website',
    url: 'https://dolpagu.com/buyer/how-to-order',
    siteName: '돌파구',
  },
  alternates: {
    canonical: 'https://dolpagu.com/buyer/how-to-order',
  },
};

export default function HowToOrderPage() {
  const steps = [
    {
      icon: UserPlus,
      step: '1단계',
      title: '회원가입 및 로그인',
      description: '이메일 또는 소셜 계정으로 간편하게 가입하세요.',
      tips: ['이메일/소셜 간편 가입', '본인 인증 후 모든 서비스 이용'],
    },
    {
      icon: Search,
      step: '2단계',
      title: '서비스 검색',
      description: '검색어나 카테고리를 통해 원하는 서비스를 찾으세요.',
      tips: ['키워드 검색', '카테고리별 탐색', '인기/추천 서비스 확인'],
    },
    {
      icon: FileText,
      step: '3단계',
      title: '상세 정보 확인',
      description: '서비스 설명, 가격, 리뷰를 꼼꼼히 확인하세요.',
      tips: ['서비스 설명 및 포함 사항', '작업 기간 및 수정 횟수', '후기 및 평점'],
    },
    {
      icon: ShoppingCart,
      step: '4단계',
      title: '옵션 선택',
      description: '필요한 옵션을 선택하고 요구사항을 입력하세요.',
      tips: ['기본/추가 옵션 선택', '작업 요청사항 작성', '참고 자료 첨부'],
    },
    {
      icon: CreditCard,
      step: '5단계',
      title: '결제하기',
      description: '안전한 결제 시스템으로 주문을 완료하세요.',
      tips: ['다양한 결제 수단', '쿠폰/캐시 사용', '에스크로 대금 보호'],
    },
    {
      icon: MessageSquare,
      step: '6단계',
      title: '전문가와 소통',
      description: '채팅으로 요구사항을 전달하고 진행 상황을 확인하세요.',
      tips: ['요청사항 재확인', '진행 상황 확인', '수정 요청 및 피드백'],
    },
    {
      icon: CheckCircle,
      step: '7단계',
      title: '작업물 확인',
      description: '완성된 작업물을 검수하고 최종 확인하세요.',
      tips: ['작업물 다운로드', '내용 검수', '수정 요청 (횟수 내)'],
    },
    {
      icon: Star,
      step: '8단계',
      title: '리뷰 작성',
      description: '서비스 이용 후기를 남겨 다른 분들께 도움을 주세요.',
      tips: ['별점 및 리뷰 작성', '리뷰 적립금 지급'],
    },
  ];

  const notices = [
    '서비스 설명을 꼼꼼히 읽고 주문해주세요',
    '요구사항은 구체적이고 명확하게 작성해주세요',
    '참고 자료가 있다면 함께 첨부해주세요',
    '작업 기간은 영업일 기준입니다',
    '추가 수정은 수정 횟수 내에서만 가능합니다',
  ];

  const benefits = [
    { icon: Shield, title: '안전한 결제', description: '에스크로로 대금 보호' },
    { icon: Clock, title: '빠른 응답', description: '전문가 신속 응대' },
    { icon: Star, title: '검증된 품질', description: '실제 이용자 리뷰' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark text-white py-10 md:py-12">
        <div className="container-1200 px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">서비스 구매 방법</h1>
          <p className="text-base md:text-lg text-blue-100 max-w-xl">
            회원가입부터 리뷰 작성까지, 돌파구 이용 방법을 안내합니다.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-8 bg-white border-b">
        <div className="container-1200 px-4">
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <benefit.icon className="w-5 h-5 md:w-6 md:h-6 text-brand-primary" />
                </div>
                <h3 className="text-xs md:text-sm font-semibold mb-0.5">{benefit.title}</h3>
                <p className="text-xs text-gray-500 hidden md:block">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-8">상세 주문 가이드</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {steps.map((step) => (
              <div key={step.step} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-brand-primary">{step.step}</span>
                      <h3 className="text-sm font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{step.description}</p>
                    <ul className="flex flex-wrap gap-2">
                      {step.tips.map((tip, index) => (
                        <li
                          key={index}
                          className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
                        >
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notices */}
      <section className="py-10 md:py-12 bg-white">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-6">주문 시 유의사항</h2>
          <div className="max-w-xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-900">꼭 확인하세요</span>
            </div>
            <ul className="space-y-2">
              {notices.map((notice, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-yellow-800">
                  <span className="text-yellow-600">•</span>
                  {notice}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Help */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4 text-center">
          <HelpCircle className="w-10 h-10 text-brand-primary mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">도움이 필요하신가요?</h2>
          <p className="text-sm text-gray-600 mb-4">
            주문 과정에서 어려움이 있으시면 문의해주세요.
          </p>
          <Link
            href="/help/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
          >
            1:1 문의하기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-10 md:py-12 bg-white">
        <div className="container-1200 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            <Link
              href="/buyer/guide"
              className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium">구매자 가이드</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/buyer/payment"
              className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium">결제 안내</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/buyer/refund"
              className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium">환불 정책</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
