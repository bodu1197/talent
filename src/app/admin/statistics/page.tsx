'use client';

import { useState, useEffect } from 'react';
import { Eye, Users, TrendingUp, Monitor, Smartphone, Tablet } from 'lucide-react';
import { logger } from '@/lib/logger';

interface AnalyticsStats {
  total_views: number;
  unique_visitors: number;
  desktop_views: number;
  mobile_views: number;
  tablet_views: number;
  bot_views: number;
}

interface AnalyticsResponse {
  period: string;
  summary: {
    totalViews: number;
    totalUniqueVisitors: number;
    avgViewsPerDay: number;
  };
  data: AnalyticsStats[];
}

type Period = 'hour' | 'day' | 'month' | 'year';

export default function AdminStatisticsPage() {
  const [period, setPeriod] = useState<Period>('day');
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      logger.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceStats = () => {
    if (!analytics?.data || analytics.data.length === 0) {
      return { desktop: 0, mobile: 0, tablet: 0, bot: 0 };
    }

    return analytics.data.reduce(
      (acc, curr) => ({
        desktop: acc.desktop + curr.desktop_views,
        mobile: acc.mobile + curr.mobile_views,
        tablet: acc.tablet + curr.tablet_views,
        bot: acc.bot + curr.bot_views,
      }),
      { desktop: 0, mobile: 0, tablet: 0, bot: 0 }
    );
  };

  const deviceStats = getDeviceStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">사이트 통계</h1>
        <p className="text-slate-600">방문자 통계 및 페이지 뷰 분석</p>
      </div>

      {/* Period Tabs */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('hour')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              period === 'hour' ? 'bg-[#0f3460] text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            시간별
          </button>
          <button
            onClick={() => setPeriod('day')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              period === 'day' ? 'bg-[#0f3460] text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            일별
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              period === 'month' ? 'bg-[#0f3460] text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            월별
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              period === 'year' ? 'bg-[#0f3460] text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            연별
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-600">데이터를 불러오는 중...</div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">총 페이지 뷰</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {analytics?.summary.totalViews.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <Eye className="w-6 h-6 text-[#0f3460]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">고유 방문자</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {analytics?.summary.totalUniqueVisitors.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <Users className="w-6 h-6 text-[#0f3460]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">일평균 뷰</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {analytics?.summary.avgViewsPerDay.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <TrendingUp className="w-6 h-6 text-[#0f3460]" />
                </div>
              </div>
            </div>
          </div>

          {/* Device Stats */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">기기별 통계</h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <Monitor className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">데스크톱</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {deviceStats.desktop.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <Smartphone className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">모바일</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {deviceStats.mobile.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <Tablet className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">태블릿</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {deviceStats.tablet.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          {analytics?.data && analytics.data.length > 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <h2 className="text-xl font-bold text-slate-900">
                  {period === 'hour' && '시간별 상세 통계'}
                  {period === 'day' && '일별 상세 통계'}
                  {period === 'month' && '월별 상세 통계'}
                  {period === 'year' && '연별 상세 통계'}
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
                        총 뷰
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        고유 방문자
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        데스크톱
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        모바일
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        태블릿
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {analytics.data.slice(0, 20).map(
                      (
                        row: AnalyticsStats & {
                          hour?: string;
                          date?: string;
                          year?: number;
                          month?: number;
                        }
                      ) => (
                        <tr
                          key={
                            row.hour ||
                            row.date ||
                            `${row.year}-${row.month}` ||
                            `row-${row.total_views}-${row.unique_visitors}`
                          }
                          className="hover:bg-slate-50"
                        >
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                            {period === 'hour' &&
                              row.hour &&
                              new Date(row.hour).toLocaleString('ko-KR')}
                            {period === 'day' &&
                              row.date &&
                              new Date(row.date).toLocaleDateString('ko-KR')}
                            {period === 'month' &&
                              row.year &&
                              row.month &&
                              `${row.year}년 ${row.month}월`}
                            {period === 'year' && row.year && `${row.year}년`}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-slate-900">
                            {row.total_views.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-700">
                            {row.unique_visitors.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-600">
                            {row.desktop_views.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-600">
                            {row.mobile_views.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-600">
                            {row.tablet_views.toLocaleString()}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <Eye className="w-12 h-12 text-slate-400 mb-4 mx-auto" />
              <p className="text-slate-600">아직 수집된 통계 데이터가 없습니다.</p>
              <p className="text-sm text-slate-500 mt-2">
                사용자가 사이트를 방문하면 자동으로 데이터가 수집됩니다.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
