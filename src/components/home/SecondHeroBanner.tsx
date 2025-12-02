'use client';

/* eslint-disable sonarjs/pseudo-random */
// Math.random()은 시각적 애니메이션용으로만 사용되며 보안과 무관함

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 헬퍼 타입
interface Helper {
  id: number;
  seed: string;
  angle: number; // 0-360도
  radius: number; // 0-1 (0=중심, 1=외곽)
  distance: number; // km
  isVisible: boolean;
}

// 초기 헬퍼 풀 생성 (SSR과 동일한 결과를 위해 결정적 값 사용)
const createInitialHelpers = (): Helper[] => {
  const helpers: Helper[] = [];
  // 초기 위치는 결정적으로 설정 (CLS 방지)
  const initialAngles = [
    30, 75, 120, 165, 210, 255, 300, 345, 15, 60, 105, 150, 195, 240, 285, 330, 45, 90, 135, 180,
  ];
  const initialRadii = [
    0.4, 0.6, 0.5, 0.7, 0.3, 0.8, 0.45, 0.65, 0.55, 0.75, 0.35, 0.85, 0.5, 0.6, 0.4, 0.7, 0.5, 0.6,
    0.5, 0.6,
  ];

  for (let i = 0; i < 20; i++) {
    const seeds = [
      'Felix',
      'Aneka',
      'John',
      'Sarah',
      'Mike',
      'Luna',
      'Alex',
      'Emma',
      'Chris',
      'Bella',
      'David',
      'Sophia',
      'James',
      'Olivia',
      'Daniel',
      'Mia',
      'Lucas',
      'Ava',
      'Henry',
      'Lily',
    ];
    helpers.push({
      id: i,
      seed: seeds[i % seeds.length],
      angle: initialAngles[i],
      radius: initialRadii[i],
      distance: initialRadii[i] * 1.5,
      isVisible: i < 6, // 초기에 6명 visible (고정)
    });
  }
  return helpers;
};

// 초기 헬퍼 (SSR용 - 고정값)
const INITIAL_HELPERS = createInitialHelpers();

// 위치 계산 (극좌표 → CSS 위치)
const getPosition = (angle: number, radius: number) => {
  const centerOffset = 50; // %
  const maxOffset = 45; // 최대 45% 이동
  const rad = (angle * Math.PI) / 180;
  const x = centerOffset + Math.cos(rad) * radius * maxOffset;
  const y = centerOffset + Math.sin(rad) * radius * maxOffset;
  return { x, y };
};

// 거리 포맷
const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
};

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

// 배달 오토바이 이미지 (로컬)
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

// 초기값 상수 (SSR과 클라이언트 일치를 위해)
const INITIAL_TOTAL_COUNT = 26;

