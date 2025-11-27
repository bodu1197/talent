'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchBuyerData } from '@/lib/prefetch/buyerPrefetch';
import { logger } from '@/lib/logger';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import Link from 'next/link';
import {
  Bell,
  Info,
  ArrowRight,
  Package,
  Heart,
  ImageIcon,
  Loader2,
  PackageOpen,
  Star,
  ShoppingCart,
} from 'lucide-react';

import type { Order, Service, Seller } from '@/types/common';

interface BuyerStats {
  inProgressOrders: number;
  deliveredOrders: number;
  pendingReviews: number;
  monthlyPurchases: number;
}

interface BuyerOrder extends Order {
  delivery_date?: string | null;
  buyer_note?: string | null;
  seller_message?: string | null;
  revision_count?: number;
  remaining_revisions?: number;
  requirements?: string;
}

interface Favorite {
  id: string;
  service?: Service & {
    seller?: Seller;
  };
  created_at: string;
}

interface BuyerBenefits {
  points: number;
  coupons: number;
  membershipLevel: string;
}

interface Props {
  readonly stats: BuyerStats;
  readonly recentOrders: BuyerOrder[];
  readonly favorites: Favorite[];
  readonly benefits: BuyerBenefits;
  readonly profileData?: {
    name: string;
    profile_image?: string | null;
  } | null;
}

export default function BuyerDashboardClient({
  stats,
  recentOrders,
  favorites,
  benefits: _benefits,
  profileData,
}: Props) {
  const queryClient = useQueryClient();

  // 백그라운드에서 모든 구매자 페이지 데이터 프리페치
  useEffect(() => {
    // 대시보드 렌더링 후 즉시 다른 페이지 데이터 미리 불러오기
    const timer = setTimeout(() => {
      prefetchBuyerData(queryClient).catch((err) => logger.error('Operation error:', err));
    }, 500); // 대시보드 로딩 후 0.5초 뒤에 실행

    return () => clearTimeout(timer);
  }, [queryClient]);

  // Generate alerts based on real data
  const alerts = [];
  if (stats?.deliveredOrders > 0) {
    alerts.push({
      id: 1,
      type: 'delivered',
      message: `작업 완료 도착 ${stats.deliveredOrders}건 - 확인 필요`,
      href: '/mypage/buyer/orders?status=delivered',
    });
  }
  if (stats?.pendingReviews > 0) {
    alerts.push({
      id: 2,
      type: 'review',
      message: `리뷰 작성 가능 ${stats.pendingReviews}건`,
      href: '/mypage/buyer/reviews?tab=pending',
    });
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return '결제완료';
      case 'in_progress':
        return '진행중';
      case 'delivered':
        return '도착 확인 대기';
      case 'completed':
        return '완료';
      case 'cancelled':
        return '취소/환불';
      default:
        return status;
    }
  };

  const getDaysLeft = (deliveryDate: string | null | undefined) => {
    if (!deliveryDate) return null;
    const days = Math.ceil((new Date(deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null;
  };

  return (
    <MypageLayoutWrapper mode="buyer" profileData={profileData}>
      <div className="py-8 px-4">
        {/* 페이지 헤더 */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-base md:text-lg font-semibold text-gray-900">구매 대시보드</h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">주문 현황을 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">진행중 주문</p>
                <p className="text-lg font-semibold text-gray-900">{stats?.inProgressOrders || 0}건</p>
              </div>
              <Loader2 className="w-7 h-7 text-yellow-500 animate-spin" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">도착 확인 대기</p>
                <p className="text-lg font-semibold text-gray-900">{stats?.deliveredOrders || 0}건</p>
              </div>
              <PackageOpen className="w-7 h-7 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">작성 가능 리뷰</p>
                <p className="text-lg font-semibold text-gray-900">{stats?.pendingReviews || 0}건</p>
              </div>
              <Star className="w-7 h-7 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">이번달 구매</p>
                <p className="text-lg font-semibold text-gray-900">{stats?.monthlyPurchases || 0}건</p>
              </div>
              <ShoppingCart className="w-7 h-7 text-green-500" />
            </div>
          </div>
        </div>

        {/* 알림 */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-500" />
              확인 필요
            </h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-blue-500" />
                    <span className="text-sm md:text-base text-gray-900 font-medium">
                      {alert.message}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 진행중인 주문 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-500" />
              진행중인 주문
            </h2>
            <Link
              href="/mypage/buyer/orders"
              className="text-xs md:text-sm text-brand-primary hover:underline flex items-center gap-1"
            >
              전체 보기 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => {
                const daysLeft = getDaysLeft(order.delivery_date);
                return (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-brand-primary transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* 썸네일 */}
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                        {order.service?.thumbnail_url ? (
                          <img
                            src={order.service.thumbnail_url}
                            alt={order.title || order.service.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <ImageIcon className="w-7 h-7 text-gray-400" />
                        )}
                      </div>

                      {/* 정보 */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs md:text-sm text-gray-500">
                                #{order.order_number || order.id.slice(0, 8)}
                              </span>
                              <span className="text-sm md:text-base font-semibold text-gray-900">
                                {order.title || order.service?.title}
                              </span>
                            </div>
                            <div className="text-xs md:text-sm text-gray-600 mb-2">
                              판매자: {order.seller?.name || '판매자'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === 'delivered'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                          {daysLeft && (
                            <span className="text-xs md:text-sm text-gray-600">D-{daysLeft}일</span>
                          )}
                          <span className="text-xs md:text-sm font-semibold text-gray-900">
                            {order.total_amount?.toLocaleString() || '0'}원
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/mypage/buyer/orders/${order.id}`}
                            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#0a2540] transition-colors text-xs md:text-sm font-medium"
                          >
                            {order.status === 'delivered' ? '확인하기' : '상세보기'}
                          </Link>
                          <Link
                            href={`/chat?order=${order.id}`}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs md:text-sm font-medium"
                          >
                            메시지
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-sm md:text-base text-gray-500">
                진행중인 주문이 없습니다
              </div>
            )}
          </div>
        </div>

        {/* 최근 찜한 서비스 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-current" />
              최근 찜한 서비스
            </h2>
            <Link
              href="/mypage/buyer/favorites"
              className="text-xs md:text-sm text-brand-primary hover:underline"
            >
              전체 보기
            </Link>
          </div>
          <div className="space-y-3">
            {favorites.length > 0 ? (
              favorites.map((item) => (
                <Link
                  key={item.id}
                  href={`/services/${item.service?.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div>
                    <div className="font-medium text-sm md:text-base text-gray-900">
                      {item.service?.title}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">
                      {item.service?.seller?.name}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-sm md:text-base text-gray-500">
                찜한 서비스가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
