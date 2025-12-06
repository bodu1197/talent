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

// 광고 카피 - 한 글자씩 떨어짐
const COPY_TEXT = '귀찮은 일 모두 돌파구에 맡겨 주세요';

export default function ErrandBannerStrip() {
  const [scooterStarted, setScooterStarted] = useState(false);
  const [scooterStopped, setScooterStopped] = useState(false);
  const [visibleChars, setVisibleChars] = useState<number[]>([]);
  const [bikePosition, setBikePosition] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const animationRef = useRef<number | null>(null);

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

  // 오토바이 위치 추적 및 글자 떨어뜨리기
  useEffect(() => {
    if (!scooterStarted) return;

    const chars = COPY_TEXT.split('');
    const totalDuration = 7000; // 7초 애니메이션
    const startTime = Date.now();
    let lastCharIndex = -1;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // 오토바이 위치 계산 (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const maxPosition = typeof window !== 'undefined' ? window.innerWidth - 450 : 800;
      const currentPosition = -150 + easeOut * (maxPosition + 150);
      setBikePosition(currentPosition);

      // 글자 떨어뜨리기 - 오토바이가 지나간 위치에 따라
      const charInterval = (maxPosition + 150) / chars.length;
      const currentCharIndex = Math.floor((currentPosition + 150) / charInterval);

      if (currentCharIndex > lastCharIndex && currentCharIndex < chars.length) {
        for (let i = lastCharIndex + 1; i <= currentCharIndex; i++) {
          if (!visibleChars.includes(i)) {
            setVisibleChars((prev) => [...prev, i]);
          }
        }
        lastCharIndex = currentCharIndex;
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setScooterStopped(true);
        // 마지막에 모든 글자 표시
        setVisibleChars(chars.map((_, i) => i));
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [scooterStarted]);

  const chars = COPY_TEXT.split('');

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* 오토바이 */}
      <div
        className="absolute pointer-events-none z-50"
        style={{
          top: 'calc(50% - 100px)',
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
            transform: `translateX(${bikePosition}px)`,
          }}
        >
          {/* 연기 효과 */}
          {!scooterStopped && scooterStarted && (
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
            {/* 떨어지는 글자들 - 가로로 배치 */}
            <div className="flex-1 flex items-center justify-center gap-0.5 md:gap-1 pl-4 md:pl-20 flex-wrap">
              {chars.map((char, index) => (
                <span
                  key={index}
                  className={`text-white font-bold text-xl md:text-3xl lg:text-4xl ${
                    visibleChars.includes(index) ? 'opacity-100' : 'opacity-0'
                  } ${char === ' ' ? 'w-2 md:w-4' : ''}`}
                  style={{
                    animation: visibleChars.includes(index)
                      ? 'text-bounce-drop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                      : 'none',
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                    color: char === '돌' || char === '파' || char === '구' ? '#fb923c' : 'white',
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
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
