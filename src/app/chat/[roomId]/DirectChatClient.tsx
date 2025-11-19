"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import toast from "react-hot-toast";

import {
  FaArrowLeft,
  FaUser,
  FaComments,
  FaSpinner,
  FaTimes,
  FaInfoCircle,
  FaCheck,
  FaClock,
  FaPaperPlane,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaRedo,
  FaHourglassHalf,
  FaChevronRight,
} from "react-icons/fa";

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender: {
    id: string;
    name: string;
    profile_image: string | null;
  };
}

interface OtherUser {
  id: string;
  name: string;
  profile_image: string | null;
}

interface Service {
  id: string;
  title: string;
  thumbnail_url: string | null;
}

interface PaymentRequest {
  id: string;
  room_id: string;
  seller_id: string;
  buyer_id: string;
  service_id: string | null;
  amount: number;
  title: string;
  description: string | null;
  delivery_days: number;
  revision_count: number;
  status: "pending" | "accepted" | "rejected" | "expired" | "paid";
  buyer_response: string | null;
  responded_at: string | null;
  order_id: string | null;
  paid_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  readonly roomId: string;
  readonly userId: string;
  readonly isSeller: boolean;
  readonly otherUser: OtherUser;
  readonly service: Service | null;
}

export default function DirectChatClient({
  roomId,
  userId,
  isSeller,
  otherUser,
  service,
}: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // 알림음 초기화
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notification.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  // 알림음 재생
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Silently fail if notification sound cannot play
      });
    }
  };

  // 읽지 않은 메시지를 읽음 처리
  const markMessagesAsRead = async () => {
    try {
      await fetch("/api/chat/messages/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ room_id: roomId }),
      });
    } catch (error) {
      console.error(
        "[DirectChatClient] Mark messages as read error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
    }
  };

  // 메시지 목록 로드
  const loadMessages = async () => {
    const response = await fetch(`/api/chat/messages?room_id=${roomId}`);
    if (response.ok) {
      const data = await response.json();
      setMessages(data.messages || []);
      scrollToBottom();
      // 메시지 로드 후 읽음 처리
      await markMessagesAsRead();
    }
  };

  // 결제 요청 목록 로드
  const loadPaymentRequests = async () => {
    const response = await fetch(`/api/payment-requests?room_id=${roomId}`);
    if (response.ok) {
      const data = await response.json();
      setPaymentRequests(data.payment_requests || []);
    }
  };

  // 메시지 전송
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_id: roomId,
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        setNewMessage("");
        scrollToBottom();
      } else {
        const errorData = await response.json();
        console.error("Send message failed:", response.status, errorData);
        toast.error(
          `메시지 전송 실패: ${errorData.error || "알 수 없는 오류"}`,
        );
      }
    } catch (error) {
      console.error(
        "Send message error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
      toast.error("메시지 전송 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    // Clear existing timeout if any
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }

    scrollTimeoutRef.current = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // 메시지와 결제 요청을 시간순으로 정렬한 타임라인 생성
  const getTimeline = () => {
    const timeline: Array<{
      type: "message" | "payment";
      data: Message | PaymentRequest;
      timestamp: string;
    }> = [];

    messages.forEach((msg) => {
      timeline.push({ type: "message", data: msg, timestamp: msg.created_at });
    });

    paymentRequests.forEach((req) => {
      timeline.push({ type: "payment", data: req, timestamp: req.created_at });
    });

    return timeline.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  };

  // 초기 로드
  useEffect(() => {
    loadMessages();
    loadPaymentRequests();
  }, []);

  // 실시간 메시지 및 결제 요청 구독
  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id !== userId) {
            // 알림음 재생
            playNotificationSound();
            await loadMessages();
            // 새 메시지가 오면 즉시 읽음 처리
            await markMessagesAsRead();
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payment_requests",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          loadPaymentRequests();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, userId]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 pt-16">
      {/* 헤더 */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* 뒤로가기 & 상대방 정보 */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="뒤로가기"
              >
                <FaArrowLeft className="text-gray-700" />
              </button>

              <div className="flex items-center gap-3">
                {/* 프로필 이미지 */}
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                  {otherUser.profile_image ? (
                    <Image
                      src={otherUser.profile_image}
                      alt={otherUser.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaUser />
                    </div>
                  )}
                </div>

                <div>
                  <h1 className="font-bold text-lg">{otherUser.name}</h1>
                  {service && (
                    <Link
                      href={`/services/${service.id}`}
                      className="text-sm text-gray-600 hover:text-brand-primary hover:underline"
                    >
                      {service.title}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* 서비스 정보 카드 (상단에 한번만) */}
          {service && (
            <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <Link
                href={`/services/${service.id}`}
                className="flex items-center gap-4 hover:bg-gray-50 transition-colors rounded-lg p-2"
              >
                {service.thumbnail_url && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    <Image
                      src={service.thumbnail_url}
                      alt={service.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 mb-1">문의 상품</p>
                  <p className="font-medium text-gray-900 truncate">
                    {service.title}
                  </p>
                </div>
                <FaChevronRight className="text-gray-400" />
              </Link>
            </div>
          )}

          {/* 메시지 및 결제 요청 타임라인 */}
          <div className="space-y-4">
            {getTimeline().length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FaComments className="text-4xl mb-3 inline-block" />
                <p>아직 메시지가 없습니다</p>
                <p className="text-sm mt-1">첫 메시지를 보내보세요!</p>
              </div>
            ) : (
              getTimeline().map((item) => {
                if (item.type === "message") {
                  const message = item.data as Message;
                  const isMine = message.sender_id === userId;
                  return (
                    <div
                      key={`msg-${message.id}`}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex items-end gap-2 max-w-md">
                        {!isMine && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 relative">
                            {otherUser.profile_image ? (
                              <Image
                                src={otherUser.profile_image}
                                alt={otherUser.name}
                                fill
                                className="object-cover"
                                sizes="32px"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                <FaUser />
                              </div>
                            )}
                          </div>
                        )}

                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isMine
                              ? "bg-brand-primary text-white rounded-br-sm"
                              : "bg-white border border-gray-200 rounded-bl-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.message}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isMine ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {new Date(message.created_at).toLocaleTimeString(
                              "ko-KR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  const paymentRequest = item.data as PaymentRequest;
                  return (
                    <PaymentRequestCard
                      key={`pay-${paymentRequest.id}`}
                      paymentRequest={paymentRequest}
                      userId={userId}
                      isSeller={isSeller}
                      onUpdate={loadPaymentRequests}
                    />
                  );
                }
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* 메시지 입력 */}
      <div className="bg-white border-t shadow-lg">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          {/* 판매자인 경우 결제 요청 버튼 표시 */}
          {isSeller && (
            <div className="mb-3 flex justify-end">
              <button
                onClick={() => setShowPaymentRequestModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <FaMoneyBillWave />
                <span>결제 요청</span>
              </button>
            </div>
          )}

          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !newMessage.trim()}
              className="px-6 py-3 bg-brand-primary text-white rounded-full hover:bg-[#1a4d8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <FaSpinner className="fa-spin" />
              ) : (
                <>
                  <FaPaperPlane />
                  <span className="hidden sm:inline">전송</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 결제 요청 모달 */}
      {showPaymentRequestModal && (
        <PaymentRequestModal
          roomId={roomId}
          service={service}
          onClose={() => setShowPaymentRequestModal(false)}
        />
      )}
    </div>
  );
}

// 결제 요청 카드 컴포넌트
function PaymentRequestCard({
  paymentRequest,
  isSeller,
  onUpdate,
}: Readonly<{
  paymentRequest: PaymentRequest;
  userId: string;
  isSeller: boolean;
  onUpdate: () => void;
}>) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isExpired = new Date(paymentRequest.expires_at) < new Date();
  const isPending = paymentRequest.status === "pending" && !isExpired;
  const canRespond = !isSeller && isPending;

  const handleResponse = async (
    action: "accept" | "reject",
    reason?: string,
  ) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `/api/payment-requests/${paymentRequest.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            buyer_response: reason,
          }),
        },
      );

      if (response.ok) {
        if (action === "accept") {
          // 결제 페이지로 이동
          globalThis.location.href = `/payment/${paymentRequest.id}`;
        } else {
          toast.error("결제 요청을 거부했습니다");
          onUpdate();
        }
      } else {
        const error = await response.json();
        toast.error(`처리 실패: ${error.error || "알 수 없는 오류"}`);
      }
    } catch (error) {
      console.error(
        "Response error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
      toast.error("처리 중 오류가 발생했습니다");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    if (isExpired && paymentRequest.status === "pending") {
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
          만료됨
        </span>
      );
    }

    switch (paymentRequest.status) {
      case "pending":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            대기 중
          </span>
        );
      case "accepted":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            수락됨
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            거부됨
          </span>
        );
      case "paid":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            결제완료
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center">
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 max-w-md w-full shadow-sm">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <FaFileInvoiceDollar className="text-white text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">결제 요청</h3>
              <p className="text-xs text-gray-500">
                {new Date(paymentRequest.created_at).toLocaleDateString(
                  "ko-KR",
                  {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* 내용 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h4 className="font-bold text-lg text-gray-900 mb-2">
            {paymentRequest.title}
          </h4>

          {paymentRequest.description && (
            <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">
              {paymentRequest.description}
            </p>
          )}

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-green-600">
              {paymentRequest.amount.toLocaleString()}원
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <FaClock className="text-gray-400" />
              <span>작업 기간: {paymentRequest.delivery_days}일</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaRedo className="text-gray-400" />
              <span>수정: {paymentRequest.revision_count}회</span>
            </div>
          </div>

          {isPending && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <FaHourglassHalf className="mr-1 inline" />
                {new Date(paymentRequest.expires_at).toLocaleDateString(
                  "ko-KR",
                  {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
                까지 유효
              </p>
            </div>
          )}
        </div>

        {/* 액션 버튼 (구매자만) */}
        {canRespond && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                const reason = prompt("거부 사유를 입력해주세요 (선택사항):");
                if (reason !== null) {
                  handleResponse("reject", reason || undefined);
                }
              }}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              거부
            </button>
            <button
              onClick={() => handleResponse("accept")}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="fa-spin mr-2 inline" />
                  처리 중...
                </>
              ) : (
                <>
                  <FaCheck className="mr-2 inline" />
                  수락 및 결제
                </>
              )}
            </button>
          </div>
        )}

        {/* 판매자 안내 */}
        {isSeller && isPending && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-700">
              <FaInfoCircle className="mr-1 inline" />
              구매자의 응답을 기다리고 있습니다
            </p>
          </div>
        )}

        {/* 거부 사유 표시 */}
        {paymentRequest.status === "rejected" &&
          paymentRequest.buyer_response && (
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-xs font-medium text-red-900 mb-1">
                거부 사유:
              </p>
              <p className="text-xs text-red-700">
                {paymentRequest.buyer_response}
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

// 결제 요청 모달 컴포넌트
function PaymentRequestModal({
  roomId,
  service,
  onClose,
}: Readonly<{
  roomId: string;
  service: Service | null;
  onClose: () => void;
}>) {
  const [formData, setFormData] = useState({
    title: service?.title || "",
    amount: "",
    description: "",
    deliveryDays: "7",
    revisionCount: "2",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || Number.parseInt(formData.amount) < 1000) {
      toast.error("최소 결제 금액은 1,000원입니다");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/payment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: roomId,
          service_id: service?.id,
          title: formData.title,
          amount: Number.parseInt(formData.amount),
          description: formData.description,
          delivery_days: Number.parseInt(formData.deliveryDays),
          revision_count: Number.parseInt(formData.revisionCount),
        }),
      });

      if (response.ok) {
        toast.error("결제 요청을 전송했습니다");
        onClose();
      } else {
        const error = await response.json();
        toast.error(`결제 요청 실패: ${error.error || "알 수 없는 오류"}`);
      }
    } catch (error) {
      console.error(
        "Payment request error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
      toast.error("결제 요청 중 오류가 발생했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">결제 요청</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="작업 제목"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              결제 금액 (원) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="10000"
              min="1000"
              step="1000"
              required
            />
            <p className="text-xs text-gray-500 mt-1">최소 1,000원</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              작업 설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              rows={3}
              placeholder="작업 내용 및 요구사항"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                작업 기간 (일)
              </label>
              <input
                type="number"
                value={formData.deliveryDays}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryDays: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                min="1"
                max="365"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수정 횟수
              </label>
              <input
                type="number"
                value={formData.revisionCount}
                onChange={(e) =>
                  setFormData({ ...formData, revisionCount: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                min="0"
                max="10"
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <FaInfoCircle className="mr-2 inline" />
              구매자가 결제 요청을 수락하면 결제 페이지로 이동합니다. 결제
              요청은 72시간 후 자동으로 만료됩니다.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="fa-spin mr-2 inline" />
                  전송 중...
                </>
              ) : (
                "결제 요청 전송"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
