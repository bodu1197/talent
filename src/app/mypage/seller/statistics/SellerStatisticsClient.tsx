"use client";

import MypageLayoutWrapper from "@/components/mypage/MypageLayoutWrapper";
import { FaChartLine } from "react-icons/fa";

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
  stats: StatisticsData;
  topServices: ServiceStats[];
}

export default function SellerStatisticsClient({ stats, topServices }: Props) {
  return (
    <MypageLayoutWrapper mode="seller">
      <div className="py-8 px-4">
        <div className="mb-6 lg:mb-8 pt-12 lg:pt-0">
          <h1 className="text-xl font-bold text-gray-900">통계/분석</h1>
          <p className="text-gray-600 mt-1 text-sm">판매 통계를 확인하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-4">조회수</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">오늘</span>
                <span className="text-lg font-bold text-gray-900">
                  {stats.todayViews}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번 주</span>
                <span className="text-lg font-bold text-gray-900">
                  {stats.weeklyViews}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번 달</span>
                <span className="text-lg font-bold text-gray-900">
                  {stats.monthlyViews}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-4">주문 수</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">오늘</span>
                <span className="text-lg font-bold text-brand-primary">
                  {stats.todayOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번 주</span>
                <span className="text-lg font-bold text-brand-primary">
                  {stats.weeklyOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번 달</span>
                <span className="text-lg font-bold text-brand-primary">
                  {stats.monthlyOrders}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-4">전환율</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">오늘</span>
                <span className="text-lg font-bold text-green-600">
                  {stats.todayViews > 0
                    ? ((stats.todayOrders / stats.todayViews) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번 주</span>
                <span className="text-lg font-bold text-green-600">
                  {stats.weeklyViews > 0
                    ? ((stats.weeklyOrders / stats.weeklyViews) * 100).toFixed(
                        1,
                      )
                    : "0.0"}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번 달</span>
                <span className="text-lg font-bold text-green-600">
                  {stats.monthlyViews > 0
                    ? (
                        (stats.monthlyOrders / stats.monthlyViews) *
                        100
                      ).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            인기 서비스 (이번 달)
          </h2>
          {topServices.length > 0 ? (
            <div className="space-y-4">
              {topServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg card-interactive"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {service.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      조회 {service.views} • 주문 {service.orders}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-brand-primary">
                    {service.views > 0
                      ? ((service.orders / service.views) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaChartLine className="text-4xl mb-2 mx-auto" />
              <p>아직 통계 데이터가 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