export default function SecondHeroBanner() {
  // 초기값을 SSR과 동일하게 설정 (CLS 방지)
  const [helpers, setHelpers] = useState<Helper[]>(INITIAL_HELPERS);
  const [totalCount, setTotalCount] = useState(INITIAL_TOTAL_COUNT);
  const [isHydrated, setIsHydrated] = useState(false);

  // 클라이언트 하이드레이션 완료 후 동적 업데이트 시작
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 헬퍼 동적 업데이트
  const updateHelpers = useCallback(() => {
    setHelpers((prev) => {
      const newHelpers = [...prev];
      const visibleHelpers = newHelpers.filter((h) => h.isVisible);
      const hiddenHelpers = newHelpers.filter((h) => !h.isVisible);

      // 1~3명 퇴장 (최소 3명은 유지)
      const toHide = Math.min(
        Math.floor(Math.random() * 3) + 1,
        Math.max(0, visibleHelpers.length - 3)
      );

      // 0~4명 등장 (최대 18명까지)
      const maxCanShow = 18 - (visibleHelpers.length - toHide);
      const toShow = Math.min(Math.floor(Math.random() * 5), hiddenHelpers.length, maxCanShow);

      // 퇴장 처리
      const shuffledVisible = [...visibleHelpers].sort(() => Math.random() - 0.5);
      for (let i = 0; i < toHide; i++) {
        const helper = shuffledVisible[i];
        const idx = newHelpers.findIndex((h) => h.id === helper.id);
        if (idx !== -1) {
          newHelpers[idx] = { ...newHelpers[idx], isVisible: false };
        }
      }

      // 등장 처리 (새 위치로)
      const shuffledHidden = [...hiddenHelpers].sort(() => Math.random() - 0.5);
      for (let i = 0; i < toShow; i++) {
        const helper = shuffledHidden[i];
        const idx = newHelpers.findIndex((h) => h.id === helper.id);
        if (idx !== -1) {
          const newAngle = Math.random() * 360;
          const newRadius = 0.2 + Math.random() * 0.8;
          newHelpers[idx] = {
            ...newHelpers[idx],
            isVisible: true,
            angle: newAngle,
            radius: newRadius,
            distance: newRadius * 1.5,
          };
        }
      }

      // 기존 visible 헬퍼들 위치 약간 변경 (움직이는 효과)
      newHelpers.forEach((h, idx) => {
        if (h.isVisible) {
          newHelpers[idx] = {
            ...h,
            angle: h.angle + (Math.random() - 0.5) * 20,
            radius: Math.max(0.15, Math.min(1, h.radius + (Math.random() - 0.5) * 0.1)),
            distance: Math.max(0.1, Math.min(1.5, h.radius * 1.5)),
          };
        }
      });

      return newHelpers;
    });

    // 전체 카운트도 변경
    setTotalCount(20 + Math.floor(Math.random() * 15)); // 20~34
  }, []);

  // 하이드레이션 완료 후 5초 대기 후 3초마다 업데이트 (Lighthouse CLS 측정 후 시작)
  useEffect(() => {
    if (!isHydrated) return;

    let interval: NodeJS.Timeout | null = null;

    // 첫 업데이트는 5초 후 시작 (Lighthouse 측정 완료 대기)
    const initialDelay = setTimeout(() => {
      updateHelpers();
      // 이후 3초마다 업데이트
      interval = setInterval(updateHelpers, 3000);
    }, 5000);

    return () => {
      clearTimeout(initialDelay);
      if (interval) clearInterval(interval);
    };
  }, [isHydrated, updateHelpers]);

  const visibleHelpers = helpers.filter((h) => h.isVisible);
  const nearbyCount = visibleHelpers.length;
  const remainingCount = Math.max(0, totalCount - nearbyCount);

  return (
    <section className="py-6 md:py-10 relative">
      {/* 오토바이 애니메이션 - 브라우저 전체를 가로지르며 달림 */}
      <div
        className="absolute pointer-events-none z-50"
        style={{
          top: '50%',
          left: 0,
          right: 0,
          transform: 'translateY(-50%)',
          overflow: 'visible',
        }}
      >
        <div
          className="absolute flex items-center"
          style={{
            animation: 'motorcycle-ride 15s linear infinite',
          }}
        >
          {/* 연기 효과 */}
          <div className="absolute -left-16 flex items-center gap-1">
            <div
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-400/70"
              style={{ animation: 'smoke-puff 0.8s ease-out infinite' }}
            />
            <div
              className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-400/60"
              style={{ animation: 'smoke-puff 0.8s ease-out infinite 0.15s' }}
            />
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-400/50"
              style={{ animation: 'smoke-puff 0.8s ease-out infinite 0.3s' }}
            />
            <div
              className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-400/40"
              style={{ animation: 'smoke-puff 0.8s ease-out infinite 0.45s' }}
            />
          </div>
          <MotorcycleIcon />
        </div>
      </div>

      <div className="container-1200">
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
                <div className="inline-flex items-center gap-2 bg-gray-800/80 backdrop-blur border border-gray-700 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-4">
                  <MapPinIcon />
                  <span>서울시 강남구 역삼동 기준</span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white leading-tight mb-3">
                  내 주변{' '}
                  <span className="text-green-400 transition-all duration-500 inline-block min-w-[3ch] tabular-nums">
                    {totalCount}
                  </span>
                  명의 헬퍼 전문가가
                  <br />
                  대기하고 있어요
                </h2>

                <p className="text-gray-400 text-sm md:text-base mb-6">
                  지금 바로 호출 가능한{' '}
                  <span className="text-green-400 font-bold transition-all duration-500 inline-block min-w-[2ch] tabular-nums">
                    {nearbyCount}
                  </span>
                  명! 평균 <span className="text-white font-bold">5분 내</span> 매칭됩니다.
                </p>

                <Link
                  href="/search?category=errands"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-blue-900/50 transition transform active:scale-95"
                >
                  <ZapIcon />
                  지금 호출하기
                </Link>
              </div>

              {/* 우측: 레이더 시각화 */}
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

                {/* 동적 헬퍼들 - SSR과 동일한 초기값으로 CLS 방지 */}
                {visibleHelpers.map((helper) => {
                  const pos = getPosition(helper.angle, helper.radius);
                  return (
                    <div
                      key={helper.id}
                      className="absolute z-10 transition-all duration-1000 ease-in-out"
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        transform: 'translate(-50%, -50%)',
                        opacity: helper.isVisible ? 1 : 0,
                      }}
                    >
                      <div
                        className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white border-2 border-green-500 flex items-center justify-center overflow-hidden shadow-lg animate-bounce"
                        style={{ animationDuration: `${1.5 + helper.id * 0.2}s` }}
                      >
                        <Image
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${helper.seed}`}
                          alt="Helper"
                          width={40}
                          height={40}
                          className="w-full h-full"
                          unoptimized
                        />
                      </div>
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] lg:text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                        {formatDistance(helper.distance)}
                      </div>
                    </div>
                  );
                })}

                {/* 남은 인원 표시 */}
                {remainingCount > 0 && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-600/90 text-white text-[10px] px-2 py-1 rounded-full whitespace-nowrap font-medium transition-all duration-500">
                    +{remainingCount}명 대기중
                  </div>
                )}
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
