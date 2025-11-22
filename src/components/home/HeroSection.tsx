"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaRobot,
  FaMoneyBillWave,
  FaBalanceScale,
  FaShieldAlt,
  FaBullhorn,
  FaSearch,
} from "react-icons/fa";

interface SplatterDrop {
  size: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  opacity: number;
  blur: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  gradient: string;
  glowColor: string;
  icon: string;
  cardTitle: string;
  cardSubtitle: string;
  cardDescription: string;
  splatterPattern: SplatterDrop[];
}

// 물리 엔진: 물감 비산 계산 (질량, 점도, 중력 포함)
// origin: 발사 지점 {x, y} (rem 단위) - 기본값: 오른쪽 카드 중심
// angle: 발사 각도 (도, 0°=오른쪽, 90°=위, 180°=왼쪽, 270°=아래)
// velocity: 초기 속도 (임의 단위, 클수록 멀리)
// mass: 물감의 양/질량 (0.3-3.0, 클수록 무겁고 크고 멀리 날아감)
// viscosity: 점도 (0-1, 높을수록 빨리 떨어짐)
// timeStep: 시간 경과 (클수록 멀리 날아감)
// gravity: 중력 (기본 9.8)
function calculateSplatter(
  origin: { x: number; y: number },
  angle: number,
  velocity: number,
  mass: number,
  viscosity: number,
  timeStep: number = 0.1,
  gravity: number = 9.8
): { x: number; y: number; size: number } {
  const rad = (angle * Math.PI) / 180;
  const vx = velocity * Math.cos(rad);
  const vy = velocity * Math.sin(rad);

  // 공기저항 계수 (질량이 클수록 저항 적음, 점도 높으면 저항 큼)
  const dragCoef = (0.15 + viscosity * 0.25) / mass;

  // 포물선 운동 (중력은 y축 음의 방향, 무거울수록 덜 영향받음)
  const t = timeStep;
  const effectiveGravity = gravity / Math.sqrt(mass); // 질량이 클수록 중력 효과 감소
  const x = origin.x + vx * t - 0.5 * dragCoef * vx * t * t;
  const y = origin.y - (vy * t - 0.5 * effectiveGravity * t * t); // y는 아래로 증가

  // 크기 = 질량 × 속도 × (1 - 점도)
  // 무거운 방울(큰 질량) = 크기 크다
  const size = mass * velocity * 10 * (1 - viscosity * 0.5);

  return { x, y, size };
}

// Icon mapping helper
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    "fa-sack-dollar": <FaMoneyBillWave className="text-2xl" />,
    "fa-balance-scale": <FaBalanceScale className="text-2xl" />,
    "fa-shield-alt": <FaShieldAlt className="text-2xl" />,
    "fa-bullhorn": <FaBullhorn className="text-2xl" />,
  };
  return iconMap[iconName] || null;
};

// 카드 중심 좌표 (오른쪽 카드 영역의 중앙)
// 위로 100px (-6.25rem), 왼쪽으로 400px (-25rem) 이동
const CARD_CENTER = { x: -15, y: -4.25 };

