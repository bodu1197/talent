"use client";

import Link from "next/link";
import {
  Banknote,
  TrendingUp,
  Frown,
  Star,
  XCircle,
  Meh,
  CheckCircle,
  Smile,
  CircleDollarSign,
  Sparkles,
  Zap,
  Megaphone,
  Clock,
  Lightbulb,
} from "lucide-react";

export default function ExpertRegisterPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-brand-primary text-white">
        <div className="container-1200 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              수수료 0원 · 영구 무료
            </div>
            <h1 className="text-4xl md:text-[40px] font-semibold mb-6">
              수수료 때문에
              <br />
              가격 올리기 이제 그만!
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              수수료 0원으로 가격 경쟁력을 확보하고
              <br />더 많은 주문과 수익을 경험하세요
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-lg px-8 py-4 rounded-lg transition-all"
            >
              지금 무료로 시작하기 →
            </Link>
          </div>
        </div>
      </div>

      {/* Pain Points */}
      <div className="bg-gray-50 py-16">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              다른 플랫폼에서 이런 고민 하셨나요?
            </h2>
            <p className="text-gray-600">수수료 때문에 판매자들이 겪는 현실</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
              <div className="text-brand-primary font-semibold text-lg mb-3 flex items-center gap-2">
                <Banknote className="w-5 h-5" /> 수수료 스트레스
              </div>
              <div className="space-y-2 text-gray-700 text-sm">
                <p>• "20% 수수료를 내고 나면 남는게 별로 없어요..."</p>
                <p>• "열심히 일했는데 수수료가 너무 많이 떼여요"</p>
                <p>• "매달 수수료 낼 때마다 아깝고 억울해요"</p>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
              <div className="text-brand-primary font-semibold text-lg mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> 가격 부담의 악순환
              </div>
              <div className="space-y-2 text-gray-700 text-sm">
                <p>• "수수료 때문에 가격을 올려야 하는데..."</p>
                <p>• "가격이 높으니까 주문이 안 들어와요"</p>
                <p>• "경쟁자들보다 비싸 보여서 고민이에요"</p>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
              <div className="text-brand-primary font-semibold text-lg mb-3 flex items-center gap-2">
                <Frown className="w-5 h-5" /> 억울한 손실
              </div>
              <div className="space-y-2 text-gray-700 text-sm">
                <p>• "내가 번 돈인데 왜 이렇게 많이 떼가죠?"</p>
                <p>• "수수료로 나간 돈이면 생활비가 되는데..."</p>
                <p>• "플랫폼은 뭐하고 이렇게 많이 가져가나요?"</p>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
              <div className="text-brand-primary font-semibold text-lg mb-3 flex items-center gap-2">
                <Meh className="w-5 h-5" /> 가격 경쟁력 상실
              </div>
              <div className="space-y-2 text-gray-700 text-sm">
                <p>• "수수료 포함하면 고객한테 너무 비싸요"</p>
                <p>• "가격 낮추면 제 수익이 없고, 올리면 주문이 없고"</p>
                <p>• "결국 수수료 때문에 경쟁에서 밀려요"</p>
              </div>
            </div>
          </div>

          <div className="bg-brand-primary text-white p-8 rounded-lg mt-8 max-w-5xl mx-auto text-center">
            <div className="text-2xl font-semibold mb-4 flex items-center justify-center gap-2">
              <Star className="w-6 h-6" /> 해결책은 간단합니다
            </div>
            <div className="text-xl mb-6">수수료 0원 플랫폼으로 옮기세요!</div>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
                <div className="font-semibold mb-2">낮은 가격 제시</div>
                <div className="text-sm text-gray-200">
                  수수료 없으니 가격 경쟁력 확보
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
                <div className="font-semibold mb-2">주문 증가</div>
                <div className="text-sm text-gray-200">
                  합리적 가격에 고객이 몰려요
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
                <div className="font-semibold mb-2">수익 극대화</div>
                <div className="text-sm text-gray-200">
                  벌어들인 돈 100% 내 것
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="py-16 bg-white">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              비교해보세요
            </h2>
            <p className="text-gray-600">같은 서비스, 다른 결과</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-100 p-8 rounded-lg">
              <div className="text-gray-500 font-semibold text-sm mb-4 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> 타 플랫폼 (수수료 20%)
              </div>
              <div className="space-y-3 text-gray-700">
                <p className="flex items-center gap-2">
                  <Meh className="w-4 h-4" /> 수수료 때문에 가격을 높게 책정
                </p>
                <p className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> 높은 가격 → 주문 감소
                </p>
                <p className="flex items-center gap-2">
                  <Banknote className="w-4 h-4" /> 적은 주문 + 수수료 차감 = 낮은 수익
                </p>
                <p className="flex items-center gap-2">
                  <Frown className="w-4 h-4" /> 스트레스만 쌓이고 포기하고 싶음
                </p>
              </div>
            </div>

            <div className="bg-brand-primary text-white p-8 rounded-lg">
              <div className="text-yellow-400 font-semibold text-sm mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> 우리 플랫폼 (수수료 0%)
              </div>
              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <Smile className="w-4 h-4" /> 수수료 걱정 없이 합리적 가격 책정
                </p>
                <p className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> 경쟁력 있는 가격 → 주문 증가
                </p>
                <p className="flex items-center gap-2">
                  <CircleDollarSign className="w-4 h-4" /> 많은 주문 × 수수료 0원 = 최고 수익
                </p>
                <p className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 더 많이 벌고 더 행복해짐!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-gray-50 py-16">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              왜 우리 플랫폼을 선택해야 할까요?
            </h2>
            <p className="text-gray-600">
              판매자의 성공이 곧 우리의 성공입니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center mb-4 text-white">
                <CircleDollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                수수료 0원
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                수수료 걱정 없이 합리적인 가격으로 서비스를 판매하세요.
              </p>
              <div className="text-brand-primary font-semibold text-sm">
                ✓ 가격 부담 없이 경쟁력 확보
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center mb-4 text-white">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                빠른 정산
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                작업 완료 후 즉시 출금 가능. 복잡한 절차 없이 당일 정산.
              </p>
              <div className="text-brand-primary font-semibold text-sm">
                ✓ 당일 출금 가능
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center mb-4 text-white">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                적극적 마케팅
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                SEO 최적화와 광고로 당신의 서비스를 활발히 홍보합니다.
              </p>
              <div className="text-brand-primary font-semibold text-sm">
                ✓ 무료 홍보 지원
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center mb-4 text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                성장 지원
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                판매 데이터 분석, 가격 전략 컨설팅까지 전문가의 성공을 돕습니다.
              </p>
              <div className="text-brand-primary font-semibold text-sm">
                ✓ 전담 매니저 배정
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center mb-4 text-white">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3분 만에 시작
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                복잡한 서류나 심사 없이 간단한 정보만으로 바로 시작.
              </p>
              <div className="text-brand-primary font-semibold text-sm">
                ✓ 즉시 승인
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center mb-4 text-white">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                안전한 거래
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                에스크로 시스템으로 안전한 거래 보장. 분쟁 시 전문팀 중재.
              </p>
              <div className="text-brand-primary font-semibold text-sm">
                ✓ 100% 거래 보호
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="py-16 bg-white">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              전문가들의 성공 스토리
            </h2>
            <p className="text-gray-600">
              수수료 스트레스에서 해방된 전문가들의 이야기
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-white font-semibold">
                  김
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">김디자이너</div>
                  <div className="text-sm text-gray-500">UI/UX 디자인</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                "수수료 때문에 가격을 10만원이나 더 받아야 했어요. 여기 옮기고
                나서 가격을 3만원 낮췄는데도 제 수익은 더 높아졌어요! 주문은
                3배로 늘었고요."
              </p>
              <div className="bg-brand-primary/10 p-3 rounded text-sm text-brand-primary flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> 저렴한 가격으로 더 많이 벌어요
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-white font-semibold">
                  박
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">박개발자</div>
                  <div className="text-sm text-gray-500">웹 개발</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                "매달 수수료 빠져나가는거 보면서 스트레스 받았어요. 여기는
                수수료 걱정 없이 일할 수 있어서 정신 건강에 너무 좋아요.
                일하는게 즐거워졌습니다!"
              </p>
              <div className="bg-brand-primary/10 p-3 rounded text-sm text-brand-primary flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> 스트레스 없이 일에 집중해요
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-white font-semibold">
                  이
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">이마케터</div>
                  <div className="text-sm text-gray-500">마케팅 전략</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                "다른 플랫폼에서는 수수료 포함해서 가격 책정하니까 경쟁자들보다
                항상 비싸 보였어요. 여기서는 수수료가 없으니 가격 경쟁력이
                생겼고, 주문이 밀려들어요!"
              </p>
              <div className="bg-brand-primary/10 p-3 rounded text-sm text-brand-primary flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> 가격 경쟁력으로 시장 장악
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-brand-primary text-white py-16">
        <div className="container-1200">
          <div className="grid md:grid-cols-4 gap-8 text-center max-w-5xl mx-auto">
            <div>
              <div className="text-4xl font-semibold mb-2">15,000+</div>
              <div className="text-gray-300 text-sm">활동 중인 전문가</div>
            </div>
            <div>
              <div className="text-4xl font-semibold mb-2">95%</div>
              <div className="text-gray-300 text-sm">
                "주문이 늘었다" 응답률
              </div>
            </div>
            <div>
              <div className="text-4xl font-semibold mb-2">2.8배</div>
              <div className="text-gray-300 text-sm">평균 주문량 증가</div>
            </div>
            <div>
              <div className="text-4xl font-semibold mb-2">0원</div>
              <div className="text-gray-300 text-sm">영구 수수료</div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Start */}
      <div className="py-16 bg-gray-50">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              시작하기 정말 간단합니다
            </h2>
            <p className="text-gray-600">3단계로 오늘부터 수익 창출 시작</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-brand-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                무료 회원가입
              </h3>
              <p className="text-gray-600 text-sm">
                이메일과 기본 정보만 입력하면 끝!
                <br />
                심사나 승인 대기 시간 없음
              </p>
            </div>

            <div className="text-center">
              <div className="bg-brand-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                서비스 등록
              </h3>
              <p className="text-gray-600 text-sm">
                당신의 재능과 가격을 설정하고
                <br />
                포트폴리오를 업로드하세요
              </p>
            </div>

            <div className="text-center">
              <div className="bg-brand-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                수익 창출 시작
              </h3>
              <p className="text-gray-600 text-sm">
                주문이 들어오면 작업하고
                <br />
                100% 수익을 받아가세요!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-yellow-400 py-16">
        <div className="container-1200">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              수수료 스트레스, 이제 끝내세요
            </h2>
            <p className="text-lg text-gray-800 mb-8">
              수수료 0원으로 가격은 낮추고 수익은 높이세요.
              <br />더 많은 주문, 더 높은 수익, 더 행복한 일상이 기다립니다.
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold text-lg px-10 py-4 rounded-lg transition-all"
            >
              3분만에 전문가 등록하기 →
            </Link>
            <div className="mt-6 text-gray-700 text-sm">
              ✓ 신용카드 불필요 &nbsp;&nbsp; ✓ 언제든지 해지 가능 &nbsp;&nbsp; ✓
              평생 무료
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-16 bg-white">
        <div className="container-1200">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
            자주 묻는 질문
          </h2>
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                수수료 0원이면 가격을 낮춰도 되나요?
              </h3>
              <p className="text-gray-600 text-sm">
                네! 그게 핵심입니다. 수수료가 없으니 가격을 낮춰도 당신의
                실수익은 오히려 높아집니다. 낮은 가격 → 주문 증가 → 총 수익
                증가의 선순환이 만들어져요.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                다른 플랫폼에서 느꼈던 스트레스가 없나요?
              </h3>
              <p className="text-gray-600 text-sm">
                전혀 없습니다. "수수료 때문에 가격 올려야 하나?", "주문이 안
                들어오면 어쩌지?" 같은 고민이 사라집니다. 순수하게 내 일에만
                집중할 수 있어요.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                타 플랫폼에서 옮겨오는 사람들이 많나요?
              </h3>
              <p className="text-gray-600 text-sm">
                현재 전문가의 73%가 다른 플랫폼에서 옮겨온 분들입니다.
                공통적으로 "수수료 스트레스가 사라졌다", "주문이 2~3배 늘었다"고
                말씀하세요.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                가격 경쟁력이 정말 생기나요?
              </h3>
              <p className="text-gray-600 text-sm">
                당연합니다. 같은 서비스를 타 플랫폼보다 20% 저렴하게 제공해도
                당신의 수익은 똑같거나 더 높아요. 고객 입장에서는 당연히 우리
                플랫폼을 선택하죠.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
