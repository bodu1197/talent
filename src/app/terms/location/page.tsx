import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: '위치기반서비스 이용약관 | 돌파구',
  description: '돌파구 위치기반서비스 이용약관입니다.',
  openGraph: {
    title: '위치기반서비스 이용약관 | 돌파구',
    description: '돌파구 위치기반서비스 이용약관입니다.',
    type: 'website',
    url: 'https://dolpagu.com/terms/location',
    siteName: '돌파구',
  },
  alternates: {
    canonical: 'https://dolpagu.com/terms/location',
  },
};

export default function LocationTermsPage() {
  const sections = [
    {
      title: '제1조 (목적)',
      content:
        '본 약관은 (주)플랫폼몬스터(이하 "회사")가 제공하는 위치기반서비스(이하 "서비스")와 관련하여 회사와 개인위치정보주체 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.',
    },
    {
      title: '제2조 (정의)',
      content: null,
      list: [
        '"위치정보"란 이동성이 있는 물건 또는 개인이 특정한 시간에 존재하거나 존재하였던 장소에 관한 정보로서 전기통신설비 및 전기통신회선설비를 이용하여 수집된 것을 말합니다.',
        '"개인위치정보"란 특정 개인의 위치정보(위치정보만으로는 특정 개인의 위치를 알 수 없는 경우에도 다른 정보와 용이하게 결합하여 특정 개인의 위치를 알 수 있는 것을 포함)를 말합니다.',
        '"개인위치정보주체"란 개인위치정보에 의하여 식별되는 자를 말합니다.',
        '"위치기반서비스"란 위치정보를 이용한 서비스를 말합니다.',
      ],
    },
    {
      title: '제3조 (약관의 효력 및 변경)',
      content: null,
      list: [
        '본 약관은 서비스를 이용하고자 하는 모든 개인위치정보주체에게 그 효력이 발생합니다.',
        '회사는 위치정보의 보호 및 이용 등에 관한 법률, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련 법령에 위배되지 않는 범위에서 본 약관을 변경할 수 있습니다.',
        '약관이 변경되는 경우 회사는 변경사항을 시행일로부터 최소 7일 전에 서비스 내 공지사항 또는 이메일을 통해 공지합니다.',
      ],
    },
    {
      title: '제4조 (서비스의 내용)',
      content: '회사가 제공하는 위치기반서비스는 다음과 같습니다.',
      list: [
        '심부름 요청자와 라이더 간의 위치 매칭 서비스: 요청자의 위치를 기반으로 인근 라이더를 매칭합니다.',
        '실시간 위치 추적 서비스: 심부름 진행 중 라이더의 위치를 요청자에게 실시간으로 제공합니다.',
        '위치 기반 알림 서비스: 라이더에게 설정한 활동 지역 내 심부름 요청을 알립니다.',
        '거리 기반 요금 산정: 출발지와 목적지 간 거리를 기반으로 심부름 요금을 산정합니다.',
      ],
    },
    {
      title: '제5조 (서비스 이용요금)',
      content:
        '회사가 제공하는 위치기반서비스는 무료입니다. 다만, 무선 서비스 이용 시 발생하는 데이터 통신료는 별도이며, 이용자가 가입한 각 이동통신사의 정책에 따릅니다.',
    },
    {
      title: '제6조 (개인위치정보의 이용 또는 제공)',
      content: null,
      list: [
        '회사는 개인위치정보를 이용하여 서비스를 제공하고자 하는 경우에는 미리 약관에 명시한 후 개인위치정보주체의 동의를 받습니다.',
        '회사는 개인위치정보를 개인위치정보주체가 지정하는 제3자에게 제공하는 경우에는 개인위치정보를 수집한 해당 통신 단말장치로 매회 개인위치정보주체에게 제공받는 자, 제공일시 및 제공목적을 즉시 통보합니다.',
        '다만, 다음 각 호의 어느 하나에 해당하는 경우에는 개인위치정보주체가 미리 특정하여 지정한 통신 단말장치 또는 전자우편주소 등으로 통보합니다.',
      ],
    },
    {
      title: '제7조 (개인위치정보의 보유 및 이용기간)',
      content: null,
      list: [
        '회사는 위치기반서비스를 제공하는 동안 개인위치정보를 보유합니다.',
        '서비스 이용 중 수집된 개인위치정보는 서비스 제공 후 즉시 파기합니다. 다만, 법령에서 정한 경우에는 해당 기간 동안 보관합니다.',
        '회원 탈퇴 시 모든 개인위치정보는 즉시 파기됩니다.',
      ],
    },
    {
      title: '제8조 (개인위치정보주체의 권리)',
      content: '개인위치정보주체는 다음 각 호의 권리를 행사할 수 있습니다.',
      list: [
        '개인위치정보의 이용·제공에 대한 동의의 전부 또는 일부를 철회할 수 있습니다.',
        '개인위치정보의 이용·제공의 일시적인 중지를 요구할 수 있습니다.',
        '개인위치정보의 이용·제공사실 확인자료의 열람 또는 고지를 요구할 수 있습니다.',
        '개인위치정보의 이용·제공사실 확인자료의 오류에 대한 정정을 요구할 수 있습니다.',
      ],
    },
    {
      title: '제9조 (법정대리인의 권리)',
      content:
        '회사는 만 14세 미만 아동의 개인위치정보를 수집·이용·제공하지 않습니다. 다만, 향후 만 14세 미만 아동의 개인위치정보를 수집·이용·제공하고자 하는 경우에는 법정대리인의 동의를 받겠습니다.',
    },
    {
      title: '제10조 (8세 이하의 아동 등의 보호의무자 권리)',
      content:
        '회사는 8세 이하의 아동, 금치산자, 장애등급 1급 내지 3급에 해당하는 정신지체인의 보호의무자가 이들의 생명 또는 신체보호를 위하여 개인위치정보의 이용 또는 제공에 동의하는 경우에는 본인의 동의가 있는 것으로 봅니다.',
    },
    {
      title: '제11조 (위치정보관리책임자)',
      content:
        '회사는 위치정보를 적절히 관리·보호하고 개인위치정보주체의 불만을 원활히 처리할 수 있도록 위치정보관리책임자를 지정합니다.',
      list: ['직책: 개인정보보호책임자', '연락처: 070-8019-6077', '이메일: dolpagu@dolpagu.com'],
    },
    {
      title: '제12조 (손해배상)',
      content:
        '회사의 위치정보의 보호 및 이용 등에 관한 법률 제15조 내지 제26조의 규정을 위반한 행위로 개인위치정보주체에게 손해가 발생한 경우 개인위치정보주체는 회사에 대하여 손해배상을 청구할 수 있습니다.',
    },
    {
      title: '제13조 (분쟁의 조정)',
      content:
        '회사와 개인위치정보주체 간에 발생한 위치정보 관련 분쟁에 대해서는 당사자 간 협의가 이루어지지 않거나 협의가 불가능한 경우에는 방송통신위원회에 재정을 신청할 수 있습니다.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 text-white py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-6 h-6" />
            <h1 className="text-2xl md:text-3xl font-bold">위치기반서비스 이용약관</h1>
          </div>
          <p className="text-sm text-green-100">시행일: 2025년 1월 1일</p>
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
                className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 hover:border-green-500 transition-colors"
              >
                <span className="text-sm font-medium">이용약관</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/privacy"
                className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 hover:border-green-500 transition-colors"
              >
                <span className="text-sm font-medium">개인정보처리방침</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
