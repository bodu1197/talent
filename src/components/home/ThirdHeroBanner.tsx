'use client';

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

// 카테고리 데이터
const categories = [
  {
    id: 'living',
    title: '생활 서비스',
    subtitle: '청소 · 수리 · 이사 · 정리수납',
    description: '전문가가 직접 방문합니다',
    icon: HomeIcon,
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    href: '/search?category=living',
  },
  {
    id: 'event',
    title: '이벤트',
    subtitle: 'MC · 사회자 · 공연 · 행사',
    description: '특별한 순간을 빛내드립니다',
    icon: MicIcon,
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
    href: '/search?category=event',
  },
  {
    id: 'beauty',
    title: '뷰티 · 패션',
    subtitle: '메이크업 · 헤어 · 네일 · 스타일링',
    description: '당신만을 위한 변신',
    icon: SparklesIcon,
    gradient: 'from-pink-500 to-rose-600',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600',
    href: '/search?category=beauty',
  },
];

export default function ThirdHeroBanner() {
  return (
    <section className="py-6 md:py-10">
      <div className="container-1200">
        {/* 헤더 */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
            직접 만나는 <span className="text-blue-600">프리미엄 전문가</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base">
            현장에서 프리미엄 서비스를 경험하세요
          </p>
        </div>

        {/* 카드 컨테이너 - 모바일: 가로 스크롤, 데스크톱: 그리드 */}
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {categories.map((category) => {
            const IconComponent = category.icon;
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
                    {/* 아이콘 */}
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent />
                    </div>

                    {/* 텍스트 */}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                      {category.title}
                    </h3>
                    <p className="text-white/80 text-sm mb-2">{category.subtitle}</p>
                    <p className="text-white/60 text-xs mb-auto">{category.description}</p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-white font-medium text-sm mt-4 group-hover:gap-3 transition-all duration-300">
                      <span>바로가기</span>
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
