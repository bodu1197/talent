import HeroWithCategories from "@/components/common/HeroWithCategories";
import AIServicesShowcase from "@/components/landing/AIServicesShowcase";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  FaMapMarkerAlt,
  FaLocationArrow,
  FaUsers,
  FaTags,
  FaShieldAlt,
  FaRocket,
  FaClock,
  FaChartLine,
} from "react-icons/fa";

export const metadata: Metadata = {
  title: "돌파구 - 수수료 0원 재능 거래 플랫폼 | 판매자·구매자 모두 무료",
  description:
    "국내 유일 수수료 0원! 디자인, 개발, 마케팅, 생활 서비스까지. 판매자와 구매자 모두 수수료 부담 없이 자유롭게 거래하세요.",
  keywords:
    "돌파구, 재능거래, 수수료0원, 무료플랫폼, 프리랜서마켓, 디자인외주, 개발외주, 마케팅대행, 생활서비스",
  openGraph: {
    title: "돌파구 - 수수료 0원! 부담 없이 시작하는 재능 거래",
    description:
      "판매자·구매자 모두 수수료 0원! 국내 유일 무료 재능 거래 플랫폼",
    type: "website",
    locale: "ko_KR",
  },
};

const landingPageSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "재능 거래 플랫폼",
  provider: {
    "@type": "Organization",
    name: "돌파구",
  },
  areaServed: {
    "@type": "Country",
    name: "대한민국",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
    description: "판매자 수수료 0원, 구매자 수수료 0원",
  },
  category: ["IT/프로그래밍", "디자인", "마케팅", "생활 서비스", "심부름"],
};

const CheckIcon = () => (
  <svg
    className="w-6 h-6 text-green-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 13l4 4L19 7"
    ></path>
  </svg>
);

interface FeatureItemProps {
  children: React.ReactNode;
}

const FeatureItem = ({ children }: FeatureItemProps) => (
  <li className="flex items-start space-x-2 md:space-x-3">
    <div className="flex-shrink-0 pt-0.5 md:pt-1">
      <CheckIcon />
    </div>
    <span className="text-gray-600 text-sm md:text-base">{children}</span>
  </li>
);

