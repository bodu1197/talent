'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Paperclip,
  X,
  Download,
  DollarSign,
  Loader2,
  Info,
  FileText,
  Clock,
  RotateCw,
  Hourglass,
  Check,
} from 'lucide-react';
import ProfileImage from '@/components/common/ProfileImage';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  sender?: {
    id: string;
    name: string;
    profile_image: string | null;
  };
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
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'paid';
  buyer_response: string | null;
  responded_at: string | null;
  order_id: string | null;
  paid_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

interface ChatRoom {
  id: string;
  service?: Service;
}

interface ChatMessageAreaProps {
  readonly selectedRoom: ChatRoom | null;
  readonly messages: Message[];
  readonly userId: string;
  readonly newMessage: string;
  readonly selectedFile: File | null;
  readonly isLoading: boolean;
  readonly isUploading: boolean;
  readonly isSeller?: boolean;
  readonly onSendMessage: (e: React.FormEvent) => void;
  readonly onMessageChange: (message: string) => void;
  readonly onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onFileClear: () => void;
}

export default function ChatMessageArea({
  selectedRoom,
  messages,
  userId,
  newMessage,
  selectedFile,
  isLoading,
  isUploading,
  isSeller = false,
  onSendMessage,
  onMessageChange,
  onFileSelect,
  onFileClear,
}: ChatMessageAreaProps) {
  const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤 (새 메시지/결제 요청 시)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, paymentRequests]);

  // 결제 요청 목록 로드
  const loadPaymentRequests = async () => {
    if (!selectedRoom) return;

    try {
      console.log('[PaymentRequests] Loading for room:', selectedRoom.id);
      const response = await fetch(`/api/payment-requests?room_id=${selectedRoom.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('[PaymentRequests] Loaded:', data.payment_requests?.length || 0, 'items');
        setPaymentRequests(data.payment_requests || []);
      } else {
        console.error('[PaymentRequests] Load failed:', response.status);
      }
    } catch (error) {
      logger.error('Failed to load payment requests:', error);
    }
  };

  // 초기 로드 및 실시간 구독
  useEffect(() => {
    if (!selectedRoom) {
      setPaymentRequests([]);
      return;
    }

    loadPaymentRequests();

    // 실시간 구독
    const channel = supabase
      .channel(`payment-requests:${selectedRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_requests',
          filter: `room_id=eq.${selectedRoom.id}`,
        },
        (payload) => {
          console.log('[PaymentRequests] Realtime event:', payload.eventType);
          loadPaymentRequests();
        }
      )
      .subscribe((status) => {
        console.log('[PaymentRequests] Subscription status:', status);
      });

    // 폴링 백업 (5초마다) - 실시간이 실패할 경우 대비
    const pollInterval = setInterval(() => {
      loadPaymentRequests();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [selectedRoom?.id]);

  // 메시지와 결제 요청을 시간순으로 정렬한 타임라인 생성
  const getTimeline = () => {
    const timeline: Array<{
      type: 'message' | 'payment';
      data: Message | PaymentRequest;
      timestamp: string;
    }> = [];

    for (const msg of messages) {
      timeline.push({ type: 'message', data: msg, timestamp: msg.created_at });
    }

    for (const req of paymentRequests) {
      timeline.push({ type: 'payment', data: req, timestamp: req.created_at });
    }

    return timeline.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  // Helper function to get submit button text
  const getSubmitButtonText = () => {
    if (isUploading) return '업로드 중...';
    if (isLoading) return '전송 중...';
    return '전송';
  };

  if (!selectedRoom) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mb-4 inline-block" />
          <p className="text-lg">채팅방을 선택해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 채팅방 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        {/* 서비스 정보 */}
        {selectedRoom.service && (
          <div className="flex items-center gap-2">
            {selectedRoom.service.thumbnail_url && (
              <img
                src={selectedRoom.service.thumbnail_url}
                alt={selectedRoom.service.title}
                className="w-12 h-12 object-cover rounded flex-shrink-0"
              />
            )}
            <p className="text-sm text-gray-700 font-medium">{selectedRoom.service.title}</p>
          </div>
        )}
      </div>

      {/* 메시지 및 결제 요청 타임라인 */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
        {getTimeline().map((item) => {
          if (item.type === 'payment') {
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

          const message = item.data as Message;
          const isMine = message.sender_id === userId;
          const sender = message.sender;
          return (
            <div
              key={`msg-${message.id}`}
              className={`flex items-start gap-2 mb-4 ${isMine ? 'flex-row-reverse' : ''}`}
            >
              {!isMine && (
                <ProfileImage
                  src={sender?.profile_image}
                  alt={sender?.name || ''}
                  size={32}
                  className="flex-shrink-0"
                />
              )}

              <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`max-w-md px-4 py-2 rounded-2xl ${
                    isMine
                      ? 'bg-[#d4f4dd] text-gray-900'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  {message.file_url && (
                    <>
                      {message.file_type?.startsWith('image/') ? (
                        // 이미지 파일인 경우
                        <a
                          href={message.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mb-2"
                        >
                          <img
                            src={message.file_url}
                            alt={message.file_name || '이미지'}
                            className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            loading="lazy"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {message.file_name}
                            {message.file_size && ` • ${(message.file_size / 1024).toFixed(1)} KB`}
                          </p>
                        </a>
                      ) : (
                        // 일반 파일인 경우
                        <a
                          href={message.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 mb-2 p-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
                        >
                          <Paperclip className="w-4 h-4 text-blue-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {message.file_name || '첨부파일'}
                            </p>
                            {message.file_size && (
                              <p className="text-xs text-gray-500">
                                {(message.file_size / 1024).toFixed(1)} KB
                              </p>
                            )}
                          </div>
                          <Download className="w-4 h-4 text-gray-400" />
                        </a>
                      )}
                    </>
                  )}
                  {message.message && (
                    <p className="whitespace-pre-wrap break-words">{message.message}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(message.created_at).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </span>
              </div>
            </div>
          );
        })}
        {/* 스크롤 앵커 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="px-6 py-4 bg-white border-t border-gray-200">
        <form onSubmit={onSendMessage} className="space-y-3">
          {/* 선택된 파일 표시 */}
          {selectedFile && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Paperclip className="w-4 h-4 text-blue-500" />
              <span className="flex-1 text-sm truncate">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
              <button
                type="button"
                onClick={onFileClear}
                className="text-red-500 hover:text-red-700"
                aria-label="첨부파일 삭제"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="relative">
            <textarea
              value={newMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage(e);
                }
              }}
              placeholder="메시지를 입력하세요. (Enter: 줄바꿈 / Ctrl+Enter: 전송)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              disabled={isLoading || isUploading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                자주 쓰는 문구
              </button>
              {isSeller && (
                <button
                  type="button"
                  onClick={() => setShowPaymentRequestModal(true)}
                  className="px-4 py-2 text-sm text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  결제 요청
                </button>
              )}
              <input
                type="file"
                id="file-input"
                className="hidden"
                onChange={onFileSelect}
                disabled={isLoading || isUploading}
              />
              <label
                htmlFor="file-input"
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer inline-flex items-center gap-2"
              >
                <Paperclip className="w-4 h-4" />
                파일 첨부
              </label>
            </div>

            <button
              type="submit"
              disabled={(!newMessage.trim() && !selectedFile) || isLoading || isUploading}
              className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#0a2540] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {getSubmitButtonText()}
            </button>
          </div>
        </form>
      </div>

      {/* 결제 요청 모달 */}
      {showPaymentRequestModal && selectedRoom && (
        <PaymentRequestModal
          roomId={selectedRoom.id}
          service={selectedRoom.service || null}
          onClose={() => setShowPaymentRequestModal(false)}
          onSuccess={() => {
            loadPaymentRequests();
            setShowPaymentRequestModal(false);
          }}
        />
      )}
    </>
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
  const isPending = paymentRequest.status === 'pending' && !isExpired;
  const canRespond = !isSeller && isPending;

  const handleResponse = async (action: 'accept' | 'reject', reason?: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/payment-requests/${paymentRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          buyer_response: reason,
        }),
      });

      if (response.ok) {
        if (action === 'accept') {
          globalThis.location.href = `/payment/${paymentRequest.id}`;
        } else {
          toast.error('결제 요청을 거부했습니다');
          onUpdate();
        }
      } else {
        const error = await response.json();
        toast.error(`처리 실패: ${error.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      logger.error('Response error:', error);
      toast.error('처리 중 오류가 발생했습니다');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    if (isExpired && paymentRequest.status === 'pending') {
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
          만료됨
        </span>
      );
    }

    switch (paymentRequest.status) {
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            대기 중
          </span>
        );
      case 'accepted':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            수락됨
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            거부됨
          </span>
        );
      case 'paid':
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
    <div className="flex justify-center mb-4">
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 max-w-md w-full shadow-sm">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">결제 요청</h3>
              <p className="text-xs text-gray-500">
                {new Date(paymentRequest.created_at).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* 내용 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-lg text-gray-900 mb-2">{paymentRequest.title}</h4>

          {paymentRequest.description && (
            <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">
              {paymentRequest.description}
            </p>
          )}

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-semibold text-green-600">
              {paymentRequest.amount.toLocaleString()}원
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>작업 기간: {paymentRequest.delivery_days}일</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <RotateCw className="w-4 h-4 text-gray-400" />
              <span>수정: {paymentRequest.revision_count}회</span>
            </div>
          </div>

          {isPending && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <Hourglass className="w-3 h-3 mr-1 inline" />
                {new Date(paymentRequest.expires_at).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
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
                const reason = prompt('거부 사유를 입력해주세요 (선택사항):');
                if (reason !== null) {
                  handleResponse('reject', reason || undefined);
                }
              }}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              거부
            </button>
            <button
              onClick={() => handleResponse('accept')}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2 inline" />
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
              <Info className="w-3 h-3 mr-1 inline" />
              구매자의 응답을 기다리고 있습니다
            </p>
          </div>
        )}

        {/* 거부 사유 표시 */}
        {paymentRequest.status === 'rejected' && paymentRequest.buyer_response && (
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <p className="text-xs font-medium text-red-900 mb-1">거부 사유:</p>
            <p className="text-xs text-red-700">{paymentRequest.buyer_response}</p>
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
  onSuccess,
}: Readonly<{
  roomId: string;
  service: Service | null;
  onClose: () => void;
  onSuccess: () => void;
}>) {
  const [formData, setFormData] = useState({
    title: service?.title || '',
    amount: '',
    description: '',
    deliveryDays: '7',
    revisionCount: '2',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || Number.parseInt(formData.amount) < 1000) {
      toast.error('최소 결제 금액은 1,000원입니다');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/payment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        toast.success('결제 요청을 전송했습니다');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(`결제 요청 실패: ${error.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      logger.error('Payment request error:', error);
      toast.error('결제 요청 중 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">결제 요청</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="payment-title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              id="payment-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="작업 제목"
              required
            />
          </div>

          <div>
            <label
              htmlFor="payment-amount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              결제 금액 (원) *
            </label>
            <input
              id="payment-amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="10000"
              min="1000"
              step="1000"
              required
            />
            <p className="text-xs text-gray-500 mt-1">최소 1,000원</p>
          </div>

          <div>
            <label
              htmlFor="payment-description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              작업 설명
            </label>
            <textarea
              id="payment-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              rows={3}
              placeholder="작업 내용 및 요구사항"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="delivery-days"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                작업 기간 (일)
              </label>
              <input
                id="delivery-days"
                type="number"
                value={formData.deliveryDays}
                onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                min="1"
                max="365"
              />
            </div>

            <div>
              <label
                htmlFor="revision-count"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                수정 횟수
              </label>
              <input
                id="revision-count"
                type="number"
                value={formData.revisionCount}
                onChange={(e) => setFormData({ ...formData, revisionCount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                min="0"
                max="10"
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <Info className="w-4 h-4 mr-2 inline" />
              구매자가 결제 요청을 수락하면 결제 페이지로 이동합니다. 결제 요청은 72시간 후 자동으로
              만료됩니다.
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
                  <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                  전송 중...
                </>
              ) : (
                '결제 요청 전송'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
