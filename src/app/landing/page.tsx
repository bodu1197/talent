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

// 하드코딩된 전문가 데이터
const experts = {
  ai: [
    { name: 'AI 전문가 김철수', specialty: 'AI 모델 개발', verified: true, avatar: 'https://i.pravatar.cc/150?img=12' },
    { name: 'AI 연구원 이영희', specialty: '자연어 처리', verified: true, avatar: 'https://i.pravatar.cc/150?img=45' },
    { name: '머신러닝 전문가 박지훈', specialty: '컴퓨터 비전', verified: true, avatar: 'https://i.pravatar.cc/150?img=33' },
  ],
  it: [
    { name: '풀스택 개발자 최민수', specialty: '웹 개발', verified: true, avatar: 'https://i.pravatar.cc/150?img=15' },
    { name: '백엔드 전문가 강수진', specialty: '서버 구축', verified: true, avatar: 'https://i.pravatar.cc/150?img=47' },
    { name: '앱 개발자 윤서연', specialty: '모바일 앱', verified: true, avatar: 'https://i.pravatar.cc/150?img=32' },
  ],
  design: [
    { name: '그래픽 디자이너 정현우', specialty: '브랜딩', verified: true, avatar: 'https://i.pravatar.cc/150?img=13' },
    { name: 'UI/UX 디자이너 김나영', specialty: 'UI/UX', verified: true, avatar: 'https://i.pravatar.cc/150?img=44' },
    { name: '일러스트레이터 이동현', specialty: '일러스트', verified: true, avatar: 'https://i.pravatar.cc/150?img=68' },
  ],
  marketing: [
    { name: '마케팅 전문가 박소현', specialty: 'SEO', verified: true, avatar: 'https://i.pravatar.cc/150?img=41' },
    { name: 'SNS 마케터 김태영', specialty: 'SNS 마케팅', verified: true, avatar: 'https://i.pravatar.cc/150?img=17' },
    { name: '콘텐츠 마케터 이수진', specialty: '콘텐츠 제작', verified: true, avatar: 'https://i.pravatar.cc/150?img=48' },
  ],
  life: [
    { name: '청소 전문가 조미래', specialty: '홈 클리닝', location: '서울 강남구', verified: true, avatar: 'https://i.pravatar.cc/150?img=43' },
    { name: '요리 강사 김맛나', specialty: '요리 레슨', location: '서울 마포구', verified: true, avatar: 'https://i.pravatar.cc/150?img=29' },
    { name: '펫시터 이멍멍', specialty: '반려동물 돌봄', location: '서울 송파구', verified: true, avatar: 'https://i.pravatar.cc/150?img=25' },
  ],
  errand: [
    { name: '심부름 전문가 이빠름', specialty: '퀵 배송 / 서류 전달', location: '서울 전역', verified: true, avatar: 'https://i.pravatar.cc/150?img=59' },
    { name: '대리 운전 박안전', specialty: '대리 운전 / 차량 이동', location: '서울 · 경기', verified: true, avatar: 'https://i.pravatar.cc/150?img=14' },
    { name: '줄서기 대행 최기다림', specialty: '줄서기 / 대기 서비스', location: '서울 강남구', verified: true, avatar: 'https://i.pravatar.cc/150?img=56' },
  ],
}

interface ExpertCardProps {
  expert: {
    name: string
    specialty: string
    location?: string
    verified: boolean
    avatar: string
  }
}

