import type { Metadata } from 'next';
import Link from 'next/link';
import {
  UserPlus,
  FileEdit,
  MessageSquare,
  CreditCard,
  Star,
  Shield,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Zap,
  Clock,
  Users,
} from 'lucide-react';
import BenefitsSection from '@/components/seller/BenefitsSection';
import FAQSection from '@/components/seller/FAQSection';

export const metadata: Metadata = {
  title: '전문가 가이드 | 돌파구',
  description:
    '돌파구에서 전문가로 활동하는 방법을 안내합니다. 서비스 등록부터 정산까지, 수수료 0%로 재능을 판매하세요.',
  keywords: ['전문가 가이드', '판매자 가이드', '서비스 등록', '수수료 0%', '돌파구', '프리랜서'],
  openGraph: {
    title: '전문가 가이드 | 돌파구',
    description: '돌파구에서 전문가로 활동하는 방법을 안내합니다.',
    type: 'website',
    url: 'https://dolpagu.com/seller/guide',
    siteName: '돌파구',
  },
  alternates: {
    canonical: 'https://dolpagu.com/seller/guide',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SellerGuidePage() {
  const steps = [
    {
      icon: UserPlus,
      step: '1단계',
      title: '전문가 등록',
      description: '간단한 정보 입력으로 프로필을 완성하세요.',
      link: '/mypage/seller/register',
      linkText: '전문가 등록하기',
    },
    {
      icon: FileEdit,
      step: '2단계',
      title: '서비스 등록',
      description: '서비스 내용, 가격, 작업 기간을 설정하세요.',
      link: '/mypage/seller/services/new',
      linkText: '서비스 등록하기',
    },
    {
      icon: MessageSquare,
      step: '3단계',
      title: '고객 상담',
      description: '문의에 빠르고 친절하게 응대하세요.',
      link: '/chat',
      linkText: '채팅 확인하기',
    },
    {
      icon: CreditCard,
      step: '4단계',
      title: '정산 받기',
      description: '최소 1만원부터 1-3 영업일 내 빠른 정산!',
      link: '/mypage/seller/earnings',
      linkText: '정산 관리하기',
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: '수수료 0%',
      description: '판매 수수료 없이 100% 수익',
    },
    {
      icon: Clock,
      title: '빠른 정산',
      description: '1-3 영업일 내 정산',
    },
    {
      icon: Users,
      title: '넓은 고객층',
      description: '다양한 분야의 고객',
    },
    {
      icon: Shield,
      title: '안전 거래',
      description: '에스크로로 대금 보호',
    },
  ];

  const tips = [
    {
      icon: Star,
      title: '매력적인 프로필 작성',
      items: [
        '전문 분야와 경력을 구체적으로 작성하세요',
        '실제 작업물을 포트폴리오로 등록하세요',
        '프로필 사진은 신뢰감을 주는 이미지로 설정하세요',
      ],
    },
    {
      icon: TrendingUp,
      title: '서비스 등록 팁',
      items: [
        '서비스 제목은 검색하기 쉽게 명확하게 작성하세요',
        '상세 설명에 작업 범위와 결과물을 안내하세요',
        '적정 가격 설정으로 첫 고객을 확보하세요',
      ],
    },
    {
      icon: MessageSquare,
      title: '고객 응대 팁',
      items: [
        '문의에 24시간 내 답변하면 신뢰도가 올라갑니다',
        '작업 진행 상황을 주기적으로 공유하세요',
        '친절하고 전문적인 커뮤니케이션을 유지하세요',
      ],
    },
  ];

  const faqs = [
    {
      question: '전문가 등록에 비용이 있나요?',
      answer: '아니요, 전문가 등록은 무료입니다. 서비스 판매 시에도 수수료가 없습니다.',
    },
    {
      question: '정산은 어떻게 받나요?',
      answer: '마이페이지 > 정산 관리에서 출금 신청이 가능합니다. 최소 1만원부터 신청 가능합니다.',
    },
    {
      question: '서비스 가격은 어떻게 설정하나요?',
      answer: '서비스 등록 시 자유롭게 가격을 설정할 수 있습니다.',
    },
    {
      question: '여러 서비스를 등록할 수 있나요?',
      answer: '네, 제한 없이 여러 서비스를 등록할 수 있습니다.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: '돌파구 전문가 가이드',
    description: '돌파구에서 전문가로 활동하는 방법',
    step: steps.map((s, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: s.title,
      text: s.description,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark text-white py-10 md:py-12">
        <div className="container-1200 px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">전문가 가이드</h1>
          <p className="text-base md:text-lg text-blue-100 mb-5 max-w-xl">
            수수료 0%로 재능을 판매하세요. 등록부터 정산까지 안내합니다.
          </p>
          <Link
            href="/mypage/seller/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-brand-primary text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            지금 시작하기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <BenefitsSection benefits={benefits} />

      {/* Steps */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-8">전문가 활동 4단계</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((step) => (
              <div
                key={step.step}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-brand-primary">{step.step}</span>
                </div>
                <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">{step.description}</p>
                <Link
                  href={step.link}
                  className="text-brand-primary text-xs font-medium hover:underline inline-flex items-center gap-1"
                >
                  {step.linkText}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-10 md:py-12 bg-white">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-3">성공하는 전문가의 비결</h2>
          <p className="text-xs md:text-sm text-gray-600 text-center mb-8">
            더 많은 고객을 만나고 높은 수익을 얻는 팁
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {tips.map((tip) => (
              <div key={tip.title} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <tip.icon className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-sm font-semibold">{tip.title}</h3>
                </div>
                <ul className="space-y-2">
                  {tip.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-gray-700">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection faqs={faqs} />

      {/* CTA */}
      <section className="py-10 md:py-12 bg-brand-primary text-white text-center">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold mb-3">지금 바로 전문가로 시작하세요</h2>
          <p className="text-sm text-blue-100 mb-6">수수료 0%로 당신의 재능을 판매하세요</p>
          <Link
            href="/mypage/seller/register"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-brand-primary text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            전문가 등록하기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
            <Link
              href="/seller/commission"
              className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-sm font-medium">수수료 안내</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/help/contact"
              className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-sm font-medium">1:1 문의</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
