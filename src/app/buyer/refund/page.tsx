import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, AlertTriangle, XCircle, ArrowRight, Clock, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: '환불 정책 | 돌파구',
  description:
    '돌파구의 환불 정책을 안내합니다. 환불 가능 기준, 신청 방법, 처리 기간을 확인하세요.',
  keywords: ['환불 정책', '환불 안내', '취소', '돌파구'],
  openGraph: {
    title: '환불 정책 | 돌파구',
    description: '돌파구의 환불 정책을 안내합니다.',
    type: 'website',
    url: 'https://dolpagu.com/buyer/refund',
    siteName: '돌파구',
  },
  alternates: {
    canonical: 'https://dolpagu.com/buyer/refund',
  },
};

function getColorClasses(color: string) {
  const colorMap: Record<
    string,
    { bg: string; border: string; icon: string; title: string; text: string }
  > = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      title: 'text-green-900',
      text: 'text-green-800',
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-900',
      text: 'text-yellow-800',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      text: 'text-red-800',
    },
  };
  return colorMap[color] || colorMap.red;
}

export default function BuyerRefundPage() {
  const refundCases = [
    {
      type: 'full',
      icon: CheckCircle,
      title: '전액 환불',
      color: 'green',
      items: [
        '작업 시작 전 취소 요청',
        '전문가가 작업을 시작하지 않은 경우',
        '서비스 설명과 실제 제공 내용이 다른 경우',
      ],
    },
    {
      type: 'partial',
      icon: AlertTriangle,
      title: '부분 환불',
      color: 'yellow',
      items: [
        '작업 진행 중 취소 요청 (진행률에 따라 협의)',
        '전문가와 구매자 간 합의가 이루어진 경우',
      ],
    },
    {
      type: 'none',
      icon: XCircle,
      title: '환불 불가',
      color: 'red',
      items: [
        '작업 완료 후 최종 확인을 마친 경우',
        '구매자의 단순 변심 (작업 완료 후)',
        '구매자의 귀책사유로 작업이 지연된 경우',
      ],
    },
  ];

  const steps = [
    '마이페이지 > 주문 내역에서 해당 주문 선택',
    '환불 신청 버튼 클릭',
    '환불 사유 작성 및 증빙 자료 첨부',
    '관리자 검토 후 승인 (2-3 영업일)',
    '승인 시 결제 수단으로 환불 처리',
  ];

  const periods = [
    { method: '신용카드', period: '승인 후 3-5 영업일' },
    { method: '계좌이체', period: '승인 후 1-2 영업일' },
    { method: '간편결제', period: '승인 후 2-3 영업일' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark text-white py-10 md:py-12">
        <div className="container-1200 px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">환불 정책</h1>
          <p className="text-base md:text-lg text-blue-100 max-w-xl">
            환불 가능 기준과 신청 방법을 안내합니다.
          </p>
        </div>
      </section>

      {/* Refund Cases */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-6">환불 가능 기준</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {refundCases.map((refund) => {
              const colors = getColorClasses(refund.color);
              return (
                <div
                  key={refund.type}
                  className={`rounded-lg p-5 border ${colors.bg} ${colors.border}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <refund.icon className={`w-5 h-5 ${colors.icon}`} />
                    <h3 className={`text-sm font-semibold ${colors.title}`}>{refund.title}</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {refund.items.map((item, index) => (
                      <li key={index} className={`text-xs leading-relaxed ${colors.text}`}>
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Request */}
      <section className="py-10 md:py-12 bg-white">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-6">환불 신청 방법</h2>
          <div className="max-w-xl mx-auto">
            <ol className="space-y-3">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                  <span className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Processing Period */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-6">환불 처리 기간</h2>
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 p-4 bg-gray-50 border-b">
              <Clock className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-semibold">결제 수단별 처리 기간</span>
            </div>
            <ul className="divide-y">
              {periods.map((item) => (
                <li key={item.method} className="flex justify-between p-4">
                  <span className="text-sm text-gray-600">{item.method}</span>
                  <span className="text-sm font-medium">{item.period}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Help */}
      <section className="py-10 md:py-12 bg-white">
        <div className="container-1200 px-4 text-center">
          <HelpCircle className="w-10 h-10 text-brand-primary mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">도움이 필요하신가요?</h2>
          <p className="text-sm text-gray-600 mb-4">환불 관련 문의는 고객센터로 연락해주세요.</p>
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
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
            <Link
              href="/buyer/payment"
              className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-sm font-medium">결제 안내</span>
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
