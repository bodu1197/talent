'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  icon: string;
  clicks: number;
  ratio: number;
}

// 긴 코드 스니펫들 (각 블록별로 다른 코드)
const longCodeSnippets = [
  `// 재능 데이터 fetching
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function fetchTalents(category) {
  const { data, error } = await supabase
    .from('talents')
    .select('*')
    .eq('category', category)
    .order('rating', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createTalent(talentData) {
  const { data, error } = await supabase
    .from('talents')
    .insert(talentData)
    .select()
    .single();

  return { data, error };
}`,

  `// TalentCard 컴포넌트
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface TalentCardProps {
  talent: {
    id: string;
    name: string;
    avatar: string;
    category: string;
    rating: number;
    reviews: number;
    price: number;
  };
}

export function TalentCard({ talent }: TalentCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={\`/talents/\${talent.id}\`}>
      <div
        className="card hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={talent.avatar}
          alt={talent.name}
          width={100}
          height={100}
        />
        <h3>{talent.name}</h3>
        <p>{talent.category}</p>
        <div className="rating">
          ⭐ {talent.rating} ({talent.reviews})
        </div>
        <p className="price">₩{talent.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}`,

  `// TypeScript 인터페이스 정의
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'expert' | 'admin';
  createdAt: Date;
}

export interface Talent {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  deliveryTime: number;
  rating: number;
  reviewCount: number;
  images: string[];
  tags: string[];
  isActive: boolean;
}

export interface Order {
  id: string;
  talentId: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  amount: number;
  requirements: string;
  createdAt: Date;
  completedAt?: Date;
}

type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'delivered'
  | 'completed'
  | 'cancelled';`,

  `// React Hook - useTalents
import { useState, useEffect, useCallback } from 'react';

interface UseTalentsOptions {
  category?: string;
  limit?: number;
  sortBy?: 'rating' | 'price' | 'reviews';
}

export function useTalents(options: UseTalentsOptions = {}) {
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTalents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (options.category) {
        params.set('category', options.category);
      }
      if (options.limit) {
        params.set('limit', options.limit.toString());
      }
      if (options.sortBy) {
        params.set('sortBy', options.sortBy);
      }

      const response = await fetch(\`/api/talents?\${params}\`);
      const data = await response.json();

      setTalents(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options.category, options.limit, options.sortBy]);

  useEffect(() => {
    fetchTalents();
  }, [fetchTalents]);

  return { talents, loading, error, refetch: fetchTalents };
}`,

  `// API Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '10');

  const talents = await prisma.talent.findMany({
    where: category ? { category } : undefined,
    take: limit,
    orderBy: { rating: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  return NextResponse.json(talents);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await request.json();

  const talent = await prisma.talent.create({
    data: {
      ...body,
      userId: session.user.id,
    },
  });

  return NextResponse.json(talent, { status: 201 });
}`,

  `// 결제 처리 로직
import { PaymentService } from '@/services/payment';
import { NotificationService } from '@/services/notification';

interface PaymentRequest {
  orderId: string;
  amount: number;
  method: 'card' | 'bank' | 'kakao';
  buyerId: string;
  sellerId: string;
}

export async function processPayment(request: PaymentRequest) {
  const payment = new PaymentService();
  const notification = new NotificationService();

  try {
    // 1. 결제 요청
    const result = await payment.requestPayment({
      orderId: request.orderId,
      amount: request.amount,
      method: request.method,
    });

    if (!result.success) {
      throw new Error(result.message);
    }

    // 2. 주문 상태 업데이트
    await prisma.order.update({
      where: { id: request.orderId },
      data: {
        status: 'paid',
        paidAt: new Date(),
        paymentId: result.paymentId,
      },
    });

    // 3. 알림 발송
    await Promise.all([
      notification.sendToBuyer(request.buyerId, {
        type: 'payment_success',
        orderId: request.orderId,
      }),
      notification.sendToSeller(request.sellerId, {
        type: 'new_order',
        orderId: request.orderId,
      }),
    ]);

    return { success: true, paymentId: result.paymentId };
  } catch (error) {
    console.error('Payment failed:', error);
    return { success: false, error: error.message };
  }
}`,
];

// 코딩 타이핑 애니메이션 컴포넌트 (한 번 완성 후 멈춤)
const CodeTypingBackground = () => {
  const [typedCodes, setTypedCodes] = useState<string[]>(['', '', '', '', '', '']);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;

    const charIndexes = [0, 0, 0, 0, 0, 0];
    let allComplete = false;

    const typeCode = () => {
      if (allComplete) return;

      const newTypedCodes = longCodeSnippets.map((snippet, i) => {
        if (charIndexes[i] < snippet.length) {
          charIndexes[i] += 3; // 한번에 3글자씩
          return snippet.slice(0, charIndexes[i]);
        }
        return snippet;
      });

      setTypedCodes(newTypedCodes);

      // 모든 코드가 완성되었는지 확인
      allComplete = charIndexes.every((idx, i) => idx >= longCodeSnippets[i].length);
      if (allComplete) {
        setIsComplete(true);
      }
    };

    const interval = setInterval(typeCode, 40);
    return () => clearInterval(interval);
  }, [isComplete]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 왼쪽에만 코드 블록 배치 - 실제 코딩처럼 */}
      <div className="absolute left-0 top-0 bottom-0 w-64 lg:w-80 hidden lg:block overflow-hidden">
        <div className="p-4 space-y-4">
          <pre className="text-[12px] text-gray-700 font-mono leading-relaxed whitespace-pre-wrap">
            {typedCodes[0]}
            {!isComplete && <span className="animate-pulse text-orange-500">|</span>}
          </pre>
        </div>
      </div>
    </div>
  );
};

