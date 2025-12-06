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

// 광고 카피 - 글자 단위로 떨어짐 (공백 제외)
const COPY_TEXT = '귀찮은 일 모두 돌파구에 맡겨 주세요';
const BIKE_WIDTH = 224; // 오토바이 너비 (w-56 = 224px)

export default function ErrandBannerStrip() {
  const [scooterStarted, setScooterStarted] = useState(false);
  const [scooterStopped, setScooterStopped] = useState(false);
  const [bikePosition, setBikePosition] = useState(-150);
  const [droppedChars, setDroppedChars] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // 공백을 제외한 글자 배열과 공백 위치 정보
  const charsWithSpace = COPY_TEXT.split('').map((char, i) => ({
    char,
    index: i,
    isSpace: char === ' ',
  }));
  const chars = charsWithSpace.filter((c) => !c.isSpace);

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
    if (!scooterStarted || typeof window === 'undefined') return;

    const totalDuration = 7000;
    const startTime = Date.now();
    const maxPosition = window.innerWidth - 450;

    // 글자들이 배치될 영역 (컨테이너 기준)
    const containerWidth = containerRef.current?.offsetWidth || 800;
    const textAreaStart = 100; // 왼쪽 여백
    const textAreaWidth = containerWidth - 200; // 글자 영역 너비
    const charSpacing = textAreaWidth / chars.length;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // 오토바이 위치 계산 (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentPosition = -150 + easeOut * (maxPosition + 150);
      setBikePosition(currentPosition);

      // 오토바이 뒷부분 위치 (오토바이가 완전히 지나간 위치)
      const bikeTailPosition = currentPosition + BIKE_WIDTH;

      // 각 글자가 오토바이가 지나간 후에 떨어지도록
      const newDroppedChars = new Set(droppedChars);
      for (let i = 0; i < chars.length; i++) {
        const charXPosition = textAreaStart + i * charSpacing;
        // 오토바이 꼬리가 글자 위치를 지나쳤을 때 떨어뜨림
        if (bikeTailPosition > charXPosition && !newDroppedChars.has(i)) {
          newDroppedChars.add(i);
        }
      }
      setDroppedChars(newDroppedChars);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setScooterStopped(true);
        // 마지막에 모든 글자 표시
        setDroppedChars(new Set(chars.map((_, i) => i)));
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [scooterStarted, chars.length]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* 오토바이 - 가장 위 레이어 */}
      <div
        className="absolute pointer-events-none z-50"
        style={{
          top: 'calc(50% - 150px)',
          left: 0,
          right: 0,
          transform: 'translateY(-50%)',
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

        <div className="container-1200 relative z-10" ref={containerRef}>
          <div className="flex items-center justify-between py-8 md:py-10 min-h-[180px] md:min-h-[200px]">
            {/* 떨어지는 글자들 - flexbox로 자연스러운 간격 */}
            <div className="flex-1 flex items-center justify-center h-20 md:h-24">
              <div className="flex items-center">
                {COPY_TEXT.split('').map((char, originalIndex) => {
                  // 공백이 아닌 글자의 인덱스 찾기
                  const charIndex = chars.findIndex((c) => c.index === originalIndex);
                  const isSpace = char === ' ';
                  const isDropped = !isSpace && charIndex !== -1 && droppedChars.has(charIndex);
                  const isHighlight = char === '돌' || char === '파' || char === '구';

                  if (isSpace) {
                    // 띄어쓰기는 자연스러운 간격으로
                    return <span key={originalIndex} className="w-2 md:w-3 lg:w-4" />;
                  }

                  return (
                    <span
                      key={originalIndex}
                      className="font-bold text-xl md:text-3xl lg:text-4xl"
                      style={{
                        opacity: isDropped ? 1 : 0,
                        transform: isDropped ? 'translateY(0)' : 'translateY(-80px)',
                        animation: isDropped
                          ? 'text-bounce-drop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                          : 'none',
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

            {/* CTA 버튼 - 우측 */}
            <Link
              href="/errands"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 md:px-6 md:py-3.5 rounded-xl font-bold text-sm md:text-base shadow-lg shadow-blue-900/50 transition transform active:scale-95 flex-shrink-0 z-20"
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
