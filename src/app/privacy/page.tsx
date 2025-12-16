import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: '개인정보처리방침 | 돌파구',
  description: '돌파구 개인정보처리방침입니다.',
  openGraph: {
    title: '개인정보처리방침 | 돌파구',
    description: '돌파구 개인정보처리방침입니다.',
    type: 'website',
    url: 'https://dolpagu.com/privacy',
    siteName: '돌파구',
  },
  alternates: {
    canonical: 'https://dolpagu.com/privacy',
  },
};

export default function PrivacyPage() {
  const sections = [
    {
      title: '제1조 (개인정보의 수집 항목 및 수집 방법)',
      content: null,
      subsections: [
        {
          subtitle: '수집하는 개인정보 항목',
          items: [
            '필수항목: 이메일, 비밀번호, 이름(닉네임), 휴대폰번호',
            '선택항목: 프로필 사진, 주소, 계좌정보(전문가의 경우)',
            '자동 수집: IP주소, 쿠키, 서비스 이용기록, 접속 로그',
          ],
        },
        {
          subtitle: '개인정보 수집 방법',
          items: ['홈페이지 회원가입 및 서비스 이용', '전문가 등록 신청', '고객센터 문의'],
        },
      ],
    },
    {
      title: '제2조 (개인정보의 수집 및 이용 목적)',
      content: null,
      items: [
        '회원 관리: 회원제 서비스 이용, 본인확인, 불량회원 부정이용 방지',
        '서비스 제공: 전문가 매칭 서비스, 결제 및 정산, 콘텐츠 제공',
        '마케팅 및 광고: 이벤트 및 광고성 정보 제공(선택 동의 시)',
        '서비스 개선: 서비스 이용 통계, 서비스 개선 및 신규 서비스 개발',
      ],
    },
    {
      title: '제3조 (개인정보의 보유 및 이용 기간)',
      content: '회원 탈퇴 시 개인정보는 즉시 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우:',
      items: [
        '계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)',
        '대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)',
        '소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)',
        '로그인 기록: 3개월 (통신비밀보호법)',
      ],
    },
    {
      title: '제4조 (개인정보의 제3자 제공)',
      content:
        '회사는 이용자의 동의 또는 법률의 특별한 규정이 있는 경우에만 제3자에게 개인정보를 제공합니다. 결제 처리를 위해 결제대행사(포트원 등)에 결제정보를 제공할 수 있습니다.',
    },
    {
      title: '제5조 (개인정보 처리의 위탁)',
      content: null,
      table: [
        { company: 'AWS', task: '데이터 보관 및 서버 운영' },
        { company: '포트원', task: '결제 처리' },
      ],
    },
    {
      title: '제6조 (정보주체의 권리)',
      content:
        '이용자는 개인정보주체로서 개인정보 열람, 정정·삭제, 처리정지를 요구할 수 있습니다. 서면, 이메일 등을 통해 요청하시면 지체없이 조치하겠습니다.',
    },
    {
      title: '제7조 (개인정보의 파기)',
      content:
        '회사는 개인정보 보유기간의 경과, 처리목적 달성 시 지체없이 해당 개인정보를 파기합니다. 전자적 파일은 복구 불가능한 방법으로 삭제합니다.',
    },
    {
      title: '제8조 (개인정보의 안전성 확보조치)',
      content: null,
      items: [
        '개인정보 취급 직원의 최소화 및 교육',
        '개인정보에 대한 접근 제한',
        '비밀번호 등 개인정보의 암호화',
        '보안프로그램 설치 및 주기적 갱신',
        '개인정보의 암호화 전송(SSL)',
      ],
    },
    {
      title: '제9조 (쿠키의 설치·운영 및 거부)',
      content:
        '회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 쿠키를 사용합니다. 웹브라우저 설정을 통해 쿠키 허용 또는 거부를 할 수 있습니다.',
    },
    {
      title: '제10조 (개인정보 보호책임자)',
      content: null,
      contact: {
        name: '배미미',
        position: '대표이사',
        email: 'dolpagu@dolpagu.com',
      },
    },
    {
      title: '제11조 (권익침해 구제방법)',
      content: null,
      items: [
        '개인정보분쟁조정위원회: 1833-6972 (www.kopico.go.kr)',
        '개인정보침해신고센터: 118 (privacy.kisa.or.kr)',
        '대검찰청: 1301 (www.spo.go.kr)',
        '경찰청: 182 (ecrm.cyber.go.kr)',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark text-white py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6" />
            <h1 className="text-2xl md:text-3xl font-bold">개인정보처리방침</h1>
          </div>
          <p className="text-sm text-blue-100">시행일: 2024년 1월 1일</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                (주)플랫폼몬스터(이하 "회사")는 개인정보보호법 등 관련 법령에 따라 이용자의
                개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기
                위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
              </p>

              <div className="space-y-6">
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 pb-5 last:border-0 last:pb-0"
                  >
                    <h2 className="text-sm font-semibold text-gray-900 mb-2">{section.title}</h2>

                    {section.content && (
                      <p className="text-xs text-gray-600 leading-relaxed">{section.content}</p>
                    )}

                    {section.subsections?.map((sub, subIdx) => (
                      <div key={subIdx} className="mt-2">
                        <h3 className="text-xs font-medium text-gray-700 mb-1">{sub.subtitle}</h3>
                        <ul className="space-y-1">
                          {sub.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="text-xs text-gray-600 flex gap-2">
                              <span className="text-gray-400">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {section.items && (
                      <ul className="space-y-1 mt-2">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex gap-2">
                            <span className="text-gray-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.table && (
                      <div className="mt-2 overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-3 py-2 text-left font-medium text-gray-700 border">
                                수탁업체
                              </th>
                              <th className="px-3 py-2 text-left font-medium text-gray-700 border">
                                위탁업무
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {section.table.map((row, idx) => (
                              <tr key={idx}>
                                <td className="px-3 py-2 text-gray-600 border">{row.company}</td>
                                <td className="px-3 py-2 text-gray-600 border">{row.task}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {section.contact && (
                      <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600">
                        <p className="font-medium text-gray-700 mb-1">개인정보 보호책임자</p>
                        <p>성명: {section.contact.name}</p>
                        <p>직책: {section.contact.position}</p>
                        <p>이메일: {section.contact.email}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* 부칙 */}
                <div className="pt-4 border-t border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-900 mb-2">부칙</h2>
                  <p className="text-xs text-gray-600">
                    본 개인정보처리방침은 2024년 1월 1일부터 시행됩니다.
                  </p>
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
            </div>

            {/* Related Links */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/terms"
                className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 hover:border-brand-primary transition-colors"
              >
                <span className="text-sm font-medium">이용약관</span>
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
