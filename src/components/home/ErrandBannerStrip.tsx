'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 배달 오토바이 이미지
const MotorcycleIcon = () => (
  <Image
    src="/delivery-bike.png"
    alt="배달 오토바이"
    width={300}
    height={200}
    className="w-44 h-auto md:w-56"
    unoptimized
  />
);

// 광고 카피 문구들
const COPY_TEXTS = [
  '귀찮은 일은 저희가',
  '번개처럼 빠르게',
  '뭐든 다 해드려요',
  '지금 바로 요청하세요!',
];

export default function ErrandBannerStrip() {
  const [scooterStarted, setScooterStarted] = useState(false);
  const [scooterStopped, setScooterStopped] = useState(false);
  const [visibleTexts, setVisibleTexts] = useState<number[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  // 스크롤 감지하여 스쿠터 애니메이션 시작
  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const delay = setTimeout(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !scooterStarted) {
            setScooterStarted(true);
          }
        },
        { threshold: 0.2 }
      );

      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }
    }, 1000);

    return () => {
      clearTimeout(delay);
      if (observer) observer.disconnect();
    };
  }, [scooterStarted]);

  // 오토바이 시작 후 텍스트 순차적으로 떨어뜨리기
  useEffect(() => {
    if (!scooterStarted) return;

    const timers: NodeJS.Timeout[] = [];
    const addVisibleText = (index: number) => {
      setVisibleTexts((prev) => [...prev, index]);
    };

    for (let i = 0; i < COPY_TEXTS.length; i++) {
      const timer = setTimeout(addVisibleText, 800 + i * 1200, i);
      timers.push(timer);
    }

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [scooterStarted]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* 오토바이 */}
      <div
        className="absolute pointer-events-none z-50"
        style={{
          top: 'calc(50% - 150px)',
          left: 0,
          right: 0,
          transform: 'translateY(-50%)',
          overflow: 'visible',
        }}
      >
        {/* 모바일: 고정 위치 */}
        <div
          className="absolute flex items-center md:hidden"
          style={{ transform: 'translateX(-80px)' }}
        >
          <MotorcycleIcon />
        </div>

        {/* 데스크톱: 애니메이션 */}
        <div
          className="absolute hidden md:flex items-center"
          style={{
            transform: scooterStarted ? undefined : 'translateX(-150px)',
            animation: scooterStarted ? 'scooter-enter 7s ease-out forwards' : 'none',
          }}
          onAnimationEnd={() => setScooterStopped(true)}
        >
          {/* 연기 효과 */}
          {!scooterStopped && (
            <div className="absolute -left-16 flex items-center gap-1">
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
              <div
                className="w-8 h-8 rounded-full bg-gray-400/40"
                style={{ animation: 'smoke-puff 0.8s ease-out infinite 0.45s' }}
              />
            </div>
          )}
          <MotorcycleIcon />
        </div>
      </div>

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
          <div className="flex items-center justify-between py-8 md:py-10 min-h-[180px] md:min-h-[200px]">
            {/* 떨어지는 텍스트 영역 - 중앙 */}
            <div className="flex-1 flex flex-col items-center justify-center gap-2 md:gap-3 pl-24 md:pl-64">
              {COPY_TEXTS.map((text, index) => (
                <div
                  key={text}
                  className={`text-white font-bold text-base md:text-xl lg:text-2xl whitespace-nowrap ${
                    visibleTexts.includes(index) ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    animation: visibleTexts.includes(index)
                      ? 'text-bounce-drop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                      : 'none',
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  }}
                >
                  {index === COPY_TEXTS.length - 1 ? (
                    <span className="text-orange-400">{text}</span>
                  ) : (
                    text
                  )}
                </div>
              ))}
            </div>

            {/* CTA 버튼 - 우측 */}
            <Link
              href="/errands"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 md:px-6 md:py-3.5 rounded-xl font-bold text-sm md:text-base shadow-lg shadow-blue-900/50 transition transform active:scale-95 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <span className="hidden sm:inline">지금 심부름 요청하기</span>
              <span className="sm:hidden">심부름 요청</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
