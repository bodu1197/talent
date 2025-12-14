'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 배달 오토바이 이미지 (데스크톱용)
const MotorcycleIcon = () => (
  <Image
    src="/delivery-bike.png"
    alt="배달 오토바이"
    width={360}
    height={360}
    sizes="256px"
    className="w-64 h-auto"
  />
);

// 광고 카피
const COPY_TEXT = '귀찮은 일 모두 돌파구에 맡겨 주세요';

export default function ErrandBannerStrip() {
  const [scooterStarted, setScooterStarted] = useState(false);
  // 종료 위치 상태 (초기값 1000, 마운트 후 계산)
  const [endPosition, setEndPosition] = useState(1000);
  const sectionRef = useRef<HTMLElement>(null);

  // 초기화 및 화면 너비 계산
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 도착 위치 계산: 화면 너비 - 450px
      setEndPosition(window.innerWidth - 450);

      // 리사이즈 대응
      const handleResize = () => setEndPosition(window.innerWidth - 450);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // 스크롤 감지하여 애니메이션 트리거
  useEffect(() => {
    // 모바일에서는 애니메이션 기능 끄기
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;

    let observer: IntersectionObserver | null = null;
    let startTimeout: NodeJS.Timeout | null = null;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && !scooterStarted) {
        // 감지 후 0.5초 뒤에 출발
        startTimeout = setTimeout(() => setScooterStarted(true), 500);
      }
    };

    const initTimeout = setTimeout(() => {
      observer = new IntersectionObserver(handleIntersect, { threshold: 0.6 });

      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }
    }, 1000);

    return () => {
      clearTimeout(initTimeout);
      if (startTimeout) clearTimeout(startTimeout);
      if (observer) observer.disconnect();
    };
  }, [scooterStarted]);

  return (
    <section ref={sectionRef} className="relative" style={{ overflow: 'visible' }}>
      {/* ... 기존 모바일 코드 유지 ... */}
      <div
        className="absolute pointer-events-none z-30 md:hidden overflow-hidden"
        style={{
          top: '50%',
          left: '-60px',
          transform: 'translateY(-50%)',
        }}
      >
        <Image
          src="/delivery-bike.png"
          alt="배달 오토바이"
          width={360}
          height={360}
          sizes="128px"
          className="w-32 h-auto opacity-70"
        />
      </div>

      {/* 데스크톱: 애니메이션 오토바이 (CSS Transition 적용) */}
      <div
        className="absolute pointer-events-none z-50 hidden md:block"
        style={{
          top: '50%',
          left: 0,
          right: 0,
          marginTop: '-160px',
          overflow: 'visible',
        }}
      >
        <div
          className="absolute flex items-center"
          style={{
            // 시작 위치: -150px, 도착 위치: endPosition
            transform: `translateX(${scooterStarted ? endPosition : -150}px)`,
            // GPU 가속을 사용한 부드러운 이동 (7초)
            transition: 'transform 7s cubic-bezier(0.1, 0.7, 1.0, 0.1)',
            willChange: 'transform',
          }}
        >
          {/* 연기 효과 - 오토바이가 출발하면 보임 */}
          {scooterStarted && (
            <div
              className="absolute -left-16 flex items-center gap-1 transition-opacity duration-500"
              style={{ opacity: scooterStarted ? 1 : 0 }}
            >
              <div
                className="w-10 h-10 rounded-full bg-gray-400/70"
                style={{ animation: 'smoke-puff 0.8s ease-out infinite' }}
              />
              <div
                className="w-8 h-8 rounded-full bg-gray-400/60"
                style={{ animation: 'smoke-puff 0.8s ease-out infinite 0.15s' }}
              />
              <div
                className="w-12 h-12 rounded-full bg-gray-400/50"
                style={{ animation: 'smoke-puff 0.8s ease-out infinite 0.3s' }}
              />
            </div>
          )}
          <MotorcycleIcon />
        </div>
      </div>

      {/* 글자를 가리는 마스크 - 오토바이 전체를 감싸고, 뒷바퀴가 왼쪽 끝 근처 (데스크톱만) */}
      {/* 시작 전: 전체 화면을 덮음 / 시작 후: 오토바이와 함께 이동 */}
      <div
        className="absolute inset-y-0 z-40 pointer-events-none hidden md:block"
        style={{
          left: '-70px',
          width: '300vw',
          transform: `translateX(${scooterStarted ? endPosition : -150}px)`,
          background:
            'linear-gradient(to right, transparent 0px, rgba(17,24,39,0.3) 15px, rgba(17,24,39,0.7) 30px, rgb(17,24,39) 50px)',
          transition: 'transform 7s cubic-bezier(0.1, 0.7, 1.0, 0.1)',
          willChange: 'transform',
        }}
      />

      {/* 배경 */}
      <div className="bg-gray-900 border-y border-gray-800">
        {/* 도트 패턴 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(#4B5563 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="container-1200 relative z-10">
          {/* 모바일: 세로 레이아웃 (오토바이 배경 위에 텍스트) */}
          <div className="flex flex-col items-center justify-center py-8 min-h-[120px] md:hidden relative z-40">
            {/* 글자 - 가로 한줄, 가독성 있는 큰 폰트 */}
            <div className="flex items-center justify-center flex-wrap mb-4">
              {COPY_TEXT.split('').map((char, index) => {
                const isSpace = char === ' ';
                const isHighlight = char === '돌' || char === '파' || char === '구';

                if (isSpace) {
                  return <span key={index} className="w-1.5" />;
                }

                return (
                  <span
                    key={index}
                    className="font-bold text-base"
                    style={{
                      textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                      color: isHighlight ? '#fb923c' : 'white',
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </div>

            {/* CTA 버튼 */}
            <Link
              href="/errands"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-900/50 transition transform active:scale-95 z-50"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <span>심부름 요청</span>
            </Link>
          </div>

          {/* 데스크톱: 가로 레이아웃 */}
          <div className="hidden md:flex items-center py-10 min-h-[200px]" style={{ gap: '200px' }}>
            {/* 글자들 - 항상 보이는 상태, 마스크에 의해 가려짐 */}
            <div className="flex items-center justify-center h-24">
              <div className="flex items-center">
                {COPY_TEXT.split('').map((char, index) => {
                  const isSpace = char === ' ';
                  const isHighlight = char === '돌' || char === '파' || char === '구';

                  if (isSpace) {
                    return <span key={index} className="w-3 lg:w-4" />;
                  }

                  return (
                    <span
                      key={index}
                      className="font-bold text-3xl lg:text-4xl"
                      style={{
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                        color: isHighlight ? '#fb923c' : 'white',
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* CTA 버튼 - 글자 뒤쪽에 배치 */}
            <Link
              href="/errands"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-blue-900/50 transition transform active:scale-95 flex-shrink-0 z-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <span>지금 심부름 요청하기</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
