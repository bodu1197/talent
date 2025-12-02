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

interface TrendingData {
  categories: CategoryData[];
  totalCount: number;
  hasMore: boolean;
  totalClicks: number;
  period: string;
  updatedAt: string;
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

const ChevronRightIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);

const INITIAL_LIMIT = 5;

// 버튼 내용 컴포넌트 (중첩 삼항 연산자 회피)
function ExpandButtonContent({
  isExpanding,
  isExpanded,
  remainingCount,
}: {
  isExpanding: boolean;
  isExpanded: boolean;
  remainingCount: number;
}) {
  if (isExpanding) {
    return (
      <>
        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>로딩 중...</span>
      </>
    );
  }

  if (isExpanded) {
    return (
      <>
        <span>접기</span>
        <ChevronUpIcon className="w-3.5 h-3.5" />
      </>
    );
  }

  return (
    <>
      <span>+{remainingCount}개 더보기</span>
      <ChevronDownIcon className="w-3.5 h-3.5" />
    </>
  );
}

export default function TrendingCategories() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [hasError, setHasError] = useState(false);

  // 초기 데이터 로드 (5개만)
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const res = await fetch(`/api/analytics/trending-categories?limit=${INITIAL_LIMIT}`);
        if (res.ok) {
          const result: TrendingData = await res.json();
          setCategories(result.categories);
          setTotalCount(result.totalCount);
        } else {
          setHasError(true);
        }
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  // 애니메이션 트리거
  useEffect(() => {
    if (!isLoading && categories.length > 0) {
      const timer = setTimeout(() => {
        setIsAnimated(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, categories]);

  // 나머지 데이터 로드
  const handleExpand = async () => {
    if (isExpanded) {
      // 접기
      setIsExpanded(false);
      setCategories((prev) => prev.slice(0, INITIAL_LIMIT));
      return;
    }

    setIsExpanding(true);
    try {
      const res = await fetch(
        `/api/analytics/trending-categories?limit=${totalCount - INITIAL_LIMIT}&offset=${INITIAL_LIMIT}`
      );
      if (res.ok) {
        const result: TrendingData = await res.json();
        setCategories((prev) => [...prev, ...result.categories]);
        setIsExpanded(true);
      }
    } catch {
      // 에러 무시
    } finally {
      setIsExpanding(false);
    }
  };

  // 로딩 스켈레톤
  if (isLoading) {
    return (
      <section className="py-4 lg:py-8 bg-gradient-to-b from-orange-50/50 to-white">
        <div className="container-1200">
          <div className="h-5 bg-gray-200 rounded w-36 mb-4 animate-pulse"></div>
          <div className="grid gap-1.5 md:gap-2">
            {Array.from({ length: INITIAL_LIMIT }, (_, i) => (
              <div
                key={`skeleton-${i}`}
                className="h-10 md:h-11 bg-gray-100 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 에러가 발생했거나 데이터가 없는 경우 표시하지 않음
  if (hasError || categories.length === 0) {
    return null;
  }

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

  const remainingCount = totalCount - INITIAL_LIMIT;

  return (
    <section className="py-4 lg:py-8 bg-gradient-to-b from-orange-50/50 to-white">
      <div className="container-1200">
        {/* 섹션 헤더 */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center gap-2 mb-1">
            <FlameIcon />
            <h2 className="text-mobile-lg lg:text-xl font-semibold text-gray-900">
              실시간 인기재능
            </h2>
            <span className="text-[10px] md:text-xs text-gray-700 bg-gray-200 px-1.5 py-0.5 rounded-full">
              최근 24시간
            </span>
          </div>
          <p className="text-mobile-md text-gray-600">지금 가장 많이 찾는 카테고리</p>
        </div>

        {/* 막대 그래프 */}
        <div className="grid gap-1.5 md:gap-2">
          {categories.map((category, index) => {
            const barColor = barColors[index % barColors.length];
            const animatedWidth = isAnimated ? `${Math.max(category.ratio, 8)}%` : '0%';
            const isTop3 = index < 3;
            const isNewItem = index >= INITIAL_LIMIT;

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className={`group block transition-all duration-300 ${isNewItem ? 'animate-fade-in-slide' : ''}`}
                style={{
                  animationDelay: isNewItem ? `${(index - INITIAL_LIMIT) * 50}ms` : undefined,
                }}
              >
                <div
                  className={`
                  relative flex items-center gap-2 md:gap-3 p-2 md:p-2.5 rounded-lg
                  bg-white border border-gray-100
                  hover:border-orange-200 hover:shadow-sm
                  transition-all duration-200
                  ${isTop3 ? 'border-orange-100' : ''}
                `}
                >
                  {/* 순위 뱃지 */}
                  <div
                    className={`
                    flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full
                    flex items-center justify-center font-bold text-[10px] md:text-xs
                    ${
                      isTop3
                        ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }
                  `}
                  >
                    {index + 1}
                  </div>

                  {/* 카테고리명 + 막대 그래프 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`
                        font-medium truncate text-xs md:text-sm
                        ${isTop3 ? 'text-gray-900' : 'text-gray-700'}
                      `}
                      >
                        {category.name}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <TrendingUpIcon
                          className={`w-3 h-3 ${isTop3 ? 'text-orange-500' : 'text-gray-400'}`}
                        />
                        <span
                          className={`text-[10px] md:text-xs font-medium ${isTop3 ? 'text-orange-600' : 'text-gray-500'}`}
                        >
                          {category.clicks.toLocaleString('ko-KR')}
                        </span>
                      </div>
                    </div>

                    {/* 진행 막대 */}
                    <div className="h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-1000 ease-out`}
                        style={{
                          width: animatedWidth,
                          transitionDelay: isNewItem ? `${(index - INITIAL_LIMIT) * 50}ms` : '0ms',
                        }}
                      />
                    </div>
                  </div>

                  {/* 화살표 */}
                  <ChevronRightIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* 펼치기/접기 버튼 */}
        {remainingCount > 0 && (
          <div className="mt-4 md:mt-6 text-center">
            <button
              onClick={handleExpand}
              disabled={isExpanding}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-full hover:from-orange-600 hover:to-red-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <ExpandButtonContent
                isExpanding={isExpanding}
                isExpanded={isExpanded}
                remainingCount={remainingCount}
              />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in-slide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-slide {
          animation: fade-in-slide 0.3s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
