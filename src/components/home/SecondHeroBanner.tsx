'use client';

import Link from 'next/link';
import Image from 'next/image';

// 인라인 SVG 아이콘들
const MapPinIcon = () => (
  <svg
    className="w-3.5 h-3.5 animate-pulse"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
    />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  </svg>
);

const NavigationIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
    />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

export default function SecondHeroBanner() {
  return (
    <section className="py-6 md:py-10">
      <div className="container-1200">
        {/* 메인 배너 영역 - 어두운 테마 */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gray-900 border border-gray-800 shadow-2xl">
          {/* 배경 도트 패턴 */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#4B5563 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 p-6 md:p-10 lg:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* 좌측: 텍스트 콘텐츠 */}
              <div className="text-center md:text-left max-w-md">
                {/* 위치 뱃지 */}
                <div className="inline-flex items-center gap-2 bg-gray-800/80 backdrop-blur border border-gray-700 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-4">
                  <MapPinIcon />
                  <span>서울시 강남구 역삼동 기준</span>
                </div>

                {/* 메인 타이틀 */}
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3">
                  내 주변 <span className="text-green-400">3명의 헬퍼</span>가
                  <br />
                  대기하고 있어요
                </h2>

                {/* 서브텍스트 */}
                <p className="text-gray-400 text-sm md:text-base mb-6">
                  지금 요청하면 평균 <span className="text-white font-bold">5분 내</span>{' '}
                  매칭됩니다.
                </p>

                {/* CTA 버튼 */}
                <Link
                  href="/search?category=errands"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-blue-900/50 transition transform active:scale-95"
                >
                  <ZapIcon />
                  지금 호출하기
                </Link>
              </div>

              {/* 우측: 레이더 시각화 (md 이상에서만) */}
              <div className="hidden md:flex relative w-56 h-56 lg:w-64 lg:h-64 items-center justify-center flex-shrink-0">
                {/* 중앙 사용자 위치 */}
                <div className="absolute w-4 h-4 bg-blue-500 rounded-full z-20 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse" />
                <div className="absolute bg-blue-500/20 w-16 h-16 rounded-full blur-md" />

                {/* Ripple 효과 */}
                <div
                  className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping"
                  style={{ animationDuration: '3s' }}
                />
                <div
                  className="absolute inset-6 rounded-full border border-blue-500/20 animate-ping"
                  style={{ animationDuration: '3s', animationDelay: '1s' }}
                />
                <div
                  className="absolute inset-12 rounded-full border border-blue-500/10 animate-ping"
                  style={{ animationDuration: '3s', animationDelay: '2s' }}
                />

                {/* 헬퍼 1 - 좌상단 */}
                <div
                  className="absolute top-8 left-8 animate-bounce"
                  style={{ animationDuration: '2s' }}
                >
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-green-500 flex items-center justify-center overflow-hidden shadow-lg">
                    <Image
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                      alt="Helper"
                      width={40}
                      height={40}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                    300m
                  </div>
                </div>

                {/* 헬퍼 2 - 우하단 */}
                <div
                  className="absolute bottom-6 right-8 animate-bounce"
                  style={{ animationDuration: '2.5s' }}
                >
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-green-500 flex items-center justify-center overflow-hidden shadow-lg">
                    <Image
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka"
                      alt="Helper"
                      width={40}
                      height={40}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                    0.8km
                  </div>
                </div>

                {/* 헬퍼 3 - 우측 중앙 */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 right-0 animate-bounce"
                  style={{ animationDuration: '1.8s' }}
                >
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-green-500 flex items-center justify-center overflow-hidden shadow-lg">
                    <Image
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                      alt="Helper"
                      width={40}
                      height={40}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                    1.2km
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 특징 바 */}
          <div className="relative z-10 bg-gray-900/90 border-t border-gray-800 px-6 py-4">
            <div className="flex flex-wrap justify-center md:justify-around gap-4 md:gap-6 text-xs md:text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="text-green-500">
                  <ShieldCheckIcon />
                </div>
                <span>신원검증 완료</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-blue-500">
                  <NavigationIcon />
                </div>
                <span>실시간 경로 추적</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-purple-500">
                  <LockIcon />
                </div>
                <span>안전 결제 보장</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
