'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

import {
  HomeIcon,
  MicIcon,
  SparklesIcon,
  WrenchIcon,
  ChatBubbleIcon,
  PuzzleIcon,
  MapPinIcon,
  ArrowRightIcon,
  LoadingSpinner,
} from '@/components/home/HeroIcons';

// 카테고리 설정 (아이콘, 스타일) - slug는 실제 카테고리 slug와 일치해야 함
const categoryConfig = [
  {
    slug: 'life-service',
    title: '생활 서비스',
    subtitle: '청소 · 수리 · 이사 · 정리수납',
    description: '내 주변 전문가가 직접 방문해요',
    icon: HomeIcon,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    slug: 'event',
    title: '이벤트',
    subtitle: 'MC · 사회자 · 공연 · 행사',
    description: '가까운 곳에서 특별한 순간을',
    icon: MicIcon,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    slug: 'beauty-fashion',
    title: '뷰티 · 패션',
    subtitle: '메이크업 · 헤어 · 네일 · 스타일링',
    description: '동네에서 만나는 뷰티 전문가',
    icon: SparklesIcon,
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    slug: 'custom-order',
    title: '주문제작',
    subtitle: '맞춤 제작 · 커스텀 상품 · 핸드메이드',
    description: '근처 공방에서 나만의 것을',
    icon: WrenchIcon,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    slug: 'counseling-coaching',
    title: '상담 · 코칭',
    subtitle: '심리상담 · 커리어 · 라이프 코칭',
    description: '가까운 전문가와 1:1 상담',
    icon: ChatBubbleIcon,
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    slug: 'hobby-handmade',
    title: '취미 · 핸드메이드',
    subtitle: '공예 · DIY · 클래스 · 원데이',
    description: '동네 원데이클래스 발견하기',
    icon: PuzzleIcon,
    gradient: 'from-fuchsia-500 to-pink-600',
  },
];

interface CategoryServiceCount {
  slug: string;
  count: number;
}

export default function ThirdHeroBanner() {
  const [serviceCounts, setServiceCounts] = useState<CategoryServiceCount[]>([]);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  // 카테고리별 서비스 수 가져오기 (전체 등록 서비스)
  const fetchServiceCounts = useCallback(async () => {
    setIsLoadingCounts(true);
    try {
      const slugs = categoryConfig.map((c) => c.slug);
      const response = await fetch(`/api/categories/service-counts?slugs=${slugs.join(',')}`);
      if (response.ok) {
        const data = await response.json();
        setServiceCounts(data.counts || []);
      }
    } catch (error) {
      console.error('서비스 수 로딩 실패:', error);
    } finally {
      setIsLoadingCounts(false);
    }
  }, []);

  // 컴포넌트 마운트 시 서비스 수 가져오기
  useEffect(() => {
    fetchServiceCounts();
  }, [fetchServiceCounts]);

  // 카테고리 슬러그로 서비스 수 가져오기
  const getServiceCount = (slug: string): number => {
    const found = serviceCounts.find((c) => c.slug === slug);
    return found?.count || 0;
  };

  // 배지 배경색 헬퍼 함수
  const getBadgeBackground = (loading: boolean, hasExperts: boolean): string => {
    if (loading) return 'bg-white/20';
    if (hasExperts) return 'bg-white/25';
    return 'bg-white/15';
  };

  return (
    <section className="py-6 md:py-10">
      <div className="container-1200">
        {/* 헤더 */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
            <span className="text-orange-700">내 주변</span>의 프리미엄 전문가
          </h2>
          <p className="text-gray-500 text-sm md:text-base">
            가까운 곳에서 직접 만나는 전문가 서비스
          </p>
        </div>

        {/* 카드 컨테이너 - 모바일: 가로 스크롤, 데스크톱: 그리드 */}
        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {categoryConfig.map((category) => {
            const IconComponent = category.icon;
            const serviceCount = getServiceCount(category.slug);
            const hasServices = serviceCount > 0;

            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group flex-shrink-0 w-[85%] sm:w-[70%] md:w-auto snap-center"
              >
                <div
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.gradient} p-6 md:p-8 h-full min-h-[200px] md:min-h-[220px] transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl`}
                >
                  {/* 배경 장식 */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                  {/* 콘텐츠 */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* 상단: 아이콘 + 서비스 수 배지 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                        <IconComponent />
                      </div>
                      {/* 내주변 서비스 수 배지 */}
                      <div
                        className={`flex items-center gap-1 backdrop-blur-sm px-2.5 py-1 rounded-full ${getBadgeBackground(isLoadingCounts, hasServices)}`}
                      >
                        {isLoadingCounts ? (
                          <LoadingSpinner className="w-3 h-3 text-white" />
                        ) : (
                          <>
                            <MapPinIcon className="w-3 h-3 text-white" />
                            <span className="text-white text-xs font-medium">
                              {hasServices ? `서비스 ${serviceCount}개` : '내주변 서비스'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 텍스트 */}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                      {category.title}
                    </h3>
                    <p className="text-white/80 text-sm mb-2">{category.subtitle}</p>
                    <p className="text-white/60 text-xs mb-auto">{category.description}</p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-white font-medium text-sm mt-4 group-hover:gap-3 transition-all duration-300">
                      <span>{hasServices ? '서비스 보기' : '전문가 찾기'}</span>
                      <ArrowRightIcon />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
