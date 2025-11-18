"use client";

import { useState, useEffect } from "react";
import {
  FaWonSign,
  FaChartLine,
  FaMousePointer,
  FaCoins,
  FaCreditCard,
  FaUniversity,
  FaChartBar,
} from "react-icons/fa";

interface RevenueByPeriod {
  period: string;
  amount: number;
}

interface RevenueByPaymentMethod {
  method: string;
  amount: number;
}

interface TopService {
  subscriptionId: string;
  serviceName: string;
  sellerName: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

interface SubscriptionStats {
  total: number;
  active: number;
  pending: number;
  cancelled: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface Statistics {
  period: string;
  startDate?: string;
  endDate?: string;
  revenue: {
    byPeriod: RevenueByPeriod[];
    byPaymentMethod: RevenueByPaymentMethod[];
    total: number;
  };
  performance: {
    totalImpressions: number;
    totalClicks: number;
    ctr: number;
    topServices: TopService[];
  };
  subscriptions: SubscriptionStats;
}

type Period = "day" | "month" | "year";

export default function AdminAdvertisingStatisticsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ period });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(
        `/api/admin/advertising/statistics?${params.toString()}`,
      );
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch statistics:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatistics();
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      credit: "크레딧",
      card: "카드",
      bank_transfer: "무통장",
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      credit: FaCoins,
      card: FaCreditCard,
      bank_transfer: FaUniversity,
    };
    return icons[method as keyof typeof icons] || FaCoins;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">광고 통계</h1>
        <p className="text-slate-600">광고 수익 및 성과 분석</p>
      </div>

      {/* Period Tabs */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              기간 단위
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod("day")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  period === "day"
                    ? "bg-[#0f3460] text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                일별
              </button>
              <button
                onClick={() => setPeriod("month")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  period === "month"
                    ? "bg-[#0f3460] text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                월별
              </button>
              <button
                onClick={() => setPeriod("year")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  period === "year"
                    ? "bg-[#0f3460] text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                연별
              </button>
            </div>
          </div>

          <form onSubmit={handleFilterSubmit} className="flex gap-2 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                시작일
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                종료일
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0f3460] text-white rounded-md hover:bg-[#0f3460]/90 transition-colors"
            >
              조회
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-600">데이터를 불러오는 중...</div>
        </div>
      ) : statistics ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    총 수익
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    ₩{statistics.revenue.total.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <FaWonSign className="text-[#0f3460] text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    월 예상 수익
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    ₩{statistics.subscriptions.monthlyRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    활성 광고 {statistics.subscriptions.active}개
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 p-3">
                  <FaChartLine className="text-green-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    평균 CTR
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {statistics.performance.ctr.toFixed(2)}%
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    노출{" "}
                    {statistics.performance.totalImpressions.toLocaleString()} /
                    클릭 {statistics.performance.totalClicks.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-purple-50 p-3">
                  <FaMousePointer className="text-purple-600 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Stats */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">
                결제 방법별 수익
              </h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                {statistics.revenue.byPaymentMethod.length === 0 ? (
                  <div className="col-span-3 text-center py-8 text-slate-600">
                    결제 내역이 없습니다.
                  </div>
                ) : (
                  statistics.revenue.byPaymentMethod.map((item) => {
                    const IconComponent = getPaymentMethodIcon(item.method);
                    return (
                      <div
                        key={item.method}
                        className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4"
                      >
                        <div className="rounded-lg bg-slate-50 p-3">
                          <IconComponent className="text-slate-700 text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">
                            {getPaymentMethodLabel(item.method)}
                          </p>
                          <p className="text-2xl font-bold text-slate-900">
                            ₩{item.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Top Services */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">
                Top 10 광고 서비스
              </h2>
            </div>
            {statistics.performance.topServices.length === 0 ? (
              <div className="p-12 text-center text-slate-600">
                광고 노출 데이터가 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                        순위
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                        서비스명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                        판매자
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        노출수
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        클릭수
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        CTR
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {statistics.performance.topServices.map(
                      (service, index) => (
                        <tr
                          key={service.subscriptionId}
                          className="hover:bg-slate-50"
                        >
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                            {index + 1}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                            {service.serviceName}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                            {service.sellerName}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-900">
                            {service.impressions.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-900">
                            {service.clicks.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-slate-900">
                            {service.ctr.toFixed(2)}%
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Revenue by Period */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">
                기간별 수익 (
                {period === "day"
                  ? "일별"
                  : period === "month"
                    ? "월별"
                    : "연별"}
                )
              </h2>
            </div>
            {statistics.revenue.byPeriod.length === 0 ? (
              <div className="p-12 text-center text-slate-600">
                수익 데이터가 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                        기간
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        수익
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {statistics.revenue.byPeriod.map((item) => (
                      <tr key={item.period} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                          {item.period}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-slate-900">
                          ₩{item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Subscription Stats */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">구독 현황</h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">전체 구독</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {statistics.subscriptions.total}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">활성 구독</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.subscriptions.active}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">결제 대기</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {statistics.subscriptions.pending}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">취소됨</p>
                  <p className="text-2xl font-bold text-red-600">
                    {statistics.subscriptions.cancelled}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <FaChartBar className="text-slate-400 text-5xl mb-4 mx-auto" />
          <p className="text-slate-600">통계 데이터가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
