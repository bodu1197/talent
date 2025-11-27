'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchSellerData } from '@/lib/prefetch/buyerPrefetch';
import { logger } from '@/lib/logger';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import Link from 'next/link';
import {
  Store,
  TrendingUp,
  Users,
  Award,
  Rocket,
  ShoppingCart,
  Loader2,
  CheckCircle,
  DollarSign,
  ImageIcon,
  ArrowRight,
} from 'lucide-react';

type Stats = {
  newOrders: number;
  inProgressOrders: number;
  deliveredOrders: number;
  completedOrders: number;
  monthlyRevenue: number;
} | null;

type Order = {
  id: string;
  order_number?: string;
  title?: string;
  status: string;
  total_amount?: number;
  created_at?: string;
  service?: {
    id: string;
    title: string;
    thumbnail_url?: string;
  };
  buyer?: {
    name: string;
  };
};

type Props = {
  readonly stats: Stats;
  readonly recentOrders: Order[];
  readonly profileData: {
    readonly name: string;
    readonly profile_image?: string | null;
  } | null;
};

/**
 * 주문 상태에 따른 배지 클래스 반환
 */
function getStatusBadgeClass(status: string): string {
  const statusClasses: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
  };
  return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

/**
 * 주문 상태에 따른 표시 텍스트 반환
 */
function getStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    in_progress: '진행중',
    completed: '완료',
    paid: '결제완료',
    delivered: '배송완료',
  };
  return statusTexts[status] || status;
}

