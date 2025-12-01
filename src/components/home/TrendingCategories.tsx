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

// 기본 카테고리 데이터 (API 실패 시 또는 데이터 없을 때 사용)
const DEFAULT_CATEGORIES: CategoryData[] = [
  {
    id: 'ai-image-design',
    name: 'AI 이미지/디자인',
    slug: 'ai-image-design',
    icon: '🎨',
    clicks: 0,
    ratio: 100,
  },
  {
    id: 'ai-video-motion',
    name: 'AI 영상/모션',
    slug: 'ai-video-motion',
    icon: '🎬',
    clicks: 0,
    ratio: 85,
  },
  {
    id: 'ai-writing-content',
    name: 'AI 글쓰기/콘텐츠',
    slug: 'ai-writing-content',
    icon: '✍️',
    clicks: 0,
    ratio: 70,
  },
  {
    id: 'ai-programming',
    name: 'AI 프로그래밍',
    slug: 'ai-programming',
    icon: '💻',
    clicks: 0,
    ratio: 60,
  },
  {
    id: 'ai-audio-music',
    name: 'AI 음악/사운드',
    slug: 'ai-audio-music',
    icon: '🎵',
    clicks: 0,
    ratio: 50,
  },
  {
    id: 'general-design',
    name: '일반 디자인',
    slug: 'general-design',
    icon: '🎨',
    clicks: 0,
    ratio: 40,
  },
  {
    id: 'general-development',
    name: '일반 개발',
    slug: 'general-development',
    icon: '💻',
    clicks: 0,
    ratio: 30,
  },
  { id: 'marketing', name: '마케팅', slug: 'marketing', icon: '📢', clicks: 0, ratio: 20 },
];

export default function TrendingCategories() {
  const [data, setData] = useState<TrendingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/analytics/trending-categories');
        if (res.ok) {
          const result = await res.json();
          setData(result);
        } else {
          // API 실패 시 기본 데이터 사용
          setData({
            categories: DEFAULT_CATEGORIES,
            totalClicks: 0,
            period: '7d',
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to fetch trending categories:', error);
        // 에러 시 기본 데이터 사용
        setData({
          categories: DEFAULT_CATEGORIES,
          totalClicks: 0,
          period: '7d',
          updatedAt: new Date().toISOString(),
        });
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
      <section className="py-10 md:py-16 bg-gradient-to-b from-orange-50 to-white">
        <div className="container-1200">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
          <div className="grid gap-3 md:gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={`skeleton-${i}`}
                className="h-14 bg-gray-100 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 데이터가 없는 경우 (로딩 중이 아닌데 데이터가 없으면 기본값 사용)
  if (!data) {
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
    <section className="py-10 md:py-16 bg-gradient-to-b from-orange-50/80 to-white overflow-hidden">
      <div className="container-1200">
        {/* 섹션 헤더 */}
        <div className="flex items-center gap-2 mb-6 md:mb-8">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 md:w-7 md:h-7 text-orange-500 animate-pulse" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">실시간 인기재능</h2>
          </div>
          <span className="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            최근 7일
          </span>
        </div>

        {/* 막대 그래프 */}
        <div className="grid gap-2.5 md:gap-3">
          {data.categories.map((category, index) => {
            const barColor = barColors[index % barColors.length];
            const animatedWidth = isAnimated ? `${Math.max(category.ratio, 8)}%` : '0%';
            const isTop3 = index < 3;

            return (
              <Link key={category.id} href={`/categories/${category.slug}`} className="group block">
                <div
                  className={`
                  relative flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl
                  bg-white border border-gray-100
                  hover:border-orange-200 hover:shadow-md
                  transition-all duration-300 ease-out
                  ${isTop3 ? 'ring-1 ring-orange-100' : ''}
                `}
                >
                  {/* 순위 뱃지 */}
                  <div
                    className={`
                    flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full
                    flex items-center justify-center font-bold text-sm md:text-base
                    ${
                      isTop3
                        ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600'
                    }
                  `}
                  >
                    {index + 1}
                  </div>

                  {/* 카테고리 아이콘 */}
                  <span className="text-xl md:text-2xl flex-shrink-0">{category.icon}</span>

                  {/* 카테고리명 + 막대 그래프 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5 md:mb-2">
                      <span
                        className={`
                        font-medium truncate text-sm md:text-base
                        ${isTop3 ? 'text-gray-900' : 'text-gray-700'}
                      `}
                      >
                        {category.name}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        <TrendingUp
                          className={`w-3.5 h-3.5 ${isTop3 ? 'text-orange-500' : 'text-gray-400'}`}
                        />
                        <span
                          className={`text-xs md:text-sm font-medium ${isTop3 ? 'text-orange-600' : 'text-gray-500'}`}
                        >
                          {category.clicks.toLocaleString('ko-KR')}
                        </span>
                      </div>
                    </div>

                    {/* 진행 막대 */}
                    <div className="h-2 md:h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: animatedWidth }}
                      />
                    </div>
                  </div>

                  {/* 화살표 (호버 시) */}
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* 전체 보기 버튼 */}
        <div className="mt-6 md:mt-8 text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-full hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg"
          >
            <span>전체 카테고리 보기</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 업데이트 시간 */}
        <p className="text-center text-xs text-gray-400 mt-4">
          {new Date(data.updatedAt).toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          기준
        </p>
      </div>
    </section>
  );
}
