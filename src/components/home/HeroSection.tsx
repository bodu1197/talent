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
            {/* 물감 비산 효과 - 큰 방울들 */}
            <div
              className="absolute -top-8 right-20 w-20 h-20 rounded-full opacity-40 blur-md transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />
            <div
              className="absolute -top-4 right-8 w-12 h-12 rounded-full opacity-50 blur-sm transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />
            <div
              className="absolute top-12 -right-6 w-16 h-16 rounded-full opacity-35 blur-md transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />
            <div
              className="absolute -bottom-6 -left-8 w-24 h-24 rounded-full opacity-40 blur-lg transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />
            <div
              className="absolute bottom-20 -left-4 w-14 h-14 rounded-full opacity-45 blur-sm transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />

            {/* 물감 비산 효과 - 중간 방울들 */}
            <div
              className="absolute -top-2 right-32 w-8 h-8 rounded-full opacity-60 transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />
            <div
              className="absolute top-6 -right-2 w-6 h-6 rounded-full opacity-55 transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />
            <div
              className="absolute top-28 -right-3 w-10 h-10 rounded-full opacity-50 blur-sm transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />
            <div
              className="absolute -bottom-2 left-12 w-8 h-8 rounded-full opacity-60 transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />
            <div
              className="absolute bottom-32 -left-2 w-6 h-6 rounded-full opacity-55 transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />

            {/* 물감 비산 효과 - 작은 방울들 */}
            <div
              className="absolute top-2 right-28 w-3 h-3 rounded-full opacity-70 transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />
            <div
              className="absolute top-16 right-6 w-4 h-4 rounded-full opacity-65 transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />
            <div
              className="absolute top-24 -right-1 w-3 h-3 rounded-full opacity-70 transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />
            <div
              className="absolute bottom-12 left-8 w-4 h-4 rounded-full opacity-65 transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />
            <div
              className="absolute bottom-24 -left-1 w-3 h-3 rounded-full opacity-70 transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />
            <div
              className="absolute top-20 right-12 w-2 h-2 rounded-full opacity-75 transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />
            <div
              className="absolute bottom-16 left-16 w-2 h-2 rounded-full opacity-75 transition-all duration-500"
              style={{ backgroundColor: slide.glowColor }}
            />

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