// 물리 엔진으로 슬라이드 생성
const slides: Slide[] = [
  // Slide 1: 카드 중심에서 사방으로 격렬하게 튀김 (Pollock 스타일)
  {
    id: 1,
    title: "당신이 번 돈,\n한 푼도 떼지 않습니다",
    subtitle: "수수료 0%. 당신의 재능이 온전히 당신의 수익으로.",
    gradient: "bg-pink-600",
    glowColor: "#db2777",
    icon: "fa-sack-dollar",
    cardTitle: "수수료 0%",
    cardSubtitle: "판매자가 100% 가져갑니다",
    cardDescription:
      "당신이 번 돈, 한 푼도 떼지 않습니다. 다른 플랫폼의 15~20% 수수료는 이제 그만. 돌파구에서는 100% 당신의 것입니다.",
    splatterPattern: (() => {
      const pattern: SplatterDrop[] = [];
      const origin = CARD_CENTER;

      // 거대 임팩트 (사방으로 튀김 - 큰 질량, 낮은 점도)
      // [각도, 속도, 질량, 점도, 시간]
      [[135, 25, 2.8, 0.1, 5.0], [180, 30, 3.0, 0.08, 6.5], [225, 22, 2.6, 0.12, 4.5],
       [90, 18, 2.7, 0.1, 3.5], [270, 20, 2.9, 0.09, 4.0]].forEach(([angle, vel, mass, visc, time]) => {
        const pos = calculateSplatter(origin, angle, vel, mass, visc, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(280, Math.min(480, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.16 + visc * 0.08,
          blur: '2xl' as const,
        });
      });

      // 큰 방울들 (다양한 방향)
      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * 360;
        const velocity = 18 + Math.random() * 12;
        const mass = 1.5 + Math.random() * 0.8;
        const viscosity = 0.15 + Math.random() * 0.15;
        const time = 3.5 + Math.random() * 2.5;
        const pos = calculateSplatter(origin, angle, velocity, mass, viscosity, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(180, Math.min(350, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.18 + viscosity * 0.12,
          blur: i < 3 ? ('2xl' as const) : ('xl' as const),
        });
      }

      // 중형 방울들
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * 360;
        const velocity = 12 + Math.random() * 10;
        const mass = 0.8 + Math.random() * 0.6;
        const viscosity = 0.3 + Math.random() * 0.2;
        const time = 2.8 + Math.random() * 2.0;
        const pos = calculateSplatter(origin, angle, velocity, mass, viscosity, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(100, Math.min(200, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.24 + viscosity * 0.15,
          blur: 'lg' as const,
        });
      }

      // 작은 방울들
      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * 360;
        const velocity = 8 + Math.random() * 8;
        const mass = 0.4 + Math.random() * 0.4;
        const viscosity = 0.5 + Math.random() * 0.2;
        const time = 2.2 + Math.random() * 1.5;
        const pos = calculateSplatter(origin, angle, velocity, mass, viscosity, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(50, Math.min(110, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.34 + viscosity * 0.15,
          blur: 'md' as const,
        });
      }

      // 좁쌀 디테일
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * 360;
        const velocity = 5 + Math.random() * 6;
        const mass = 0.2 + Math.random() * 0.25;
        const viscosity = 0.7 + Math.random() * 0.2;
        const time = 1.8 + Math.random() * 1.2;
        const pos = calculateSplatter(origin, angle, velocity, mass, viscosity, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(10, Math.min(40, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.52 + viscosity * 0.2,
          blur: i < 4 ? ('sm' as const) : ('none' as const),
        });
      }

      return pattern;
    })(),
  },
  // Slide 2: 카드 중심에서 수평 왼쪽 강조 분사 (Klein 스타일)
  {
    id: 2,
    title: "첫날부터 공정하게,\n모두에게 같은 기회를",
    subtitle: "신규 판매자와 베테랑, 시작이 평등한 곳입니다.",
    gradient: "bg-indigo-600",
    glowColor: "#4f46e5",
    icon: "fa-balance-scale",
    cardTitle: "판매 기회 균등",
    cardSubtitle: "모든 판매자에게 공평한 기회",
    cardDescription:
      "신규든 베테랑이든, 모두에게 같은 기회. 알고리즘도, 편애도 없습니다. 오직 실력으로 승부하세요.",
    splatterPattern: (() => {
      const pattern: SplatterDrop[] = [];
      const origin = CARD_CENTER;

      // 거대 임팩트 (좌우 180도 수평 분산, 큰 질량)
      [[0, 28, 2.9, 0.08, 6.0], [45, 26, 3.0, 0.1, 5.5], [90, 32, 2.7, 0.09, 7.0],
       [135, 24, 2.8, 0.11, 5.0], [180, 22, 2.6, 0.1, 4.5]].forEach(([angle, vel, mass, visc, time]) => {
        const pos = calculateSplatter(origin, angle, vel, mass, visc, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(300, Math.min(500, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.15 + visc * 0.08,
          blur: '2xl' as const,
        });
      });

      // 큰 방울들 (좌우 180도 수평 분산)
      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * 180; // 0-180도
        const velocity = 20 + Math.random() * 10;
        const mass = 1.6 + Math.random() * 0.8;
        const viscosity = 0.14 + Math.random() * 0.16;
        const time = 4.0 + Math.random() * 2.0;
        const pos = calculateSplatter(origin, angle, velocity, mass, viscosity, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(200, Math.min(370, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.18 + viscosity * 0.12,
          blur: i < 3 ? ('2xl' as const) : ('xl' as const),
        });
      }

      // 중형 방울들
      for (let i = 0; i < 7; i++) {
        const angle = Math.random() * 180; // 0-180도
        const velocity = 14 + Math.random() * 8;
        const mass = 0.9 + Math.random() * 0.6;
        const viscosity = 0.28 + Math.random() * 0.22;
        const time = 3.0 + Math.random() * 1.8;
        const pos = calculateSplatter(origin, angle, velocity, mass, viscosity, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(110, Math.min(210, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.26 + viscosity * 0.15,
          blur: 'lg' as const,
        });
      }

      // 작은 방울들
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * 180; // 0-180도
        const velocity = 10 + Math.random() * 6;
        const mass = 0.45 + Math.random() * 0.4;
        const viscosity = 0.48 + Math.random() * 0.22;
        const time = 2.4 + Math.random() * 1.4;
        const pos = calculateSplatter(origin, angle, velocity, mass, viscosity, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(55, Math.min(115, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.36 + viscosity * 0.15,
          blur: 'md' as const,
        });
      }

      // 좁쌀 디테일
      for (let i = 0; i < 7; i++) {
        const angle = Math.random() * 180; // 0-180도
        const velocity = 6 + Math.random() * 5;
        const mass = 0.22 + Math.random() * 0.28;
        const viscosity = 0.68 + Math.random() * 0.22;
        const time = 2.0 + Math.random() * 1.2;
        const pos = calculateSplatter(origin, angle, velocity, mass, viscosity, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(12, Math.min(42, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.56 + viscosity * 0.2,
          blur: i < 4 ? ('sm' as const) : ('none' as const),
        });
      }

      return pattern;
    })(),
  },
  // Slide 3: 카드 중심에서 사방으로 우아한 비산 (Francis 스타일)
  {
    id: 3,
    title: "표시된 가격이 전부입니다\n숨은 비용 없습니다",
    subtitle: "구매 수수료 0원. 보이는 그대로 결제하세요.",
    gradient: "bg-purple-600",
    glowColor: "#9333ea",
    icon: "fa-shield-alt",
    cardTitle: "구매 수수료 0원",
    cardSubtitle: "표시된 가격이 전부입니다",
    cardDescription:
      "다른 곳처럼 결제 직전 수수료 추가? 없습니다. 보이는 가격이 최종 가격. 숨은 비용 없이 투명하게.",
    splatterPattern: (() => {
      const pattern: SplatterDrop[] = [];
      const origin = CARD_CENTER;

      // 거대 임팩트 (사방팔방, 다양한 각도)
      [[45, 27, 2.7, 0.09, 5.5], [135, 25, 2.9, 0.1, 5.0], [225, 23, 2.8, 0.11, 6.0],
       [315, 26, 2.6, 0.08, 5.3], [90, 22, 2.7, 0.12, 4.5]].forEach(([angle, vel, mass, visc, time]) => {
        const pos = calculateSplatter(origin, angle, vel, mass, visc, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(290, Math.min(460, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.16 + visc * 0.08,
          blur: '2xl' as const,
        });
      });

      // 큰 방울들 (다방향 분산)
      for (let i = 0; i < 7; i++) {
        const angle = Math.random() * 360;
        const velocity = 19 + Math.random() * 11;
        const mass = 1.5 + Math.random() * 0.9;
        const viscosity = 0.13 + Math.random() * 0.17;
        const time = 3.8 + Math.random() * 2.2;
        const pos = calculateSplatter(origin, angle, velocity, mass, viscosity, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(190, Math.min(360, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.18 + viscosity * 0.12,
          blur: i < 3 ? ('2xl' as const) : ('xl' as const),
        });
      }

      // 중형 방울들
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * 360;
        const velocity = 13 + Math.random() * 9;
        const mass = 0.85 + Math.random() * 0.65;
        const viscosity = 0.27 + Math.random() * 0.23;
        const time = 2.9 + Math.random() * 1.9;
        const pos = calculateSplatter(origin, angle, velocity, mass, viscosity, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(105, Math.min(205, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.25 + viscosity * 0.15,
          blur: 'lg' as const,
        });
      }

      // 작은 방울들
      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * 360;
        const velocity = 9 + Math.random() * 7;
        const mass = 0.42 + Math.random() * 0.43;
        const viscosity = 0.5 + Math.random() * 0.25;
        const time = 2.3 + Math.random() * 1.5;
        const pos = calculateSplatter(origin, angle, velocity, mass, viscosity, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(52, Math.min(108, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.38 + viscosity * 0.15,
          blur: 'md' as const,
        });
      }

      // 좁쌀 디테일
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * 360;
        const velocity = 5.5 + Math.random() * 5.5;
        const mass = 0.2 + Math.random() * 0.3;
        const viscosity = 0.65 + Math.random() * 0.25;
        const time = 1.9 + Math.random() * 1.3;
        const pos = calculateSplatter(origin, angle, velocity, mass, viscosity, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(11, Math.min(40, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.54 + viscosity * 0.2,
          blur: i < 4 ? ('sm' as const) : ('none' as const),
        });
      }

      return pattern;
    })(),
  },
  // Slide 4: 카드 중심에서 대각선 상승 포물선 (물리 역학 강조)
  {
    id: 4,
    title: "시작하는 당신에게,\n1,500만원 드립니다",
    subtitle: "런칭 기념. 광고 크레딧으로 첫 고객을 만나세요.",
    gradient: "bg-blue-600",
    glowColor: "#2563eb",
    icon: "fa-bullhorn",
    cardTitle: "런칭 기념 1,500만원",
    cardSubtitle: "시작하는 당신에게 드립니다",
    cardDescription:
      "런칭 기념, 모든 전문가에게 최대 1,500만원 광고 크레딧 지원. 돌파구 내 광고로 첫 고객을 만나세요.",
    splatterPattern: (() => {
      const pattern: SplatterDrop[] = [];
      const origin = CARD_CENTER;

      // 거대 임팩트 (대각선 상승 - 45-75도)
      [[55, 28, 2.8, 0.09, 6.0], [60, 26, 2.9, 0.08, 6.5], [50, 24, 3.0, 0.1, 5.5],
       [65, 25, 2.7, 0.11, 5.8], [45, 27, 2.6, 0.09, 6.0]].forEach(([angle, vel, mass, visc, time]) => {
        const pos = calculateSplatter(origin, angle, vel, mass, visc, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(310, Math.min(490, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.15 + visc * 0.08,
          blur: '2xl' as const,
        });
      });

      // 큰 방울들 (포물선 궤적)
      for (let i = 0; i < 6; i++) {
        const angle = 40 + Math.random() * 40; // 40-80도
        const velocity = 20 + Math.random() * 10;
        const mass = 1.6 + Math.random() * 0.8;
        const viscosity = 0.14 + Math.random() * 0.16;
        const time = 4.2 + Math.random() * 2.0;
        const pos = calculateSplatter(origin, angle, velocity, mass, viscosity, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(210, Math.min(380, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.17 + viscosity * 0.12,
          blur: i < 3 ? ('2xl' as const) : ('xl' as const),
        });
      }

      // 중형 방울들 (다양한 궤적)
      for (let i = 0; i < 7; i++) {
        const angle = 35 + Math.random() * 50; // 35-85도
        const velocity = 14 + Math.random() * 8;
        const mass = 0.9 + Math.random() * 0.6;
        const viscosity = 0.26 + Math.random() * 0.22;
        const time = 3.2 + Math.random() * 1.8;
        const pos = calculateSplatter(origin, angle, velocity, mass, viscosity, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(110, Math.min(215, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.25 + viscosity * 0.15,
          blur: 'lg' as const,
        });
      }

      // 작은 방울들
      for (let i = 0; i < 6; i++) {
        const angle = 30 + Math.random() * 60; // 30-90도
        const velocity = 10 + Math.random() * 6;
        const mass = 0.44 + Math.random() * 0.42;
        const viscosity = 0.48 + Math.random() * 0.24;
        const time = 2.5 + Math.random() * 1.6;
        const pos = calculateSplatter(origin, angle, velocity, mass, viscosity, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(56, Math.min(118, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.37 + viscosity * 0.15,
          blur: 'md' as const,
        });
      }

      // 좁쌀 비말
      for (let i = 0; i < 7; i++) {
        const angle = 25 + Math.random() * 70; // 25-95도
        const velocity = 6 + Math.random() * 5.5;
        const mass = 0.21 + Math.random() * 0.29;
        const viscosity = 0.68 + Math.random() * 0.22;
        const time = 2.0 + Math.random() * 1.4;
        const pos = calculateSplatter(origin, angle, velocity, mass, viscosity, time);
        const x = Math.min(8, pos.x); // 카드 영역 내 오른쪽 제한
        const y = Math.max(0, Math.min(7, pos.y)); // 히어로 영역 내 엄격 제한
        pattern.push({
          size: Math.max(13, Math.min(44, pos.size)),
          top: `${y}rem`,
          left: `${x}rem`,
          opacity: 0.55 + viscosity * 0.2,
          blur: i < 4 ? ('sm' as const) : ('none' as const),
        });
      }

      return pattern;
    })(),
  },
];

export default function HeroSection() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const performSlideTransition = useCallback((newSlide: number) => {
    setCurrentSlide(newSlide);
    setIsTransitioning(false);
  }, []);

  const changeSlide = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => performSlideTransition(index), 300);
  };

  const advanceSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      performSlideTransition((currentSlide + 1) % slides.length);
    }, 300);
  }, [currentSlide, performSlideTransition]);

  useEffect(() => {
    const timer = setInterval(advanceSlide, 8000);
    return () => clearInterval(timer);
  }, [advanceSlide]);

  const slide = slides[currentSlide];

  return (
    <section className="bg-white py-2 sm:py-4 lg:py-8 hidden lg:block">
      <div className="container-1200 px-0">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 mb-2">
          {/* 왼쪽: 타이틀 + 검색 + 카테고리 */}
          <div className="flex-1 w-full">
            <div className="mb-6 lg:mb-8">
              <h1
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4 transition-opacity duration-500 lg:min-h-[120px] leading-[1.6] whitespace-pre-line ${isTransitioning ? "opacity-0" : "opacity-100"}`}
              >
                {slide.title}
              </h1>
              <p
                className={`text-sm sm:text-base text-gray-600 lg:min-h-[48px] leading-[1.5] transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
              >
                {slide.subtitle}
              </p>
            </div>

            {/* 검색창 - PC에서만 표시 */}
            <div className="mb-4 lg:mb-6 hidden lg:block">
              <form onSubmit={handleSearch} className="relative w-full lg:max-w-[490px]" autoComplete="off">
                <input
                  type="text"
                  id="hero-search"
                  name="hero-search-query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="어떤 재능이 필요하신가요?"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-lpignore="true"
                  role="searchbox"
                  aria-label="서비스 검색"
                  className="focus-visible:outline-none w-full px-4 sm:px-6 py-3 sm:py-4 pr-14 border-2 border-gray-300 rounded-full focus:rounded-full hover:border-gray-300 focus:outline-none focus:border-gray-300 focus:shadow-none transition-none text-gray-900 text-sm sm:text-base"
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none'
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-brand-primary transition-colors rounded-full hover:bg-gray-100 active:scale-100 focus:outline-none isolate"
                  style={{
                    transform: 'translate3d(0, -50%, 0)',
                    backfaceVisibility: 'hidden',
                    willChange: 'transform'
                  }}
                  aria-label="검색"
                >
                  <FaSearch className="text-lg" />
                </button>
              </form>
            </div>

            {/* 인기 카테고리 - PC에서만 표시 */}
            <div className="flex-wrap gap-2 sm:gap-3 hidden lg:flex">
              <Link
                href="/categories/ai-services"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-blue-50 text-brand-primary rounded-full font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
              >
                <FaRobot className="text-sm sm:text-base" />{" "}
                <span className="hidden sm:inline">AI 서비스</span>
                <span className="sm:hidden">AI</span>
              </Link>
              <Link
                href="/categories/it-programming"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                <span className="hidden sm:inline">IT/프로그래밍</span>
                <span className="sm:hidden">IT</span>
              </Link>
              <Link
                href="/categories/design"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                디자인
              </Link>
              <Link
                href="/categories/marketing"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                마케팅
              </Link>
              <Link
                href="/categories/writing"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors hidden sm:inline-flex"
              >
                글쓰기
              </Link>
            </div>
          </div>

          {/* 오른쪽: 카드 + 페이지네이션 */}
          <div className="w-full lg:w-[382px] flex-shrink-0 relative">
            {/* 물감 비산 효과 - 동적 렌더링 */}
            {slide.splatterPattern.map((drop, index) => {
              const blurValues: Record<string, string> = {
                'none': '0',
                'sm': '4px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
                '2xl': '24px',
              };
              return (
                <div
                  key={`splatter-${slide.id}-${index}`}
                  className="absolute rounded-full transition-all duration-500"
                  style={{
                    width: `${drop.size}px`,
                    height: `${drop.size}px`,
                    top: drop.top,
                    bottom: drop.bottom,
                    left: drop.left,
                    right: drop.right,
                    opacity: drop.opacity,
                    backgroundColor: slide.glowColor,
                    filter: drop.blur !== 'none' ? `blur(${blurValues[drop.blur]})` : 'none',
                  }}
                />
              );
            })}

            {/* 메인 카드 - 매우 투명한 배경 */}
            <div
              className="relative p-5 sm:p-6 transition-all duration-500 h-[250px] sm:h-[298px] flex flex-col rounded-3xl backdrop-blur-sm"
              style={{
                background: `linear-gradient(135deg, ${slide.glowColor}15, ${slide.glowColor}08)`,
                boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* 아이콘 */}
              <div
                className={`mb-4 transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white"
                  style={{
                    backgroundColor: `${slide.glowColor}60`,
                    boxShadow: `0 0 20px ${slide.glowColor}40`
                  }}
                >
                  {getIconComponent(slide.icon)}
                </div>
              </div>

              {/* 내용 */}
              <h3
                className={`text-2xl font-bold mb-2 transition-opacity duration-500 text-gray-900 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
                style={{ textShadow: '0 2px 4px rgba(255, 255, 255, 0.5)' }}
              >
                {slide.cardTitle}
              </h3>
              <p
                className={`text-lg mb-3 text-gray-800 transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
                style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)' }}
              >
                {slide.cardSubtitle}
              </p>
              <p
                className={`text-sm text-gray-700 leading-relaxed line-clamp-3 mb-6 transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
                style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)' }}
              >
                {slide.cardDescription}
              </p>

              {/* 페이지네이션 도트 */}
              <div className="flex gap-2 mt-auto">
                {slides.map((s, index) => (
                  <button
                    key={s.id}
                    onClick={() => changeSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? "w-8" : "w-2"
                    }`}
                    style={{
                      backgroundColor: index === currentSlide ? slide.glowColor : `${slide.glowColor}40`
                    }}
                    aria-label={`슬라이드 ${index + 1}로 이동`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
