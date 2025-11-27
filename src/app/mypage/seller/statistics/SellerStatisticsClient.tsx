'use client';

import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import { TrendingUp } from 'lucide-react';

interface StatisticsData {
  todayViews: number;
  weeklyViews: number;
  monthlyViews: number;
  todayOrders: number;
  weeklyOrders: number;
  monthlyOrders: number;
}

interface ServiceStats {
  id: string;
  name: string;
  views: number;
  orders: number;
}

interface Props {
  readonly stats: StatisticsData;
  readonly topServices: readonly ServiceStats[];
}

export default function SellerStatisticsClient({ stats, topServices }: Props) {
  return (
    <MypageLayoutWrapper mode="seller">
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        <div className="mb-4 lg:mb-6">
          <h1 className="text-base lg:text-lg font-semibold text-gray-900">통계/분석</h1>
          <p className="text-gray-600 mt-1 text-sm">판매 통계를 확인하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
            <div className="text-xs lg:text-sm text-gray-600 mb-3">조회수</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">오늘</span>
                <span className="text-base lg:text-lg font-semibold text-gray-900">
                  {stats.todayViews}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">이번 주</span>
                <span className="text-base lg:text-lg font-semibold text-gray-900">
                  {stats.weeklyViews}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">이번 달</span>
                <span className="text-base lg:text-lg font-semibold text-gray-900">
                  {stats.monthlyViews}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
            <div className="text-xs lg:text-sm text-gray-600 mb-3">주문 수</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">오늘</span>
                <span className="text-base lg:text-lg font-semibold text-brand-primary">
                  {stats.todayOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">이번 주</span>
                <span className="text-base lg:text-lg font-semibold text-brand-primary">
                  {stats.weeklyOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">이번 달</span>
                <span className="text-base lg:text-lg font-semibold text-brand-primary">
                  {stats.monthlyOrders}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
            <div className="text-xs lg:text-sm text-gray-600 mb-3">전환율</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">오늘</span>
                <span className="text-base lg:text-lg font-semibold text-green-600">
                  {stats.todayViews > 0
                    ? ((stats.todayOrders / stats.todayViews) * 100).toFixed(1)
                    : '0.0'}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">이번 주</span>
                <span className="text-base lg:text-lg font-semibold text-green-600">
                  {stats.weeklyViews > 0
                    ? ((stats.weeklyOrders / stats.weeklyViews) * 100).toFixed(1)
                    : '0.0'}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">이번 달</span>
                <span className="text-base lg:text-lg font-semibold text-green-600">
                  {stats.monthlyViews > 0
                    ? ((stats.monthlyOrders / stats.monthlyViews) * 100).toFixed(1)
                    : '0.0'}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
          <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-3 lg:mb-4">
            인기 서비스 (이번 달)
          </h2>
          {topServices.length > 0 ? (
            <div className="space-y-2 lg:space-y-3">
              {topServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{service.name}</div>
                    <div className="text-xs text-gray-600">
                      조회 {service.views} • 주문 {service.orders}
                    </div>
                  </div>
                  <div className="text-base lg:text-lg font-semibold text-brand-primary ml-2">
                    {service.views > 0
                      ? ((service.orders / service.views) * 100).toFixed(1)
                      : '0.0'}
                    %
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <TrendingUp className="w-8 h-8 lg:w-10 lg:h-10 mb-2 mx-auto" />
              <p className="text-sm">아직 통계 데이터가 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
