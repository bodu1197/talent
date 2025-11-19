"use client";

import { useState, useEffect } from "react";
import MypageLayoutWrapper from "@/components/mypage/MypageLayoutWrapper";
import Link from "next/link";
import { updateOrderStatus, cancelOrder } from "@/lib/supabase/mutations/orders";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";
import toast from "react-hot-toast";

import {
  FaArrowLeft,
  FaComment,
  FaUpload,
  FaImage,
  FaFileAlt,
  FaDownload,
  FaInfoCircle,
  FaCheck,
  FaSpinner,
  FaCheckCircle,
  FaBan,
  FaHeadset,
  FaTimes,
  FaCloudUploadAlt,
} from "react-icons/fa";

interface Props {
  orderId: string;
}

interface Deliverable {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  created_at: string;
}

interface ServiceData {
  id: string;
  title: string;
  thumbnail_url: string | null;
}

interface BuyerData {
  id: string;
  name: string;
  profile_image?: string | null;
}

interface OrderData {
  id: string;
  order_number?: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at?: string;
  paid_at?: string;
  started_at?: string;
  delivered_at?: string;
  completed_at?: string;
  title?: string;
  package?: string;
  revision_count?: number;
  delivery_date?: string;
  requirements?: string;
  buyer_note?: string;
  deliverables?: Deliverable[];
  service?: ServiceData;
  buyer?: BuyerData;
  [key: string]: unknown;
}

