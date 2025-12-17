'use client';

import { useState, useEffect } from 'react';
import {
  getAdminOrders,
  getAdminOrdersCount,
  type OrderWithRelations,
} from '@/lib/supabase/queries/admin';
import { getOrderStatusLabel, getOrderStatusColor } from '@/lib/orders/status';
import { logger } from '@/lib/logger';
import AdminDataView from '@/components/admin/AdminDataView';

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

  return (
    <AdminDataView
      title="주문 관리"
      description="전체 주문 내역을 관리하세요"
      tabs={tabs}
      activeTab={statusFilter}
      onTabChange={setStatusFilter}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="주문번호, 구매자명, 전문가명으로 검색"
      isLoading={loading}
      error={error}
      onRetry={loadOrders}
      filteredCount={filteredOrders.length}
      isEmpty={filteredOrders.length === 0}
      emptyStateProps={{
        icon: 'fa-shopping-cart',
        title: '주문이 없습니다',
        description: '검색 조건에 맞는 주문이 없습니다',
      }}
    >
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
                        src={order.service.thumbnail_url ?? ''}
                        alt={order.service?.title ?? ''}
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
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrderStatusColor(order.status ?? '')}`}
                  >
                    {getOrderStatusLabel(order.status ?? '')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString('ko-KR') : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminDataView>
  );
}
