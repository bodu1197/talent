'use client';

import { useState, useEffect } from 'react';
import {
  getAdminOrders,
  getAdminOrdersCount,
  type OrderWithRelations,
} from '@/lib/supabase/queries/admin';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { logger } from '@/lib/logger';
import { RefreshCw } from 'lucide-react';

type OrderStatus = 'all' | 'paid' | 'in_progress' | 'delivered' | 'completed' | 'cancelled';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    paid: 0,
    in_progress: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    loadOrders();
    loadStatusCounts();
  }, [statusFilter]);

  async function loadOrders() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminOrders({
        status: statusFilter === 'all' ? undefined : statusFilter,
        searchQuery,
      });
      setOrders(data);
    } catch (err: unknown) {
      logger.error('주문 조회 실패:', err);
      setError(err instanceof Error ? err.message : '주문 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }

  async function loadStatusCounts() {
    try {
      const [allCount, paidCount, inProgressCount, deliveredCount, completedCount, cancelledCount] =
        await Promise.all([
          getAdminOrdersCount(),
          getAdminOrdersCount('paid'),
          getAdminOrdersCount('in_progress'),
          getAdminOrdersCount('delivered'),
          getAdminOrdersCount('completed'),
          getAdminOrdersCount('cancelled'),
        ]);

      setStatusCounts({
        all: allCount,
        paid: paidCount,
        in_progress: inProgressCount,
        delivered: deliveredCount,
        completed: completedCount,
        cancelled: cancelledCount,
      });
    } catch (err) {
      logger.error('상태별 카운트 조회 실패:', err);
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.order_number?.toLowerCase().includes(query) ||
        order.buyer?.name?.toLowerCase().includes(query) ||
        order.seller?.name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return '결제완료';
      case 'in_progress':
        return '진행중';
      case 'delivered':
        return '완료 대기';
      case 'completed':
        return '완료';
      case 'cancelled':
        return '취소/환불';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-red-100 text-red-700';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'delivered':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const tabs = [
    { value: 'all' as OrderStatus, label: '전체', count: statusCounts.all },
    {
      value: 'paid' as OrderStatus,
      label: '결제완료',
      count: statusCounts.paid,
    },
    {
      value: 'in_progress' as OrderStatus,
      label: '진행중',
      count: statusCounts.in_progress,
    },
    {
      value: 'delivered' as OrderStatus,
      label: '완료 대기',
      count: statusCounts.delivered,
    },
    {
      value: 'completed' as OrderStatus,
      label: '완료',
      count: statusCounts.completed,
    },
    {
      value: 'cancelled' as OrderStatus,
      label: '취소/환불',
      count: statusCounts.cancelled,
    },
  ];

  if (loading) {
    return <LoadingSpinner message="주문 목록을 불러오는 중..." />;
  }

  if (error) {
    return <ErrorState message={error} retry={loadOrders} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">주문 관리</h1>
        <p className="text-gray-600 mt-1">전체 주문 내역을 관리하세요</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    statusFilter === tab.value
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

      {/* 검색 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="주문번호, 구매자명, 전문가명으로 검색"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              aria-label="주문 검색"
            />
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            초기화
          </button>
        </div>
      </div>

      {/* 결과 카운트 */}
      <div className="text-sm text-gray-600">
        총 <span className="font-semibold text-gray-900">{filteredOrders.length}</span> 건의 주문
      </div>

      {/* 주문 목록 */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주문번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    서비스
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    구매자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    전문가
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주문일
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.order_number || order.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {order.service?.thumbnail_url && (
                          <img
                            src={order.service.thumbnail_url || ''}
                            alt={order.service?.title || ''}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        )}
                        <div className="text-sm text-gray-900">
                          {order.service?.title || order.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.buyer?.name}</div>
                      <div className="text-xs text-gray-500">{order.buyer?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.seller?.name}</div>
                      <div className="text-xs text-gray-500">{order.seller?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {(order.total_amount ?? 0).toLocaleString()}원
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status || '')}`}
                      >
                        {getStatusLabel(order.status || '')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString('ko-KR')
                        : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12">
            <EmptyState
              icon="fa-shopping-cart"
              title="주문이 없습니다"
              description="검색 조건에 맞는 주문이 없습니다"
            />
          </div>
        )}
      </div>
    </div>
  );
}
