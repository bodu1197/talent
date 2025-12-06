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
  HelpCircle,
  CheckCircle,
  ArrowRight,
  Zap,
  Clock,
  Users,
} from 'lucide-react';

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
      description:
        '간단한 정보 입력으로 전문가 프로필을 완성하세요. 본인인증 후 바로 활동을 시작할 수 있습니다.',
      link: '/mypage/seller/register',
      linkText: '전문가 등록하기',
    },
    {
      icon: FileEdit,
      step: '2단계',
      title: '서비스 등록',
      description:
        '제공할 서비스의 상세 내용, 가격, 작업 기간을 설정하세요. 매력적인 썸네일과 상세 설명이 중요합니다.',
      link: '/mypage/seller/services/new',
      linkText: '서비스 등록하기',
    },
    {
      icon: MessageSquare,
      step: '3단계',
      title: '고객 상담',
      description:
        '문의가 오면 빠르고 친절하게 응대하세요. 신속한 응답은 고객 만족도를 높이는 핵심입니다.',
      link: '/chat',
      linkText: '채팅 확인하기',
    },
    {
      icon: CreditCard,
      step: '4단계',
      title: '정산 받기',
      description:
        '작업 완료 후 고객 확인이 되면 정산이 가능합니다. 최소 1만원부터 1-3 영업일 내 빠른 정산!',
      link: '/mypage/seller/earnings',
      linkText: '정산 관리하기',
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: '수수료 0%',
      description: '타 플랫폼과 달리 판매 수수료가 전혀 없습니다. 100% 수익을 가져가세요.',
    },
    {
      icon: Clock,
      title: '빠른 정산',
      description: '최소 1만원부터 신청 가능, 1-3 영업일 내 정산됩니다.',
    },
    {
      icon: Users,
      title: '넓은 고객층',
      description: '다양한 분야의 고객들이 전문가를 찾고 있습니다.',
    },
    {
      icon: Shield,
      title: '안전 거래',
      description: '에스크로 시스템으로 대금을 안전하게 보호받습니다.',
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
        '상세 설명에 작업 범위와 결과물을 구체적으로 안내하세요',
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
      answer:
        '마이페이지 > 정산 관리에서 출금 신청이 가능합니다. 최소 1만원부터 신청 가능하며, 1-3 영업일 내 등록된 계좌로 입금됩니다.',
    },
    {
      question: '서비스 가격은 어떻게 설정하나요?',
      answer:
        '서비스 등록 시 자유롭게 가격을 설정할 수 있습니다. 시장 조사를 통해 적정 가격을 책정하는 것을 권장합니다.',
    },
    {
      question: '분쟁이 발생하면 어떻게 되나요?',
      answer:
        '고객센터를 통해 분쟁 조정을 요청할 수 있습니다. 에스크로 시스템으로 대금이 보호되므로 안심하세요.',
    },
    {
      question: '여러 서비스를 등록할 수 있나요?',
      answer:
        '네, 제한 없이 여러 서비스를 등록할 수 있습니다. 다양한 서비스로 더 많은 고객을 만나보세요.',
    },
  ];

  // JSON-LD 구조화 데이터
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
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark text-white py-16">
        <div className="container-1200 px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">전문가 가이드</h1>
          <p className="text-xl text-blue-100 mb-6 max-w-2xl">
            돌파구에서 수수료 0%로 재능을 판매하세요. 전문가 등록부터 정산까지 모든 과정을
            안내합니다.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/mypage/seller/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              지금 시작하기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 bg-white border-b">
        <div className="container-1200 px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <benefit.icon className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="container-1200 px-4">
          <h2 className="text-2xl font-bold text-center mb-12">전문가 활동 4단계</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div
                key={step.step}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-brand-primary">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{step.description}</p>
                <Link
                  href={step.link}
                  className="text-brand-primary text-sm font-medium hover:underline inline-flex items-center gap-1"
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
      <section className="py-16 bg-white">
        <div className="container-1200 px-4">
          <h2 className="text-2xl font-bold text-center mb-4">성공하는 전문가의 비결</h2>
          <p className="text-gray-600 text-center mb-12">
            더 많은 고객을 만나고 높은 수익을 얻는 팁을 알려드립니다
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {tips.map((tip) => (
              <div key={tip.title} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <tip.icon className="w-6 h-6 text-brand-primary" />
                  <h3 className="font-semibold">{tip.title}</h3>
                </div>
                <ul className="space-y-3">
                  {tip.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
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
      <section className="py-16">
        <div className="container-1200 px-4">
          <h2 className="text-2xl font-bold text-center mb-4">자주 묻는 질문</h2>
          <p className="text-gray-600 text-center mb-12">
            전문가 활동에 대해 궁금한 점을 확인하세요
          </p>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-primary text-white text-center">
        <div className="container-1200 px-4">
          <h2 className="text-2xl font-bold mb-4">지금 바로 전문가로 시작하세요</h2>
          <p className="text-blue-100 mb-8">수수료 0%로 당신의 재능을 판매하세요</p>
          <Link
            href="/mypage/seller/register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-brand-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            전문가 등록하기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 bg-gray-100">
        <div className="container-1200 px-4 text-center">
          <p className="text-gray-600 mb-4">더 궁금한 점이 있으신가요?</p>
          <Link href="/help/contact" className="text-brand-primary font-medium hover:underline">
            1:1 문의하기
          </Link>
        </div>
      </section>
    </div>
  );
}