// 하드코딩된 전문가 데이터
const experts = {
  ai: [
    {
      name: "AI 전문가 김철수",
      specialty: "AI 모델 개발",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    {
      name: "AI 연구원 이영희",
      specialty: "자연어 처리",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=45",
    },
    {
      name: "머신러닝 전문가 박지훈",
      specialty: "컴퓨터 비전",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=33",
    },
    {
      name: "데이터 과학자 최데이터",
      specialty: "데이터 분석",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=8",
    },
    {
      name: "AI 컨설턴트 정혁신",
      specialty: "AI 전략 기획",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=52",
    },
  ],
  it: [
    {
      name: "풀스택 개발자 최민수",
      specialty: "웹 개발",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=15",
    },
    {
      name: "백엔드 전문가 강수진",
      specialty: "서버 구축",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=47",
    },
    {
      name: "앱 개발자 윤서연",
      specialty: "모바일 앱",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=32",
    },
    {
      name: "프론트엔드 개발자 이리액트",
      specialty: "React/Vue",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=60",
    },
    {
      name: "데브옵스 엔지니어 박클라우드",
      specialty: "AWS/Docker",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=19",
    },
  ],
  design: [
    {
      name: "그래픽 디자이너 정현우",
      specialty: "브랜딩",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=13",
    },
    {
      name: "UI/UX 디자이너 김나영",
      specialty: "UI/UX",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=44",
    },
    {
      name: "일러스트레이터 이동현",
      specialty: "일러스트",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=68",
    },
    {
      name: "영상 디자이너 최모션",
      specialty: "모션 그래픽",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=27",
    },
    {
      name: "3D 디자이너 박입체",
      specialty: "3D 모델링",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=54",
    },
  ],
  marketing: [
    {
      name: "마케팅 전문가 박소현",
      specialty: "SEO",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=41",
    },
    {
      name: "SNS 마케터 김태영",
      specialty: "SNS 마케팅",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=17",
    },
    {
      name: "콘텐츠 마케터 이수진",
      specialty: "콘텐츠 제작",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=48",
    },
    {
      name: "퍼포먼스 마케터 정광고",
      specialty: "광고 운영",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=31",
    },
    {
      name: "브랜드 마케터 최브랜딩",
      specialty: "브랜딩 전략",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=64",
    },
  ],
  life: [
    {
      name: "청소 전문가 조미래",
      specialty: "홈 클리닝",
      location: "서울 강남구",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=43",
    },
    {
      name: "요리 강사 김맛나",
      specialty: "요리 레슨",
      location: "서울 마포구",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=29",
    },
    {
      name: "펫시터 이멍멍",
      specialty: "반려동물 돌봄",
      location: "서울 송파구",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=25",
    },
    {
      name: "홈트레이너 박건강",
      specialty: "운동 지도",
      location: "서울 강남구",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=18",
    },
    {
      name: "외국어 강사 정잉글리시",
      specialty: "영어 회화",
      location: "서울 서초구",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=38",
    },
  ],
  errand: [
    {
      name: "심부름 전문가 이빠름",
      specialty: "퀵 배송 / 서류 전달",
      location: "서울 전역",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=59",
    },
    {
      name: "대리 운전 박안전",
      specialty: "대리 운전 / 차량 이동",
      location: "서울 · 경기",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=14",
    },
    {
      name: "줄서기 대행 최기다림",
      specialty: "줄서기 / 대기 서비스",
      location: "서울 강남구",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=56",
    },
    {
      name: "이사 도우미 김용달",
      specialty: "짐 운반 / 이사",
      location: "서울 전역",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=22",
    },
    {
      name: "대행 전문가 정대리",
      specialty: "각종 대행 업무",
      location: "서울 · 경기",
      verified: true,
      avatar: "https://i.pravatar.cc/150?img=66",
    },
  ],
};

interface ExpertCardProps {
  expert: {
    name: string;
    specialty: string;
    location?: string;
    verified: boolean;
    avatar: string;
  };
}

const ExpertCard = ({ expert }: ExpertCardProps) => (
  <Link
    href="/categories"
    className="block bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer min-w-[180px] md:min-w-0 flex-shrink-0"
  >
    <div className="flex flex-col items-center text-center">
      {/* 프로필 사진 */}
      <div className="relative mb-3 md:mb-4 w-20 h-20 md:w-24 md:h-24">
        <Image
          src={expert.avatar}
          alt={expert.name}
          fill
          className="rounded-full object-cover border-3 md:border-4 border-gray-100"
          sizes="(max-width: 768px) 80px, 96px"
          loading="lazy"
        />
        {expert.verified && (
          <div className="absolute -bottom-1 -right-1 bg-brand-primary rounded-full p-1 md:p-1.5">
            <svg
              className="w-3 h-3 md:w-4 md:h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* 전문가 정보 */}
      <h4 className="font-bold text-gray-900 text-base md:text-lg mb-1 line-clamp-1">
        {expert.name}
      </h4>
      <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 line-clamp-2">
        {expert.specialty}
      </p>

      {expert.location && (
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
          <FaMapMarkerAlt className="text-xs" />
          <span className="line-clamp-1">{expert.location}</span>
        </div>
      )}
    </div>
  </Link>
);

export default async function LandingPage() {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || "";

  return (
    <div className="pb-0">
      {/* Schema.org 구조화 데이터 */}
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landingPageSchema) }}
      />

      {/* 히어로 섹션 + 카테고리 (공통) */}
      <HeroWithCategories />

      {/* AI 서비스 쇼케이스 */}
      <AIServicesShowcase />

      {/* Featured Categories Section */}
      <section className="pt-0 pb-12 md:py-24 bg-white overflow-hidden">
        <div className="container-1200 space-y-12 md:space-y-24 px-4">
          {/* IT/Programming Section */}
          <div className="space-y-6 md:space-y-8">
            <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="mb-3 md:mb-4">
                  <span className="text-xs md:text-sm font-bold uppercase text-brand-primary">
                    IT & Programming
                  </span>
                  <h2 className="text-lg md:text-xl lg:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    아이디어를 현실로, 최고의 개발자 군단
                  </h2>
                </div>
                <p className="mt-3 md:mt-4 text-sm md:text-lg text-gray-600 leading-relaxed">
                  웹사이트, 모바일 앱, 맞춤형 소프트웨어 개발까지. 검증된 실력의
                  IT 전문가들이 당신의 아이디어를 완벽한 결과물로 만들어
                  드립니다.
                </p>
                <ul className="mt-4 md:mt-6 space-y-1 md:space-y-2 text-sm md:text-lg">
                  <FeatureItem>최신 기술 스택을 활용한 웹/앱 개발</FeatureItem>
                  <FeatureItem>안정적인 서버 구축 및 유지보수</FeatureItem>
                  <FeatureItem>
                    비즈니스 자동화를 위한 프로그램 제작
                  </FeatureItem>
                </ul>
                <Link
                  href="/categories/it-programming"
                  className="mt-6 md:mt-8 inline-block bg-brand-primary text-white font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-lg hover:bg-[#0a2340] transition-colors shadow-lg text-sm md:text-base"
                >
                  개발자 찾기
                </Link>
              </div>
              <div className="order-1 md:order-2 hidden md:block relative w-full h-[320px] lg:h-[400px]">
                <Image
                  src="https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop"
                  alt="IT and Programming"
                  fill
                  className="rounded-2xl shadow-2xl object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
            {/* IT 전문가 카드 */}
            <div className="mt-6 md:mt-8">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 px-4 md:px-0">
                추천 IT 전문가
              </h3>
              <div className="flex md:grid md:grid-cols-5 gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-4 md:px-0 -mx-4 md:mx-0">
                {experts.it.map((expert, index) => (
                  <div
                    key={index}
                    className="snap-start first:ml-4 md:first:ml-0 last:mr-4 md:last:mr-0"
                  >
                    <ExpertCard expert={expert} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Design Section */}
          <div className="space-y-6 md:space-y-8">
            <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
              <div className="hidden md:block relative w-full h-[320px] lg:h-[400px]">
                <Image
                  src="https://images.unsplash.com/photo-1522199670076-2852f80289c3?q=80&w=800&auto=format&fit=crop"
                  alt="Creative Design"
                  fill
                  className="rounded-2xl shadow-2xl object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
              <div>
                <div className="mb-3 md:mb-4">
                  <span className="text-xs md:text-sm font-bold uppercase text-brand-primary">
                    Design
                  </span>
                  <h2 className="text-lg md:text-xl lg:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    브랜드를 빛내는, 감각적인 디자인
                  </h2>
                </div>
                <p className="mt-3 md:mt-4 text-sm md:text-lg text-gray-600 leading-relaxed">
                  로고, 웹사이트, 마케팅 자료까지. 당신의 비즈니스에 특별한
                  가치를 더할 디자인 전문가를 만나보세요. 시선을 사로잡는
                  디자인으로 고객의 마음을 움직입니다.
                </p>
                <ul className="mt-4 md:mt-6 space-y-1 md:space-y-2 text-sm md:text-lg">
                  <FeatureItem>로고 및 브랜딩 디자인</FeatureItem>
                  <FeatureItem>UI/UX 웹 및 모바일 디자인</FeatureItem>
                  <FeatureItem>상세페이지 및 광고 콘텐츠 제작</FeatureItem>
                </ul>
                <Link
                  href="/categories/design"
                  className="mt-6 md:mt-8 inline-block bg-brand-primary text-white font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-lg hover:bg-[#0a2340] transition-colors shadow-lg text-sm md:text-base"
                >
                  디자이너 포트폴리오 보기
                </Link>
              </div>
            </div>
            {/* Design 전문가 카드 */}
            <div className="mt-6 md:mt-8">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 px-4 md:px-0">
                추천 디자인 전문가
              </h3>
              <div className="flex md:grid md:grid-cols-5 gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-4 md:px-0 -mx-4 md:mx-0">
                {experts.design.map((expert, index) => (
                  <div
                    key={index}
                    className="snap-start first:ml-4 md:first:ml-0 last:mr-4 md:last:mr-0"
                  >
                    <ExpertCard expert={expert} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Marketing Section */}
          <div className="space-y-6 md:space-y-8">
            <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="mb-3 md:mb-4">
                  <span className="text-xs md:text-sm font-bold uppercase text-brand-primary">
                    Marketing
                  </span>
                  <h2 className="text-lg md:text-xl lg:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    성공적인 비즈니스를 위한, 전략적 마케팅
                  </h2>
                </div>
                <p className="mt-3 md:mt-4 text-sm md:text-lg text-gray-600 leading-relaxed">
                  디지털 마케팅, SEO, SNS 관리 등 각 분야 최고의 마케팅
                  전문가들이 매출 증대를 위한 맞춤형 전략을 제공합니다. 이제
                  비즈니스 성장에만 집중하세요.
                </p>
                <ul className="mt-4 md:mt-6 space-y-1 md:space-y-2 text-sm md:text-lg">
                  <FeatureItem>검색 엔진 최적화(SEO) 및 광고</FeatureItem>
                  <FeatureItem>
                    소셜 미디어 채널 관리 및 콘텐츠 제작
                  </FeatureItem>
                  <FeatureItem>블로그 및 인플루언서 마케팅</FeatureItem>
                </ul>
                <Link
                  href="/categories/marketing"
                  className="mt-6 md:mt-8 inline-block bg-brand-primary text-white font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-lg hover:bg-[#0a2340] transition-colors shadow-lg text-sm md:text-base"
                >
                  마케팅 전문가와 상담하기
                </Link>
              </div>
              <div className="order-1 md:order-2 hidden md:block relative w-full h-[320px] lg:h-[400px]">
                <Image
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
                  alt="Digital Marketing"
                  fill
                  className="rounded-2xl shadow-2xl object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
            </div>
            {/* Marketing 전문가 카드 */}
            <div className="mt-6 md:mt-8">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 px-4 md:px-0">
                추천 마케팅 전문가
              </h3>
              <div className="flex md:grid md:grid-cols-5 gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-4 md:px-0 -mx-4 md:mx-0">
                {experts.marketing.map((expert, index) => (
                  <div
                    key={index}
                    className="snap-start first:ml-4 md:first:ml-0 last:mr-4 md:last:mr-0"
                  >
                    <ExpertCard expert={expert} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fortune / Tarot Banner Section - 얇은 띠 형식 */}
      <section className="py-8 md:py-12 bg-brand-primary overflow-hidden relative">
        {/* 반짝이는 별 장식 */}
        <div className="absolute top-2 left-4 md:top-4 md:left-10 text-yellow-300 text-lg md:text-2xl animate-pulse">
          ✨
        </div>
        <div
          className="absolute top-4 right-8 md:top-8 md:right-20 text-yellow-300 text-base md:text-xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        >
          ⭐
        </div>
        <div
          className="absolute bottom-3 left-1/4 md:bottom-6 text-yellow-300 text-sm md:text-lg animate-pulse"
          style={{ animationDelay: "1s" }}
        >
          ✨
        </div>
        <div
          className="absolute bottom-2 right-1/3 md:bottom-4 text-yellow-300 text-lg md:text-2xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        >
          ⭐
        </div>

        <div className="container-1200 relative z-10 px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3 md:gap-4 text-center md:text-left">
              <div className="text-3xl md:text-5xl flex-shrink-0">🔮</div>
              <div>
                <h3 className="text-lg md:text-3xl font-bold text-white mb-0.5 md:mb-1 leading-tight">
                  오늘의 운세가 궁금하신가요?
                </h3>
                <p className="text-white/90 text-xs md:text-lg leading-snug">
                  타로, 사주, 운세 상담까지. 당신의 미래를 밝혀줄 전문가들이
                  기다립니다.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link
                href="/categories/fortune"
                className="bg-white text-brand-primary font-bold px-6 py-3 md:px-8 md:py-4 rounded-full hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 whitespace-nowrap text-sm md:text-base w-full md:w-auto text-center"
              >
                🌙 운세 보러가기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Section (계속) */}
      <section className="py-12 md:py-24 bg-white overflow-hidden">
        <div className="container-1200 space-y-12 md:space-y-24 px-4">
          {/* Life Services Section */}
          <div className="space-y-6 md:space-y-8">
            <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
              <div className="hidden md:block relative w-full h-[320px] lg:h-[400px]">
                <Image
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=800&auto=format&fit=crop"
                  alt="Life Services"
                  fill
                  className="rounded-2xl shadow-2xl object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
              <div>
                <div className="mb-3 md:mb-4">
                  <span className="text-xs md:text-sm font-bold uppercase text-brand-primary">
                    Life Services
                  </span>
                  <h2 className="text-lg md:text-xl lg:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    당신의 일상을 더 편리하고 풍요롭게
                  </h2>
                </div>

                {/* 내 주변 전문가 찾기 강조 박스 */}
                <div className="mt-3 md:mt-4 p-3 md:p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 text-brand-primary flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <h3 className="text-base md:text-lg font-bold text-gray-900">
                      내 주변 가까운 전문가 찾기
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                    위치 기반으로 가까운 생활 서비스 전문가를 찾아보세요. 빠르고
                    편리한 서비스를 경험하실 수 있습니다.
                  </p>
                </div>

                <p className="mt-3 md:mt-4 text-sm md:text-lg text-gray-600 leading-relaxed">
                  바쁜 일상 속 도움이 필요한 모든 순간, 생활 서비스 전문가가
                  해결해 드립니다. 청소, 심부름, 반려동물 돌봄, 개인 레슨 등
                  삶의 질을 높이는 다양한 서비스를 만나보세요.
                </p>
                <ul className="mt-4 md:mt-6 space-y-1 md:space-y-2 text-sm md:text-lg">
                  <FeatureItem>전문적인 홈 클리닝 및 정리 정돈</FeatureItem>
                  <FeatureItem>맞춤형 취미 및 외국어 레슨</FeatureItem>
                  <FeatureItem>
                    신뢰할 수 있는 펫시터 및 산책 서비스
                  </FeatureItem>
                </ul>
                <Link
                  href="/categories/life"
                  className="mt-6 md:mt-8 inline-block bg-brand-primary text-white font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-lg hover:bg-[#0a2340] transition-colors shadow-lg text-sm md:text-base"
                >
                  생활 서비스 찾아보기
                </Link>
              </div>
            </div>

            {/* Life Services 전문가 카드 - 위치 정보 포함 */}
            <div className="mt-6 md:mt-8">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 px-4 md:px-0">
                <FaMapMarkerAlt className="text-brand-primary mr-2 inline" />내
                주변 생활 서비스 전문가
              </h3>
              <div className="flex md:grid md:grid-cols-5 gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-4 md:px-0 -mx-4 md:mx-0">
                {experts.life.map((expert, index) => (
                  <div
                    key={index}
                    className="snap-start first:ml-4 md:first:ml-0 last:mr-4 md:last:mr-0"
                  >
                    <ExpertCard expert={expert} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Errand Services Section - 실시간 위치 추적 강조 */}
          <div className="space-y-6 md:space-y-8">
            <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="mb-3 md:mb-4">
                  <span className="text-xs md:text-sm font-bold uppercase text-brand-primary">
                    Errand Services
                  </span>
                  <h2 className="text-lg md:text-xl lg:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    바쁜 당신을 위한, 믿을 수 있는 심부름 서비스
                  </h2>
                </div>

                {/* 실시간 위치 추적 강조 박스 */}
                <div className="mt-3 md:mt-4 p-3 md:p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 text-brand-primary animate-pulse flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <h3 className="text-base md:text-lg font-bold text-gray-900">
                      전문가 위치 실시간 추적
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                    심부름 전문가의 현재 위치를 실시간으로 확인하세요. GPS
                    추적으로 안심하고 서비스를 이용할 수 있습니다.
                  </p>
                </div>

                <p className="mt-3 md:mt-4 text-sm md:text-lg text-gray-600 leading-relaxed">
                  퀵 배송, 서류 전달, 대리 운전, 줄서기 대행까지. 시간이 부족한
                  당신을 위해 신뢰할 수 있는 심부름 전문가가 대신 처리해
                  드립니다.
                </p>
                <ul className="mt-4 md:mt-6 space-y-1 md:space-y-2 text-sm md:text-lg">
                  <FeatureItem>GPS 기반 실시간 위치 추적</FeatureItem>
                  <FeatureItem>빠른 퀵 배송 및 서류 전달</FeatureItem>
                  <FeatureItem>안전한 대리 운전 서비스</FeatureItem>
                </ul>
                <Link
                  href="/categories/errand"
                  className="mt-6 md:mt-8 inline-block bg-brand-primary text-white font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-lg hover:bg-[#0a2340] transition-colors shadow-lg text-sm md:text-base"
                >
                  심부름 전문가 찾기
                </Link>
              </div>
              <div className="order-1 md:order-2 hidden md:block relative w-full h-[320px] lg:h-[400px]">
                <Image
                  src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?q=80&w=800&auto=format&fit=crop"
                  alt="Errand Services"
                  fill
                  className="rounded-2xl shadow-2xl object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Errand Services 전문가 카드 - 위치 정보 포함 */}
            <div className="mt-6 md:mt-8">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 px-4 md:px-0">
                <FaLocationArrow className="text-brand-primary mr-2 animate-pulse inline" />
                실시간 추적 가능한 심부름 전문가
              </h3>
              <div className="flex md:grid md:grid-cols-5 gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-4 md:px-0 -mx-4 md:mx-0">
                {experts.errand.map((expert, index) => (
                  <div
                    key={index}
                    className="snap-start first:ml-4 md:first:ml-0 last:mr-4 md:last:mr-0"
                  >
                    <ExpertCard expert={expert} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Benefits Section */}
      <section className="py-12 md:py-24 bg-gray-900">
        <div className="container-1200 px-4">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-xl md:text-4xl font-extrabold text-white tracking-tight">
              왜 돌파구를 선택해야 할까요?
            </h2>
            <p className="mt-2 md:mt-4 max-w-2xl mx-auto text-sm md:text-lg text-gray-400">
              <span className="text-yellow-400 font-bold">수수료 0원!</span>{" "}
              구매자와 전문가 모두를 위한 최고의 재능 마켓플레이스
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
            {/* For Buyers */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-5 md:p-8 rounded-xl md:rounded-2xl border border-gray-700 hover:border-brand-primary/50 hover:bg-gray-800/80 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg md:text-2xl font-bold text-white">
                  구매자 (Clients)
                </h3>
                <span className="bg-yellow-400 text-gray-900 text-xs md:text-sm font-bold px-2 py-1 rounded">
                  수수료 0원
                </span>
              </div>
              <p className="mt-2 text-white/80 text-sm md:text-lg">
                필요한 모든 재능을 한 곳에서, 수수료 부담 없이 빠르고 안전하게
                만나보세요.
              </p>
              <ul className="mt-5 md:mt-8 space-y-4 md:space-y-6">
                <li className="flex items-start space-x-3 md:space-x-4">
                  <div className="flex-shrink-0">
                    <FaUsers className="text-xl md:text-3xl text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-base md:text-lg">
                      폭넓은 전문가 풀
                    </h4>
                    <p className="text-white/80 mt-1 text-sm md:text-base leading-relaxed">
                      AI부터 생활 서비스까지, 각 분야에서 검증된 전문가들을
                      손쉽게 찾아 프로젝트를 의뢰할 수 있습니다.
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 md:space-x-4">
                  <div className="flex-shrink-0">
                    <FaTags className="text-xl md:text-3xl text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-base md:text-lg">
                      투명한 가격 정책 (수수료 0원!)
                    </h4>
                    <p className="text-white/80 mt-1 text-sm md:text-base leading-relaxed">
                      숨은 비용이나 추가 수수료 걱정 없이, 표시된 가격 그대로
                      결제하세요. 다른 플랫폼과 달리 중개 수수료가 전혀
                      없습니다.
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 md:space-x-4">
                  <div className="flex-shrink-0">
                    <FaShieldAlt className="text-xl md:text-3xl text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-base md:text-lg">
                      안전 결제 시스템
                    </h4>
                    <p className="text-white/80 mt-1 text-sm md:text-base leading-relaxed">
                      작업이 만족스럽게 완료될 때까지 결제 대금은 돌파구가
                      안전하게 보호합니다.
                    </p>
                  </div>
                </li>
              </ul>
              <Link
                href="/categories"
                className="mt-6 md:mt-10 inline-block bg-brand-primary text-white font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-lg hover:bg-[#0a2340] transition-colors shadow-lg text-sm md:text-base"
              >
                최고의 전문가 찾기
              </Link>
            </div>
            {/* For Sellers */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-5 md:p-8 rounded-xl md:rounded-2xl border border-gray-700 hover:border-gray-500/50 hover:bg-gray-800/80 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg md:text-2xl font-bold text-white">
                  판매자 (Experts)
                </h3>
                <span className="bg-yellow-400 text-gray-900 text-xs md:text-sm font-bold px-2 py-1 rounded">
                  수수료 0원
                </span>
              </div>
              <p className="mt-2 text-white/80 text-sm md:text-lg">
                당신의 재능과 전문성을 가치로 바꾸세요. 판매 수수료 0원으로
                수익을 100% 가져가세요!
              </p>
              <ul className="mt-5 md:mt-8 space-y-4 md:space-y-6">
                <li className="flex items-start space-x-3 md:space-x-4">
                  <div className="flex-shrink-0">
                    <FaRocket className="text-xl md:text-3xl text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-base md:text-lg">
                      새로운 수익 창출 (수수료 0원!)
                    </h4>
                    <p className="text-white/80 mt-1 text-sm md:text-base leading-relaxed">
                      재능을 상품으로 등록하고 판매하세요. 판매 수수료가 전혀
                      없어서 판매가의 100%를 수익으로 가져갈 수 있습니다.
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 md:space-x-4">
                  <div className="flex-shrink-0">
                    <FaClock className="text-xl md:text-3xl text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-base md:text-lg">
                      유연한 근무 환경
                    </h4>
                    <p className="text-white/80 mt-1 text-sm md:text-base leading-relaxed">
                      원하는 시간과 장소에서 자유롭게 일하며 워라밸을 실현하고
                      경력을 관리할 수 있습니다.
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 md:space-x-4">
                  <div className="flex-shrink-0">
                    <FaChartLine className="text-xl md:text-3xl text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-base md:text-lg">
                      성장과 기회
                    </h4>
                    <p className="text-white/80 mt-1 text-sm md:text-base leading-relaxed">
                      다양한 프로젝트를 통해 포트폴리오를 쌓고 전문가로서 당신의
                      가치를 더욱 높일 수 있습니다.
                    </p>
                  </div>
                </li>
              </ul>
              <Link
                href="/expert/register"
                className="mt-6 md:mt-10 inline-block bg-white text-gray-800 font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-lg hover:bg-gray-200 transition-colors shadow-lg shadow-white/10 text-sm md:text-base"
              >
                재능 판매 시작하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 프로세스 섹션 - PC만 표시 */}
      <section className="hidden md:block py-8 bg-gray-100">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold mb-4">간단한 거래 프로세스</h2>
            <p className="text-gray-600">단 4단계로 완성되는 안전한 거래</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="font-bold mb-2">서비스 검색</h3>
              <p className="text-sm text-gray-600">
                원하는 서비스를 검색하고 전문가를 찾아보세요
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="font-bold mb-2">상담 및 견적</h3>
              <p className="text-sm text-gray-600">
                전문가와 상담하고 견적을 받아보세요
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="font-bold mb-2">안전 결제</h3>
              <p className="text-sm text-gray-600">
                안전한 에스크로 시스템으로 결제하세요
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h3 className="font-bold mb-2">작업 완료</h3>
              <p className="text-sm text-gray-600">
                만족스러운 결과물을 받고 리뷰를 남겨주세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 실시간 리뷰 섹션 - PC만 표시 */}
      <section className="hidden md:block py-8 bg-gray-50">
        <div className="container-1200">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold mb-4">실시간 구매 후기</h2>
            <p className="text-gray-600">실제 구매자들의 생생한 후기</p>
          </div>

          <div className="text-center py-8 text-gray-500">
            아직 등록된 후기가 없습니다
          </div>
        </div>
      </section>
    </div>
  );
}
