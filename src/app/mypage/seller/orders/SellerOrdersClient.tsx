'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import OrderCard from '@/components/mypage/OrderCard';
import Link from 'next/link';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';
import type { Order, Service, User } from '@/types/common';
import { Eye, Check, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

type OrderStatus =
  | 'all'
  | 'paid'
  | 'in_progress'
  | 'revision'
  | 'delivered'
  | 'completed'
  | 'cancelled';

interface OrderFilter {
  status: OrderStatus;
  searchQuery: string;
  startDate: string;
  endDate: string;
  minPrice: string;
  maxPrice: string;
}

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

  const [filters, setFilters] = useState<OrderFilter>({
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return '결제완료';
      case 'in_progress':
        return '진행중';
      case 'revision':
        return '수정 요청';
      case 'delivered':
        return '완료 대기';
      case 'completed':
        return '완료';
      case 'cancelled':
        return '취소/환불';
      case 'refunded':
        return '환불완료';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): 'red' | 'yellow' | 'green' | 'gray' => {
    switch (status) {
      case 'paid':
        return 'red';
      case 'in_progress':
        return 'yellow';
      case 'revision':
        return 'red';
      case 'delivered':
        return 'green';
      case 'completed':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getActionButtons = (order: SellerOrderListItem) => {
    if (order.status === 'paid') {
      return (
        <>
          <Link
            href={`/mypage/seller/orders/${order.id}`}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium"
          >
            주문 확인
          </Link>
          <Link
            href={`/chat?order=${order.id}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
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
            href={`/mypage/seller/orders/${order.id}`}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium"
          >
            상세보기
          </Link>
          <Link
            href={`/chat?order=${order.id}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            메시지
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium whitespace-nowrap"
          >
            <Eye aria-hidden="true" className="w-4 h-4" />
            <span>수정 요청 확인</span>
            {revisionCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {revisionCount}차
              </span>
            )}
          </Link>
          <button
            onClick={() => handleCompleteRevision(order.id)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            <Check aria-hidden="true" className="w-4 h-4" />
            수정 완료
          </button>
          <Link
            href={`/chat?order=${order.id}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            메시지
          </Link>
        </>
      );
    }

    if (order.status === 'delivered') {
      return (
        <>
          <Link
            href={`/mypage/seller/orders/${order.id}`}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium"
          >
            상세보기
          </Link>
          <Link
            href={`/chat?order=${order.id}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            메시지
          </Link>
        </>
      );
    }

    return (
      <>
        <Link
          href={`/mypage/seller/orders/${order.id}`}
          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium"
        >
          상세보기
        </Link>
        <Link
          href={`/chat?order=${order.id}`}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          메시지
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
      statusLabel: getStatusLabel(order.status),
      statusColor: getStatusColor(order.status),
      price: order.total_amount,
      orderDate: new Date(order.created_at).toLocaleString('ko-KR'),
      expectedDeliveryDate: order.delivery_date
        ? new Date(order.delivery_date).toLocaleDateString('ko-KR')
        : '-',
      daysLeft: order.delivery_date
        ? Math.ceil((new Date(order.delivery_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0,
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
      <div className="py-4 px-4 lg:py-8 lg:px-6">
        {/* 페이지 헤더 */}
        <div className="mb-4 lg:mb-6">
          <h1 className="text-base lg:text-lg font-semibold text-gray-900">주문 관리</h1>
          <p className="text-gray-600 mt-1 text-sm">전체 주문 내역을 관리하세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilters({ ...filters, status: tab.value as OrderStatus })}
                className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  filters.status === tab.value
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      filters.status === tab.value
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {/* 검색 */}
            <div className="lg:col-span-2">
              <label
                htmlFor="seller-order-search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                주문번호 / 구매자명 검색
              </label>
              <input
                id="seller-order-search"
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                placeholder="검색어를 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>

            {/* 기간 검색 */}
            <div>
              <label
                htmlFor="seller-order-start-date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                시작일
              </label>
              <input
                id="seller-order-start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="seller-order-end-date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                종료일
              </label>
              <input
                id="seller-order-end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>

            {/* 가격 범위 */}
            <div>
              <label
                htmlFor="seller-order-min-price"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                최소 금액
              </label>
              <input
                id="seller-order-min-price"
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="seller-order-max-price"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                최대 금액
              </label>
              <input
                id="seller-order-max-price"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>

            {/* 초기화 버튼 */}
            <div className="lg:col-span-2 flex items-end">
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium whitespace-nowrap"
              >
                <RotateCcw aria-hidden="true" className="w-4 h-4" />
                초기화
              </button>
            </div>
          </div>
        </div>

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
