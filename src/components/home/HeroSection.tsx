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
  top: string;
  left: string;
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

// 수동 배치된 비산 패턴
const slides: Slide[] = [
  // Slide 1: 핑크색 (#db2777) - 수수료 0%
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
    splatterPattern: [
      // 큰 비산 - 카드 영역 대체 (7개)
      { size: 380, top: '3rem', left: '48rem', opacity: 0.35, blur: '2xl' },
      { size: 420, top: '2.5rem', left: '52rem', opacity: 0.4, blur: '2xl' },
      { size: 350, top: '5rem', left: '50rem', opacity: 0.32, blur: 'xl' },
      { size: 400, top: '4rem', left: '54rem', opacity: 0.38, blur: '2xl' },
      { size: 360, top: '6rem', left: '49rem', opacity: 0.33, blur: 'xl' },
      { size: 340, top: '3.5rem', left: '56rem', opacity: 0.36, blur: 'xl' },
      { size: 370, top: '5.5rem', left: '53rem', opacity: 0.34, blur: '2xl' },

      // 중형 비산 - 주변 장식 (7개)
      { size: 180, top: '1.5rem', left: '46rem', opacity: 0.28, blur: 'lg' },
      { size: 150, top: '7rem', left: '47rem', opacity: 0.3, blur: 'md' },
      { size: 160, top: '2rem', left: '58rem', opacity: 0.26, blur: 'lg' },
      { size: 140, top: '6.5rem', left: '57rem', opacity: 0.29, blur: 'md' },
      { size: 170, top: '1rem', left: '51rem', opacity: 0.27, blur: 'lg' },
      { size: 155, top: '7.5rem', left: '52rem', opacity: 0.31, blur: 'md' },
      { size: 165, top: '3rem', left: '45rem', opacity: 0.25, blur: 'lg' },

      // 작은 비산 - 디테일 (6개)
      { size: 80, top: '0.5rem', left: '47rem', opacity: 0.22, blur: 'sm' },
      { size: 60, top: '8rem', left: '48rem', opacity: 0.24, blur: 'sm' },
      { size: 70, top: '1.5rem', left: '59rem', opacity: 0.2, blur: 'sm' },
      { size: 90, top: '7rem', left: '58rem', opacity: 0.23, blur: 'sm' },
      { size: 75, top: '4.5rem', left: '44rem', opacity: 0.21, blur: 'sm' },
      { size: 65, top: '5rem', left: '60rem', opacity: 0.25, blur: 'sm' },
    ],
  },

  // Slide 2: 초록색 (#16a34a) - 판매 기회 균등
  {
    id: 2,
    title: "당신의 재능에만\n집중하세요",
    subtitle: "모든 판매자에게 공평한 기회를. 광고비 없이도 성공할 수 있습니다.",
    gradient: "bg-green-600",
    glowColor: "#16a34a",
    icon: "fa-balance-scale",
    cardTitle: "판매 기회 균등",
    cardSubtitle: "모든 판매자에게 공평한 기회",
    cardDescription:
      "돈 많은 판매자가 상위를 독점하는 시대는 끝났습니다. 돌파구는 광고비가 아닌, 고객 만족도로 순위를 결정합니다.",
    splatterPattern: [
      // 큰 비산 - 카드 영역 대체 (7개)
      { size: 390, top: '2.8rem', left: '49rem', opacity: 0.36, blur: '2xl' },
      { size: 410, top: '3.5rem', left: '53rem', opacity: 0.38, blur: '2xl' },
      { size: 360, top: '4.8rem', left: '51rem', opacity: 0.34, blur: 'xl' },
      { size: 385, top: '2rem', left: '55rem', opacity: 0.37, blur: '2xl' },
      { size: 345, top: '6rem', left: '50rem', opacity: 0.32, blur: 'xl' },
      { size: 365, top: '4rem', left: '47rem', opacity: 0.35, blur: 'xl' },
      { size: 395, top: '5.2rem', left: '54rem', opacity: 0.39, blur: '2xl' },

      // 중형 비산 - 주변 장식 (7개)
      { size: 175, top: '1.2rem', left: '48rem', opacity: 0.29, blur: 'lg' },
      { size: 145, top: '7.2rem', left: '49rem', opacity: 0.27, blur: 'md' },
      { size: 165, top: '1.8rem', left: '57rem', opacity: 0.3, blur: 'lg' },
      { size: 150, top: '6.8rem', left: '56rem', opacity: 0.28, blur: 'md' },
      { size: 160, top: '0.8rem', left: '52rem', opacity: 0.26, blur: 'lg' },
      { size: 170, top: '7.5rem', left: '53rem', opacity: 0.31, blur: 'md' },
      { size: 155, top: '2.5rem', left: '46rem', opacity: 0.25, blur: 'lg' },

      // 작은 비산 - 디테일 (6개)
      { size: 85, top: '0.3rem', left: '50rem', opacity: 0.23, blur: 'sm' },
      { size: 65, top: '8.2rem', left: '51rem', opacity: 0.21, blur: 'sm' },
      { size: 75, top: '1rem', left: '58rem', opacity: 0.24, blur: 'sm' },
      { size: 70, top: '7.5rem', left: '55rem', opacity: 0.22, blur: 'sm' },
      { size: 80, top: '4.2rem', left: '45rem', opacity: 0.2, blur: 'sm' },
      { size: 60, top: '5.5rem', left: '59rem', opacity: 0.25, blur: 'sm' },
    ],
  },

  // Slide 3: 파란색 (#2563eb) - 구매 수수료 0원
  {
    id: 3,
    title: "숨겨진 비용,\n이제 그만",
    subtitle: "표시된 가격이 전부입니다. 구매 수수료 0원.",
    gradient: "bg-blue-600",
    glowColor: "#2563eb",
    icon: "fa-shield-alt",
    cardTitle: "구매 수수료 0원",
    cardSubtitle: "표시된 가격이 전부입니다",
    cardDescription:
      "결제 단계에서 갑자기 추가되는 수수료는 없습니다. 표시된 가격 그대로, 투명하고 공정하게 거래하세요.",
    splatterPattern: [
      // 큰 비산 - 카드 영역 대체 (7개)
      { size: 400, top: '3.2rem', left: '48.5rem', opacity: 0.37, blur: '2xl' },
      { size: 375, top: '2.5rem', left: '52.5rem', opacity: 0.35, blur: '2xl' },
      { size: 415, top: '5rem', left: '50.5rem', opacity: 0.4, blur: 'xl' },
      { size: 355, top: '4.2rem', left: '54.5rem', opacity: 0.33, blur: '2xl' },
      { size: 380, top: '6.2rem', left: '49.5rem', opacity: 0.36, blur: 'xl' },
      { size: 370, top: '3.8rem', left: '47rem', opacity: 0.34, blur: 'xl' },
      { size: 390, top: '5.5rem', left: '53.5rem', opacity: 0.38, blur: '2xl' },

      // 중형 비산 - 주변 장식 (7개)
      { size: 170, top: '1.5rem', left: '47.5rem', opacity: 0.3, blur: 'lg' },
      { size: 160, top: '7.3rem', left: '48.5rem', opacity: 0.28, blur: 'md' },
      { size: 150, top: '2.2rem', left: '57.5rem', opacity: 0.27, blur: 'lg' },
      { size: 165, top: '6.5rem', left: '56.5rem', opacity: 0.29, blur: 'md' },
      { size: 175, top: '1rem', left: '51.5rem', opacity: 0.31, blur: 'lg' },
      { size: 145, top: '7.8rem', left: '52.5rem', opacity: 0.26, blur: 'md' },
      { size: 155, top: '3.2rem', left: '45.5rem', opacity: 0.25, blur: 'lg' },

      // 작은 비산 - 디테일 (6개)
      { size: 75, top: '0.5rem', left: '49.5rem', opacity: 0.24, blur: 'sm' },
      { size: 90, top: '8rem', left: '50.5rem', opacity: 0.22, blur: 'sm' },
      { size: 65, top: '1.8rem', left: '59rem', opacity: 0.2, blur: 'sm' },
      { size: 80, top: '7.2rem', left: '57.5rem', opacity: 0.23, blur: 'sm' },
      { size: 70, top: '4.5rem', left: '44.5rem', opacity: 0.21, blur: 'sm' },
      { size: 85, top: '5.8rem', left: '59.5rem', opacity: 0.25, blur: 'sm' },
    ],
  },

  // Slide 4: 보라색 (#9333ea) - 런칭 기념 1,500만원
  {
    id: 4,
    title: "시작하는 당신을 위한\n특별한 지원",
    subtitle: "런칭 기념 1,500만원 광고 지원금. 당신의 성공을 응원합니다.",
    gradient: "bg-purple-600",
    glowColor: "#9333ea",
    icon: "fa-bullhorn",
    cardTitle: "런칭 기념 1,500만원",
    cardSubtitle: "시작하는 당신에게 드립니다",
    cardDescription:
      "신규 판매자에게 1,500만원 상당의 광고 지원금을 드립니다. 돌파구와 함께 성공적인 시작을 하세요.",
    splatterPattern: [
      // 큰 비산 - 카드 영역 대체 (7개)
      { size: 395, top: '3rem', left: '49.2rem', opacity: 0.39, blur: '2xl' },
      { size: 405, top: '2.2rem', left: '53rem', opacity: 0.37, blur: '2xl' },
      { size: 365, top: '4.5rem', left: '51rem', opacity: 0.35, blur: 'xl' },
      { size: 385, top: '5.8rem', left: '48rem', opacity: 0.36, blur: '2xl' },
      { size: 375, top: '3.5rem', left: '55rem', opacity: 0.34, blur: 'xl' },
      { size: 410, top: '6.5rem', left: '52rem', opacity: 0.4, blur: 'xl' },
      { size: 350, top: '4.8rem', left: '54.5rem', opacity: 0.32, blur: '2xl' },

      // 중형 비산 - 주변 장식 (7개)
      { size: 165, top: '1.3rem', left: '48.2rem', opacity: 0.28, blur: 'lg' },
      { size: 155, top: '7.5rem', left: '49.5rem', opacity: 0.3, blur: 'md' },
      { size: 175, top: '1.5rem', left: '57rem', opacity: 0.27, blur: 'lg' },
      { size: 150, top: '7rem', left: '56rem', opacity: 0.29, blur: 'md' },
      { size: 160, top: '0.8rem', left: '52.2rem', opacity: 0.26, blur: 'lg' },
      { size: 170, top: '8rem', left: '53.2rem', opacity: 0.31, blur: 'md' },
      { size: 145, top: '2.8rem', left: '46.5rem', opacity: 0.25, blur: 'lg' },

      // 작은 비산 - 디테일 (6개)
      { size: 80, top: '0.2rem', left: '50.5rem', opacity: 0.22, blur: 'sm' },
      { size: 70, top: '8.5rem', left: '51.2rem', opacity: 0.24, blur: 'sm' },
      { size: 85, top: '1.2rem', left: '58.5rem', opacity: 0.21, blur: 'sm' },
      { size: 65, top: '7.8rem', left: '55.5rem', opacity: 0.23, blur: 'sm' },
      { size: 75, top: '4rem', left: '45rem', opacity: 0.2, blur: 'sm' },
      { size: 90, top: '5.2rem', left: '59.2rem', opacity: 0.25, blur: 'sm' },
    ],
  },
];

