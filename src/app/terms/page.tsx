import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: '이용약관 | 돌파구',
  description: '돌파구 서비스 이용약관입니다.',
  openGraph: {
    title: '이용약관 | 돌파구',
    description: '돌파구 서비스 이용약관입니다.',
    type: 'website',
    url: 'https://dolpagu.com/terms',
    siteName: '돌파구',
  },
  alternates: {
    canonical: 'https://dolpagu.com/terms',
  },
};

export default function TermsPage() {
  const sections = [
    {
      title: '제1조 (목적)',
      content:
        '본 약관은 (주)플랫폼몬스터(이하 "회사")가 운영하는 돌파구 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.',
    },
    {
      title: '제2조 (정의)',
      content: null,
      list: [
        '"서비스"란 회사가 제공하는 전문가 매칭 플랫폼 및 관련 제반 서비스를 의미합니다.',
        '"이용자"란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.',
        '"회원"이란 서비스에 가입하여 아이디(ID)를 부여받은 자로서, 서비스를 계속적으로 이용할 수 있는 자를 말합니다.',
        '"전문가"란 서비스를 통해 자신의 전문 서비스를 제공하는 회원을 말합니다.',
        '"의뢰인"이란 서비스를 통해 전문가의 서비스를 구매하는 회원을 말합니다.',
      ],
    },
    {
      title: '제3조 (약관의 효력 및 변경)',
      content: null,
      list: [
        '본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.',
        '회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위 내에서 약관을 변경할 수 있으며, 변경된 약관은 적용일 7일 전부터 공지합니다.',
        '회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.',
      ],
    },
    {
      title: '제4조 (회원가입)',
      content: null,
      list: [
        '회원가입은 이용자가 본 약관에 동의하고 회사가 정한 절차에 따라 가입신청을 하면, 회사가 이를 승낙함으로써 성립합니다.',
        '회사는 타인의 명의를 도용하거나 허위 정보를 기재한 경우 가입신청을 거부할 수 있습니다.',
      ],
    },
    {
      title: '제5조 (서비스의 제공 및 변경)',
      content:
        '회사는 전문가와 의뢰인 간의 매칭 서비스, 결제 및 정산 서비스, 서비스 관련 정보 제공 등을 제공합니다.',
    },
    {
      title: '제6조 (서비스 이용요금)',
      content: null,
      list: [
        '서비스 이용에 대한 요금은 서비스 내 별도로 명시합니다.',
        '회사는 결제된 금액에서 수수료를 제한 후 전문가에게 정산합니다.',
        '수수료율 및 정산 주기는 회사 정책에 따르며, 변경 시 사전 공지합니다.',
      ],
    },
    {
      title: '제7조 (결제 및 환불)',
      content: null,
      list: [
        '의뢰인은 서비스 이용을 위해 회사가 정한 결제수단을 통해 결제할 수 있습니다.',
        '환불은 회사의 환불정책에 따르며, 서비스 특성상 작업이 시작된 이후에는 환불이 제한될 수 있습니다.',
      ],
    },
    {
      title: '제8조 (회원의 의무)',
      content:
        '회원은 타인의 정보 도용, 서비스 운영 방해, 불법적인 목적의 서비스 이용, 타인의 명예 훼손 등을 해서는 안 됩니다.',
    },
    {
      title: '제9조 (회사의 의무)',
      content:
        '회사는 관련 법령과 본 약관이 정하는 바에 따라 지속적이고 안정적인 서비스를 제공하기 위해 노력하며, 회원의 개인정보를 보호합니다.',
    },
    {
      title: '제10조 (면책조항)',
      content:
        '회사는 통신판매중개자로서 전문가와 의뢰인 간의 거래를 중개하는 역할을 하며, 거래 당사자가 아닙니다. 상품, 상품정보, 거래에 관한 의무와 책임은 해당 전문가(판매회원)에게 있습니다.',
    },
    {
      title: '제11조 (분쟁해결)',
      content:
        '본 약관과 관련하여 분쟁이 발생한 경우, 회사와 회원은 원만한 해결을 위해 성실히 협의합니다.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark text-white py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-6 h-6" />
            <h1 className="text-2xl md:text-3xl font-bold">이용약관</h1>
          </div>
          <p className="text-sm text-blue-100">시행일: 2024년 1월 1일</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              {sections.map((section, index) => (
                <div key={index} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                  <h2 className="text-sm font-semibold text-gray-900 mb-2">{section.title}</h2>
                  {section.content && (
                    <p className="text-xs text-gray-600 leading-relaxed">{section.content}</p>
                  )}
                  {section.list && (
                    <ol className="space-y-1.5 mt-2">
                      {section.list.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-600 leading-relaxed flex gap-2">
                          <span className="text-gray-400 flex-shrink-0">{idx + 1}.</span>
                          {item}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}

              {/* 부칙 */}
              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">부칙</h2>
                <p className="text-xs text-gray-600">본 약관은 2024년 1월 1일부터 시행됩니다.</p>
              </div>

              {/* 회사 정보 */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong className="text-gray-700">(주)플랫폼몬스터</strong>
                  <br />
                  사업자등록번호: 363-06-01936 | 대표: 배미미
                  <br />
                  주소: 서울시 마포구 월드컵로 81 3층
                  <br />
                  고객센터: 070-8019-6077 | dolpagu@dolpagu.com
                </p>
              </div>
            </div>

            {/* Related Links */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/privacy"
                className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 hover:border-brand-primary transition-colors"
              >
                <span className="text-sm font-medium">개인정보처리방침</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/help"
                className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 hover:border-brand-primary transition-colors"
              >
                <span className="text-sm font-medium">고객센터</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
