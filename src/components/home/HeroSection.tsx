"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaRobot,
  FaMoneyBillWave,
  FaBalanceScale,
  FaShieldAlt,
  FaBullhorn,
  FaSearch,
} from "react-icons/fa";

interface SplatterDrop {
  size: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  opacity: number;
  blur: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  gradient: string;
  glowColor: string;
  icon: string;
  cardTitle: string;
  cardSubtitle: string;
  cardDescription: string;
  splatterPattern: SplatterDrop[];
}

// Icon mapping helper
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    "fa-sack-dollar": <FaMoneyBillWave className="text-2xl" />,
    "fa-balance-scale": <FaBalanceScale className="text-2xl" />,
    "fa-shield-alt": <FaShieldAlt className="text-2xl" />,
    "fa-bullhorn": <FaBullhorn className="text-2xl" />,
  };
  return iconMap[iconName] || null;
};

const slides: Slide[] = [
  {
    id: 1,
    title: "당신이 번 돈,\n한 푼도 떼지 않습니다",
    subtitle: "수수료 0%. 당신의 재능이 온전히 당신의 수익으로.",
    gradient: "bg-pink-600",
    glowColor: "#db2777",
    icon: "fa-sack-dollar",
    cardTitle: "수수료 0%",
    cardSubtitle: "판매자가 100% 가져갑니다",
    cardDescription:
      "당신이 번 돈, 한 푼도 떼지 않습니다. 다른 플랫폼의 15~20% 수수료는 이제 그만. 돌파구에서는 100% 당신의 것입니다.",
    // Jackson Pollock 액션 페인팅 스타일 - 격렬하고 무작위한 비산, 전체 영역 폭발적 활용
    splatterPattern: [
      // 왼쪽 텍스트 영역 완전 침범 - 거대한 방울들
      { size: 350, top: '-5rem', left: '-10rem', opacity: 0.18, blur: '2xl' },
      { size: 280, top: '2rem', left: '-5rem', opacity: 0.22, blur: '2xl' },
      { size: 240, top: '6rem', left: '5rem', opacity: 0.25, blur: 'xl' },
      { size: 200, top: '10rem', left: '-8rem', opacity: 0.28, blur: 'xl' },

      // 중앙 영역 - 큰 덩어리들
      { size: 320, top: '-3rem', left: '30%', opacity: 0.2, blur: '2xl' },
      { size: 260, top: '4rem', left: '40%', opacity: 0.24, blur: 'xl' },
      { size: 190, top: '8rem', left: '35%', opacity: 0.28, blur: 'xl' },

      // 오른쪽 카드 영역 - 대형 비산
      { size: 380, top: '-6rem', right: '-5rem', opacity: 0.18, blur: '2xl' },
      { size: 300, top: '1rem', right: '-8rem', opacity: 0.22, blur: '2xl' },
      { size: 220, top: '5rem', right: '2rem', opacity: 0.26, blur: 'xl' },
      { size: 180, top: '9rem', right: '-4rem', opacity: 0.3, blur: 'xl' },

      // 중형 방울들 (리듬감)
      { size: 150, top: '3rem', left: '15rem', opacity: 0.32, blur: 'lg' },
      { size: 120, top: '7rem', left: '25rem', opacity: 0.35, blur: 'lg' },
      { size: 140, top: '1rem', right: '10rem', opacity: 0.34, blur: 'lg' },
    ],
  },
  {
    id: 2,
    title: "첫날부터 공정하게,\n모두에게 같은 기회를",
    subtitle: "신규 판매자와 베테랑, 시작이 평등한 곳입니다.",
    gradient: "bg-indigo-600",
    glowColor: "#4f46e5",
    icon: "fa-balance-scale",
    cardTitle: "판매 기회 균등",
    cardSubtitle: "모든 판매자에게 공평한 기회",
    cardDescription:
      "신규든 베테랑이든, 모두에게 같은 기회. 알고리즘도, 편애도 없습니다. 오직 실력으로 승부하세요.",
    // Yves Klein 스타일 - 대담한 거대 덩어리, 공간을 압도적으로 지배
    splatterPattern: [
      // 왼쪽 텍스트 영역 - 초거대 덩어리로 완전 장악
      { size: 450, top: '-8rem', left: '-15rem', opacity: 0.16, blur: '2xl' },
      { size: 380, top: '3rem', left: '-8rem', opacity: 0.19, blur: '2xl' },
      { size: 340, top: '8rem', left: '2rem', opacity: 0.22, blur: '2xl' },

      // 중앙 영역 - 거대한 색면
      { size: 420, top: '-4rem', left: '35%', opacity: 0.17, blur: '2xl' },
      { size: 310, top: '6rem', left: '30%', opacity: 0.21, blur: 'xl' },

      // 오른쪽 카드 영역 - 압도적 크기
      { size: 500, top: '-10rem', right: '-12rem', opacity: 0.15, blur: '2xl' },
      { size: 400, top: '2rem', right: '-6rem', opacity: 0.18, blur: '2xl' },
      { size: 280, top: '7rem', right: '1rem', opacity: 0.24, blur: 'xl' },

      // 중형 방울 (대비 효과)
      { size: 180, top: '4rem', left: '20rem', opacity: 0.28, blur: 'lg' },
      { size: 160, top: '1rem', right: '15rem', opacity: 0.3, blur: 'lg' },
    ],
  },
  {
    id: 3,
    title: "표시된 가격이 전부입니다\n숨은 비용 없습니다",
    subtitle: "구매 수수료 0원. 보이는 그대로 결제하세요.",
    gradient: "bg-purple-600",
    glowColor: "#9333ea",
    icon: "fa-shield-alt",
    cardTitle: "구매 수수료 0원",
    cardSubtitle: "표시된 가격이 전부입니다",
    cardDescription:
      "다른 곳처럼 결제 직전 수수료 추가? 없습니다. 보이는 가격이 최종 가격. 숨은 비용 없이 투명하게.",
    // Sam Francis 스타일 - 여백과 거대함의 대비, 우아하면서도 압도적
    splatterPattern: [
      // 왼쪽 텍스트 영역 - 큰 방울들로 여백 강조
      { size: 320, top: '-6rem', left: '-12rem', opacity: 0.2, blur: '2xl' },
      { size: 260, top: '4rem', left: '-4rem', opacity: 0.24, blur: 'xl' },
      { size: 220, top: '9rem', left: '8rem', opacity: 0.27, blur: 'xl' },

      // 중앙 영역 - 의도적 여백 (작은 방울만)
      { size: 150, top: '2rem', left: '35%', opacity: 0.32, blur: 'lg' },
      { size: 120, top: '6rem', left: '30%', opacity: 0.36, blur: 'lg' },

      // 오른쪽 카드 영역 - 큰 방울들의 클러스터
      { size: 380, top: '-7rem', right: '-8rem', opacity: 0.19, blur: '2xl' },
      { size: 300, top: '1rem', right: '-5rem', opacity: 0.22, blur: 'xl' },
      { size: 240, top: '6rem', right: '3rem', opacity: 0.25, blur: 'xl' },
      { size: 180, top: '10rem', right: '-2rem', opacity: 0.29, blur: 'xl' },

      // 작은 디테일 (여백과의 대비)
      { size: 100, top: '3rem', left: '22rem', opacity: 0.38, blur: 'md' },
      { size: 90, top: '7rem', right: '12rem', opacity: 0.4, blur: 'md' },
    ],
  },
  {
    id: 4,
    title: "시작하는 당신에게,\n1,500만원 드립니다",
    subtitle: "런칭 기념. 광고 크레딧으로 첫 고객을 만나세요.",
    gradient: "bg-blue-600",
    glowColor: "#2563eb",
    icon: "fa-bullhorn",
    cardTitle: "런칭 기념 1,500만원",
    cardSubtitle: "시작하는 당신에게 드립니다",
    cardDescription:
      "런칭 기념, 모든 전문가에게 최대 1,500만원 광고 크레딧 지원. 돌파구 내 광고로 첫 고객을 만나세요.",
    // 물리적 역학 기반 - 좌하단에서 강력하게 분사된 페인트, 역동적 포물선 궤적
    // 거대한 방울은 멀리 폭발적으로 날아가고, 작은 방울은 가까이 떨어짐
    splatterPattern: [
      // 발사 지점 근처 (왼쪽 하단) - 폭발적 거대 덩어리
      { size: 400, bottom: '-8rem', left: '-15rem', opacity: 0.17, blur: '2xl' },
      { size: 340, bottom: '-2rem', left: '-8rem', opacity: 0.2, blur: '2xl' },
      { size: 280, bottom: '2rem', left: '0rem', opacity: 0.23, blur: 'xl' },

      // 중간 궤적 (왼쪽~중앙) - 상승하는 큰 방울들
      { size: 360, top: '2rem', left: '10rem', opacity: 0.18, blur: '2xl' },
      { size: 300, top: '0rem', left: '22rem', opacity: 0.21, blur: 'xl' },
      { size: 240, top: '4rem', left: '18rem', opacity: 0.25, blur: 'xl' },
      { size: 200, top: '6rem', left: '12rem', opacity: 0.28, blur: 'xl' },

      // 정점 부근 (중앙~우측) - 최고점 분산
      { size: 320, top: '-5rem', left: '40%', opacity: 0.19, blur: '2xl' },
      { size: 260, top: '-2rem', right: '10rem', opacity: 0.22, blur: 'xl' },
      { size: 190, top: '1rem', right: '6rem', opacity: 0.26, blur: 'lg' },

      // 하강 궤적 (오른쪽) - 중력 낙하
      { size: 280, top: '4rem', right: '-3rem', opacity: 0.24, blur: 'xl' },
      { size: 220, top: '7rem', right: '2rem', opacity: 0.28, blur: 'xl' },
      { size: 170, top: '10rem', right: '-5rem', opacity: 0.32, blur: 'lg' },

      // 비말 디테일 (궤적을 따라)
      { size: 140, bottom: '5rem', left: '5rem', opacity: 0.35, blur: 'md' },
      { size: 110, top: '8rem', left: '28rem', opacity: 0.38, blur: 'md' },
    ],
  },
];