// 인라인 SVG 아이콘
const FlameIcon = () => (
  <svg
    className="w-5 h-5 text-orange-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
    />
  </svg>
);

const TrendingUpIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

// 그래프 색상 배열
const barColors = [
  'from-orange-500 to-red-500',
  'from-amber-500 to-orange-500',
  'from-yellow-500 to-amber-500',
  'from-lime-500 to-yellow-500',
  'from-emerald-500 to-lime-500',
  'from-teal-500 to-emerald-500',
  'from-cyan-500 to-teal-500',
  'from-blue-500 to-cyan-500',
];

interface Props {
  categories: CategoryData[];
}

export default function TrendingCategoriesClient({ categories }: Props) {
  const [isAnimated, setIsAnimated] = useState(false);

  // 마운트 후 애니메이션 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 최대 ratio 값 (높이 계산용)
  const maxRatio = Math.max(...categories.map((c) => c.ratio));

  return (
    <section className="py-6 lg:py-10 bg-gradient-to-b from-orange-50/50 to-white relative overflow-hidden">
      {/* 코딩 타이핑 애니메이션 */}
      <CodeTypingBackground />

      <div className="container-1200 relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm py-6 px-4">
        {/* 섹션 헤더 */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <FlameIcon />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">
              실시간 인기재능
            </h2>
          </div>
          <p className="text-gray-500 text-sm md:text-base">
            지금 가장 많이 찾는 온라인 전문가 카테고리
            <span className="ml-2 text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">
              최근 24시간
            </span>
          </p>
        </div>

        {/* 세로 막대 그래프 */}
        <div className="flex justify-center items-end gap-2 sm:gap-3 md:gap-4 lg:gap-6 px-2 overflow-x-auto pb-4">
          {categories.map((category, index) => {
            const barColor = barColors[index % barColors.length];
            const heightPercent = maxRatio > 0 ? (category.ratio / maxRatio) * 100 : 0;
            const animatedHeight = isAnimated ? `${Math.max(heightPercent, 15)}%` : '0%';
            const isTop3 = index < 3;

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group flex flex-col items-center flex-shrink-0"
              >
                {/* 클릭 수 */}
                <div
                  className={`
                    text-[10px] md:text-xs font-medium mb-1 transition-all duration-500
                    ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                    ${isTop3 ? 'text-orange-600' : 'text-gray-500'}
                  `}
                  style={{ transitionDelay: `${index * 100 + 500}ms` }}
                >
                  {category.clicks.toLocaleString('ko-KR')}
                </div>

                {/* 막대 */}
                <div className="relative w-10 sm:w-12 md:w-14 lg:w-16 h-28 sm:h-32 md:h-40 lg:h-48 flex items-end">
                  <div
                    className={`
                      w-full bg-gradient-to-t ${barColor} rounded-t-lg
                      transition-all duration-1000 ease-out
                      group-hover:shadow-lg group-hover:scale-105
                      ${isTop3 ? 'shadow-md' : ''}
                    `}
                    style={{
                      height: animatedHeight,
                      transitionDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* 순위 뱃지 */}
                    <div
                      className={`
                        absolute -top-3 left-1/2 -translate-x-1/2
                        w-5 h-5 md:w-6 md:h-6 rounded-full
                        flex items-center justify-center
                        text-[10px] md:text-xs font-bold
                        transition-all duration-500
                        ${isAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                        ${
                          isTop3
                            ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md'
                            : 'bg-gray-200 text-gray-600'
                        }
                      `}
                      style={{ transitionDelay: `${index * 100 + 800}ms` }}
                    >
                      {index + 1}
                    </div>

                    {/* 트렌딩 아이콘 (TOP 3만) */}
                    {isTop3 && (
                      <div
                        className={`
                          absolute top-2 left-1/2 -translate-x-1/2
                          transition-all duration-500
                          ${isAnimated ? 'opacity-100' : 'opacity-0'}
                        `}
                        style={{ transitionDelay: `${index * 100 + 1000}ms` }}
                      >
                        <TrendingUpIcon className="w-4 h-4 text-white/80" />
                      </div>
                    )}
                  </div>
                </div>

                {/* 카테고리명 */}
                <div
                  className={`
                    mt-2 text-center transition-all duration-500
                    ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                  `}
                  style={{ transitionDelay: `${index * 100 + 300}ms` }}
                >
                  <span
                    className={`
                      text-[10px] sm:text-xs md:text-sm font-medium
                      group-hover:text-orange-600 transition-colors
                      ${isTop3 ? 'text-gray-900' : 'text-gray-600'}
                    `}
                  >
                    {category.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
