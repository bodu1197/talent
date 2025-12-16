'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import OrderCard from '@/components/mypage/OrderCard';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import OrdersTabNavigation from '@/components/orders/OrdersTabNavigation';
import OrdersFilterPanel, { type OrdersFilter } from '@/components/orders/OrdersFilterPanel';
import { logger } from '@/lib/logger';
import type { Order, Service, Seller, OrderStatus } from '@/types/common';
import {
  getOrderStatusLabel,
  getOrderStatusColor,
  formatOrderDate,
  formatDeliveryDate,
  calculateDaysLeft,
} from '@/utils/orderHelpers';
import { RotateCcw, Eye, Download, Check, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface BuyerOrderListItem extends Order {
  order_number?: string;
  title?: string;
  delivery_date?: string | null;
  requirements?: string;
  service?: Service;
  seller?: Seller;
}

function BuyerOrdersContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const statusFromUrl = (searchParams.get('status') as OrderStatus) || 'all';

  const [orders, setOrders] = useState<BuyerOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    paid: 0,
    in_progress: 0,
    revision: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
  });

  const [filters, setFilters] = useState<OrdersFilter & { status: OrderStatus }>({
    status: statusFromUrl,
    searchQuery: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, status: statusFromUrl }));
  }, [statusFromUrl]);

  useEffect(() => {
    if (user) {
      loadOrders();
      loadStatusCounts();
    }
  }, [user, filters.status]);

  async function loadOrders() {
    try {
      setLoading(true);
      setError(null);

      const statusParam = filters.status === 'all' ? '' : `?status=${filters.status}`;
      const response = await fetch(`/api/orders/buyer${statusParam}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '주문 목록을 불러올 수 없습니다');
      }

      const { orders } = await response.json();
      setOrders(orders);
    } catch (err: unknown) {
      logger.error('주문 조회 실패:', err);
      setError(err instanceof Error ? err.message : '주문 내역을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }

  async function loadStatusCounts() {
    try {
      const response = await fetch('/api/orders/buyer/count');

      if (!response.ok) {
        throw new Error('카운트 조회 실패');
      }

      const { counts } = await response.json();
      setStatusCounts(counts);
    } catch (err) {
      logger.error('상태별 카운트 조회 실패:', err);
    }
  }

  async function handleConfirmOrder(orderId: string) {
    if (!confirm('구매를 확정하시겠습니까?\n확정 후에는 취소할 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '구매 확정에 실패했습니다');
      }

      toast.success('구매가 확정되었습니다.');
      loadOrders();
      loadStatusCounts();
    } catch (err: unknown) {
      logger.error('구매 확정 실패:', err);
      toast.error(err instanceof Error ? err.message : '구매 확정에 실패했습니다');
    }
  }

  async function handleRequestRevision(orderId: string) {
    const reason = prompt('수정 요청 사유를 입력해주세요:');

    if (!reason || reason.trim() === '') {
      toast.error('수정 요청 사유를 입력해주세요');
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '수정 요청에 실패했습니다');
      }

      toast.success('수정 요청이 전송되었습니다.');
      loadOrders();
    } catch (err: unknown) {
      logger.error('수정 요청 실패:', err);
      toast.error(err instanceof Error ? err.message : '수정 요청에 실패했습니다');
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesSellerName = order.seller?.name?.toLowerCase().includes(query);
      const matchesOrderNumber = order.order_number?.toLowerCase().includes(query);
      const matchesTitle = order.title?.toLowerCase().includes(query);
      if (!matchesSellerName && !matchesOrderNumber && !matchesTitle) return false;
    }
    return true;
  });

  const tabs: Array<{ value: OrderStatus; label: string; count: number }> = [
    { value: 'all', label: '전체', count: statusCounts.all },
    { value: 'paid', label: '결제완료', count: statusCounts.paid },
    { value: 'in_progress', label: '진행중', count: statusCounts.in_progress },
    { value: 'revision', label: '수정 요청', count: statusCounts.revision },
    {
      value: 'delivered',
      label: '도착 확인 대기',
      count: statusCounts.delivered,
    },
    { value: 'completed', label: '완료', count: statusCounts.completed },
    { value: 'cancelled', label: '취소/환불', count: statusCounts.cancelled },
  ];

  const resetFilters = () => {
    setFilters({
      status: 'all',
      searchQuery: '',
      startDate: '',
      endDate: '',
    });
  };

  const getActionButtons = (order: BuyerOrderListItem) => {
    if (order.status === 'revision') {
      return (
        <>
          <Link
            href={`/mypage/buyer/orders/${order.id}`}
            className="inline-flex items-center gap-1 px-2 py-1 lg:px-4 lg:py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors text-xs lg:text-sm font-medium whitespace-nowrap"
          >
            <Eye className="w-3 h-3 lg:w-4 lg:h-4 hidden lg:block" />
            <span className="lg:hidden">확인</span>
            <span className="hidden lg:inline">수정 내역 확인</span>
          </Link>
          <Link
            href={`/chat?order=${order.id}`}
            className="px-2 py-1 lg:px-4 lg:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs lg:text-sm font-medium"
          >
            <span className="lg:hidden">채팅</span>
            <span className="hidden lg:inline">메시지</span>
          </Link>
        </>
      );
    }

    if (order.status === 'delivered') {
      return (
        <>
          <Link
            href={`/mypage/buyer/orders/${order.id}`}
            className="inline-flex items-center gap-1 px-2 py-1 lg:px-4 lg:py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors text-xs lg:text-sm font-medium whitespace-nowrap"
          >
            <Download className="w-3 h-3 lg:w-4 lg:h-4 hidden lg:block" />
            <span className="lg:hidden">상세</span>
            <span className="hidden lg:inline">다운로드</span>
          </Link>
          <button
            onClick={() => handleConfirmOrder(order.id)}
            className="inline-flex items-center gap-1 px-2 py-1 lg:px-4 lg:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs lg:text-sm font-medium whitespace-nowrap"
          >
            <Check className="w-3 h-3 lg:w-4 lg:h-4 hidden lg:block" />
            <span className="lg:hidden">확정</span>
            <span className="hidden lg:inline">구매 확정</span>
          </button>
          <button
            onClick={() => handleRequestRevision(order.id)}
            className="inline-flex items-center gap-1 px-2 py-1 lg:px-4 lg:py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-xs lg:text-sm font-medium whitespace-nowrap"
          >
            <RotateCcw className="w-3 h-3 lg:w-4 lg:h-4 hidden lg:block" />
            <span className="lg:hidden">수정</span>
            <span className="hidden lg:inline">수정 요청</span>
          </button>
          <Link
            href={`/chat?order=${order.id}`}
            className="hidden lg:inline-block px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            메시지
          </Link>
        </>
      );
    }

    if (order.status === 'in_progress') {
      return (
        <>
          <Link
            href={`/mypage/buyer/orders/${order.id}`}
            className="px-2 py-1 lg:px-4 lg:py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors text-xs lg:text-sm font-medium"
          >
            <span className="lg:hidden">상세</span>
            <span className="hidden lg:inline">상세보기</span>
          </Link>
          <Link
            href={`/chat?order=${order.id}`}
            className="px-2 py-1 lg:px-4 lg:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs lg:text-sm font-medium"
          >
            <span className="lg:hidden">채팅</span>
            <span className="hidden lg:inline">메시지</span>
          </Link>
        </>
      );
    }

    if (order.status === 'completed') {
      return (
        <>
          <Link
            href={`/mypage/buyer/orders/${order.id}`}
            className="px-2 py-1 lg:px-4 lg:py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors text-xs lg:text-sm font-medium"
          >
            <span className="lg:hidden">상세</span>
            <span className="hidden lg:inline">상세보기</span>
          </Link>
          <Link
            href={`/mypage/buyer/reviews?order=${order.id}`}
            className="inline-flex items-center gap-1 px-2 py-1 lg:px-4 lg:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs lg:text-sm font-medium whitespace-nowrap"
          >
            <Star className="w-3 h-3 lg:w-4 lg:h-4 hidden lg:block" />
            <span className="lg:hidden">리뷰</span>
            <span className="hidden lg:inline">리뷰 작성</span>
          </Link>
        </>
      );
    }

    return (
      <Link
        href={`/mypage/buyer/orders/${order.id}`}
        className="px-2 py-1 lg:px-4 lg:py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors text-xs lg:text-sm font-medium"
      >
        <span className="lg:hidden">상세</span>
        <span className="hidden lg:inline">상세보기</span>
      </Link>
    );
  };

  const formatOrderData = (order: BuyerOrderListItem) => {
    return {
      id: order.id,
      orderNumber: order.order_number,
      title: order.title || order.service?.title || '제목 없음',
      thumbnailUrl: order.service?.thumbnail_url,
      sellerName: order.seller?.name,
      status: order.status,
      statusLabel: getOrderStatusLabel(order.status),
      statusColor: getOrderStatusColor(order.status, 'buyer'),
      price: order.total_amount,
      orderDate: formatOrderDate(order.created_at),
      expectedDeliveryDate: formatDeliveryDate(order.delivery_date || null),
      daysLeft: calculateDaysLeft(order.delivery_date || null),
      requirements: order.requirements,
    };
  };

  if (loading) {
    return (
      <MypageLayoutWrapper mode="buyer">
        <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
          <LoadingSpinner message="주문 내역을 불러오는 중..." />
        </div>
      </MypageLayoutWrapper>
    );
  }

  if (error) {
    return (
      <MypageLayoutWrapper mode="buyer">
        <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
          <ErrorState message={error} retry={loadOrders} />
        </div>
      </MypageLayoutWrapper>
    );
  }

  return (
    <MypageLayoutWrapper mode="buyer">
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        {/* 페이지 헤더 */}
        <div className="mb-4 lg:mb-6">
          <h1 className="text-base lg:text-lg font-semibold text-gray-900">주문 내역</h1>
          <p className="text-gray-600 mt-1 text-sm">주문 내역을 확인하세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <OrdersTabNavigation
          tabs={tabs}
          activeStatus={filters.status}
          onStatusChange={(status) => setFilters({ ...filters, status })}
        />

        {/* 검색 및 필터 */}
        <OrdersFilterPanel
          filters={filters}
          onFiltersChange={(newFilters) => setFilters({ ...newFilters, status: filters.status })}
          onReset={resetFilters}
          mode="buyer"
        />

        {/* 결과 카운트 */}
        <div className="mb-4 text-sm text-gray-600">
          총 <span className="font-semibold text-gray-900">{filteredOrders.length}</span> 건의 주문
        </div>

        {/* 주문 목록 */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={formatOrderData(order)}
                mode="buyer"
                actions={getActionButtons(order)}
              />
            ))
          ) : (
            <EmptyState
              icon="fa-inbox"
              title="주문 내역이 없습니다"
              description="서비스를 구매하고 주문 내역을 확인해보세요"
              action={{
                label: '서비스 둘러보기',
                href: '/',
              }}
            />
          )}
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}

export default function BuyerOrdersPage() {
  return (
    <Suspense
      fallback={
        <MypageLayoutWrapper mode="buyer">
          <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
            <LoadingSpinner message="페이지 로딩 중..." />
          </div>
        </MypageLayoutWrapper>
      }
    >
      <BuyerOrdersContent />
    </Suspense>
  );
}
