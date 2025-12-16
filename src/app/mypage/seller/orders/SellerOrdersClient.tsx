'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import OrderCard from '@/components/mypage/OrderCard';
import Link from 'next/link';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import OrdersTabNavigation from '@/components/orders/OrdersTabNavigation';
import OrdersFilterPanel, { type OrdersFilter } from '@/components/orders/OrdersFilterPanel';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';
import type { Order, Service, User, OrderStatus } from '@/types/common';
import {
  getOrderStatusLabel,
  getOrderStatusColor,
  formatOrderDate,
  formatDeliveryDate,
  calculateDaysLeft,
} from '@/utils/orderHelpers';
import { Eye, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface SellerOrderListItem extends Order {
  order_number?: string;
  title?: string;
  delivery_date?: string | null;
  revision_count?: number;
  requirements?: string;
  service?: Service;
  buyer?: User;
}

export default function SellerOrdersClient({ sellerId }: Readonly<{ sellerId: string }>) {
  const searchParams = useSearchParams();
  const statusFromUrl = (searchParams.get('status') as OrderStatus) || 'all';
  const supabase = createClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [orders, setOrders] = useState<SellerOrderListItem[]>([]);
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
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, status: statusFromUrl }));
  }, [statusFromUrl]);

  useEffect(() => {
    loadOrders();
    loadStatusCounts();
  }, [filters.status]);

  async function loadOrders() {
    try {
      setLoading(true);
      setError(null);

      const statusParam = filters.status === 'all' ? '' : `?status=${filters.status}`;
      const response = await fetch(`/api/orders/seller${statusParam}`);

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
      const response = await fetch('/api/orders/seller/count');

      if (!response.ok) {
        throw new Error('카운트 조회 실패');
      }

      const { counts } = await response.json();
      setStatusCounts(counts);
    } catch (err: unknown) {
      logger.error('상태별 카운트 조회 실패:', err);
    }
  }

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Notification sound play failed - silently ignore
      });
    }
  };

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  // Real-time subscription for new orders
  useEffect(() => {
    const channel = supabase
      .channel('seller-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `seller_id=eq.${sellerId}`,
        },
        async () => {
          playNotificationSound();
          loadOrders();
          loadStatusCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sellerId]);

  async function handleCompleteRevision(orderId: string) {
    if (!confirm('수정을 완료하고 구매자에게 전달하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/complete-revision`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '수정 완료 처리에 실패했습니다');
      }

      toast.success('수정이 완료되었습니다.');
      loadOrders();
      loadStatusCounts();
    } catch (err: unknown) {
      logger.error('수정 완료 처리 실패:', err);
      toast.error(err instanceof Error ? err.message : '수정 완료 처리에 실패했습니다');
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesBuyerName = order.buyer?.name?.toLowerCase().includes(query);
      const matchesOrderNumber = order.order_number?.toLowerCase().includes(query);
      const matchesTitle = order.title?.toLowerCase().includes(query);
      if (!matchesBuyerName && !matchesOrderNumber && !matchesTitle) return false;
    }

    if (filters.minPrice && order.total_amount < Number.parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && order.total_amount > Number.parseInt(filters.maxPrice)) return false;

    return true;
  });

  const tabs = [
    { value: 'all', label: '전체', count: statusCounts.all },
    { value: 'paid', label: '신규 주문', count: statusCounts.paid },
    { value: 'in_progress', label: '진행중', count: statusCounts.in_progress },
    { value: 'revision', label: '수정 요청', count: statusCounts.revision },
    { value: 'delivered', label: '완료 대기', count: statusCounts.delivered },
    { value: 'completed', label: '완료', count: statusCounts.completed },
    { value: 'cancelled', label: '취소/환불', count: statusCounts.cancelled },
  ];

  const resetFilters = () => {
    setFilters({
      status: 'all',
      searchQuery: '',
      startDate: '',
      endDate: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const getActionButtons = (order: SellerOrderListItem) => {
    if (order.status === 'paid') {
      return (
        <>
          <Link
            href={`/mypage/seller/orders/${order.id}`}
            className="px-3 py-1.5 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-xs font-medium"
          >
            확인
          </Link>
          <Link
            href={`/chat?order=${order.id}`}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
          >
            채팅
          </Link>
        </>
      );
    }

    if (order.status === 'in_progress') {
      return (
        <>
          <Link
            href={`/mypage/seller/orders/${order.id}`}
            className="px-3 py-1.5 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-xs font-medium"
          >
            상세
          </Link>
          <Link
            href={`/chat?order=${order.id}`}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
          >
            채팅
          </Link>
        </>
      );
    }

    if (order.status === 'revision') {
      const revisionCount = order.revision_count || 0;
      return (
        <>
          <Link
            href={`/mypage/seller/orders/${order.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-xs font-medium whitespace-nowrap"
          >
            <Eye aria-hidden="true" className="w-3 h-3" />
            <span>수정확인</span>
            {revisionCount > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {revisionCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => handleCompleteRevision(order.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium whitespace-nowrap"
          >
            <Check aria-hidden="true" className="w-3 h-3" />
            완료
          </button>
          <Link
            href={`/chat?order=${order.id}`}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
          >
            채팅
          </Link>
        </>
      );
    }

    if (order.status === 'delivered') {
      return (
        <>
          <Link
            href={`/mypage/seller/orders/${order.id}`}
            className="px-3 py-1.5 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-xs font-medium"
          >
            상세
          </Link>
          <Link
            href={`/chat?order=${order.id}`}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
          >
            채팅
          </Link>
        </>
      );
    }

    return (
      <>
        <Link
          href={`/mypage/seller/orders/${order.id}`}
          className="px-3 py-1.5 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-xs font-medium"
        >
          상세
        </Link>
        <Link
          href={`/chat?order=${order.id}`}
          className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
        >
          채팅
        </Link>
      </>
    );
  };

  const formatOrderData = (order: SellerOrderListItem) => {
    return {
      id: order.id,
      orderNumber: order.order_number,
      title: order.title || order.service?.title || '',
      thumbnailUrl: order.service?.thumbnail_url,
      buyerName: order.buyer?.name,
      status: order.status,
      statusLabel: getOrderStatusLabel(order.status),
      statusColor: getOrderStatusColor(order.status, 'seller'),
      price: order.total_amount,
      orderDate: formatOrderDate(order.created_at),
      expectedDeliveryDate: formatDeliveryDate(order.delivery_date || null),
      daysLeft: calculateDaysLeft(order.delivery_date || null),
      requirements: order.requirements,
      revisionCount: order.revision_count || 0,
    };
  };

  if (loading) {
    return (
      <MypageLayoutWrapper mode="seller">
        <div className="py-8 px-4">
          <LoadingSpinner message="주문 내역을 불러오는 중..." />
        </div>
      </MypageLayoutWrapper>
    );
  }

  if (error) {
    return (
      <MypageLayoutWrapper mode="seller">
        <div className="py-8 px-4">
          <ErrorState message={error} retry={loadOrders} />
        </div>
      </MypageLayoutWrapper>
    );
  }

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        {/* 페이지 헤더 */}
        <div className="mb-4 lg:mb-6">
          <h1 className="text-base lg:text-lg font-semibold text-gray-900">주문 관리</h1>
          <p className="text-gray-600 mt-1 text-sm">전체 주문 내역을 관리하세요</p>
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
          onFiltersChange={setFilters}
          onReset={resetFilters}
          mode="seller"
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
                mode="seller"
                actions={getActionButtons(order)}
              />
            ))
          ) : (
            <EmptyState
              icon="fa-inbox"
              title="주문 내역이 없습니다"
              description="새로운 주문이 들어오면 여기에 표시됩니다"
            />
          )}
        </div>

        {/* 페이지네이션 */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft aria-hidden="true" className="w-4 h-4" />
            </button>
            <button className="px-4 py-2 bg-brand-primary text-white rounded-lg">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              2
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              3
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <ChevronRight aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </MypageLayoutWrapper>
  );
}
