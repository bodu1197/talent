'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  icon: string;
  clicks: number;
  ratio: number;
}

// 인라인 SVG 아이콘
const FlameIcon = () => (
  <svg
    className="w-5 h-5 text-orange-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
    />
  </svg>
);

const TrendingUpIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

// 그래프 색상 배열
const barColors = [
  'from-orange-500 to-red-500',
  'from-amber-500 to-orange-500',
  'from-yellow-500 to-amber-500',
  'from-lime-500 to-yellow-500',
  'from-emerald-500 to-lime-500',
  'from-teal-500 to-emerald-500',
  'from-cyan-500 to-teal-500',
  'from-blue-500 to-cyan-500',
];

interface Props {
  categories: CategoryData[];
}

export default function TrendingCategoriesClient({ categories }: Props) {
  const [isAnimated, setIsAnimated] = useState(false);

  // 마운트 후 애니메이션 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 최대 ratio 값 (높이 계산용)
  const maxRatio = Math.max(...categories.map((c) => c.ratio));

  return (
    <section className="py-6 lg:py-10 bg-gradient-to-b from-orange-50/50 to-white">
      <div className="container-1200">
        {/* 섹션 헤더 */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <FlameIcon />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">
              실시간 인기재능
            </h2>
          </div>
          <p className="text-gray-500 text-sm md:text-base">
            지금 가장 많이 찾는 온라인 전문가 카테고리
            <span className="ml-2 text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">
              최근 24시간
            </span>
          </p>
        </div>

        {/* 세로 막대 그래프 */}
        <div className="flex justify-center items-end gap-2 sm:gap-3 md:gap-4 lg:gap-6 px-2 overflow-x-auto pb-4">
          {categories.map((category, index) => {
            const barColor = barColors[index % barColors.length];
            const heightPercent = maxRatio > 0 ? (category.ratio / maxRatio) * 100 : 0;
            const animatedHeight = isAnimated ? `${Math.max(heightPercent, 15)}%` : '0%';
            const isTop3 = index < 3;

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group flex flex-col items-center flex-shrink-0"
              >
                {/* 클릭 수 */}
                <div
                  className={`
                    text-[10px] md:text-xs font-medium mb-1 transition-all duration-500
                    ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                    ${isTop3 ? 'text-orange-600' : 'text-gray-500'}
                  `}
                  style={{ transitionDelay: `${index * 100 + 500}ms` }}
                >
                  {category.clicks.toLocaleString('ko-KR')}
                </div>

                {/* 막대 */}
                <div className="relative w-10 sm:w-12 md:w-14 lg:w-16 h-28 sm:h-32 md:h-40 lg:h-48 flex items-end">
                  <div
                    className={`
                      w-full bg-gradient-to-t ${barColor} rounded-t-lg
                      transition-all duration-1000 ease-out
                      group-hover:shadow-lg group-hover:scale-105
                      ${isTop3 ? 'shadow-md' : ''}
                    `}
                    style={{
                      height: animatedHeight,
                      transitionDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* 순위 뱃지 */}
                    <div
                      className={`
                        absolute -top-3 left-1/2 -translate-x-1/2
                        w-5 h-5 md:w-6 md:h-6 rounded-full
                        flex items-center justify-center
                        text-[10px] md:text-xs font-bold
                        transition-all duration-500
                        ${isAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                        ${
                          isTop3
                            ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md'
                            : 'bg-gray-200 text-gray-600'
                        }
                      `}
                      style={{ transitionDelay: `${index * 100 + 800}ms` }}
                    >
                      {index + 1}
                    </div>

                    {/* 트렌딩 아이콘 (TOP 3만) */}
                    {isTop3 && (
                      <div
                        className={`
                          absolute top-2 left-1/2 -translate-x-1/2
                          transition-all duration-500
                          ${isAnimated ? 'opacity-100' : 'opacity-0'}
                        `}
                        style={{ transitionDelay: `${index * 100 + 1000}ms` }}
                      >
                        <TrendingUpIcon className="w-4 h-4 text-white/80" />
                      </div>
                    )}
                  </div>
                </div>

                {/* 카테고리명 */}
                <div
                  className={`
                    mt-2 text-center transition-all duration-500
                    ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                  `}
                  style={{ transitionDelay: `${index * 100 + 300}ms` }}
                >
                  <span
                    className={`
                      text-[10px] sm:text-xs md:text-sm font-medium
                      group-hover:text-orange-600 transition-colors
                      ${isTop3 ? 'text-gray-900' : 'text-gray-600'}
                    `}
                  >
                    {category.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
