'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ErrandBannerStrip() {
  const [scooterStarted, setScooterStarted] = useState(false);
  const [scooterStopped, setScooterStopped] = useState(false);
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
        { threshold: 0.3 }
      );

      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }
    }, 500);

    return () => {
      clearTimeout(delay);
      if (observer) observer.disconnect();
    };
  }, [scooterStarted]);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden"
    >
      {/* 도로 패턴 배경 */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.3) 50px, rgba(255,255,255,0.3) 100px)`,
          }}
        />
        {/* 도로 중앙선 */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-400/30" />
      </div>

      {/* 오토바이 애니메이션 - 왼쪽에서 오른쪽으로 */}
      <div
        className="absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center"
        style={{
          left: scooterStarted ? undefined : '-200px',
          animation:
            scooterStarted && !scooterStopped ? 'scooter-strip-enter 5s ease-out forwards' : 'none',
        }}
        onAnimationEnd={() => setScooterStopped(true)}
      >
        {/* 연기 효과 */}
        {scooterStarted && !scooterStopped && (
          <div className="absolute -left-12 flex items-center gap-0.5">
            <div
              className="w-6 h-6 rounded-full bg-gray-300/60"
              style={{ animation: 'smoke-puff 0.6s ease-out infinite' }}
            />
            <div
              className="w-5 h-5 rounded-full bg-gray-300/50"
              style={{ animation: 'smoke-puff 0.6s ease-out infinite 0.1s' }}
            />
            <div
              className="w-7 h-7 rounded-full bg-gray-300/40"
              style={{ animation: 'smoke-puff 0.6s ease-out infinite 0.2s' }}
            />
          </div>
        )}
        <Image
          src="/delivery-bike.png"
          alt="배달 오토바이"
          width={160}
          height={100}
          className="w-24 md:w-32 h-auto"
          unoptimized
        />
      </div>

      {/* CTA 버튼 - 우측 고정 */}
      <div className="container-1200 relative z-10">
        <div className="flex items-center justify-end py-3 md:py-4">
          <Link
            href="/errands/new"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-yellow-50 text-blue-700 font-bold px-4 py-2 md:px-5 md:py-2.5 rounded-full text-sm md:text-base shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            <span className="hidden sm:inline">심부름 요청하기</span>
            <span className="sm:hidden">요청</span>
          </Link>
        </div>
      </div>

      {/* 애니메이션 스타일 */}
      <style jsx>{`
        @keyframes scooter-strip-enter {
          0% {
            transform: translateX(-200px) translateY(-50%);
          }
          70% {
            transform: translateX(calc(100vw * 0.15)) translateY(-50%);
          }
          100% {
            transform: translateX(calc(100vw * 0.12)) translateY(-50%);
          }
        }

        @keyframes smoke-puff {
          0% {
            opacity: 0.6;
            transform: scale(0.5) translateX(0);
          }
          100% {
            opacity: 0;
            transform: scale(1.5) translateX(-20px);
          }
        }
      `}</style>
    </section>
  );
}
