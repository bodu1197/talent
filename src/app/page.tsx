import ServiceGrid from '@/components/services/ServiceGrid'
import HeroSection from '@/components/home/HeroSection'
import AITalentShowcase from '@/components/home/AITalentShowcase'
import CategoryGrid from '@/components/home/CategoryGrid'

export default function HomePage() {
  return (
    <div className="pb-20 lg:pb-0">
      <HeroSection />
      <CategoryGrid />
      <AITalentShowcase />

      {/* 기존의 '추천 서비스', '서비스 프로세스', '실시간 구매 후기', 'CTA 섹션' 등은
          새로운 컴포넌트들로 대체되거나 재구성될 예정입니다. */}

      {/* 기존 '추천 서비스' 섹션 (ServiceGrid는 재사용 가능성 있음) */}
      <section className="py-16 lg:py-7 bg-gray-50">
        <div className="container-1200">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-lg lg:text-xl font-bold mb-2">추천 서비스</h2>
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
      <section className="py-16 lg:py-7 bg-gray-100">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-lg lg:text-xl font-bold mb-4">간단한 거래 프로세스</h2>
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
      <section className="py-16 lg:py-7 bg-gray-50">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-lg lg:text-xl font-bold mb-4">실시간 구매 후기</h2>
            <p className="text-gray-600">
              실제 구매자들의 생생한 후기
            </p>
          </div>

          <div className="text-center py-8 text-gray-500">
            아직 등록된 후기가 없습니다
          </div>
        </div>
      </section>

      {/* 기존 'CTA 섹션' */}
      <section className="py-20 lg:py-7 bg-[#0f3460] text-white">
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
