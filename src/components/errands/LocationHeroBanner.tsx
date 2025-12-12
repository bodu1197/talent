'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// 인라인 SVG 아이콘들
const HomeIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
  </svg>
);

const MicIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
    />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const MapPinIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
    />
  </svg>
);

const WrenchIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
    />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
    />
  </svg>
);

const PuzzleIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"
    />
  </svg>
);

// 로딩 스피너
const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// 카테고리 설정 (아이콘, 스타일 등)
const categoryConfig: Record<
  string,
  {
    title: string;
    subtitle: string;
    description: string;
    icon: React.FC;
    gradient: string;
    bgLight: string;
    textColor: string;
  }
> = {
  living: {
    title: '생활 서비스',
    subtitle: '청소 · 수리 · 이사 · 정리수납',
    description: '내 주변 전문가가 직접 방문해요',
    icon: HomeIcon,
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  event: {
    title: '이벤트',
    subtitle: 'MC · 사회자 · 공연 · 행사',
    description: '가까운 곳에서 특별한 순간을',
    icon: MicIcon,
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
  },
  beauty: {
    title: '뷰티 · 패션',
    subtitle: '메이크업 · 헤어 · 네일 · 스타일링',
    description: '동네에서 만나는 뷰티 전문가',
    icon: SparklesIcon,
    gradient: 'from-pink-500 to-rose-600',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600',
  },
  'custom-order': {
    title: '주문제작',
    subtitle: '맞춤 제작 · 커스텀 상품 · 핸드메이드',
    description: '근처 공방에서 나만의 것을',
    icon: WrenchIcon,
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  'counseling-coaching': {
    title: '상담 · 코칭',
    subtitle: '심리상담 · 커리어 · 라이프 코칭',
    description: '가까운 전문가와 1:1 상담',
    icon: ChatBubbleIcon,
    gradient: 'from-sky-500 to-blue-600',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-600',
  },
  'hobby-handmade': {
    title: '취미 · 핸드메이드',
    subtitle: '공예 · DIY · 클래스 · 원데이',
    description: '동네 원데이클래스 발견하기',
    icon: PuzzleIcon,
    gradient: 'from-fuchsia-500 to-pink-600',
    bgLight: 'bg-fuchsia-50',
    textColor: 'text-fuchsia-600',
  },
};

interface CategoryCount {
  category_slug: string;
  count: number;
}

export default function LocationHeroBanner() {
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  // 전체 카테고리 수 가져오기
  const fetchCategoryCounts = useCallback(async () => {
    setIsLoadingCounts(true);
    try {
      const response = await fetch('/api/experts/nearby/categories');
      if (response.ok) {
        const data = await response.json();
        setCategoryCounts(data.categories || []);
      }
    } catch (error) {
      console.error('카테고리 수 로딩 실패:', error);
    } finally {
      setIsLoadingCounts(false);
    }
  }, []);

  // 컴포넌트 마운트 시 카테고리 수 가져오기
  useEffect(() => {
    fetchCategoryCounts();
  }, [fetchCategoryCounts]);

  // 카테고리 슬러그로 전문가 수 가져오기
  const getCount = (slug: string): number => {
    const found = categoryCounts.find((c) => c.category_slug === slug);
    return found?.count || 0;
  };

  // 배지 배경색 결정
  const getBadgeBackground = (loading: boolean, hasExperts: boolean) => {
    if (loading) return 'bg-white/20';
    if (hasExperts) return 'bg-white/25';
    return 'bg-white/15';
  };

  // 카테고리 데이터 생성
  const categories = Object.entries(categoryConfig).map(([slug, config]) => ({
    id: slug,
    ...config,
    href: `/search?category=${slug}`,
    count: getCount(slug),
  }));

  return (
    <section className="py-6 md:py-10">
      <div className="container-1200">
        {/* 헤더 */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
            <span className="text-orange-500">내 주변</span>의 프리미엄 전문가
          </h2>
          <p className="text-gray-500 text-sm md:text-base">
            가까운 곳에서 직접 만나는 전문가 서비스
          </p>
        </div>

        {/* 카드 컨테이너 */}
        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const hasExperts = category.count > 0;

            return (
              <Link
                key={category.id}
                href={category.href}
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
                    {/* 상단: 아이콘 + 전문가 수 배지 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                        <IconComponent />
                      </div>
                      {/* 전문가 수 배지 */}
                      <div
                        className={`flex items-center gap-1 backdrop-blur-sm px-2.5 py-1 rounded-full ${getBadgeBackground(isLoadingCounts, hasExperts)}`}
                      >
                        {isLoadingCounts ? (
                          <LoadingSpinner className="w-3 h-3 text-white" />
                        ) : (
                          <>
                            <MapPinIcon className="w-3 h-3 text-white" />
                            <span className="text-white text-xs font-medium">
                              {hasExperts ? `전문가 ${category.count}명` : '전문가 찾기'}
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
                      <span>{hasExperts ? '전문가 보기' : '전문가 찾기'}</span>
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
