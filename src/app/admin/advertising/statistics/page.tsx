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

  return (
    <div className="space-y-8">
      <PageHeader />
      <PeriodFilter
        period={period}
        startDate={startDate}
        endDate={endDate}
        onPeriodChange={setPeriod}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSubmit={handleFilterSubmit}
      />
      <StatisticsContent loading={loading} statistics={statistics} />
    </div>
  );
}

// Helper components to reduce complexity
function PageHeader() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">광고 통계</h1>
      <p className="text-slate-600">광고 수익 및 성과 분석</p>
    </div>
  );
}

interface PeriodFilterProps {
  readonly period: Period;
  readonly startDate: string;
  readonly endDate: string;
  readonly onPeriodChange: (period: Period) => void;
  readonly onStartDateChange: (date: string) => void;
  readonly onEndDateChange: (date: string) => void;
  readonly onSubmit: (e: React.FormEvent) => void;
}

function PeriodFilter({
  period,
  startDate,
  endDate,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
}: PeriodFilterProps) {
  const periodButtons: Array<{ value: Period; label: string }> = [
    { value: "day", label: "일별" },
    { value: "month", label: "월별" },
    { value: "year", label: "연별" },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            기간 단위
          </label>
          <div className="flex gap-2" role="group" aria-label="기간 단위 선택">
            {periodButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => onPeriodChange(btn.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  period === btn.value
                    ? "bg-[#0f3460] text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex gap-2 items-end">
          <div>
            <label htmlFor="stats-start-date" className="block text-sm font-medium text-slate-700 mb-1">
              시작일
            </label>
            <input
              id="stats-start-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            />
          </div>
          <div>
            <label htmlFor="stats-end-date" className="block text-sm font-medium text-slate-700 mb-1">
              종료일
            </label>
            <input
              id="stats-end-date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
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
  );
}

interface StatisticsContentProps {
  readonly loading: boolean;
  readonly statistics: Statistics | null;
}

function StatisticsContent({ loading, statistics }: StatisticsContentProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <FaChartBar className="text-slate-400 text-5xl mb-4 mx-auto" />
        <p className="text-slate-600">통계 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <SummaryCards statistics={statistics} />
      <PaymentMethodStats revenue={statistics.revenue} />
      <TopServicesTable services={statistics.performance.topServices} />
      <RevenueByPeriodTable
        revenue={statistics.revenue}
        period={statistics.period}
      />
      <SubscriptionStats subscriptions={statistics.subscriptions} />
    </>
  );
}

function SummaryCards({ statistics }: Readonly<{ statistics: Statistics }>) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">총 수익</p>
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
            <p className="text-sm font-medium text-slate-600 mb-2">평균 CTR</p>
            <p className="text-3xl font-bold text-slate-900">
              {statistics.performance.ctr.toFixed(2)}%
            </p>
            <p className="text-sm text-slate-500 mt-1">
              노출 {statistics.performance.totalImpressions.toLocaleString()} /
              클릭 {statistics.performance.totalClicks.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-purple-50 p-3">
            <FaMousePointer className="text-purple-600 text-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

const PAYMENT_METHOD_CONFIG = {
  credit: { label: "크레딧", icon: FaCoins },
  card: { label: "카드", icon: FaCreditCard },
  bank_transfer: { label: "무통장", icon: FaUniversity },
} as const;

function getPaymentMethodConfig(method: string) {
  return (
    PAYMENT_METHOD_CONFIG[method as keyof typeof PAYMENT_METHOD_CONFIG] || {
      label: method,
      icon: FaCoins,
    }
  );
}

function PaymentMethodStats({
  revenue,
}: Readonly<{
  revenue: Statistics["revenue"];
}>) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h2 className="text-xl font-bold text-slate-900">결제 방법별 수익</h2>
      </div>
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {revenue.byPaymentMethod.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-slate-600">
              결제 내역이 없습니다.
            </div>
          ) : (
            revenue.byPaymentMethod.map((item) => {
              const config = getPaymentMethodConfig(item.method);
              const IconComponent = config.icon;
              return (
                <div
                  key={item.method}
                  className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="rounded-lg bg-slate-50 p-3">
                    <IconComponent className="text-slate-700 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{config.label}</p>
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
  );
}

function TopServicesTable({ services }: Readonly<{ services: TopService[] }>) {
  if (services.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">
            Top 10 광고 서비스
          </h2>
        </div>
        <div className="p-12 text-center text-slate-600">
          광고 노출 데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h2 className="text-xl font-bold text-slate-900">Top 10 광고 서비스</h2>
      </div>
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
            {services.map((service, index) => (
              <tr key={service.subscriptionId} className="hover:bg-slate-50">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RevenueByPeriodTable({
  revenue,
  period,
}: Readonly<{
  revenue: Statistics["revenue"];
  period: string;
}>) {
  const monthLabel = period === "month" ? "월별" : "연별";
  const periodLabel = period === "day" ? "일별" : monthLabel;

  if (revenue.byPeriod.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">
            기간별 수익 ({periodLabel})
          </h2>
        </div>
        <div className="p-12 text-center text-slate-600">
          수익 데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h2 className="text-xl font-bold text-slate-900">
          기간별 수익 ({periodLabel})
        </h2>
      </div>
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
            {revenue.byPeriod.map((item) => (
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
    </div>
  );
}

function SubscriptionStats({
  subscriptions,
}: Readonly<{
  subscriptions: SubscriptionStats;
}>) {
  const stats = [
    {
      label: "전체 구독",
      value: subscriptions.total,
      bgColor: "bg-slate-50",
      textColor: "text-slate-900",
    },
    {
      label: "활성 구독",
      value: subscriptions.active,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "결제 대기",
      value: subscriptions.pending,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      label: "취소됨",
      value: subscriptions.cancelled,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h2 className="text-xl font-bold text-slate-900">구독 현황</h2>
      </div>
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className={`${stat.bgColor} rounded-lg p-4`}>
              <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
