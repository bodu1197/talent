"use client";

import { useState } from "react";
import MypageLayoutWrapper from "@/components/mypage/MypageLayoutWrapper";
import { createReviewReply } from "@/lib/supabase/mutations/reviews";
import EmptyState from "@/components/common/EmptyState";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";
import { Review } from "@/types/common";
import { FaStar, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1";

interface Props {
  readonly reviews: Review[];
}

export default function SellerReviewsClient({
  reviews: initialReviews,
}: Props) {
  const router = useRouter();
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const filteredReviews = initialReviews.filter((review) => {
    if (ratingFilter === "all") return true;
    return review.rating === Number.parseInt(ratingFilter);
  });

  async function handleReplySubmit() {
    if (!replyContent.trim()) {
      toast.error("답변 내용을 입력해주세요");
      return;
    }

    if (!selectedReview) {
      toast.error("선택된 리뷰가 없습니다");
      return;
    }

    try {
      setSubmitting(true);
      await createReviewReply(selectedReview.id, replyContent);
      setShowReplyModal(false);
      setReplyContent("");
      setSelectedReview(null);
      router.refresh();
      toast.success("답변이 등록되었습니다");
    } catch (err: unknown) {
      logger.error("답변 등록 실패:", err);
      toast.error(
        "답변 등록에 실패했습니다: " +
        (err instanceof Error ? err.message : "알 수 없는 오류"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const avgRating =
    initialReviews.length > 0
      ? (
        initialReviews.reduce((sum, r) => sum + r.rating, 0) /
        initialReviews.length
      ).toFixed(1)
      : "0.0";

  const ratingCounts = {
    5: initialReviews.filter((r) => r.rating === 5).length,
    4: initialReviews.filter((r) => r.rating === 4).length,
    3: initialReviews.filter((r) => r.rating === 3).length,
    2: initialReviews.filter((r) => r.rating === 2).length,
    1: initialReviews.filter((r) => r.rating === 1).length,
  };

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="py-8 px-4">
        <div className="mb-8">
          <h1 className="text-base md:text-lg font-bold text-gray-900">받은 리뷰</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            고객들이 남긴 리뷰를 확인하고 답변하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {avgRating}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={
                      Number.parseFloat(avgRating) >= star
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">
                {initialReviews.length}개의 리뷰
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating}점</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-brand-primary h-2 rounded-full"
                      style={{
                        width: `${initialReviews.length > 0 ? (ratingCounts[rating as keyof typeof ratingCounts] / initialReviews.length) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {ratingCounts[rating as keyof typeof ratingCounts]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex gap-2 overflow-x-auto">
                {(["all", "5", "4", "3", "2", "1"] as RatingFilter[]).map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setRatingFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${ratingFilter === filter
                          ? "bg-brand-primary text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {filter === "all" ? "전체" : `${filter}점`}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-4">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-lg border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={
                                  review.rating >= star
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                          </div>
                          <span className="font-bold text-gray-900">
                            {review.rating}.0
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {review.buyer?.name || "구매자"} •{" "}
                          {new Date(review.created_at).toLocaleDateString(
                            "ko-KR",
                          )}
                        </div>
                      </div>
                      {!review.reply && (
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setShowReplyModal(true);
                          }}
                          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm"
                        >
                          답변하기
                        </button>
                      )}
                    </div>

                    <p className="text-gray-900 mb-3">{review.content}</p>

                    {review.reply && (
                      <div className="mt-4 pl-4 border-l-4 border-brand-primary bg-blue-50 p-4 rounded">
                        <div className="text-sm font-medium text-gray-900 mb-2">
                          판매자 답변
                        </div>
                        <p className="text-gray-700">{review.reply}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          {review.replied_at
                            ? new Date(review.replied_at).toLocaleDateString(
                              "ko-KR",
                            )
                            : ""}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <EmptyState
                  icon="fa-star"
                  title="리뷰가 없습니다"
                  description="아직 받은 리뷰가 없습니다"
                />
              )}
            </div>
          </div>
        </div>

        {showReplyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base md:text-lg font-bold text-gray-900">리뷰 답변</h2>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyContent("");
                    setSelectedReview(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              {selectedReview && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={
                          selectedReview.rating >= star
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-gray-900">{selectedReview.content}</p>
                </div>
              )}

              <textarea
                rows={6}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답변 내용을 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent mb-4"
              ></textarea>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyContent("");
                    setSelectedReview(null);
                  }}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleReplySubmit}
                  disabled={submitting || !replyContent.trim()}
                  className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "등록중..." : "답변 등록"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MypageLayoutWrapper>
  );
}
