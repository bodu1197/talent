'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchBuyerData } from '@/lib/prefetch/buyerPrefetch';
import { logger } from '@/lib/logger';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import Link from 'next/link';
import { Bell, Info, ArrowRight, Package, Heart, ImageIcon } from 'lucide-react';

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
      case 'pending_payment':
        return '결제 대기';
      case 'paid':
      case 'payment_completed':
        return '결제완료';
      case 'in_progress':
        return '진행중';
      case 'delivered':
        return '도착 확인 대기';
      case 'completed':
        return '완료';
      case 'cancelled':
        return '취소/환불';
      case 'refunded':
        return '환불됨';
      case 'revision':
        return '수정 요청';
      case 'in_review':
        return '검토중';
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
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        {/* 페이지 헤더 */}
        <div className="mb-4 lg:mb-6">
          <h1 className="text-base lg:text-lg font-semibold text-gray-900">구매 대시보드</h1>
          <p className="text-gray-600 mt-1 text-sm">주문 현황을 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-4 lg:mb-6">
          <div className="bg-white rounded-lg shadow p-3 lg:p-4">
            <p className="text-xs text-gray-600">진행중 주문</p>
            <p className="text-base lg:text-lg font-semibold text-gray-900">
              {stats?.inProgressOrders || 0}건
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 lg:p-4">
            <p className="text-xs text-gray-600">도착 확인 대기</p>
            <p className="text-base lg:text-lg font-semibold text-gray-900">
              {stats?.deliveredOrders || 0}건
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 lg:p-4">
            <p className="text-xs text-gray-600">작성 가능 리뷰</p>
            <p className="text-base lg:text-lg font-semibold text-gray-900">
              {stats?.pendingReviews || 0}건
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 lg:p-4">
            <p className="text-xs text-gray-600">이번달 구매</p>
            <p className="text-base lg:text-lg font-semibold text-gray-900">
              {stats?.monthlyPurchases || 0}건
            </p>
          </div>
        </div>

        {/* 알림 */}
        {alerts.length > 0 && (
          <>
            <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-red-500" />
              확인 필요
            </h2>
            <div className="space-y-2 mb-4 lg:mb-6">
              {alerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className="flex items-center justify-between p-3 bg-white rounded-lg shadow hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-900 font-medium">{alert.message}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </>
        )}

        {/* 진행중인 주문 */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm lg:text-base font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-500" />
            진행중인 주문
          </h2>
          <Link
            href="/mypage/buyer/orders"
            className="text-xs text-brand-primary hover:underline flex items-center gap-1"
          >
            전체 보기 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="mb-4 lg:mb-6">
          {recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map((order) => {
                const daysLeft = getDaysLeft(order.delivery_date);
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    {/* 모바일 레이아웃 */}
                    <div className="lg:hidden p-3">
                      <div className="flex gap-3 mb-2">
                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {order.service?.thumbnail_url ? (
                            <img
                              src={order.service.thumbnail_url}
                              alt={order.title || order.service.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {order.title || order.service?.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              #{order.order_number || order.id.slice(0, 8)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                order.status === 'delivered'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>{order.seller?.name || '판매자'}</span>
                          <span className="font-semibold text-gray-900">
                            {order.total_amount?.toLocaleString() || '0'}원
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/mypage/buyer/orders/${order.id}`}
                            className="px-3 py-1.5 bg-brand-primary text-white rounded-lg hover:bg-[#0a2540] transition-colors text-xs font-medium"
                          >
                            {order.status === 'delivered' ? '확인' : '상세'}
                          </Link>
                          <Link
                            href={`/chat?order=${order.id}`}
                            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
                          >
                            메시지
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* PC 레이아웃 */}
                    <div className="hidden lg:block p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {order.service?.thumbnail_url ? (
                            <img
                              src={order.service.thumbnail_url}
                              alt={order.title || order.service.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-500">
                              #{order.order_number || order.id.slice(0, 8)}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {order.title || order.service?.title}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            판매자: {order.seller?.name || '판매자'}
                          </div>
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                order.status === 'delivered'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                            {daysLeft && (
                              <span className="text-sm text-gray-600">D-{daysLeft}일</span>
                            )}
                            <span className="text-sm font-semibold text-gray-900">
                              {order.total_amount?.toLocaleString() || '0'}원
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/mypage/buyer/orders/${order.id}`}
                              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#0a2540] transition-colors text-sm font-medium"
                            >
                              {order.status === 'delivered' ? '확인하기' : '상세보기'}
                            </Link>
                            <Link
                              href={`/chat?order=${order.id}`}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                              메시지
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">진행중인 주문이 없습니다</p>
            </div>
          )}
        </div>

        {/* 최근 찜한 서비스 */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm lg:text-base font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            최근 찜한 서비스
          </h2>
          <Link
            href="/mypage/buyer/favorites"
            className="text-xs text-brand-primary hover:underline flex items-center gap-1"
          >
            전체 보기 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div>
          {favorites.length > 0 ? (
            <div className="space-y-2">
              {favorites.map((item) => (
                <Link
                  key={item.id}
                  href={`/services/${item.service?.id}`}
                  className="flex items-center justify-between p-3 bg-white rounded-lg shadow hover:shadow-md transition-all"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900">{item.service?.title}</div>
                    <div className="text-xs text-gray-600">{item.service?.seller?.name}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">찜한 서비스가 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
