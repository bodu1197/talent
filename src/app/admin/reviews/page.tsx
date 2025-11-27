"use client";

import { useState, useEffect } from "react";
import {
  getAdminReviews,
  type ReviewWithRelations,
} from "@/lib/supabase/queries/admin";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { logger } from "@/lib/logger";
import { Star, RefreshCw, Reply } from "lucide-react";

type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadReviews();
  }, [ratingFilter]);

  async function loadReviews() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminReviews({
        rating: ratingFilter === "all" ? undefined : Number.parseInt(ratingFilter),
        searchQuery,
      });
      setReviews(data);
    } catch (err: unknown) {
      logger.error("리뷰 조회 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "리뷰 목록을 불러오는데 실패했습니다",
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredReviews = reviews.filter((review) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const reviewComment = review.comment || "";
      return (
        reviewComment.toLowerCase().includes(query) ||
        review.buyer?.name?.toLowerCase().includes(query) ||
        review.seller?.name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const ratingCounts = {
    all: reviews.length,
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const tabs = [
    { value: "all" as RatingFilter, label: "전체", count: ratingCounts.all },
    {
      value: "5" as RatingFilter,
      label: "⭐️⭐️⭐️⭐️⭐️",
      count: ratingCounts[5],
    },
    {
      value: "4" as RatingFilter,
      label: "⭐️⭐️⭐️⭐️",
      count: ratingCounts[4],
    },
    { value: "3" as RatingFilter, label: "⭐️⭐️⭐️", count: ratingCounts[3] },
    { value: "2" as RatingFilter, label: "⭐️⭐️", count: ratingCounts[2] },
    { value: "1" as RatingFilter, label: "⭐️", count: ratingCounts[1] },
  ];

  if (loading) {
    return <LoadingSpinner message="리뷰 목록을 불러오는 중..." />;
  }

  if (error) {
    return <ErrorState message={error} retry={loadReviews} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">리뷰 관리</h1>
        <p className="text-gray-600 mt-1">전체 리뷰를 관리하세요</p>
      </div>

      {/* 평점 요약 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {avgRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= Math.floor(avgRating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">
              총 {reviews.length}개의 리뷰
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter((r) => r.rating === rating).length;
              const percentage =
                reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-8">{rating}점</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRatingFilter(tab.value)}
              className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                ratingFilter === tab.value
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    ratingFilter === tab.value
                      ? "bg-brand-primary text-white"
                      : "bg-gray-200 text-gray-600"
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
              placeholder="리뷰 내용, 구매자명, 판매자명으로 검색"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setSearchQuery("")}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            초기화
          </button>
        </div>
      </div>

      {/* 결과 카운트 */}
      <div className="text-sm text-gray-600">
        총{' '}
        <span className="font-bold text-gray-900">
          {filteredReviews.length}
        </span>
        {' '}개의 리뷰
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold">
                    {(review.buyer?.name || "구매자")[0]}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {review.buyer?.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString(
                            "ko-KR",
                          )
                        : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= (review.rating ?? 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-1">
                  {review.service?.title} • 판매자: {review.seller?.name}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{review.comment}</p>

              {review.seller_reply && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Reply className="w-4 h-4 text-brand-primary" />
                    <span className="text-sm font-medium text-gray-900">
                      판매자 답변
                    </span>
                    {review.seller_reply_at && (
                      <span className="text-xs text-gray-500">
                        •{" "}
                        {new Date(review.seller_reply_at).toLocaleDateString(
                          "ko-KR",
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{review.seller_reply}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <EmptyState
            icon="fa-star"
            title="리뷰가 없습니다"
            description="검색 조건에 맞는 리뷰가 없습니다"
          />
        )}
      </div>
    </div>
  );
}
