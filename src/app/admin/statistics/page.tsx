'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Eye,
  Users,
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  FileText,
  Bot,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { logger } from '@/lib/logger';

interface AnalyticsStats {
  total_views: number;
  unique_visitors: number;
  desktop_views: number;
  mobile_views: number;
  tablet_views: number;
  bot_views: number;
  hour?: string;
  date?: string;
  year?: number;
  month?: number;
}

interface TopPage {
  path: string;
  views: number;
}

interface ReferrerData {
  referrer: string;
  count: number;
}

interface RealtimeStats {
  today_views: number;
  today_unique: number;
  last_hour_views: number;
  active_sessions: number;
}

interface DeviceStats {
  desktop: number;
  mobile: number;
  tablet: number;
  bot: number;
  total: number;
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
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [referrers, setReferrers] = useState<ReferrerData[]>([]);
  const [realtime, setRealtime] = useState<RealtimeStats | null>(null);
  const [deviceStats, setDeviceStats] = useState<DeviceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
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
  }, [period]);

  const fetchTopPages = async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: 'day', limit: 10 }),
      });
      if (response.ok) {
        const data = await response.json();
        setTopPages(data.topPages || []);
      }
    } catch (error) {
      logger.error('Failed to fetch top pages:', error);
    }
  };

  const fetchReferrers = async () => {
    try {
      const response = await fetch('/api/admin/analytics/referrers');
      if (response.ok) {
        const data = await response.json();
        setReferrers(data.referrers || []);
      }
    } catch {
      // Silently fail if endpoint doesn't exist yet
    }
  };

  const fetchRealtime = async () => {
    try {
      const response = await fetch('/api/admin/analytics/realtime');
      if (response.ok) {
        const data = await response.json();
        setRealtime(data);
      }
    } catch {
      // Silently fail if endpoint doesn't exist yet
    }
  };

  const fetchDeviceStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics/devices?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setDeviceStats(data);
      }
    } catch {
      // Silently fail if endpoint doesn't exist yet
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
    fetchTopPages();
    fetchReferrers();
    fetchRealtime();
    fetchDeviceStats();
  }, [fetchAnalytics, fetchDeviceStats]);

  // Auto-refresh realtime stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRealtime();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAnalytics(),
      fetchTopPages(),
      fetchReferrers(),
      fetchRealtime(),
      fetchDeviceStats(),
    ]);
    setRefreshing(false);
  };

  // Calculate device percentages
  const getDevicePercentage = (count: number) => {
    const total = deviceStats?.total || 0;
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  // Get max views for chart scaling
  const getMaxViews = () => {
    if (!analytics?.data || analytics.data.length === 0) return 1;
    return Math.max(...analytics.data.map((d) => d.total_views), 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-1">사이트 통계</h1>
          <p className="text-slate-600 text-sm">방문자 통계 및 페이지 뷰 분석</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {/* Realtime Stats */}
      {realtime && (
        <div className="bg-gradient-to-r from-[#0f3460] to-[#1a4a7a] rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5" />
            <h2 className="text-lg font-semibold">실시간 통계</h2>
            <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded">30초마다 갱신</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-white/70 text-sm">오늘 페이지뷰</p>
              <p className="text-2xl font-bold">{realtime.today_views.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">오늘 방문자</p>
              <p className="text-2xl font-bold">{realtime.today_unique.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">최근 1시간</p>
              <p className="text-2xl font-bold">{realtime.last_hour_views.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">활성 세션</p>
              <p className="text-2xl font-bold">{realtime.active_sessions.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Period Tabs */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex gap-2">
          {[
            { key: 'hour', label: '시간별' },
            { key: 'day', label: '일별' },
            { key: 'month', label: '월별' },
            { key: 'year', label: '연별' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key as Period)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === tab.key ? 'bg-[#0f3460] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-600">데이터를 불러오는 중...</div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">총 페이지 뷰</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {analytics?.summary.totalViews.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-2.5">
                  <Eye className="w-5 h-5 text-[#0f3460]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">고유 방문자</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {analytics?.summary.totalUniqueVisitors.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-2.5">
                  <Users className="w-5 h-5 text-[#0f3460]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">일평균 뷰</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {analytics?.summary.avgViewsPerDay.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-2.5">
                  <TrendingUp className="w-5 h-5 text-[#0f3460]" />
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Device Stats */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                <h2 className="text-lg font-semibold text-slate-900">기기별 통계</h2>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-blue-50 p-2.5">
                      <Monitor className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">데스크톱</span>
                        <span className="text-sm text-slate-600">
                          {(deviceStats?.desktop || 0).toLocaleString()} (
                          {getDevicePercentage(deviceStats?.desktop || 0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${getDevicePercentage(deviceStats?.desktop || 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-green-50 p-2.5">
                      <Smartphone className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">모바일</span>
                        <span className="text-sm text-slate-600">
                          {(deviceStats?.mobile || 0).toLocaleString()} (
                          {getDevicePercentage(deviceStats?.mobile || 0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${getDevicePercentage(deviceStats?.mobile || 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-purple-50 p-2.5">
                      <Tablet className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">태블릿</span>
                        <span className="text-sm text-slate-600">
                          {(deviceStats?.tablet || 0).toLocaleString()} (
                          {getDevicePercentage(deviceStats?.tablet || 0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${getDevicePercentage(deviceStats?.tablet || 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-orange-50 p-2.5">
                      <Bot className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">봇/크롤러</span>
                        <span className="text-sm text-slate-600">
                          {(deviceStats?.bot || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  인기 페이지 TOP 10
                </h2>
              </div>
              <div className="p-5">
                {topPages.length > 0 ? (
                  <div className="space-y-3">
                    {topPages.map((page, index) => (
                      <div key={page.path} className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index < 3 ? 'bg-[#0f3460] text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900 truncate" title={page.path}>
                            {page.path === '/' ? '홈페이지' : page.path}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {page.views.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">아직 데이터가 없습니다</p>
                )}
              </div>
            </div>
          </div>

          {/* Referrers */}
          {referrers.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  유입 경로
                </h2>
              </div>
              <div className="p-5">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {referrers.slice(0, 9).map((ref) => (
                    <div
                      key={ref.referrer}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <span className="text-sm text-slate-700 truncate flex-1" title={ref.referrer}>
                        {ref.referrer || '직접 접속'}
                      </span>
                      <span className="text-sm font-medium text-slate-900 ml-2">
                        {ref.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Daily Chart */}
          {analytics?.data && analytics.data.length > 0 && period === 'day' && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  일별 트래픽 추이
                </h2>
              </div>
              <div className="p-5">
                <div className="flex items-end gap-1 h-40">
                  {analytics.data
                    .slice(0, 30)
                    .reverse()
                    .map((day, index) => {
                      const height = Math.max((day.total_views / getMaxViews()) * 100, 5);
                      return (
                        <div
                          key={day.date || index}
                          className="flex-1 group relative"
                          title={`${day.date}: ${day.total_views} views`}
                        >
                          <div
                            className="bg-[#0f3460] rounded-t hover:bg-[#1a4a7a] transition-colors cursor-pointer"
                            style={{ height: `${height}%` }}
                          />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                            {day.date &&
                              new Date(day.date).toLocaleDateString('ko-KR', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            <br />
                            {day.total_views.toLocaleString()} 뷰
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>30일 전</span>
                  <span>오늘</span>
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          {analytics?.data && analytics.data.length > 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                <h2 className="text-lg font-semibold text-slate-900">
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
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                        기간
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        총 뷰
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        고유 방문자
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        데스크톱
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        모바일
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                        태블릿
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {analytics.data.slice(0, 20).map((row, index) => (
                      <tr
                        key={row.hour || row.date || `${row.year}-${row.month}` || index}
                        className="hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-900">
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
                        <td className="whitespace-nowrap px-5 py-3 text-right text-sm font-medium text-slate-900">
                          {row.total_views.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right text-sm text-slate-700">
                          {row.unique_visitors.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right text-sm text-slate-600">
                          {row.desktop_views.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right text-sm text-slate-600">
                          {row.mobile_views.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right text-sm text-slate-600">
                          {row.tablet_views.toLocaleString()}
                        </td>
                      </tr>
                    ))}
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