export default function HeroSection() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const changeSlide = useCallback((index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 500);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      changeSlide((currentSlide + 1) % slides.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [currentSlide, changeSlide]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const slide = slides[currentSlide];

  return (
    <section className="relative h-[500px] sm:h-[600px] overflow-hidden bg-white">
      <div className="container-1200 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center">
          {/* 왼쪽: 텍스트 + 검색 */}
          <div className="relative z-10 text-left space-y-6">
            <h1
              className={`text-4xl sm:text-5xl md:text-6xl font-black leading-tight whitespace-pre-line transition-all duration-500 ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
              style={{
                color: slide.glowColor,
                textShadow: `0 0 40px ${slide.glowColor}40, 0 0 80px ${slide.glowColor}20`
              }}
            >
              {slide.title}
            </h1>
            <p
              className={`text-lg sm:text-xl md:text-2xl text-gray-700 font-medium transition-all duration-500 delay-100 ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
            >
              {slide.subtitle}
            </p>

            {/* 검색창 */}
            <form
              onSubmit={handleSearch}
              className={`relative transition-all duration-500 delay-200 ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
            >
              <div className="relative flex items-center">
                <FaSearch className="absolute left-4 text-gray-400 text-xl" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="어떤 재능을 찾으시나요?"
                  className="w-full pl-12 pr-32 py-4 text-lg rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors"
                >
                  검색
                </button>
              </div>
            </form>
          </div>

          {/* 오른쪽: 비산 + 카드 */}
          <div className="relative h-full flex items-center justify-end">
            {/* 비산 패턴 */}
            {slide.splatterPattern.map((drop, index) => {
              const blurValues = {
                'none': '0',
                'sm': '4px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
                '2xl': '24px'
              };
              return (
                <div
                  key={`splatter-${slide.id}-${index}`}
                  className="absolute rounded-full transition-all duration-500"
                  style={{
                    width: `${drop.size}px`,
                    height: `${drop.size}px`,
                    top: drop.top,
                    left: drop.left,
                    opacity: drop.opacity,
                    backgroundColor: slide.glowColor,
                    filter: drop.blur !== 'none' ? `blur(${blurValues[drop.blur]})` : 'none',
                  }}
                />
              );
            })}

            {/* 메인 카드 - 배경 없이 내용만 표시 */}
            <div
              className="relative p-5 sm:p-6 transition-all duration-500 h-[250px] sm:h-[298px] flex flex-col"
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
