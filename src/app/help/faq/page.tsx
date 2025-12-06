'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight, HelpCircle } from 'lucide-react';

const faqs = [
  {
    category: '회원가입/로그인',
    items: [
      {
        question: '회원가입은 어떻게 하나요?',
        answer:
          '홈페이지 우측 상단의 "회원가입" 버튼을 클릭하고 이메일과 비밀번호를 입력하시면 됩니다. 소셜 로그인(구글, 카카오)도 가능합니다.',
      },
      {
        question: '비밀번호를 잊어버렸어요.',
        answer:
          '로그인 페이지에서 "비밀번호 찾기"를 클릭하고 가입 시 등록한 이메일을 입력하시면 비밀번호 재설정 링크가 전송됩니다.',
      },
    ],
  },
  {
    category: '서비스 구매',
    items: [
      {
        question: '서비스는 어떻게 구매하나요?',
        answer:
          '원하는 서비스를 선택하고 패키지를 고른 후 결제하기 버튼을 클릭하세요. 결제 완료 후 전문가와 채팅으로 작업을 시작할 수 있습니다.',
      },
      {
        question: '결제 수단은 무엇이 있나요?',
        answer:
          '신용카드, 체크카드, 계좌이체, 간편결제(카카오페이, 네이버페이) 등 다양한 결제 수단을 지원합니다.',
      },
      {
        question: '환불은 가능한가요?',
        answer:
          '작업 시작 전이라면 전액 환불이 가능합니다. 작업 진행 중에는 진행 정도에 따라 부분 환불이 가능하며, 완료 후에는 환불이 불가능합니다.',
      },
    ],
  },
  {
    category: '전문가',
    items: [
      {
        question: '전문가 등록은 어떻게 하나요?',
        answer:
          '마이페이지에서 "전문가 전환" 메뉴를 선택하고 필요한 정보를 입력하시면 됩니다. 심사 후 승인되면 서비스를 등록할 수 있습니다.',
      },
      {
        question: '수수료는 얼마인가요?',
        answer:
          '돌파구는 전문가와 구매자 모두 수수료가 0원입니다! 판매가의 100%를 수익으로 가져갈 수 있습니다.',
      },
      {
        question: '정산은 언제 받을 수 있나요?',
        answer:
          '최소 정산 금액인 10,000원 이상이 되면 언제든지 정산 신청이 가능하며, 신청 후 1-3 영업일 내에 입금됩니다.',
      },
    ],
  },
  {
    category: '기타',
    items: [
      {
        question: '분쟁이 발생하면 어떻게 하나요?',
        answer:
          '구매자와 전문가 간 분쟁이 발생하면 고객센터에 중재를 요청하실 수 있습니다. 공정한 심사를 통해 해결해드립니다.',
      },
      {
        question: '서비스 이용 중 문제가 생기면 어디로 문의하나요?',
        answer: '고객센터의 1:1 문의를 이용하시거나 이메일(dolpagu@dolpagu.com)로 문의해주세요.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.flatMap((category) =>
      category.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      }))
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark text-white py-10 md:py-12">
        <div className="container-1200 px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">자주 묻는 질문</h1>
          <p className="text-base md:text-lg text-blue-100">궁금한 점을 빠르게 확인하세요.</p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="max-w-3xl mx-auto">
            {faqs.map((category, categoryIndex) => (
              <div key={category.category} className="mb-8">
                <h2 className="text-sm md:text-base font-semibold mb-4 text-brand-primary">
                  {category.category}
                </h2>
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => {
                    const key = `${categoryIndex}-${itemIndex}`;
                    const isOpen = openItems[key];

                    return (
                      <div
                        key={key}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(categoryIndex, itemIndex)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-2 text-left">
                            <span className="text-brand-primary font-semibold text-sm">Q.</span>
                            <span className="text-sm font-medium">{item.question}</span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 font-semibold text-sm">A.</span>
                              <p className="text-xs text-gray-700 leading-relaxed">{item.answer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help */}
      <section className="py-10 md:py-12 bg-white">
        <div className="container-1200 px-4 text-center">
          <HelpCircle className="w-10 h-10 text-brand-primary mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">원하는 답변을 찾지 못하셨나요?</h2>
          <p className="text-sm text-gray-600 mb-4">1:1 문의를 통해 직접 질문해주세요.</p>
          <Link
            href="/help/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
          >
            1:1 문의하기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