export default function SellerOrderDetailClient({ orderId }: Props) {
  const _router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  async function loadOrder() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/orders/${orderId}`);

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

  async function handleAcceptOrder() {
    if (
      !confirm("주문을 접수하시겠습니까?\n접수 후 작업을 시작할 수 있습니다.")
    ) {
      return;
    }

    try {
      setSubmitting(true);
      await updateOrderStatus(orderId, "in_progress");
      await loadOrder(); // 주문 정보 새로고침
      toast.success(
        "주문이 접수되었습니다. 구매자에게 작업 시작 알림이 전송되었습니다.",
      );
    } catch (err: unknown) {
      logger.error("주문 접수 실패:", err);
      toast.error(
        "주문 접수에 실패했습니다: " +
          (err instanceof Error ? err.message : "알 수 없는 오류"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelivery() {
    if (!deliveryMessage.trim()) {
      toast.error("전달 메시지를 입력해주세요");
      return;
    }

    try {
      setSubmitting(true);
      await updateOrderStatus(orderId, "delivered");
      setShowDeliveryModal(false);
      await loadOrder(); // 주문 정보 새로고침
      toast.success("납품이 완료되었습니다");
    } catch (err: unknown) {
      logger.error("납품 실패:", err);
      toast.error(
        "납품에 실패했습니다: " +
          (err instanceof Error ? err.message : "알 수 없는 오류"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelOrder() {
    if (!cancelReason.trim()) {
      toast.error("취소 사유를 입력해주세요");
      return;
    }

    try {
      setSubmitting(true);
      await cancelOrder(orderId, cancelReason);
      setShowCancelModal(false);
      setCancelReason("");
      await loadOrder(); // 주문 정보 새로고침
      toast.success("주문이 취소되었습니다");
    } catch (err: unknown) {
      logger.error("주문 취소 실패:", err);
      toast.error(
        "주문 취소에 실패했습니다: " +
          (err instanceof Error ? err.message : "알 수 없는 오류"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "결제완료";
      case "in_progress":
        return "진행중";
      case "delivered":
        return "완료 대기";
      case "completed":
        return "완료";
      case "cancelled":
        return "취소/환불";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-red-100 text-red-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "delivered":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <MypageLayoutWrapper mode="seller">
        <div className="py-8 px-4">
          <LoadingSpinner message="주문 정보를 불러오는 중..." />
        </div>
      </MypageLayoutWrapper>
    );
  }

  if (error || !order) {
    return (
      <MypageLayoutWrapper mode="seller">
        <div className="py-8 px-4">
          <ErrorState
            message={error || "주문을 찾을 수 없습니다"}
            retry={loadOrder}
          />
        </div>
      </MypageLayoutWrapper>
    );
  }

  // Helper: Build status history entry
  function buildStatusEntry(
    status: string,
    timestamp: string | undefined,
    actor: string
  ): { status: string; date: string; actor: string } | null {
    if (!timestamp || typeof timestamp !== "string") return null;

    return {
      status,
      date: new Date(timestamp).toLocaleString("ko-KR"),
      actor,
    };
  }

  // Helper: Build complete status history
  function buildStatusHistory(order: OrderData) {
    const entries = [
      buildStatusEntry("주문 접수", order.created_at, "시스템"),
      buildStatusEntry("결제 완료", order.paid_at, "구매자"),
      buildStatusEntry("작업 시작", order.started_at, "판매자"),
      buildStatusEntry("납품 완료", order.delivered_at, "판매자"),
      buildStatusEntry("구매 확정", order.completed_at, "구매자"),
    ];

    return entries.filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  }

  const statusHistory = buildStatusHistory(order);

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="py-8 px-4">
        {/* 상단 네비게이션 */}
        <div className="mb-6">
          <Link
            href="/mypage/seller/orders"
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
              <h1 className="text-xl font-bold text-gray-900">주문 상세</h1>
              <p className="text-gray-600 mt-1 text-sm">
                주문 번호: #{order.order_number || order.id.slice(0, 8)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/chat?order=${orderId}`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <FaComment className="mr-2 inline" />
                메시지
              </Link>
              {order.status === "in_progress" && (
                <button
                  onClick={() => setShowDeliveryModal(true)}
                  className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium"
                >
                  <FaUpload className="mr-2 inline" />
                  납품하기
                </button>
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
                        alt={order.title || order.service?.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FaImage className="text-gray-400 text-3xl" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {order.title ||
                        order.service?.title ||
                        "서비스 제목 없음"}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">패키지:</span>
                        <span className="ml-2 font-medium">
                          {order.package || "standard"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">수정 횟수:</span>
                        <span className="ml-2 font-medium">
                          {order.revision_count || 0}회
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">예상 완료일:</span>
                        <span className="ml-2 font-medium">
                          {order.delivery_date &&
                          typeof order.delivery_date === "string"
                            ? new Date(order.delivery_date).toLocaleDateString(
                                "ko-KR",
                              )
                            : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">남은 기간:</span>
                        <span className="ml-2 font-medium text-red-600">
                          {order.delivery_date &&
                          typeof order.delivery_date === "string"
                            ? `D-${Math.ceil((new Date(order.delivery_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}일`
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 요구사항 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                구매자 요구사항
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
              </h2>
              {order.deliverables && order.deliverables.length > 0 ? (
                <div className="space-y-3">
                  {order.deliverables.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FaFileAlt className="text-blue-500 text-2xl" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {file.file_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {(file.file_size / 1024 / 1024).toFixed(2)}MB •{" "}
                            {file.created_at &&
                            typeof file.created_at === "string"
                              ? new Date(file.created_at).toLocaleString(
                                  "ko-KR",
                                )
                              : "날짜 정보 없음"}
                          </div>
                        </div>
                      </div>
                      <a
                        href={file.file_url}
                        download
                        className="px-4 py-2 text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FaDownload className="mr-2 inline" />
                        다운로드
                      </a>
                    </div>
                  ))}
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
                상태 이력
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
                  className={`px-6 py-3 rounded-lg font-bold text-lg ${getStatusColor(order.status)}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </div>

            {/* 구매자 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">구매자 정보</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold">
                  {(order.buyer?.name || "구매자")[0] || "U"}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {order.buyer?.name || "구매자"}
                  </div>
                  <div className="text-sm text-gray-600">구매자</div>
                </div>
              </div>
              <Link
                href={`/chat?order=${orderId}`}
                className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium text-center block"
              >
                <FaComment className="mr-2 inline" />
                메시지 보내기
              </Link>
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
                  <span className="font-bold text-gray-900">최종 금액</span>
                  <span className="font-bold text-brand-primary text-lg">
                    {order.total_amount?.toLocaleString() || "0"}원
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 text-sm text-gray-600">
                  <div>
                    주문일: {new Date(order.created_at).toLocaleString("ko-KR")}
                  </div>
                  {order.paid_at && typeof order.paid_at === "string" && (
                    <div>
                      결제일: {new Date(order.paid_at).toLocaleString("ko-KR")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 빠른 액션 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">빠른 액션</h3>
              <div className="space-y-2">
                {/* 결제 완료 상태일 때: 접수 버튼 표시 */}
                {order.status === "paid" && (
                  <button
                    onClick={handleAcceptOrder}
                    disabled={submitting}
                    className="w-full px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="fa-spin mr-2 inline" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="mr-2 inline" />
                        주문 접수하기
                      </>
                    )}
                  </button>
                )}

                {/* 진행 중 상태일 때: 납품 버튼 표시 */}
                {order.status === "in_progress" && (
                  <button
                    onClick={() => setShowDeliveryModal(true)}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-lg"
                  >
                    <FaUpload className="mr-2 inline" />
                    납품하기
                  </button>
                )}

                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <FaBan className="mr-2 inline" />
                  취소 요청
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  <FaHeadset className="mr-2 inline" />
                  고객센터 문의
                </button>
              </div>
            </div>
          </div>
        </div>

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
                        <li>취소 요청 시 구매자에게 알림이 전송됩니다</li>
                        <li>구매자 동의 후 취소가 확정됩니다</li>
                        <li>정당한 사유 없는 취소는 불이익이 있을 수 있습니다</li>
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

        {/* 납품 모달 */}
        {showDeliveryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">납품하기</h2>
                <button
                  onClick={() => setShowDeliveryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    파일 업로드
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-brand-primary transition-colors cursor-pointer">
                    <FaCloudUploadAlt className="text-gray-400 text-4xl mb-3 inline-block" />
                    <p className="text-gray-600">
                      클릭하여 파일 선택 또는 드래그 앤 드롭
                    </p>
                    <p className="text-sm text-gray-500 mt-2">최대 100MB</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전달 메시지
                  </label>
                  <textarea
                    rows={4}
                    value={deliveryMessage}
                    onChange={(e) => setDeliveryMessage(e.target.value)}
                    placeholder="구매자에게 전달할 메시지를 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowDeliveryModal(false)}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleDelivery}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:opacity-50"
                  >
                    {submitting ? "처리중..." : "납품 완료"}
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
