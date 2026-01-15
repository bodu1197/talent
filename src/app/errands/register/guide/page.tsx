import Link from 'next/link';
import {
  Fingerprint,
  FileText,
  CreditCard,
  CheckCircle,
  Shield,
  Clock,
  Wallet,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  Bike,
  MapPin,
} from 'lucide-react';

export const metadata = {
  title: '라이더 등록 안내 | 돌파구 심부름',
  description:
    '돌파구 심부름 라이더가 되어 자유롭게 수익을 창출하세요. 등록 절차, 필요 서류, 혜택을 안내합니다.',
};

const REGISTRATION_STEPS = [
  {
    step: 1,
    title: '본인인증',
    icon: Fingerprint,
    description: '휴대폰 본인인증으로 신원을 확인합니다.',
    details: [
      '본인 명의 휴대폰 필요',
      '이름, 생년월일, 성별 자동 입력',
      '만 19세 이상만 등록 가능',
    ],
    color: 'blue',
  },
  {
    step: 2,
    title: '서류 제출',
    icon: FileText,
    description: '안전한 서비스를 위한 서류를 제출합니다.',
    details: [
      '신분증 사본 (주민등록증, 운전면허증, 여권 중 1개)',
      '본인 얼굴 사진 (셀카)',
      '범죄경력회보서 (정부24에서 무료 발급)',
    ],
    color: 'green',
  },
  {
    step: 3,
    title: '계좌 정보',
    icon: CreditCard,
    description: '수익금을 받을 정산 계좌를 등록합니다.',
    details: ['본인 명의 계좌만 등록 가능', '주요 은행 모두 지원', '자기소개 작성 (선택)'],
    color: 'purple',
  },
  {
    step: 4,
    title: '약관 동의 및 심사',
    icon: CheckCircle,
    description: '약관에 동의하고 심사를 기다립니다.',
    details: [
      '라이더 이용약관 동의',
      '개인정보 수집 및 이용 동의',
      '범죄경력 조회 동의',
      '심사 기간: 영업일 1-3일',
    ],
    color: 'orange',
  },
];

// 색상별 클래스 반환 함수
function getColorClass(color: string): string {
  switch (color) {
    case 'blue':
      return 'bg-blue-100 text-blue-600';
    case 'green':
      return 'bg-green-100 text-green-600';
    case 'purple':
      return 'bg-purple-100 text-purple-600';
    default:
      return 'bg-orange-100 text-orange-600';
  }
}

const BENEFITS = [
  {
    icon: Wallet,
    title: '건당 100원',
    description: '심부름 금액 상관없이 고정 수수료',
  },
  {
    icon: Clock,
    title: '자유로운 시간',
    description: '원할 때 원하는 만큼 활동',
  },
  {
    icon: MapPin,
    title: '원하는 지역',
    description: '활동 지역 직접 선택 가능',
  },
];