const ExpertCard = ({ expert }: ExpertCardProps) => (
  <Link href="/categories" className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
    <div className="flex flex-col items-center text-center">
      {/* 프로필 사진 */}
      <div className="relative mb-4">
        <img
          src={expert.avatar}
          alt={expert.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
        />
        {expert.verified && (
          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* 전문가 정보 */}
      <h4 className="font-bold text-gray-900 text-lg mb-1">{expert.name}</h4>
      <p className="text-sm text-gray-600 mb-3">{expert.specialty}</p>

      {expert.location && (
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
          <i className="fas fa-map-marker-alt"></i>
          <span>{expert.location}</span>
        </div>
      )}
    </div>
  </Link>
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
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <span className="text-sm font-bold uppercase text-blue-600">AI Services</span>
                <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
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
            {/* AI 전문가 카드 */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">추천 AI 전문가</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {experts.ai.map((expert, index) => (
                  <ExpertCard key={index} expert={expert} />
                ))}
              </div>
            </div>
          </div>

          {/* IT/Programming Section */}
          <div className="space-y-8">
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
                <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
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
            {/* IT 전문가 카드 */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">추천 IT 전문가</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {experts.it.map((expert, index) => (
                  <ExpertCard key={index} expert={expert} />
                ))}
              </div>
            </div>
          </div>

          {/* Design Section */}
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <span className="text-sm font-bold uppercase text-orange-500">Design</span>
                <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
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
            {/* Design 전문가 카드 */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">추천 디자인 전문가</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {experts.design.map((expert, index) => (
                  <ExpertCard key={index} expert={expert} />
                ))}
              </div>
            </div>
          </div>

          {/* Marketing Section */}
          <div className="space-y-8">
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
                <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
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
            {/* Marketing 전문가 카드 */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">추천 마케팅 전문가</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {experts.marketing.map((expert, index) => (
                  <ExpertCard key={index} expert={expert} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fortune / Tarot Banner Section - 얇은 띠 형식 */}
      <section className="py-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden relative">
        <div className="absolute inset-0 bg-black/10"></div>
        {/* 반짝이는 별 장식 */}
        <div className="absolute top-4 left-10 text-yellow-300 text-2xl animate-pulse">✨</div>
        <div className="absolute top-8 right-20 text-yellow-300 text-xl animate-pulse" style={{animationDelay: '0.5s'}}>⭐</div>
        <div className="absolute bottom-6 left-1/4 text-yellow-300 text-lg animate-pulse" style={{animationDelay: '1s'}}>✨</div>
        <div className="absolute bottom-4 right-1/3 text-yellow-300 text-2xl animate-pulse" style={{animationDelay: '1.5s'}}>⭐</div>

        <div className="container-1200 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🔮</div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  오늘의 운세가 궁금하신가요?
                </h3>
                <p className="text-white/90 text-base md:text-lg">
                  타로, 사주, 운세 상담까지. 당신의 미래를 밝혀줄 전문가들이 기다립니다.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/categories/fortune"
                className="bg-white text-purple-600 font-bold px-8 py-4 rounded-full hover:bg-yellow-300 hover:text-purple-700 transition-all shadow-2xl hover:scale-105 whitespace-nowrap"
              >
                🌙 운세 보러가기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Section (계속) */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container-1200 space-y-24">
          {/* Life Services Section */}
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <span className="text-sm font-bold uppercase text-purple-600">Life Services</span>
                <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  당신의 일상을 더 편리하고 풍요롭게
                </h2>
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-bold text-purple-900">내 주변 가까운 전문가 찾기</h3>
                  </div>
                  <p className="text-sm text-purple-800">위치 기반으로 가까운 생활 서비스 전문가를 찾아보세요. 빠르고 편리한 서비스를 경험하실 수 있습니다.</p>
                </div>
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
            {/* Life Services 전문가 카드 - 위치 정보 포함 */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                <i className="fas fa-map-marker-alt text-purple-600 mr-2"></i>
                내 주변 생활 서비스 전문가
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {experts.life.map((expert, index) => (
                  <ExpertCard key={index} expert={expert} />
                ))}
              </div>
            </div>
          </div>

          {/* Errand Services Section - 실시간 위치 추적 강조 */}
          <div className="space-y-8 mt-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop"
                  alt="Errand Services"
                  className="rounded-2xl shadow-2xl object-cover w-full h-[500px]"
                />
              </div>
              <div>
                <span className="text-sm font-bold uppercase text-red-600">Errand Services</span>
                <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  바쁜 당신을 위한, 믿을 수 있는 심부름 서비스
                </h2>

                {/* 실시간 위치 추적 강조 박스 */}
                <div className="mt-4 p-4 bg-red-50 rounded-lg border-2 border-red-200">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-red-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-bold text-red-900">전문가 위치 실시간 추적</h3>
                  </div>
                  <p className="text-sm text-red-800">심부름 전문가의 현재 위치를 실시간으로 확인하세요. GPS 추적으로 안심하고 서비스를 이용할 수 있습니다.</p>
                </div>

                <p className="mt-4 text-lg text-gray-600">
                  퀵 배송, 서류 전달, 대리 운전, 줄서기 대행까지. 시간이 부족한 당신을 위해 신뢰할 수 있는 심부름 전문가가 대신 처리해 드립니다.
                </p>
                <ul className="mt-6 space-y-4 text-lg">
                  <FeatureItem>GPS 기반 실시간 위치 추적</FeatureItem>
                  <FeatureItem>빠른 퀵 배송 및 서류 전달</FeatureItem>
                  <FeatureItem>안전한 대리 운전 서비스</FeatureItem>
                </ul>
                <Link href="/categories/errand" className="mt-8 inline-block bg-red-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-lg">
                  심부름 전문가 찾기
                </Link>
              </div>
            </div>

            {/* Errand Services 전문가 카드 - 위치 정보 포함 */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                <i className="fas fa-location-arrow text-red-600 mr-2 animate-pulse"></i>
                실시간 추적 가능한 심부름 전문가
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {experts.errand.map((expert, index) => (
                  <ExpertCard key={index} expert={expert} />
                ))}
              </div>
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