export default function SellerDashboardClient({ stats, recentOrders, profileData }: Props) {
  const queryClient = useQueryClient();

  // 백그라운드에서 모든 판매자 페이지 데이터 프리페치
  useEffect(() => {
    // 판매자 등록이 완료된 경우에만 프리페치
    if (stats) {
      const timer = setTimeout(() => {
        prefetchSellerData(queryClient).catch((err) => logger.error('Operation error:', err));
      }, 500); // 대시보드 로딩 후 0.5초 뒤에 실행

      return () => clearTimeout(timer);
    }
  }, [queryClient, stats]);

  // 판매자 미등록 상태 - 등록 유도 UI 표시
  if (!stats) {
    return (
      <MypageLayoutWrapper mode="seller" profileData={profileData}>
        <div className="py-8 px-4">
          <div className="max-w-3xl mx-auto">
            {/* 판매자 등록 안내 카드 */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                  <Store className="w-10 h-10 text-brand-primary" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  판매자로 등록하고 서비스를 판매하세요
                </h1>
                <p className="text-gray-600">
                  전문가로 등록하여 여러분의 재능을 공유하고 수익을 창출할 수 있습니다
                </p>
              </div>

              {/* 혜택 리스트 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <TrendingUp className="w-7 h-7 text-green-500 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">수익 창출</h3>
                  <p className="text-sm text-gray-600">전문 서비스로 안정적인 수입</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Users className="w-7 h-7 text-blue-500 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">고객 관리</h3>
                  <p className="text-sm text-gray-600">체계적인 주문 및 고객 관리</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Award className="w-7 h-7 text-purple-500 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">신뢰도 향상</h3>
                  <p className="text-sm text-gray-600">리뷰와 평점으로 브랜드 구축</p>
                </div>
              </div>

              {/* 등록 버튼 */}
              <Link
                href="/mypage/seller/register"
                className="inline-flex items-center px-8 py-4 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-lg font-semibold shadow-md hover:shadow-lg"
              >
                <Rocket className="inline mr-3 w-5 h-5" />
                판매자 등록하기
              </Link>

              {/* 추가 정보 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  등록은 무료이며, 간단한 정보 입력만으로 바로 시작할 수 있습니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </MypageLayoutWrapper>
    );
  }

  // 판매자 등록 완료 - 정상 대시보드 표시
  return (
    <MypageLayoutWrapper mode="seller" profileData={profileData}>
      <div className="py-4 px-4 lg:py-8 lg:px-6">
        {/* 페이지 헤더 */}
        <div className="mb-4 lg:mb-6">
          <h1 className="text-base lg:text-lg font-semibold text-gray-900">판매 대시보드</h1>
          <p className="text-gray-600 mt-1 text-sm">판매 현황을 한눈에 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">신규 주문</p>
                <p className="text-base lg:text-lg font-semibold text-gray-900">
                  {stats?.newOrders || 0}건
                </p>
              </div>
              <ShoppingCart className="w-6 h-6 lg:w-7 lg:h-7 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">진행중</p>
                <p className="text-base lg:text-lg font-semibold text-gray-900">
                  {stats?.inProgressOrders || 0}건
                </p>
              </div>
              <Loader2 className="w-6 h-6 lg:w-7 lg:h-7 text-yellow-500 animate-spin" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">완료된 주문</p>
                <p className="text-base lg:text-lg font-semibold text-gray-900">
                  {stats?.completedOrders || 0}건
                </p>
              </div>
              <CheckCircle className="w-6 h-6 lg:w-7 lg:h-7 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">이번달 수익</p>
                <p className="text-base lg:text-lg font-semibold text-gray-900">
                  {(stats?.monthlyRevenue || 0).toLocaleString()}원
                </p>
              </div>
              <DollarSign className="w-6 h-6 lg:w-7 lg:h-7 text-purple-500" />
            </div>
          </div>
        </div>

        {/* 최근 주문 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 lg:px-6 lg:py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm lg:text-base font-semibold text-gray-900">최근 주문</h2>
            <Link
              href="/mypage/seller/orders"
              className="text-xs text-brand-primary hover:underline flex items-center gap-1"
            >
              전체 보기 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 lg:p-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-3 lg:p-4 hover:border-brand-primary transition-colors"
                  >
                    {/* 모바일 레이아웃 */}
                    <div className="lg:hidden">
                      {/* 상단: 썸네일 + 서비스명 + 상태 */}
                      <div className="flex gap-3 mb-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {order.service?.thumbnail_url ? (
                            <img
                              src={order.service.thumbnail_url}
                              alt={order.service.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="text-gray-400 w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {order.service?.title || order.title || '-'}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              #{order.order_number || order.id.slice(0, 8)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 하단: 구매자 + 금액 + 버튼 */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span>구매자: {order.buyer?.name || '-'}</span>
                          <span className="font-semibold text-gray-900">
                            {(order.total_amount || 0).toLocaleString()}원
                          </span>
                        </div>
                        <Link
                          href={`/mypage/seller/orders/${order.id}`}
                          className="px-3 py-1.5 bg-brand-primary text-white rounded-lg hover:bg-[#0a2540] transition-colors text-xs font-medium"
                        >
                          상세
                        </Link>
                      </div>
                    </div>

                    {/* PC 레이아웃 (원래대로) */}
                    <div className="hidden lg:block">
                      <div className="flex gap-4">
                        {/* 썸네일 */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {order.service?.thumbnail_url ? (
                            <img
                              src={order.service.thumbnail_url}
                              alt={order.service.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="text-gray-400 w-6 h-6" />
                          )}
                        </div>

                        {/* 정보 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">
                              #{order.order_number || order.id.slice(0, 8)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900 truncate mb-1">
                            {order.service?.title || order.title || '-'}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span>구매자: {order.buyer?.name || '-'}</span>
                            <span className="font-medium text-gray-900">
                              {(order.total_amount || 0).toLocaleString()}원
                            </span>
                          </div>
                        </div>

                        {/* 버튼 */}
                        <div className="flex-shrink-0 flex items-center">
                          <Link
                            href={`/mypage/seller/orders/${order.id}`}
                            className="px-3 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#0a2540] transition-colors text-xs font-medium"
                          >
                            상세보기
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">최근 주문이 없습니다</p>
            )}
          </div>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
