"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import MypageLayoutWrapper from "@/components/mypage/MypageLayoutWrapper";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { confirmOrder, requestRevision, cancelOrder } from "@/lib/supabase/mutations/orders";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";
import { logger } from "@/lib/logger";
import type { Order, Service, User, Seller, Deliverable } from "@/types/common";
import toast from "react-hot-toast";

import {
  FaArrowLeft,
  FaComment,
  FaRedo,
  FaCheck,
  FaStar,
  FaInfoCircle,
  FaUser,
  FaBan,
  FaHeadset,
  FaTimes,
  FaExclamationTriangle,
  FaCloudUploadAlt,
  FaFileAlt,
  FaDownload,
  FaUserCircle,
  FaImage,
} from "react-icons/fa";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface OrderDetail extends Order {
  order_number?: string;
  title?: string;
  package_type?: string;
  delivery_date?: string | null;
  delivered_at?: string | null;
  revision_count?: number;
  remaining_revisions?: number;
  requirements?: string;
  buyer_note?: string;
  seller_message?: string;
  service?: Service;
  seller?: Seller;
  buyer?: User;
}

interface StatusHistory {
  status: string;
  date: string;
  actor: string;
}

export default function BuyerOrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [revisionDetails, setRevisionDetails] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrder();
    }
  }, [user, id]);

  async function loadOrder() {
    try {
      setLoading(true);
      setError(null);

      // API를 통해 주문 조회
      const response = await fetch(`/api/orders/${id}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "주문을 찾을 수 없습니다");
      }

      const { order } = await response.json();
      setOrder(order);
    } catch (err: unknown) {
      logger.error("주문 조회 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "주문 정보를 불러오는데 실패했습니다",
      );
    } finally {
      setLoading(false);
    }
  }

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await confirmOrder(id);
      setShowConfirmModal(false);
      await loadOrder(); // Reload to get updated status
      toast.success("구매가 확정되었습니다");
    } catch (err: unknown) {
      logger.error("구매 확정 실패:", err);
      toast.error("구매 확정에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevisionRequest = async () => {
    if (!revisionDetails.trim()) {
      toast.error("수정 요청 사항을 입력해주세요");
      return;
    }

    try {
      setSubmitting(true);
      await requestRevision(id, revisionDetails);
      setShowRevisionModal(false);
      setRevisionDetails("");
      await loadOrder(); // Reload to get updated status
      toast.success("수정 요청이 전송되었습니다");
    } catch (err: unknown) {
      logger.error("수정 요청 실패:", err);
      toast.error("수정 요청에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("취소 사유를 입력해주세요");
      return;
    }

    try {
      setSubmitting(true);
      await cancelOrder(id, cancelReason);
      setShowCancelModal(false);
      setCancelReason("");
      await loadOrder(); // Reload to get updated status
      toast.success("주문이 취소되었습니다");
    } catch (err: unknown) {
      logger.error("주문 취소 실패:", err);
      toast.error("주문 취소에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      setCreatingChat(true);
      const response = await fetch("/api/chat/rooms/create-from-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "채팅방 생성에 실패했습니다");
      }

      const data = await response.json();
      globalThis.location.href = `/chat/${data.room.id}`;
    } catch (err: unknown) {
      logger.error("채팅방 생성 실패:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "채팅방 생성 중 오류가 발생했습니다",
      );
    } finally {
      setCreatingChat(false);
    }
  };

  if (loading) {
    return (
      <MypageLayoutWrapper mode="buyer">
        <div className="py-8 px-4">
          <LoadingSpinner message="주문 정보를 불러오는 중..." />
        </div>
      </MypageLayoutWrapper>
    );
  }

  if (error || !order) {
    return (
      <MypageLayoutWrapper mode="buyer">
        <div className="py-8 px-4">
          <ErrorState
            message={error || "주문을 찾을 수 없습니다"}
            retry={loadOrder}
          />
        </div>
      </MypageLayoutWrapper>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "결제완료";
      case "in_progress":
        return "진행중";
      case "delivered":
        return "도착 확인 대기";
      case "completed":
        return "완료";
      case "cancelled":
        return "취소/환불";
      case "refunded":
        return "환불완료";
      default:
        return status;
    }
  };

  const statusHistory: StatusHistory[] = [
    {
      status: "주문 접수",
      date: new Date(order.created_at).toLocaleString("ko-KR"),
      actor: "시스템",
    },
    order.paid_at
      ? {
          status: "결제 완료",
          date: new Date(order.paid_at).toLocaleString("ko-KR"),
          actor: "구매자",
        }
      : null,
    order.started_at
      ? {
          status: "작업 시작",
          date: new Date(order.started_at).toLocaleString("ko-KR"),
          actor: "판매자",
        }
      : null,
    order.delivered_at
      ? {
          status: "작업 완료",
          date: new Date(order.delivered_at).toLocaleString("ko-KR"),
          actor: "판매자",
        }
      : null,
    order.completed_at
      ? {
          status: "구매 확정",
          date: new Date(order.completed_at).toLocaleString("ko-KR"),
          actor: "구매자",
        }
      : null,
  ].filter((item): item is StatusHistory => item !== null);

  return (
    <MypageLayoutWrapper mode="buyer">
      <div className="py-8 px-4">
        {/* 상단 네비게이션 */}
        <div className="mb-6">
          <Link
            href="/mypage/buyer/orders"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <FaArrowLeft />
            <span>주문 목록으로</span>
          </Link>
        </div>

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                주문 상세
              </h1>
              <p className="text-gray-600">
                주문 번호: #{order.order_number || id}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateChat}
                disabled={creatingChat}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                <FaComment className="mr-2" />
                {creatingChat ? "로딩 중..." : "메시지"}
              </button>
              {order.status === "delivered" && (
                <>
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                  >
                    <FaRedo className="mr-2" />
                    수정 요청
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <FaCheck className="mr-2" />
                    구매 확정
                  </button>
                </>
              )}
              {order.status === "completed" && (
                <Link
                  href={`/mypage/buyer/reviews?order=${id}`}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <FaStar className="mr-2" />
                  리뷰 작성
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 주요 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 주문 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                주문 정보
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {order.service?.thumbnail_url ? (
                      <img
                        src={order.service.thumbnail_url}
                        alt={order.title || order.service.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FaImage className="text-gray-400 text-3xl" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {order.title || order.service?.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">패키지:</span>
                        <span className="ml-2 font-medium">
                          {order.package_type || "standard"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">수정 횟수:</span>
                        <span className="ml-2 font-medium">
                          {order.revision_count || 0}회
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">남은 수정:</span>
                        <span className="ml-2 font-medium text-blue-600">
                          {order.remaining_revisions || 0}회
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">예상 완료일:</span>
                        <span className="ml-2 font-medium">
                          {order.delivery_date
                            ? new Date(order.delivery_date).toLocaleDateString(
                                "ko-KR",
                              )
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 내 요구사항 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                내 요구사항
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {order.requirements || "요구사항이 없습니다"}
                </p>
              </div>
              {order.buyer_note && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-blue-600 mt-1" />
                    <div>
                      <div className="font-medium text-blue-900 mb-1">
                        추가 메모
                      </div>
                      <p className="text-blue-700">{order.buyer_note}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 납품 파일 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                납품 파일
                {order.deliverables && order.deliverables.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({order.deliverables.length}개)
                  </span>
                )}
              </h2>

              {order.seller_message && (
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <FaUserCircle className="text-green-600 mt-1" />
                    <div>
                      <div className="font-medium text-green-900 mb-1">
                        판매자 메시지
                      </div>
                      <p className="text-green-700">{order.seller_message}</p>
                    </div>
                  </div>
                </div>
              )}

              {order.deliverables && order.deliverables.length > 0 ? (
                <div className="space-y-3">
                  {order.deliverables.map(
                    (file: Deliverable, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FaFileAlt className="text-blue-500 text-2xl" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {file.file_name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {file.file_size
                                ? (file.file_size / 1024 / 1024).toFixed(2)
                                : "0.00"}
                              MB •
                              {file.uploaded_at
                                ? new Date(file.uploaded_at).toLocaleString(
                                    "ko-KR",
                                  )
                                : ""}
                            </div>
                          </div>
                        </div>
                        <a
                          href={file.file_url || "#"}
                          download
                          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors"
                        >
                          <FaDownload className="mr-2" />
                          다운로드
                        </a>
                      </div>
                    ),
                  )}

                  {order.status === "delivered" && (
                    <button className="w-full px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium">
                      <FaDownload className="mr-2" />
                      전체 다운로드
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  아직 납품한 파일이 없습니다
                </div>
              )}
            </div>

            {/* 상태 이력 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                진행 상태
              </h2>
              <div className="space-y-3">
                {statusHistory.map((history, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0"
                  >
                    <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-white text-sm" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {history.status}
                      </div>
                      <div className="text-sm text-gray-600">
                        {history.date} • {history.actor}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 사이드바 */}
          <div className="space-y-6">
            {/* 현재 상태 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">현재 상태</h3>
              <div className="flex items-center justify-center py-4">
                <span
                  className={`px-6 py-3 rounded-lg font-bold text-lg ${
                    order.status === "delivered"
                      ? "bg-red-100 text-red-700"
                      : order.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
              {order.status === "delivered" && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800 text-center">
                    <FaExclamationTriangle className="mr-2" />
                    구매 확정을 해주세요
                  </p>
                </div>
              )}
            </div>

            {/* 판매자 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">판매자 정보</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold">
                  {order.seller?.name?.[0] || "S"}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {order.seller?.name || "판매자"}
                  </div>
                  <div className="text-sm text-gray-600">판매자</div>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleCreateChat}
                  disabled={creatingChat}
                  className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium disabled:opacity-50"
                >
                  <FaComment className="mr-2" />
                  {creatingChat ? "로딩 중..." : "메시지 보내기"}
                </button>
                <Link
                  href={`/seller/${order.seller_id}`}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center block"
                >
                  <FaUser className="mr-2" />
                  프로필 보기
                </Link>
              </div>
            </div>

            {/* 결제 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">결제 정보</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">주문 금액</span>
                  <span className="font-medium">
                    {order.total_amount?.toLocaleString() || "0"}원
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="font-bold text-gray-900">결제 금액</span>
                  <span className="font-bold text-brand-primary text-lg">
                    {order.total_amount?.toLocaleString() || "0"}원
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 text-sm text-gray-600">
                  <div>
                    주문일: {new Date(order.created_at).toLocaleString("ko-KR")}
                  </div>
                  {order.paid_at && (
                    <div>
                      결제일: {new Date(order.paid_at).toLocaleString("ko-KR")}
                    </div>
                  )}
                  {order.delivered_at && (
                    <div>
                      납품일:{" "}
                      {new Date(order.delivered_at).toLocaleString("ko-KR")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 빠른 액션 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">빠른 액션</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <FaBan className="mr-2" />
                  취소 요청
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  <FaHeadset className="mr-2" />
                  고객센터 문의
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 구매 확정 모달 */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">구매 확정</h2>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <FaExclamationTriangle className="text-yellow-600 mt-1" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">구매 확정 전 확인사항</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>납품된 파일을 모두 확인하셨나요?</li>
                        <li>요구사항이 충족되었나요?</li>
                        <li>수정이 필요한 부분은 없나요?</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">
                  구매 확정 시 판매자에게 대금이 정산되며, 이후에는 수정 요청이
                  불가능합니다.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  {submitting ? "처리 중..." : "확정하기"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 취소 요청 모달 */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">주문 취소 요청</h2>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FaBan className="text-red-600 mt-1" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium mb-1">취소 요청 안내</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>취소 요청 시 판매자에게 알림이 전송됩니다</li>
                        <li>판매자 동의 후 취소가 확정됩니다</li>
                        <li>결제가 완료된 경우 환불 절차가 진행됩니다</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    취소 사유 *
                  </label>
                  <textarea
                    rows={4}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="주문을 취소하려는 사유를 구체적으로 작성해주세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                  >
                    닫기
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {submitting ? "처리중..." : "취소 요청"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 수정 요청 모달 */}
        {showRevisionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">수정 요청</h2>
                <button
                  onClick={() => setShowRevisionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-900 mb-2">
                    <FaInfoCircle />
                    <span className="font-medium">
                      남은 수정 횟수: {order.remaining_revisions || 0}회
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    수정 요청 시 판매자에게 알림이 전송됩니다.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수정 요청 사항 *
                  </label>
                  <textarea
                    rows={6}
                    value={revisionDetails}
                    onChange={(e) => setRevisionDetails(e.target.value)}
                    placeholder="수정이 필요한 부분을 구체적으로 작성해주세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    참고 파일 첨부 (선택)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-primary transition-colors cursor-pointer">
                    <FaCloudUploadAlt className="text-gray-400 text-3xl mb-2" />
                    <p className="text-gray-600 text-sm">클릭하여 파일 선택</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowRevisionModal(false)}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleRevisionRequest}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {submitting ? (
                      "전송 중..."
                    ) : (
                      <>
                        <FaRedo className="mr-2" />
                        수정 요청하기
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
