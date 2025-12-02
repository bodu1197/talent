'use client';

import Link from 'next/link';

// 인라인 SVG 아이콘들
const SparklesIcon = () => (
  <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    className="w-4 h-4 md:w-5 md:h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg
    className="w-5 h-5 md:w-6 md:h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  </svg>
);

const ZapIcon = () => (
  <svg
    className="w-5 h-5 md:w-6 md:h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
    />
  </svg>
);

const WonIcon = () => <span className="text-lg md:text-xl font-bold">₩</span>;

export default function SecondHeroBanner() {
  return (
    <section className="py-6 md:py-10 bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="container-1200">
        {/* 메인 배너 영역 */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-10 lg:p-12 text-white">
          <div className="relative z-10 max-w-lg">
            {/* 뱃지 */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
              <SparklesIcon />
              <span>AI 매칭 시스템</span>
            </div>

            {/* 타이틀 */}
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 md:mb-4">
              귀찮은 일은 <br />
              <span className="text-yellow-300">돌파구</span>에게 맡기세요
            </h2>

            {/* 설명 */}
            <p className="text-blue-100 mb-6 md:mb-8 text-sm md:text-lg leading-relaxed">
              디자인, IT, 마케팅부터 AI 서비스까지.
              <br />
              검증된 전문가가 당신의 프로젝트를 완성해드립니다.
            </p>

            {/* CTA 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link
                href="/search"
                className="bg-white text-blue-600 px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2 shadow-lg text-sm md:text-base"
              >
                서비스 둘러보기 <ArrowRightIcon />
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-800/50 backdrop-blur-sm text-white border border-blue-400/30 px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-medium hover:bg-blue-800/70 transition flex items-center justify-center text-sm md:text-base"
              >
                전문가로 활동하기
              </Link>
            </div>
          </div>

          {/* 장식 SVG - PC에서만 표시 */}
          <div className="absolute top-1/2 right-[-50px] md:right-0 lg:right-10 transform -translate-y-1/2 opacity-10 md:opacity-20 lg:opacity-30 pointer-events-none">
            <svg width="280" height="280" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#FDBA74"
                d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.1C93.5,9,82.3,22.3,71.4,33.5C60.5,44.7,50,53.8,38.6,61.9C27.2,70,14.9,77.1,1.5,74.5C-11.9,71.9,-26.4,59.6,-39.7,49.2C-53,38.8,-65.1,30.3,-72.2,18.7C-79.3,7.1,-81.4,-7.6,-76.3,-20.9C-71.2,-34.2,-58.9,-46.1,-46.2,-53.8C-33.5,-61.5,-20.4,-65,-6.6,-53.6L0,-42.2Z"
                transform="translate(100 100)"
              />
            </svg>
          </div>
        </div>

        {/* 특징 카드 3개 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6">
          {/* 카드 1: 신뢰할 수 있는 전문가 */}
          <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/20 flex items-start gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 text-green-300 rounded-full flex items-center justify-center flex-shrink-0">
              <ShieldCheckIcon />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-lg text-white mb-1">
                신뢰할 수 있는 전문가
              </h3>
              <p className="text-blue-200 text-xs md:text-sm">
                본인 인증과 철저한 심사를 통과한 전문가들이에요.
              </p>
            </div>
          </div>

          {/* 카드 2: 빠른 AI 매칭 */}
          <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/20 flex items-start gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/20 text-purple-300 rounded-full flex items-center justify-center flex-shrink-0">
              <ZapIcon />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-lg text-white mb-1">빠른 AI 매칭</h3>
              <p className="text-blue-200 text-xs md:text-sm">
                요청 내용을 AI가 분석하여 적합한 전문가를 찾아드려요.
              </p>
            </div>
          </div>

          {/* 카드 3: 수수료 0% */}
          <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/20 flex items-start gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500/20 text-orange-300 rounded-full flex items-center justify-center flex-shrink-0">
              <WonIcon />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-lg text-white mb-1">수수료 0%</h3>
              <p className="text-blue-200 text-xs md:text-sm">
                판매자 수수료 없이 100% 수익을 가져가세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
