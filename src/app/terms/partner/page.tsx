import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Handshake } from 'lucide-react';

export const metadata: Metadata = {
  title: '파트너 업무위수탁 약관 | 돌파구',
  description: '돌파구 파트너(라이더) 업무위수탁 약관입니다.',
  openGraph: {
    title: '파트너 업무위수탁 약관 | 돌파구',
    description: '돌파구 파트너(라이더) 업무위수탁 약관입니다.',
    type: 'website',
    url: 'https://dolpagu.com/terms/partner',
    siteName: '돌파구',
  },
  alternates: {
    canonical: 'https://dolpagu.com/terms/partner',
  },
};

export default function PartnerTermsPage() {
  const sections = [
    {
      title: '제1조 (목적)',
      content:
        '본 약관은 (주)플랫폼몬스터(이하 "회사")와 돌파구 심부름 서비스의 파트너(라이더)(이하 "파트너") 간의 업무위수탁 관계에 관한 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.',
    },
    {
      title: '제2조 (정의)',
      content: null,
      list: [
        '"심부름 서비스"란 회사가 운영하는 돌파구 플랫폼을 통해 이용자(요청자)가 요청한 배달, 구매대행, 줄서기 등의 심부름을 수행하는 서비스를 말합니다.',
        '"파트너"(라이더)란 본 약관에 동의하고 회사의 승인을 받아 심부름 서비스를 수행하는 자를 말합니다.',
        '"요청자"란 심부름 서비스를 요청하는 이용자를 말합니다.',
        '"플랫폼"이란 회사가 운영하는 돌파구 웹사이트 및 애플리케이션을 말합니다.',
      ],
    },
    {
      title: '제3조 (업무위수탁 관계)',
      content: null,
      list: [
        '파트너는 회사와 근로계약 관계에 있지 않으며, 독립적인 사업자로서 업무위수탁 계약에 따라 심부름 서비스를 수행합니다.',
        '파트너는 자유의사에 따라 심부름 요청의 수락 여부를 결정할 수 있으며, 활동 시간과 지역을 자유롭게 설정할 수 있습니다.',
        '회사는 파트너에게 근로자성에 기반한 지휘·감독을 행사하지 않습니다.',
      ],
    },
    {
      title: '제4조 (파트너 등록)',
      content: null,
      list: [
        '파트너로 등록하고자 하는 자는 회사가 정한 등록 절차를 완료하여야 합니다.',
        '파트너 등록을 위해서는 본인인증, 신분증 사본, 본인 얼굴 사진, 범죄경력회보서 제출이 필요합니다.',
        '회사는 생활물류서비스산업발전법에 따라 범죄경력 조회를 실시하며, 취업 제한 사유에 해당하는 경우 등록이 거부될 수 있습니다.',
        '회사는 파트너 등록 신청에 대해 승인 또는 거부할 수 있으며, 거부 사유를 고지할 의무가 없습니다.',
      ],
    },
    {
      title: '제5조 (파트너의 의무)',
      content: '파트너는 다음 각 호의 의무를 준수하여야 합니다.',
      list: [
        '심부름 요청 수락 후 성실하게 서비스를 수행하여야 합니다.',
        '요청자의 개인정보를 보호하고, 업무 수행 중 알게 된 정보를 제3자에게 누설하지 않아야 합니다.',
        '관련 법령 및 회사의 서비스 정책을 준수하여야 합니다.',
        '심부름 수행 중 발생하는 안전사고에 대비하여 적절한 보험에 가입하는 것을 권장합니다.',
        '플랫폼 이용료(건당 100원) 및 PG 수수료를 정산 시 공제하는 것에 동의합니다.',
      ],
    },
    {
      title: '제6조 (회사의 의무)',
      content: '회사는 다음 각 호의 의무를 이행합니다.',
      list: [
        '플랫폼을 통해 심부름 요청을 파트너에게 전달합니다.',
        '요청자로부터 수금한 서비스 대금을 정산하여 파트너에게 지급합니다.',
        '파트너의 서비스 수행에 필요한 정보를 제공합니다.',
        '파트너의 개인정보를 관련 법령에 따라 보호합니다.',
      ],
    },
    {
      title: '제7조 (서비스 대금 및 정산)',
      content: null,
      list: [
        '심부름 서비스 대금은 요청자가 플랫폼을 통해 결제합니다.',
        '회사는 서비스 대금에서 플랫폼 이용료(건당 100원)를 공제한 후 파트너에게 정산합니다.',
        '정산금 출금 시 이니시스 카드 결제 수수료(PG 수수료)가 별도로 공제됩니다.',
        '정산은 파트너가 등록한 본인 명의 계좌로 지급됩니다.',
        '정산 주기 및 방법은 회사 정책에 따르며, 변경 시 사전 공지합니다.',
      ],
    },
    {
      title: '제8조 (계약 해지)',
      content: null,
      list: [
        '파트너는 언제든지 회사에 통지함으로써 본 계약을 해지할 수 있습니다.',
        '회사는 파트너가 본 약관을 위반하거나 관련 법령에 위반되는 행위를 한 경우 계약을 해지할 수 있습니다.',
        '계약 해지 시 미정산된 서비스 대금은 해지일로부터 14일 이내에 정산됩니다.',
      ],
    },
    {
      title: '제9조 (손해배상)',
      content: null,
      list: [
        '파트너는 서비스 수행 중 자신의 고의 또는 과실로 요청자나 제3자에게 손해를 입힌 경우 그 손해를 배상할 책임이 있습니다.',
        '회사는 파트너의 서비스 수행과 관련하여 발생한 손해에 대해 직접적인 책임을 지지 않습니다.',
        '회사는 플랫폼의 기술적 결함으로 인해 파트너에게 손해가 발생한 경우 그 손해를 배상합니다.',
      ],
    },
    {
      title: '제10조 (면책)',
      content: null,
      list: [
        '회사는 천재지변, 전쟁, 테러, 폭동, 파업, 정부의 규제 등 불가항력적인 사유로 서비스를 제공하지 못하는 경우 책임이 면제됩니다.',
        '회사는 파트너의 귀책사유로 인한 서비스 장애에 대해 책임을 지지 않습니다.',
        '회사는 파트너가 플랫폼을 통해 얻은 정보를 이용하여 발생한 손해에 대해 책임을 지지 않습니다.',
      ],
    },
    {
      title: '제11조 (개인정보 보호)',
      content:
        '회사는 파트너의 개인정보를 관련 법령 및 회사의 개인정보처리방침에 따라 보호합니다. 파트너의 개인정보는 서비스 제공 및 정산 목적으로만 이용되며, 법령에서 정한 경우를 제외하고 제3자에게 제공되지 않습니다.',
    },
    {
      title: '제12조 (분쟁 해결)',
      content: null,
      list: [
        '본 약관과 관련하여 분쟁이 발생한 경우, 회사와 파트너는 원만한 해결을 위해 성실히 협의합니다.',
        '협의로 해결되지 않는 분쟁은 회사의 소재지를 관할하는 법원을 제1심 관할 법원으로 합니다.',
      ],
    },
    {
      title: '제13조 (약관의 변경)',
      content:
        '회사는 관련 법령에 위배되지 않는 범위에서 본 약관을 변경할 수 있으며, 변경된 약관은 적용일 7일 전부터 플랫폼 내 공지사항 또는 이메일을 통해 공지합니다.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="flex items-center gap-3 mb-3">
            <Handshake className="w-6 h-6" />
            <h1 className="text-2xl md:text-3xl font-bold">파트너 업무위수탁 약관</h1>
          </div>
          <p className="text-sm text-orange-100">시행일: 2025년 1월 1일</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              {sections.map((section) => (
                <div
                  key={section.title}
                  className="border-b border-gray-100 pb-5 last:border-0 last:pb-0"
                >
                  <h2 className="text-sm font-semibold text-gray-900 mb-2">{section.title}</h2>
                  {section.content && (
                    <p className="text-xs text-gray-600 leading-relaxed">{section.content}</p>
                  )}
                  {section.list && (
                    <ol className="space-y-1.5 mt-2">
                      {section.list.map((item, idx) => (
                        <li
                          key={`${section.title}-${idx}`}
                          className="text-xs text-gray-600 leading-relaxed flex gap-2"
                        >
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
                <p className="text-xs text-gray-600">본 약관은 2025년 1월 1일부터 시행됩니다.</p>
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
                href="/terms"
                className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 hover:border-orange-500 transition-colors"
              >
                <span className="text-sm font-medium">이용약관</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/errands/register/guide"
                className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 hover:border-orange-500 transition-colors"
              >
                <span className="text-sm font-medium">라이더 등록 안내</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
