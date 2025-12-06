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
    {
      platform: '돌파구',
      sellerFee: '0%',
      buyerFee: '0%',
      highlight: true,
    },
    {
      platform: '크몽',
      sellerFee: '20%',
      buyerFee: '0%',
      highlight: false,
    },
    {
      platform: '숨고',
      sellerFee: '견적당 과금',
      buyerFee: '0%',
      highlight: false,
    },
    {
      platform: '탈잉',
      sellerFee: '15~20%',
      buyerFee: '0%',
      highlight: false,
    },
    {
      platform: '클래스101',
      sellerFee: '30%',
      buyerFee: '0%',
      highlight: false,
    },
  ];

  const benefits = [
    {
      icon: Percent,
      title: '수수료 0%',
      description: '전문가도 구매자도 수수료가 없습니다',
    },
    {
      icon: TrendingUp,
      title: '100% 수익',
      description: '판매 금액 전액을 가져가세요',
    },
    {
      icon: Calculator,
      title: '투명한 정산',
      description: '숨겨진 비용 없이 명확한 정산',
    },
    {
      icon: Shield,
      title: '안전 거래',
      description: '에스크로로 대금 보호',
    },
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
      answer:
        '네, 돌파구는 전문가와 구매자 모두 수수료가 0%입니다. 숨겨진 비용도 없습니다. 판매 금액 100%를 가져가실 수 있습니다.',
    },
    {
      question: '그럼 돌파구는 어떻게 수익을 내나요?',
      answer:
        '돌파구는 광고, 프리미엄 노출 등 부가 서비스를 통해 수익을 창출합니다. 기본 거래에는 수수료를 부과하지 않습니다.',
    },
    {
      question: '결제 수수료도 없나요?',
      answer:
        '카드사/PG사 결제 수수료는 돌파구가 부담합니다. 전문가분들은 판매 금액 전액을 정산받으실 수 있습니다.',
    },
    {
      question: '정산 시 세금은 어떻게 되나요?',
      answer:
        '정산 시 원천징수(3.3%)가 적용됩니다. 이는 세법에 따른 것으로, 종합소득세 신고 시 환급받으실 수 있습니다.',
    },
  ];

  // JSON-LD 구조화 데이터
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
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark text-white py-16">
        <div className="container-1200 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
            <Zap className="w-5 h-5" />
            <span className="font-medium">업계 최초 수수료 0%</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            수수료 <span className="text-yellow-300">0%</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            돌파구는 전문가와 구매자 모두 수수료가 없습니다.
            <br />
            판매 금액 100%를 가져가세요.
          </p>
          <Link
            href="/mypage/seller/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors text-lg"
          >
            지금 시작하기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 bg-white border-b">
        <div className="container-1200 px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="w-14 h-14 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <benefit.icon className="w-7 h-7 text-brand-primary" />
                </div>
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16">
        <div className="container-1200 px-4">
          <h2 className="text-2xl font-bold text-center mb-4">플랫폼별 수수료 비교</h2>
          <p className="text-gray-600 text-center mb-12">
            돌파구는 타 플랫폼과 달리 수수료가 전혀 없습니다
          </p>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="py-4 px-6 text-left font-semibold">플랫폼</th>
                  <th className="py-4 px-6 text-center font-semibold">전문가 수수료</th>
                  <th className="py-4 px-6 text-center font-semibold">구매자 수수료</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {comparisonData.map((row) => (
                  <tr
                    key={row.platform}
                    className={row.highlight ? 'bg-brand-primary/5' : 'hover:bg-gray-50'}
                  >
                    <td className="py-4 px-6">
                      <span
                        className={`font-medium ${row.highlight ? 'text-brand-primary' : 'text-gray-900'}`}
                      >
                        {row.platform}
                      </span>
                      {row.highlight && (
                        <span className="ml-2 px-2 py-0.5 bg-brand-primary text-white text-xs rounded-full">
                          추천
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.sellerFee === '0%' ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-bold">
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
                    <td className="py-4 px-6 text-center">
                      <span className="text-gray-600">{row.buyerFee}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Revenue Simulation */}
      <section className="py-16 bg-white">
        <div className="container-1200 px-4">
          <h2 className="text-2xl font-bold text-center mb-4">수익 시뮬레이션</h2>
          <p className="text-gray-600 text-center mb-12">
            같은 가격에 판매해도 실제 수익은 이렇게 다릅니다 (수수료 20% 기준)
          </p>

          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm font-semibold text-gray-600">
                <div>판매 금액</div>
                <div className="text-center">타 플랫폼 실수령</div>
                <div className="text-center text-brand-primary">돌파구 실수령</div>
              </div>
              <div className="space-y-3">
                {simulations.map((sim) => (
                  <div
                    key={sim.price}
                    className="grid grid-cols-3 gap-4 items-center bg-white rounded-lg p-4"
                  >
                    <div className="font-medium">{sim.price.toLocaleString()}원</div>
                    <div className="text-center text-gray-500">
                      {sim.others.toLocaleString()}원
                      <span className="text-xs text-red-500 ml-1">
                        (-{(sim.price - sim.others).toLocaleString()})
                      </span>
                    </div>
                    <div className="text-center text-brand-primary font-bold">
                      {sim.dolpagu.toLocaleString()}원
                      <span className="text-xs text-green-500 ml-1">(+0)</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-brand-primary/10 rounded-lg text-center">
                <p className="text-brand-primary font-semibold">
                  100만원 거래 시 타 플랫폼 대비 <strong>20만원</strong> 더 수익!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container-1200 px-4">
          <h2 className="text-2xl font-bold text-center mb-4">자주 묻는 질문</h2>
          <p className="text-gray-600 text-center mb-12">수수료에 대해 궁금한 점을 확인하세요</p>
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
          <h2 className="text-2xl font-bold mb-4">수수료 걱정 없이 시작하세요</h2>
          <p className="text-blue-100 mb-8">판매 금액 100%를 가져가는 돌파구</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/mypage/seller/register"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-brand-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              전문가 등록하기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/seller/guide"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              전문가 가이드 보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
