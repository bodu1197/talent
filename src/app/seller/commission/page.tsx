import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Percent,
  CheckCircle,
  XCircle,
  ArrowRight,
  Calculator,
  TrendingUp,
  Shield,
  Zap,
  HelpCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: '수수료 안내 | 돌파구 - 수수료 0% 재능 거래 플랫폼',
  description:
    '돌파구는 전문가와 구매자 모두 수수료 0%입니다. 타 플랫폼 대비 수수료 비교와 수익 시뮬레이션을 확인하세요.',
  keywords: ['수수료', '수수료 0%', '크몽 수수료', '숨고 수수료', '프리랜서 수수료', '돌파구'],
  openGraph: {
    title: '수수료 안내 | 돌파구 - 수수료 0%',
    description: '돌파구는 전문가와 구매자 모두 수수료 0%입니다.',
    type: 'website',
    url: 'https://dolpagu.com/seller/commission',
    siteName: '돌파구',
  },
  alternates: {
    canonical: 'https://dolpagu.com/seller/commission',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CommissionPage() {
  const comparisonData = [
    { platform: '돌파구', sellerFee: '0%', buyerFee: '0%', highlight: true },
    { platform: '크몽', sellerFee: '20%', buyerFee: '0%', highlight: false },
    { platform: '숨고', sellerFee: '견적당 과금', buyerFee: '0%', highlight: false },
    { platform: '탈잉', sellerFee: '15~20%', buyerFee: '0%', highlight: false },
    { platform: '클래스101', sellerFee: '30%', buyerFee: '0%', highlight: false },
  ];

  const benefits = [
    { icon: Percent, title: '수수료 0%', description: '전문가/구매자 모두 무료' },
    { icon: TrendingUp, title: '100% 수익', description: '판매 금액 전액 수익' },
    { icon: Calculator, title: '투명한 정산', description: '숨겨진 비용 없음' },
    { icon: Shield, title: '안전 거래', description: '에스크로 대금 보호' },
  ];

  const simulations = [
    { price: 50000, others: 40000, dolpagu: 50000 },
    { price: 100000, others: 80000, dolpagu: 100000 },
    { price: 300000, others: 240000, dolpagu: 300000 },
    { price: 500000, others: 400000, dolpagu: 500000 },
    { price: 1000000, others: 800000, dolpagu: 1000000 },
  ];

  const faqs = [
    {
      question: '정말 수수료가 0%인가요?',
      answer: '네, 전문가와 구매자 모두 수수료가 0%입니다. 판매 금액 100%를 가져가세요.',
    },
    {
      question: '그럼 돌파구는 어떻게 수익을 내나요?',
      answer: '광고, 프리미엄 노출 등 부가 서비스로 수익을 창출합니다.',
    },
    {
      question: '결제 수수료도 없나요?',
      answer: '카드사/PG사 수수료는 돌파구가 부담합니다.',
    },
    {
      question: '정산 시 세금은 어떻게 되나요?',
      answer: '원천징수(3.3%)가 적용되며, 종합소득세 신고 시 환급 가능합니다.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '돌파구 수수료 안내',
    description: '돌파구는 전문가와 구매자 모두 수수료 0%입니다.',
    mainEntity: {
      '@type': 'Service',
      name: '돌파구 재능 거래 플랫폼',
      offers: {
        '@type': 'Offer',
        description: '수수료 0% 재능 거래',
        price: '0',
        priceCurrency: 'KRW',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark text-white py-10 md:py-12">
        <div className="container-1200 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full mb-4">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">업계 최초 수수료 0%</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            수수료 <span className="text-yellow-300">0%</span>
          </h1>
          <p className="text-base md:text-lg text-blue-100 mb-6 max-w-xl mx-auto">
            돌파구는 전문가와 구매자 모두 수수료가 없습니다.
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
      <section className="py-8 bg-white border-b">
        <div className="container-1200 px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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

      {/* Comparison Table */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-3">플랫폼별 수수료 비교</h2>
          <p className="text-xs md:text-sm text-gray-600 text-center mb-8">
            돌파구는 타 플랫폼과 달리 수수료가 전혀 없습니다
          </p>

          <div className="max-w-2xl mx-auto overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm overflow-hidden text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="py-3 px-4 text-left font-semibold">플랫폼</th>
                  <th className="py-3 px-4 text-center font-semibold">전문가 수수료</th>
                  <th className="py-3 px-4 text-center font-semibold">구매자 수수료</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {comparisonData.map((row) => (
                  <tr
                    key={row.platform}
                    className={row.highlight ? 'bg-brand-primary/5' : 'hover:bg-gray-50'}
                  >
                    <td className="py-3 px-4">
                      <span className={`font-medium ${row.highlight ? 'text-brand-primary' : ''}`}>
                        {row.platform}
                      </span>
                      {row.highlight && (
                        <span className="ml-2 px-2 py-0.5 bg-brand-primary text-white text-xs rounded-full">
                          추천
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.sellerFee === '0%' ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          {row.sellerFee}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500">
                          <XCircle className="w-4 h-4" />
                          {row.sellerFee}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">{row.buyerFee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Revenue Simulation */}
      <section className="py-10 md:py-12 bg-white">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-3">수익 시뮬레이션</h2>
          <p className="text-xs md:text-sm text-gray-600 text-center mb-8">
            같은 가격에 판매해도 실제 수익은 이렇게 다릅니다 (수수료 20% 기준)
          </p>

          <div className="max-w-xl mx-auto bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-3 mb-3 text-xs font-semibold text-gray-600">
              <div>판매 금액</div>
              <div className="text-center">타 플랫폼</div>
              <div className="text-center text-brand-primary">돌파구</div>
            </div>
            <div className="space-y-2">
              {simulations.map((sim) => (
                <div
                  key={sim.price}
                  className="grid grid-cols-3 gap-3 items-center bg-white rounded-lg p-3 text-sm"
                >
                  <div className="font-medium">{sim.price.toLocaleString()}원</div>
                  <div className="text-center text-gray-500">
                    {sim.others.toLocaleString()}원
                    <span className="text-xs text-red-500 ml-1">
                      (-{(sim.price - sim.others).toLocaleString()})
                    </span>
                  </div>
                  <div className="text-center text-brand-primary font-semibold">
                    {sim.dolpagu.toLocaleString()}원
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-brand-primary/10 rounded-lg text-center">
              <p className="text-sm text-brand-primary font-semibold">
                100만원 거래 시 <strong>20만원</strong> 더 수익!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-6">자주 묻는 질문</h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
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

      {/* CTA */}
      <section className="py-10 md:py-12 bg-brand-primary text-white text-center">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold mb-3">수수료 걱정 없이 시작하세요</h2>
          <p className="text-sm text-blue-100 mb-6">판매 금액 100%를 가져가는 돌파구</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/mypage/seller/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-brand-primary text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              전문가 등록하기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/seller/guide"
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-white text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              전문가 가이드 보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
