'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Flame, ChevronRight } from 'lucide-react';

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
  totalClicks: number;
  period: string;
  updatedAt: string;
}

export default function TrendingCategories() {
  const [data, setData] = useState<TrendingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimated, setIsAnimated] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/analytics/trending-categories');
        if (res.ok) {
          const result = await res.json();
          setData(result);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error('Failed to fetch trending categories:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // 애니메이션 트리거
  useEffect(() => {
    if (!isLoading && data) {
      const timer = setTimeout(() => {
        setIsAnimated(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);

  // 로딩 스켈레톤
  if (isLoading) {
    return (
      <section className="py-4 lg:py-8 bg-gradient-to-b from-orange-50/50 to-white">
        <div className="container-1200">
          <div className="h-5 bg-gray-200 rounded w-36 mb-4 animate-pulse"></div>
          <div className="grid gap-1.5 md:gap-2">
            {Array.from({ length: 10 }, (_, i) => (
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
  if (hasError || !data || data.categories.length === 0) {
    return null;
  }

  // 그래프 색상 배열 (그라데이션 효과)
  const barColors = [
    'from-orange-500 to-red-500', // 1위: 주황-빨강
    'from-amber-500 to-orange-500', // 2위: 호박-주황
    'from-yellow-500 to-amber-500', // 3위: 노랑-호박
    'from-lime-500 to-yellow-500', // 4위
    'from-emerald-500 to-lime-500', // 5위
    'from-teal-500 to-emerald-500', // 6위
    'from-cyan-500 to-teal-500', // 7위
    'from-blue-500 to-cyan-500', // 8위
  ];

  return (
    <section className="py-4 lg:py-8 bg-gradient-to-b from-orange-50/50 to-white">
      <div className="container-1200">
        {/* 섹션 헤더 - 다른 섹션과 동일한 스타일 */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-mobile-lg lg:text-xl font-semibold text-gray-900">
              실시간 인기재능
            </h2>
            <span className="text-[10px] md:text-xs text-gray-700 bg-gray-200 px-1.5 py-0.5 rounded-full">
              최근 24시간
            </span>
          </div>
          <p className="text-mobile-md text-gray-600">지금 가장 많이 찾는 카테고리</p>
        </div>

        {/* 막대 그래프 - 컴팩트한 디자인 */}
        <div className="grid gap-1.5 md:gap-2">
          {data.categories.map((category, index) => {
            const barColor = barColors[index % barColors.length];
            const animatedWidth = isAnimated ? `${Math.max(category.ratio, 8)}%` : '0%';
            const isTop3 = index < 3;

            return (
              <Link key={category.id} href={`/categories/${category.slug}`} className="group block">
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
                        <TrendingUp
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
                        style={{ width: animatedWidth }}
                      />
                    </div>
                  </div>

                  {/* 화살표 (호버 시) */}
                  <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* 전체 보기 버튼 */}
        <div className="mt-4 md:mt-6 text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-full hover:from-orange-600 hover:to-red-600 transition-all shadow-sm hover:shadow-md"
          >
            <span>전체 카테고리 보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
