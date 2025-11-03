import HeroWithCategories from '@/components/common/HeroWithCategories'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="pb-0">
      {/* 히어로 섹션 + 카테고리 (공통) */}
      <HeroWithCategories />

      {/* 플랫폼 소개 섹션 */}
      <section className="py-16 bg-gray-50">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">왜 톨파구를 선택해야 할까요?</h2>
            <p className="text-gray-600">
              공정하고 투명한 재능 거래 플랫폼
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-sack-dollar text-3xl text-[#0f3460]"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">수수료 0%</h3>
              <p className="text-gray-600">당신이 번 돈 100% 가져가세요</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-balance-scale text-3xl text-[#0f3460]"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">공평한 기회</h3>
              <p className="text-gray-600">모든 판매자에게 같은 기회를 제공</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-3xl text-[#0f3460]"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">구매 수수료 0원</h3>
              <p className="text-gray-600">표시된 가격이 최종 가격</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-bullhorn text-3xl text-[#0f3460]"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">광고비 1,500만원</h3>
              <p className="text-gray-600">런칭 기념 무료 지원</p>
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 프로세스 섹션 */}
      <section className="py-16 bg-white">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">간단한 거래 프로세스</h2>
            <p className="text-gray-600">
              단 4단계로 완성되는 안전한 거래
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#0f3460] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="font-bold mb-2 text-lg">서비스 검색</h3>
              <p className="text-sm text-gray-600">원하는 서비스를 검색하고 전문가를 찾아보세요</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#0f3460] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="font-bold mb-2 text-lg">상담 및 견적</h3>
              <p className="text-sm text-gray-600">전문가와 상담하고 견적을 받아보세요</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#0f3460] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="font-bold mb-2 text-lg">안전 결제</h3>
              <p className="text-sm text-gray-600">안전한 에스크로 시스템으로 결제하세요</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#0f3460] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h3 className="font-bold mb-2 text-lg">작업 완료</h3>
              <p className="text-sm text-gray-600">만족스러운 결과물을 받고 리뷰를 남겨주세요</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-16 bg-[#0f3460] text-white">
        <div className="container-1200 text-center">
          <h2 className="text-3xl font-bold mb-4">지금 시작하세요</h2>
          <p className="text-lg mb-8">
            당신의 재능을 세상과 공유하고, 공정한 수익을 얻으세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-[#0f3460] rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              판매자로 시작하기
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-colors"
            >
              로그인
            </Link>
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="py-16 bg-gray-50">
        <div className="container-1200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#0f3460] mb-2">0%</div>
              <div className="text-gray-600">판매 수수료</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#0f3460] mb-2">0원</div>
              <div className="text-gray-600">구매 수수료</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#0f3460] mb-2">22+</div>
              <div className="text-gray-600">카테고리</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#0f3460] mb-2">1,500만원</div>
              <div className="text-gray-600">광고 크레딧</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
