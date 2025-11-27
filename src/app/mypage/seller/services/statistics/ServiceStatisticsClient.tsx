'use client';

import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import Link from 'next/link';
import { ArrowLeft, Eye, Heart, ShoppingCart, Star, DollarSign } from 'lucide-react';

interface Props {
  readonly stats: {
    readonly serviceName: string;
    readonly period: string;
    readonly viewCount: number;
    readonly favoriteCount: number;
    readonly orderCount: number;
    readonly revenue: number;
    readonly avgRating: number;
    readonly reviewCount: number;
  };
  readonly dailyViews: ReadonlyArray<{ readonly date: string; readonly views: number }>;
  readonly ratingPercentages: readonly number[];
  readonly serviceId?: string;
}

// 안전한 퍼센트 계산 (0으로 나누기 방지)
function safePercent(numerator: number, denominator: number): string {
  if (!denominator || denominator === 0) return '0.0';
  return ((numerator / denominator) * 100).toFixed(1);
}

// 일별 조회수 바 너비 계산
function getBarWidth(views: number, maxViews: number): number {
  if (!maxViews || maxViews === 0) return 0;
  return Math.min((views / maxViews) * 100, 100);
}

export default function ServiceStatisticsClient({
  stats,
  dailyViews,
  ratingPercentages,
  serviceId: _serviceId,
}: Props) {
  // 최대 조회수 계산 (바 차트 비율용)
  const maxViews = Math.max(...dailyViews.map((d) => d.views), 1);

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="w-full max-w-[1200px] pt-2 pb-4 px-4 lg:py-8 lg:px-6 mx-auto">
        {/* 상단 네비게이션 */}
        <div className="mb-4 lg:mb-6">
          <Link
            href="/mypage/seller/services"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm lg:text-base">서비스 관리로</span>
          </Link>
        </div>

        {/* 페이지 헤더 */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-base lg:text-lg font-semibold text-gray-900">서비스 통계</h1>
          <p className="text-gray-600 mt-1 text-sm">
            {stats.serviceName} - {stats.period}
          </p>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-4 lg:mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
            <div className="flex items-center justify-between mb-1 lg:mb-2">
              <span className="text-gray-600 text-xs lg:text-sm">조회수</span>
              <Eye className="text-blue-500 w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <div className="text-xl lg:text-2xl font-semibold text-gray-900">
              {stats.viewCount.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
            <div className="flex items-center justify-between mb-1 lg:mb-2">
              <span className="text-gray-600 text-xs lg:text-sm">찜</span>
              <Heart className="text-red-500 w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <div className="text-xl lg:text-2xl font-semibold text-gray-900">
              {stats.favoriteCount.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
            <div className="flex items-center justify-between mb-1 lg:mb-2">
              <span className="text-gray-600 text-xs lg:text-sm">주문 수</span>
              <ShoppingCart className="text-green-500 w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <div className="text-xl lg:text-2xl font-semibold text-gray-900">
              {stats.orderCount.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
            <div className="flex items-center justify-between mb-1 lg:mb-2">
              <span className="text-gray-600 text-xs lg:text-sm">매출</span>
              <DollarSign className="text-purple-500 w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <div className="text-base lg:text-xl font-semibold text-gray-900">
              {stats.revenue.toLocaleString()}원
            </div>
          </div>
        </div>

        {/* 차트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-8">
          {/* 조회수 추이 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <h2 className="text-sm lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
              일별 조회수 (최근 7일)
            </h2>
            <div className="space-y-2">
              {dailyViews.map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-xs lg:text-sm text-gray-600 w-12">{day.date}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 lg:h-6 overflow-hidden">
                    <div
                      className="bg-brand-primary h-full rounded-full flex items-center justify-end pr-2 min-w-[30px]"
                      style={{ width: `${Math.max(getBarWidth(day.views, maxViews), 15)}%` }}
                    >
                      <span className="text-xs text-white font-medium">{day.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 평점 분포 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <h2 className="text-sm lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
              평점 분포
            </h2>
            <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
              <div className="text-3xl lg:text-4xl font-semibold text-gray-900">
                {stats.avgRating.toFixed(1)}
              </div>
              <div>
                <div className="flex items-center gap-0.5 lg:gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 lg:w-4 lg:h-4 ${star <= Math.floor(stats.avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">{stats.reviewCount}개 리뷰</div>
              </div>
            </div>
            <div className="space-y-1.5 lg:space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const percentage = ratingPercentages[rating - 1] || 0;
                return (
                  <div key={rating} className="flex items-center gap-2 lg:gap-3">
                    <span className="text-xs lg:text-sm text-gray-600 w-8 lg:w-10">{rating}점</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 lg:h-4 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full rounded-full"
                        style={{ width: `${Math.max(percentage, percentage > 0 ? 5 : 0)}%` }}
                      />
                    </div>
                    <span className="text-xs lg:text-sm text-gray-600 w-10 lg:w-12 text-right">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 전환율 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
          <h2 className="text-sm lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">전환율</h2>
          <div className="grid grid-cols-3 gap-2 lg:gap-4">
            <div className="text-center p-2 lg:p-4 bg-gray-50 rounded-lg">
              <div className="text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2">조회 → 찜</div>
              <div className="text-lg lg:text-2xl font-semibold text-gray-900">
                {safePercent(stats.favoriteCount, stats.viewCount)}%
              </div>
            </div>
            <div className="text-center p-2 lg:p-4 bg-gray-50 rounded-lg">
              <div className="text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2">조회 → 주문</div>
              <div className="text-lg lg:text-2xl font-semibold text-gray-900">
                {safePercent(stats.orderCount, stats.viewCount)}%
              </div>
            </div>
            <div className="text-center p-2 lg:p-4 bg-gray-50 rounded-lg">
              <div className="text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2">찜 → 주문</div>
              <div className="text-lg lg:text-2xl font-semibold text-gray-900">
                {safePercent(stats.orderCount, stats.favoriteCount)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