export default function RiderRegisterGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Bike className="w-6 h-6" />
            </div>
            <span className="text-orange-100 text-sm font-medium">돌파구 심부름</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            라이더로 등록하고
            <br />
            자유롭게 수익을 창출하세요
          </h1>
          <p className="text-orange-100 text-sm md:text-base mb-8 max-w-xl">
            배달, 구매대행, 줄서기 등 다양한 심부름을 수행하고 수익을 얻으세요. 원하는 시간에 원하는
            만큼, 자유롭게 활동할 수 있습니다.
          </p>

          {/* 혜택 카드 */}
          <div className="grid grid-cols-3 gap-3">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="bg-white/10 backdrop-blur rounded-xl p-3 md:p-4">
                <benefit.icon className="w-5 h-5 mb-2 text-orange-200" />
                <p className="font-semibold text-sm">{benefit.title}</p>
                <p className="text-xs text-orange-200 mt-0.5">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 등록 절차 */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">
          라이더 등록 절차
        </h2>
        <p className="text-gray-600 text-sm text-center mb-8">4단계로 간편하게 등록하세요</p>

        <div className="space-y-4">
          {REGISTRATION_STEPS.map((item, index) => (
            <div key={item.step} className="bg-white rounded-xl border border-gray-200 p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getColorClass(item.color)}`}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-400">STEP {item.step}</span>
                    {index < REGISTRATION_STEPS.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-gray-300" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  <ul className="space-y-1.5">
                    {item.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 범죄경력회보서 안내 */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">범죄경력회보서 제출 안내</h3>
              <p className="text-gray-400 text-sm mb-4">
                2025년 1월 17일부터 시행된{' '}
                <strong className="text-white">생활물류서비스산업발전법</strong>에 따라
                범죄경력회보서 제출이 의무화되었습니다.
              </p>

              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  취업 제한 사유
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 살인·성범죄: 20년 취업 제한</li>
                  <li>• 절도 상습범: 18년 취업 제한</li>
                  <li>• 마약류 범죄: 2~10년 취업 제한</li>
                </ul>
              </div>

              <div className="bg-blue-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">발급 방법</h4>
                <ol className="text-sm text-gray-300 space-y-1">
                  <li>1. 정부24 접속</li>
                  <li>2. &quot;범죄경력회보서&quot; 검색</li>
                  <li>3. &quot;취업용&quot; 선택</li>
                  <li>4. 성범죄경력 조회 포함 체크</li>
                  <li>5. 무료 발급 완료</li>
                </ol>
                <a
                  href="https://www.gov.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  정부24 바로가기
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 요금 안내 */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">요금 안내</h2>
        <p className="text-gray-600 text-sm text-center mb-8">투명하고 합리적인 요금 정책</p>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-200 p-6 md:p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="text-center">
              <p className="text-sm text-orange-600 font-medium mb-1">플랫폼 이용료</p>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">
                건당 100<span className="text-lg font-normal text-gray-500">원</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">심부름 금액과 상관없이 고정</p>
            </div>
          </div>

          <div className="border-t border-orange-200 pt-4">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                심부름 대금에서 <strong>100원만 공제</strong>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                나머지는 <strong>100% 본인 수익</strong>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                언제든 <strong>해지 가능</strong>
              </li>
            </ul>
          </div>

          <div className="border-t border-orange-200 mt-4 pt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">
                <strong className="text-gray-800">출금 시 안내:</strong> 정산금 출금 시 이니시스
                카드 결제 수수료(PG 수수료)가 별도로 공제됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 text-center">
            자주 묻는 질문
          </h2>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">심사는 얼마나 걸리나요?</h3>
              <p className="text-sm text-gray-600">
                영업일 기준 1-3일 내에 심사가 완료됩니다. 심사 결과는 등록된 휴대폰 번호로
                안내드립니다.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">차량이 없어도 등록할 수 있나요?</h3>
              <p className="text-sm text-gray-600">
                네, 가능합니다. 도보, 자전거, 대중교통을 이용한 심부름도 수행할 수 있습니다.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">정산은 어떻게 되나요?</h3>
              <p className="text-sm text-gray-600">
                심부름 완료 후 고객의 결제가 확인되면 등록된 계좌로 정산됩니다. 심부름 대금에서
                플랫폼 이용료 100원과 출금 시 PG 수수료(이니시스 카드 결제 수수료)가 공제됩니다.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">활동 지역을 변경할 수 있나요?</h3>
              <p className="text-sm text-gray-600">
                네, 마이페이지에서 언제든 활동 지역을 변경할 수 있습니다. 설정한 지역의 심부름이
                우선 노출됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/errands/register"
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-base transition-colors shadow-lg shadow-orange-500/30"
          >
            <Bike className="w-5 h-5" />
            라이더 등록 신청하기
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-center text-xs text-gray-500 mt-2">
            이미 라이더이신가요?{' '}
            <Link href="/errands/mypage/helper" className="text-orange-600 hover:underline">
              라이더 대시보드로 이동
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