export default function HeroSection() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Helper: Perform slide transition
  const performSlideTransition = useCallback((newSlide: number) => {
    setCurrentSlide(newSlide);
    setIsTransitioning(false);
  }, []);

  const changeSlide = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => performSlideTransition(index), 300);
  };

  // Helper: Auto-advance slides
  const advanceSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      performSlideTransition((currentSlide + 1) % slides.length);
    }, 300);
  }, [currentSlide, performSlideTransition]);

  useEffect(() => {
    const timer = setInterval(advanceSlide, 8000);
    return () => clearInterval(timer);
  }, [advanceSlide]);

  const slide = slides[currentSlide];

  return (
    <section className="bg-white py-2 sm:py-4 lg:py-8 hidden lg:block">
      <div className="container-1200 px-0">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 mb-2">
          {/* 왼쪽: 타이틀 + 검색 + 카테고리 */}
          <div className="flex-1 w-full">
            <div className="mb-6 lg:mb-8">
              <h1
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4 transition-opacity duration-500 lg:min-h-[120px] leading-[1.6] whitespace-pre-line ${isTransitioning ? "opacity-0" : "opacity-100"}`}
              >
                {slide.title}
              </h1>
              <p
                className={`text-sm sm:text-base text-gray-600 lg:min-h-[48px] leading-[1.5] transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
              >
                {slide.subtitle}
              </p>
            </div>

            {/* 검색창 - PC에서만 표시 */}
            <div className="mb-4 lg:mb-6 hidden lg:block">
              <form onSubmit={handleSearch} className="relative w-full lg:max-w-[490px]" autoComplete="off">
                <input
                  type="text"
                  id="hero-search"
                  name="hero-search-query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="어떤 재능이 필요하신가요?"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-lpignore="true"
                  role="searchbox"
                  aria-label="서비스 검색"
                  className="focus-visible:outline-none w-full px-4 sm:px-6 py-3 sm:py-4 pr-14 border-2 border-gray-300 rounded-full focus:rounded-full hover:border-gray-300 focus:outline-none focus:border-gray-300 focus:shadow-none transition-none text-gray-900 text-sm sm:text-base"
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none'
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-brand-primary transition-colors rounded-full hover:bg-gray-100 active:scale-100 focus:outline-none isolate"
                  style={{
                    transform: 'translate3d(0, -50%, 0)',
                    backfaceVisibility: 'hidden',
                    willChange: 'transform'
                  }}
                  aria-label="검색"
                >
                  <FaSearch className="text-lg" />
                </button>
              </form>
            </div>

            {/* 인기 카테고리 - PC에서만 표시 */}
            <div className="flex-wrap gap-2 sm:gap-3 hidden lg:flex">
              <Link
                href="/categories/ai-services"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-blue-50 text-brand-primary rounded-full font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
              >
                <FaRobot className="text-sm sm:text-base" />{" "}
                <span className="hidden sm:inline">AI 서비스</span>
                <span className="sm:hidden">AI</span>
              </Link>
              <Link
                href="/categories/it-programming"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                <span className="hidden sm:inline">IT/프로그래밍</span>
                <span className="sm:hidden">IT</span>
              </Link>
              <Link
                href="/categories/design"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                디자인
              </Link>
              <Link
                href="/categories/marketing"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                마케팅
              </Link>
              <Link
                href="/categories/writing"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors hidden sm:inline-flex"
              >
                글쓰기
              </Link>
            </div>
          </div>

          {/* 오른쪽: 카드 + 페이지네이션 */}
          <div className="w-full lg:w-[382px] flex-shrink-0 relative">
            {/* 물감 비산 효과 - 동적 렌더링 */}
            {slide.splatterPattern.map((drop, index) => {
              const blurValues: Record<string, string> = {
                'none': '0',
                'sm': '4px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
                '2xl': '24px',
              };
              return (
                <div
                  key={`splatter-${slide.id}-${index}`}
                  className="absolute rounded-full transition-all duration-500"
                  style={{
                    width: `${drop.size}px`,
                    height: `${drop.size}px`,
                    top: drop.top,
                    bottom: drop.bottom,
                    left: drop.left,
                    right: drop.right,
                    opacity: drop.opacity,
                    backgroundColor: slide.glowColor,
                    filter: drop.blur !== 'none' ? `blur(${blurValues[drop.blur]})` : 'none',
                  }}
                />
              );
            })}

            {/* 메인 카드 - 매우 투명한 배경 */}
            <div
              className="relative p-5 sm:p-6 transition-all duration-500 h-[250px] sm:h-[298px] flex flex-col rounded-3xl backdrop-blur-sm"
              style={{
                background: `linear-gradient(135deg, ${slide.glowColor}15, ${slide.glowColor}08)`,
                boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >

              {/* 아이콘 */}
              <div
                className={`mb-4 transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white"
                  style={{
                    backgroundColor: `${slide.glowColor}60`,
                    boxShadow: `0 0 20px ${slide.glowColor}40`
                  }}
                >
                  {getIconComponent(slide.icon)}
                </div>
              </div>

              {/* 내용 */}
              <h3
                className={`text-2xl font-bold mb-2 transition-opacity duration-500 text-gray-900 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
                style={{ textShadow: '0 2px 4px rgba(255, 255, 255, 0.5)' }}
              >
                {slide.cardTitle}
              </h3>
              <p
                className={`text-lg mb-3 text-gray-800 transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
                style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)' }}
              >
                {slide.cardSubtitle}
              </p>
              <p
                className={`text-sm text-gray-700 leading-relaxed line-clamp-3 mb-6 transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
                style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)' }}
              >
                {slide.cardDescription}
              </p>

              {/* 페이지네이션 도트 */}
              <div className="flex gap-2 mt-auto">
                {slides.map((s, index) => (
                  <button
                    key={s.id}
                    onClick={() => changeSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? "w-8" : "w-2"
                    }`}
                    style={{
                      backgroundColor: index === currentSlide ? slide.glowColor : `${slide.glowColor}40`
                    }}
                    aria-label={`슬라이드 ${index + 1}로 이동`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
