import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Bike,
  FileText,
  Shield,
  UserCheck,
  Camera,
  CreditCard,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Clock,
  BadgeCheck,
  FileSearch,
  Fingerprint,
  HelpCircle,
  Phone,
  Ban,
  Scale,
} from 'lucide-react';

export const metadata: Metadata = {
  title: '심부름꾼 등록 가이드 | 돌파구',
  description:
    '돌파구 심부름꾼 등록 안내입니다. 안전한 대면 서비스를 위해 신원 검증, 범죄경력 조회, 서류 심사 등 엄격한 등록 절차를 안내합니다.',
  keywords: ['심부름꾼 등록', '라이더 등록', '배달 파트너', '심부름 서비스', '돌파구'],
  openGraph: {
    title: '심부름꾼 등록 가이드 | 돌파구',
    description: '안전한 심부름 서비스를 위한 엄격한 등록 절차를 안내합니다.',
    type: 'website',
    url: 'https://dolpagu.com/helper/guide',
    siteName: '돌파구',
  },
  alternates: {
    canonical: 'https://dolpagu.com/helper/guide',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HelperGuidePage() {
  const requirements = [
    {
      icon: UserCheck,
      title: '만 19세 이상',
      description: '성인만 등록 가능합니다',
    },
    {
      icon: Fingerprint,
      title: '본인 명의 휴대폰',
      description: '본인인증이 필요합니다',
    },
    {
      icon: FileSearch,
      title: '범죄경력 조회 동의',
      description: '경찰청 범죄경력 조회에 동의해야 합니다',
    },
    {
      icon: BadgeCheck,
      title: '결격사유 없음',
      description: '심부름 수행에 결격사유가 없어야 합니다',
    },
  ];

  const documents = [
    {
      icon: Camera,
      title: '신분증 사본',
      description: '주민등록증, 운전면허증, 여권 중 1개',
      required: true,
    },
    {
      icon: FileText,
      title: '범죄경력회보서',
      description: '경찰서 또는 정부24에서 발급 (3개월 이내)',
      required: true,
    },
    {
      icon: FileSearch,
      title: '성범죄경력조회서',
      description: '경찰서 또는 정부24에서 발급 (3개월 이내)',
      required: true,
    },
    {
      icon: CreditCard,
      title: '정산 계좌 정보',
      description: '본인 명의 은행 계좌',
      required: true,
    },
    {
      icon: Phone,
      title: '본인 휴대폰 인증',
      description: '본인 명의 휴대폰 번호',
      required: true,
    },
  ];

  const steps = [
    {
      step: '1단계',
      title: '기본 정보 입력',
      description: '이름, 연락처, 주소 등 기본 정보를 입력합니다.',
    },
    {
      step: '2단계',
      title: '본인인증',
      description: '본인 명의 휴대폰으로 본인인증을 진행합니다.',
    },
    {
      step: '3단계',
      title: '서류 제출',
      description: '신분증, 범죄경력회보서, 성범죄경력조회서를 업로드합니다.',
    },
    {
      step: '4단계',
      title: '심사 대기',
      description: '제출된 서류를 검토합니다. (영업일 기준 1-3일 소요)',
    },
    {
      step: '5단계',
      title: '승인 완료',
      description: '심사 통과 시 심부름꾼으로 활동을 시작합니다.',
    },
  ];

  const disqualifications = [
    '폭력, 절도, 사기 등 범죄 경력이 있는 경우',
    '성범죄 경력이 있는 경우',
    '마약류 관련 범죄 경력이 있는 경우',
    '아동학대 관련 범죄 경력이 있는 경우',
    '신분증이 위조되었거나 본인이 아닌 경우',
    '허위 정보를 제출한 경우',
  ];

  const faqs = [
    {
      question: '범죄경력회보서는 어디서 발급받나요?',
      answer:
        '가까운 경찰서 민원실 또는 정부24(www.gov.kr)에서 온라인으로 발급받을 수 있습니다. 발급 수수료는 무료입니다.',
    },
    {
      question: '심사 기간은 얼마나 걸리나요?',
      answer:
        '서류가 모두 정상적으로 제출된 경우 영업일 기준 1-3일 이내에 심사가 완료됩니다. 보완이 필요한 경우 별도 안내드립니다.',
    },
    {
      question: '심사 탈락 시 재신청이 가능한가요?',
      answer:
        '탈락 사유에 따라 다릅니다. 단순 서류 미비의 경우 재신청이 가능하나, 결격사유에 해당하는 경우 등록이 불가합니다.',
    },
    {
      question: '외국인도 등록할 수 있나요?',
      answer:
        '대한민국에서 합법적으로 취업이 가능한 체류자격(F-4, F-5, F-6, H-2, E-7 등)을 가진 외국인은 등록이 가능합니다. 외국인등록증과 체류자격 증명이 필요합니다.',
    },
    {
      question: '개인정보는 어떻게 보호되나요?',
      answer:
        '제출하신 모든 서류와 개인정보는 암호화되어 안전하게 보관되며, 심부름꾼 등록 심사 목적으로만 사용됩니다. 개인정보처리방침에 따라 엄격히 관리됩니다.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: '돌파구 심부름꾼 등록 가이드',
    description: '안전한 심부름 서비스를 위한 등록 절차',
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
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="flex items-center gap-3 mb-3">
            <Bike className="w-8 h-8" />
            <h1 className="text-2xl md:text-3xl font-bold">심부름꾼 등록 가이드</h1>
          </div>
          <p className="text-base md:text-lg text-orange-100 mb-5 max-w-xl">
            안전한 대면 서비스를 위해 엄격한 등록 절차를 운영합니다.
          </p>
          <Link
            href="/errands/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-orange-600 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            등록 신청하기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Safety Notice */}
      <section className="py-6 bg-red-50 border-b border-red-100">
        <div className="container-1200 px-4">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-red-800 mb-1">
                안전한 서비스를 위한 엄격한 검증
              </h2>
              <p className="text-xs text-red-700 leading-relaxed">
                심부름 서비스는 고객과 대면하는 업무입니다. 고객의 안전을 최우선으로 하여{' '}
                <strong>범죄경력 조회, 성범죄경력 조회, 신원 확인</strong>을 필수로 진행합니다. 이는
                배달의민족, 쿠팡이츠, 당근마켓 등 주요 플랫폼의 기준을 따릅니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-3">등록 자격 요건</h2>
          <p className="text-xs md:text-sm text-gray-600 text-center mb-8">
            아래 조건을 모두 충족해야 심부름꾼으로 등록할 수 있습니다
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {requirements.map((req) => (
              <div key={req.title} className="bg-white rounded-lg p-4 shadow-sm text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <req.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-sm font-semibold mb-1">{req.title}</h3>
                <p className="text-xs text-gray-500">{req.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Required Documents */}
      <section className="py-10 md:py-12 bg-white">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-3">필수 제출 서류</h2>
          <p className="text-xs md:text-sm text-gray-600 text-center mb-8">
            모든 서류는 본인 명의로 3개월 이내 발급된 것이어야 합니다
          </p>
          <div className="max-w-2xl mx-auto space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.title}
                className="flex items-start gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <doc.icon className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold">{doc.title}</h3>
                    {doc.required && (
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-medium rounded">
                        필수
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{doc.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Document Tips */}
          <div className="max-w-2xl mx-auto mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              서류 발급 안내
            </h3>
            <ul className="text-xs text-blue-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>범죄경력회보서:</strong> 정부24(gov.kr) → 범죄경력회보서 신청 (취업용,
                  무료)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>성범죄경력조회서:</strong> 정부24(gov.kr) → 성범죄경력조회 신청 (취업용,
                  무료)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>발급까지 1-2일 소요될 수 있으니 미리 준비해주세요</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Registration Steps */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-8">등록 절차</h2>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              {steps.map((step, index) => (
                <div key={step.step} className="flex gap-4 mb-6 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-full bg-orange-200 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <span className="text-xs font-medium text-orange-600">{step.step}</span>
                    <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
                    <p className="text-xs text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Disqualifications */}
      <section className="py-10 md:py-12 bg-gray-900 text-white">
        <div className="container-1200 px-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Ban className="w-6 h-6 text-red-400" />
            <h2 className="text-lg md:text-xl font-bold">등록 불가 사유</h2>
          </div>
          <p className="text-xs md:text-sm text-gray-400 text-center mb-6">
            아래 사항에 해당하는 경우 심부름꾼 등록이 불가합니다
          </p>
          <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-3">
            {disqualifications.map((item) => (
              <div key={item} className="flex items-start gap-2 bg-gray-800 rounded-lg p-3">
                <Scale className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-300">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-6">
            * 결격사유 확인 시 등록이 즉시 취소되며, 기존 활동 내역도 정지될 수 있습니다.
          </p>
        </div>
      </section>

      {/* Benefits after registration */}
      <section className="py-10 md:py-12 bg-white">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-3">심부름꾼 혜택</h2>
          <p className="text-xs md:text-sm text-gray-600 text-center mb-8">
            등록 완료 후 아래 혜택을 누리세요
          </p>
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-100">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-sm font-semibold mb-1">30일 무료 체험</h3>
              <p className="text-xs text-gray-600">첫 달은 무료로 이용하세요</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-100">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-sm font-semibold mb-1">수수료 0%</h3>
              <p className="text-xs text-gray-600">수익금 100% 본인 수령</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-100">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-sm font-semibold mb-1">안전 보장</h3>
              <p className="text-xs text-gray-600">검증된 의뢰인과 매칭</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-6">자주 묻는 질문</h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
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
      <section className="py-10 md:py-12 bg-orange-500 text-white text-center">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold mb-3">심부름꾼으로 시작하세요</h2>
          <p className="text-sm text-orange-100 mb-6">안전한 플랫폼에서 수익을 올려보세요</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/errands/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-orange-600 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              등록 신청하기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/help/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-white text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              문의하기
            </Link>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
            <Link
              href="/errands"
              className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-sm font-medium">심부름 둘러보기</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/help/faq"
              className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-sm font-medium">자주 묻는 질문</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
