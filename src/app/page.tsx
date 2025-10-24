import ServiceGrid from '@/components/services/ServiceGrid'
import HeroSection from '@/components/home/HeroSection'
import AITalentShowcase from '@/components/home/AITalentShowcase'
import PremiumPlacements from '@/components/home/PremiumPlacements'
import CategoryGrid from '@/components/home/CategoryGrid'
import TrendingServices from '@/components/home/TrendingServices'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <CategoryGrid />
      <PremiumPlacements />
      <AITalentShowcase />
      <TrendingServices />

      {/* 기존의 '추천 서비스', '서비스 프로세스', '실시간 구매 후기', 'CTA 섹션' 등은
          새로운 컴포넌트들로 대체되거나 재구성될 예정입니다. */}

      {/* 기존 '추천 서비스' 섹션 (ServiceGrid는 재사용 가능성 있음) */}
      <section className="py-16 bg-gray-50">
        <div className="container-1200">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold mb-2">추천 서비스</h2>
              <p className="text-gray-600">믿을 수 있는 검증된 전문가들의 서비스</p>
            </div>
            <button className="hidden md:block px-4 py-2 border border-[#0f3460] text-[#0f3460] rounded-lg hover:bg-gray-50 transition-colors">
              전체보기
            </button>
          </div>
          <ServiceGrid featured={true} />
        </div>
      </section>

      {/* 기존 '서비스 프로세스' 섹션 */}
      <section className="py-16 bg-gray-100">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold mb-4">간단한 거래 프로세스</h2>
            <p className="text-gray-600">
              단 4단계로 완성되는 안전한 거래
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#0f3460] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="font-bold mb-2">서비스 검색</h3>
              <p className="text-sm text-gray-600">원하는 서비스를 검색하고 전문가를 찾아보세요</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#0f3460] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="font-bold mb-2">상담 및 견적</h3>
              <p className="text-sm text-gray-600">전문가와 상담하고 견적을 받아보세요</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#0f3460] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="font-bold mb-2">안전 결제</h3>
              <p className="text-sm text-gray-600">안전한 에스크로 시스템으로 결제하세요</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#0f3460] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h3 className="font-bold mb-2">작업 완료</h3>
              <p className="text-sm text-gray-600">만족스러운 결과물을 받고 리뷰를 남겨주세요</p>
            </div>
          </div>
        </div>
      </section>

      {/* 기존 '실시간 리뷰' 섹션 */}
      <section className="py-16 bg-gray-50">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold mb-4">실시간 구매 후기</h2>
            <p className="text-gray-600">
              실제 구매자들의 생생한 후기
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-[#0f3460] rounded-full mr-3"></div>
                  <div>
                    <div className="font-semibold">김**님</div>
                    <div className="text-sm text-gray-500">2시간 전</div>
                  </div>
                </div>
                <div className="flex mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i key={star} className="fas fa-star text-yellow-400"></i>
                  ))}
                </div>
                <p className="text-gray-700 mb-3">
                  빠른 작업과 친절한 응대에 매우 만족합니다. 결과물도 기대 이상이었어요!
                </p>
                <div className="text-sm text-gray-500">
                  로고 디자인 · 디자인 카테고리
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 기존 'CTA 섹션' */}
      <section className="py-20 bg-[#0f3460] text-white">
        <div className="container-1200 text-center">
          <h2 className="text-2xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl mb-8 opacity-90">
            당신의 재능을 필요로 하는 수많은 고객이 기다리고 있습니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[#0f3460] hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors">
              판매자 등록하기
            </button>
            <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0f3460] font-bold py-3 px-8 rounded-lg transition-all">
              서비스 둘러보기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
