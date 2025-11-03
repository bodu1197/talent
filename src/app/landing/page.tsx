import HeroWithCategories from '@/components/common/HeroWithCategories'
import Link from 'next/link'

const CheckIcon = () => (
  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
  </svg>
)

interface FeatureItemProps {
  children: React.ReactNode
}

const FeatureItem = ({ children }: FeatureItemProps) => (
  <li className="flex items-start space-x-3">
    <div className="flex-shrink-0 pt-1">
      <CheckIcon />
    </div>
    <span className="text-gray-600">{children}</span>
  </li>
)

export default function LandingPage() {
  return (
    <div className="pb-0">
      {/* 히어로 섹션 + 카테고리 (공통) */}
      <HeroWithCategories />

      {/* Featured Categories Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container-1200 space-y-24">
          {/* AI Services Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <span className="text-sm font-bold uppercase text-blue-600">AI Services</span>
              <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                미래를 여는 기술, AI 전문가와 함께
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                최신 인공지능 기술을 비즈니스에 접목하여 혁신을 가속화하세요. 데이터 분석부터 머신러닝 모델 개발, 자동화 챗봇 구축까지 최고의 AI 전문가들이 당신의 성공을 돕습니다.
              </p>
              <ul className="mt-6 space-y-4 text-lg">
                <FeatureItem>AI 기반 데이터 분석 및 예측 모델링</FeatureItem>
                <FeatureItem>자연어 처리(NLP) 및 챗봇 개발</FeatureItem>
                <FeatureItem>컴퓨터 비전 및 이미지 인식 솔루션</FeatureItem>
              </ul>
              <Link href="/categories/ai-services" className="mt-8 inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                AI 서비스 둘러보기
              </Link>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop"
                alt="AI Technology"
                className="rounded-2xl shadow-2xl object-cover w-full h-[500px]"
              />
            </div>
          </div>

          {/* IT/Programming Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop"
                alt="IT and Programming"
                className="rounded-2xl shadow-2xl object-cover w-full h-[500px]"
              />
            </div>
            <div>
              <span className="text-sm font-bold uppercase text-green-600">IT & Programming</span>
              <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                아이디어를 현실로, 최고의 개발자 군단
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                웹사이트, 모바일 앱, 맞춤형 소프트웨어 개발까지. 검증된 실력의 IT 전문가들이 당신의 아이디어를 완벽한 결과물로 만들어 드립니다.
              </p>
              <ul className="mt-6 space-y-4 text-lg">
                <FeatureItem>최신 기술 스택을 활용한 웹/앱 개발</FeatureItem>
                <FeatureItem>안정적인 서버 구축 및 유지보수</FeatureItem>
                <FeatureItem>비즈니스 자동화를 위한 프로그램 제작</FeatureItem>
              </ul>
              <Link href="/categories/it-programming" className="mt-8 inline-block bg-green-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg">
                개발자 찾기
              </Link>
            </div>
          </div>

          {/* Design Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <span className="text-sm font-bold uppercase text-orange-500">Design</span>
              <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                브랜드를 빛내는, 감각적인 디자인
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                로고, 웹사이트, 마케팅 자료까지. 당신의 비즈니스에 특별한 가치를 더할 디자인 전문가를 만나보세요. 시선을 사로잡는 디자인으로 고객의 마음을 움직입니다.
              </p>
              <ul className="mt-6 space-y-4 text-lg">
                <FeatureItem>로고 및 브랜딩 디자인</FeatureItem>
                <FeatureItem>UI/UX 웹 및 모바일 디자인</FeatureItem>
                <FeatureItem>상세페이지 및 광고 콘텐츠 제작</FeatureItem>
              </ul>
              <Link href="/categories/design" className="mt-8 inline-block bg-orange-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors shadow-lg">
                디자이너 포트폴리오 보기
              </Link>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="https://images.unsplash.com/photo-1522199670076-2852f80289c3?q=80&w=800&auto=format&fit=crop"
                alt="Creative Design"
                className="rounded-2xl shadow-2xl object-cover w-full h-[500px]"
              />
            </div>
          </div>

          {/* Marketing Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
                alt="Digital Marketing"
                className="rounded-2xl shadow-2xl object-cover w-full h-[500px]"
              />
            </div>
            <div>
              <span className="text-sm font-bold uppercase text-pink-500">Marketing</span>
              <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                성공적인 비즈니스를 위한, 전략적 마케팅
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                디지털 마케팅, SEO, SNS 관리 등 각 분야 최고의 마케팅 전문가들이 매출 증대를 위한 맞춤형 전략을 제공합니다. 이제 비즈니스 성장에만 집중하세요.
              </p>
              <ul className="mt-6 space-y-4 text-lg">
                <FeatureItem>검색 엔진 최적화(SEO) 및 광고</FeatureItem>
                <FeatureItem>소셜 미디어 채널 관리 및 콘텐츠 제작</FeatureItem>
                <FeatureItem>블로그 및 인플루언서 마케팅</FeatureItem>
              </ul>
              <Link href="/categories/marketing" className="mt-8 inline-block bg-pink-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors shadow-lg">
                마케팅 전문가와 상담하기
              </Link>
            </div>
          </div>

          {/* Life Services Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <span className="text-sm font-bold uppercase text-purple-600">Life Services</span>
              <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                당신의 일상을 더 편리하고 풍요롭게
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                바쁜 일상 속 도움이 필요한 모든 순간, 생활 서비스 전문가가 해결해 드립니다. 청소, 심부름, 반려동물 돌봄, 개인 레슨 등 삶의 질을 높이는 다양한 서비스를 만나보세요.
              </p>
              <ul className="mt-6 space-y-4 text-lg">
                <FeatureItem>전문적인 홈 클리닝 및 정리 정돈</FeatureItem>
                <FeatureItem>맞춤형 취미 및 외국어 레슨</FeatureItem>
                <FeatureItem>신뢰할 수 있는 펫시터 및 산책 서비스</FeatureItem>
              </ul>
              <Link href="/categories/life" className="mt-8 inline-block bg-purple-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors shadow-lg">
                생활 서비스 찾아보기
              </Link>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=800&auto=format&fit=crop"
                alt="Life Services"
                className="rounded-2xl shadow-2xl object-cover w-full h-[500px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Benefits Section */}
      <section className="py-24 bg-gray-900 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container-1200">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              왜 톨파구를 선택해야 할까요?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
              구매자와 전문가 모두를 위한 최고의 재능 마켓플레이스
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* For Buyers */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/80 transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-2xl font-bold text-blue-400">구매자 (Clients)</h3>
              <p className="mt-2 text-gray-400 text-lg">필요한 모든 재능을 한 곳에서, 빠르고 안전하게 만나보세요.</p>
              <ul className="mt-8 space-y-6">
                <li className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 00-12 0v-2.25a9.094 9.094 0 0012 0v2.25zM13.5 12.75a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM13.5 12.75V15M6.75 12.75V15m10.5-6.75a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM17.25 8.25V15" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-100 text-lg">폭넓은 전문가 풀</h4>
                    <p className="text-gray-400 mt-1">AI부터 생활 서비스까지, 각 분야에서 검증된 전문가들을 손쉽게 찾아 프로젝트를 의뢰할 수 있습니다.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m15 3a3 3 0 11-6 0m6 0a3 3 0 10-6 0" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-100 text-lg">투명한 가격 정책</h4>
                    <p className="text-gray-400 mt-1">숨은 비용이나 추가 수수료 걱정 없이, 예산에 맞춰 합리적으로 서비스를 이용하세요.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-100 text-lg">안전 결제 시스템</h4>
                    <p className="text-gray-400 mt-1">작업이 만족스럽게 완료될 때까지 결제 대금은 톨파구가 안전하게 보호합니다.</p>
                  </div>
                </li>
              </ul>
              <Link href="/categories" className="mt-10 inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
                최고의 전문가 찾기
              </Link>
            </div>
            {/* For Sellers */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-gray-500/50 hover:bg-gray-800/80 transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-2xl font-bold text-gray-200">판매자 (Experts)</h3>
              <p className="mt-2 text-gray-400 text-lg">당신의 재능과 전문성을 가치로 바꾸고, 새로운 기회를 만드세요.</p>
              <ul className="mt-8 space-y-6">
                <li className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.81m5.84-2.57a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 2.45m5.96 5.96a14.926 14.926 0 01-5.841 2.57m0 0a14.926 14.926 0 01-2.57-5.841m2.57 5.841A14.926 14.926 0 017.5 15.59m6.16-7.38a14.926 14.926 0 01-2.57 5.84m0 0a14.926 14.926 0 015.84 2.57m-5.84-2.57v4.81" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-100 text-lg">새로운 수익 창출</h4>
                    <p className="text-gray-400 mt-1">재능을 상품으로 등록하고 판매하여 안정적인 부가 수익을 만들 수 있는 기회를 잡으세요.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-100 text-lg">유연한 근무 환경</h4>
                    <p className="text-gray-400 mt-1">원하는 시간과 장소에서 자유롭게 일하며 워라밸을 실현하고 경력을 관리할 수 있습니다.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.05a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.25a2.25 2.25 0 012.25-2.25h15a2.25 2.25 0 012.25 2.25v.75M2.25 9l1.28-2.285A2.25 2.25 0 015.884 6h12.232a2.25 2.25 0 011.943 1.285L21.75 9M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-100 text-lg">성장과 기회</h4>
                    <p className="text-gray-400 mt-1">다양한 프로젝트를 통해 포트폴리오를 쌓고 전문가로서 당신의 가치를 더욱 높일 수 있습니다.</p>
                  </div>
                </li>
              </ul>
              <Link href="/expert/register" className="mt-10 inline-block bg-white text-gray-800 font-semibold px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
                재능 판매 시작하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
