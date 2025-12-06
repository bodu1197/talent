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
    className="w-52 h-auto md:w-64"
    unoptimized
  />
);

// 광고 카피
const COPY_TEXT = '귀찮은 일 모두 돌파구에 맡겨 주세요';

export default function ErrandBannerStrip() {
  const [scooterStarted, setScooterStarted] = useState(false);
  const [scooterStopped, setScooterStopped] = useState(false);
  const [bikePosition, setBikePosition] = useState(-150);
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

  // 오토바이 위치 추적
  useEffect(() => {
    if (!scooterStarted || typeof window === 'undefined') return;

    const totalDuration = 7000;
    const startTime = Date.now();
    const maxPosition = window.innerWidth - 450;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // 오토바이 위치 계산 (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentPosition = -150 + easeOut * (maxPosition + 150);
      setBikePosition(currentPosition);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setScooterStopped(true);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [scooterStarted]);

  return (
    <section ref={sectionRef} className="relative" style={{ overflow: 'visible' }}>
      {/* 오토바이 - 가장 위 레이어 */}
      <div
        className="absolute pointer-events-none z-50"
        style={{
          top: '50%',
          left: 0,
          right: 0,
          marginTop: '-190px',
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

      {/* 글자를 가리는 마스크 - 오토바이 전체를 감싸고, 뒷바퀴가 왼쪽 끝 근처 (데스크톱만) */}
      {/* 시작 전: 전체 화면을 덮음 / 시작 후: 오토바이와 함께 이동 */}
      <div
        className="absolute inset-y-0 bg-gray-900 z-40 pointer-events-none hidden md:block"
        style={{
          left: scooterStarted ? `${bikePosition - 20}px` : '0px',
          width: '300vw',
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
          <div
            className="flex items-center py-8 md:py-10 min-h-[180px] md:min-h-[200px]"
            style={{ gap: '100px' }}
          >
            {/* 글자들 - 항상 보이는 상태, 마스크에 의해 가려짐 */}
            <div className="flex items-center justify-center h-20 md:h-24">
              <div className="flex items-center">
                {COPY_TEXT.split('').map((char, index) => {
                  const isSpace = char === ' ';
                  const isHighlight = char === '돌' || char === '파' || char === '구';

                  if (isSpace) {
                    return <span key={index} className="w-2 md:w-3 lg:w-4" />;
                  }

                  return (
                    <span
                      key={index}
                      className="font-bold text-xl md:text-3xl lg:text-4xl"
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
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 md:px-6 md:py-3.5 rounded-xl font-bold text-sm md:text-base shadow-lg shadow-blue-900/50 transition transform active:scale-95 flex-shrink-0 z-50"
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
