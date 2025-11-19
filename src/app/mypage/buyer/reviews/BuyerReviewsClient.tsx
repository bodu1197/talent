"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MypageLayoutWrapper from "@/components/mypage/MypageLayoutWrapper";
import { createReview } from "@/lib/supabase/mutations/reviews";
import { logger } from "@/lib/logger";
import { Order } from "@/types/common";
import {
  FaStar,
  FaImage,
  FaReply,
  FaInfoCircle,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import toast from "react-hot-toast";

interface BuyerReviewsClientProps {
  initialPendingReviews: Partial<Order>[];
  initialWrittenReviews: Partial<Order>[];
  userId: string;
}

export default function BuyerReviewsClient({
  initialPendingReviews,
  initialWrittenReviews,
  userId,
}: BuyerReviewsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "pending";
  const [activeTab, setActiveTab] = useState<"pending" | "written">(
    tabFromUrl as "pending" | "written",
  );
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Partial<Order> | null>(
    null,
  );
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [pendingReviews, _setPendingReviews] = useState(initialPendingReviews);
  const [writtenReviews, _setWrittenReviews] = useState(initialWrittenReviews);

  useEffect(() => {
    setActiveTab(tabFromUrl as "pending" | "written");
  }, [tabFromUrl]);

  function refreshData() {
    router.refresh();
  }

  const handleSubmitReview = async () => {
    if (!reviewContent.trim()) {
      toast.error("리뷰 내용을 입력해주세요");
      return;
    }

    if (
      !selectedOrder?.id ||
      !selectedOrder?.service_id ||
      !selectedOrder?.seller_id
    ) {
      toast.error("주문 정보가 올바르지 않습니다");
      return;
    }

    try {
      setSubmitting(true);
      await createReview({
        orderId: selectedOrder.id,
        serviceId: selectedOrder.service_id,
        sellerId: selectedOrder.seller_id,
        buyerId: userId,
        rating,
        content: reviewContent,
      });

      setShowWriteModal(false);
      setSelectedOrder(null);
      setRating(5);
      setReviewContent("");
      refreshData();
      toast.error("리뷰가 등록되었습니다");
    } catch (err: unknown) {
      logger.error("리뷰 등록 실패:", err);
      toast.error("리뷰 등록에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MypageLayoutWrapper mode="buyer">
      <div className="py-8 px-4">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">리뷰 관리</h1>
          <p className="text-gray-600 mt-1 text-sm">
            서비스 리뷰를 작성하고 관리하세요
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "pending"
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              작성 가능
              {pendingReviews.length > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === "pending"
                      ? "bg-brand-primary text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {pendingReviews.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("written")}
              className={`flex-1 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "written"
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              작성한 리뷰
              {writtenReviews.length > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === "written"
                      ? "bg-brand-primary text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {writtenReviews.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 작성 가능 탭 */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {pendingReviews.length > 0 ? (
              pendingReviews.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      {order.service?.thumbnail_url ? (
                        <img
                          src={order.service.thumbnail_url}
                          alt={order.title || order.service.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FaImage className="text-gray-400 text-2xl" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {order.title || order.service?.title}
                          </h3>
                          <div className="text-sm text-gray-600">
                            판매자: {order.seller?.name} • 주문번호 #
                            {order.order_number ||
                              order.id?.slice(0, 8) ||
                              "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-sm text-gray-600">
                          완료일:{" "}
                          {order.completed_at
                            ? new Date(order.completed_at).toLocaleDateString(
                                "ko-KR",
                              )
                            : "-"}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {order.total_amount?.toLocaleString() || "0"}원
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowWriteModal(true);
                        }}
                        className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-sm font-medium"
                      >
                        <FaStar className="mr-2" />
                        리뷰 작성
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <FaStar className="text-gray-300 text-5xl mb-4" />
                <p className="text-gray-600 text-lg">
                  작성 가능한 리뷰가 없습니다
                </p>
              </div>
            )}
          </div>
        )}

        {/* 작성한 리뷰 탭 */}
        {activeTab === "written" && (
          <div className="space-y-4">
            {writtenReviews.length > 0 ? (
              writtenReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex gap-4 mb-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      {review.service?.thumbnail_url ? (
                        <img
                          src={review.service.thumbnail_url}
                          alt={review.service.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FaImage className="text-gray-400 text-2xl" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {review.service?.title}
                          </h3>
                          <div className="text-sm text-gray-600">
                            판매자: {review.seller?.name} • 주문번호 #
                            {review.order?.order_number ||
                              review.order_id?.slice(0, 8)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={`${star <= (review.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        작성일:{" "}
                        {review.created_at
                          ? new Date(review.created_at).toLocaleDateString(
                              "ko-KR",
                            )
                          : "-"}
                      </div>

                      <p className="text-gray-700 mb-4">
                        {review.comment || ""}
                      </p>

                      {review.seller_reply && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FaReply className="text-brand-primary" />
                            <span className="text-sm font-medium text-gray-900">
                              판매자 답변
                            </span>
                          </div>
                          <p className="text-gray-700">{review.seller_reply}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <FaInfoCircle className="mr-2" />
                      작성된 리뷰는 수정 및 삭제가 불가능합니다
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <FaStar className="text-gray-300 text-5xl mb-4" />
                <p className="text-gray-600 text-lg">작성한 리뷰가 없습니다</p>
              </div>
            )}
          </div>
        )}

        {/* 리뷰 작성 모달 */}
        {showWriteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">리뷰 작성</h2>
                <button
                  onClick={() => setShowWriteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    평점 *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-colors"
                      >
                        <FaStar
                          className={`text-3xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-gray-600">{rating}점</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    리뷰 내용 *
                  </label>
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    rows={6}
                    placeholder="서비스 이용 후기를 작성해주세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  ></textarea>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-blue-600 mt-1" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">리뷰 작성 안내</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          서비스 품질, 판매자 응대, 납품 속도 등을 평가해주세요
                        </li>
                        <li>
                          구체적이고 솔직한 후기가 다른 구매자에게 도움이 됩니다
                        </li>
                        <li>비속어나 욕설은 사용하지 말아주세요</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowWriteModal(false);
                      setRating(5);
                      setReviewContent("");
                    }}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:opacity-50"
                  >
                    {submitting ? (
                      "등록 중..."
                    ) : (
                      <>
                        <FaCheck className="mr-2" />
                        리뷰 등록
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MypageLayoutWrapper>
  );
}
