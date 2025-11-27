'use client';

import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import { ShoppingCart, Loader2, CheckCircle, CircleDollarSign } from 'lucide-react';

type Stats = {
  newOrders: number;
  inProgressOrders: number;
  deliveredOrders: number;
  monthlyRevenue: number;
};

type Order = {
  id: string;
  order_number?: string;
  title?: string;
  status: string;
  total_amount?: number;
  service?: {
    title: string;
  };
  buyer?: {
    name: string;
  };
};

type Props = {
  readonly stats: Stats;
  readonly recentOrders: Order[];
};

export default function Dashboard2Client({ stats, recentOrders }: Props) {
  return (
    <MypageLayoutWrapper mode="seller">
      <div className="py-8 px-4">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">판매 대시보드 2 (헤더/푸터 없음)</h1>
          <p className="text-gray-600 mt-1 text-sm">판매 현황을 한눈에 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">신규 주문</p>
                <p className="text-lg font-semibold text-gray-900">{stats.newOrders}건</p>
              </div>
              <ShoppingCart className="w-7 h-7 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">진행중</p>
                <p className="text-lg font-semibold text-gray-900">{stats.inProgressOrders}건</p>
              </div>
              <Loader2 className="w-7 h-7 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">완료된 주문</p>
                <p className="text-lg font-semibold text-gray-900">{stats.deliveredOrders}건</p>
              </div>
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">이번달 수익</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.monthlyRevenue.toLocaleString()}원
                </p>
              </div>
              <CircleDollarSign className="w-7 h-7 text-purple-500" />
            </div>
          </div>
        </div>

        {/* 최근 주문 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">최근 주문</h2>
          </div>
          <div className="p-6">
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
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
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        금액
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{order.order_number || order.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.service?.title || order.title || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.buyer?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(() => {
                              if (order.status === 'completed')
                                return 'bg-green-100 text-green-800';
                              if (order.status === 'in_progress')
                                return 'bg-yellow-100 text-yellow-800';
                              return 'bg-gray-100 text-gray-800';
                            })()}`}
                          >
                            {(() => {
                              if (order.status === 'in_progress') return '진행중';
                              if (order.status === 'completed') return '완료';
                              if (order.status === 'paid') return '결제완료';
                              return order.status;
                            })()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(order.total_amount || 0).toLocaleString()}원
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
