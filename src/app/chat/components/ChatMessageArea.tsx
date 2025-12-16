'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Paperclip, X, Download, DollarSign } from 'lucide-react';
import ProfileImage from '@/components/common/ProfileImage';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';
import PaymentRequestCard, { type PaymentRequest } from '@/components/chat/PaymentRequestCard';
import PaymentRequestModal from '@/components/chat/PaymentRequestModal';
import { createChatTimeline } from '@/lib/chat/timeline';

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
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤 (채팅 컨테이너 내부만)
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // 약간의 딜레이 후 스크롤 (렌더링 완료 대기)
    setTimeout(scrollToBottom, 100);
  }, [messages, paymentRequests]);

  // 결제 요청 목록 로드
  const loadPaymentRequests = async () => {
    if (!selectedRoom) return;

    try {
      logger.debug('[PaymentRequests] Loading for room', { roomId: selectedRoom.id });
      const response = await fetch(`/api/payment-requests?room_id=${selectedRoom.id}`);
      if (response.ok) {
        const data = await response.json();
        logger.debug('[PaymentRequests] Loaded', { count: data.payment_requests?.length || 0 });
        setPaymentRequests(data.payment_requests || []);
      } else {
        logger.error('[PaymentRequests] Load failed:', response.status);
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
          logger.debug('[PaymentRequests] Realtime event', { eventType: payload.eventType });
          loadPaymentRequests();
        }
      )
      .subscribe((status) => {
        logger.debug('[PaymentRequests] Subscription status', { status });
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
  const getTimeline = () => createChatTimeline(messages, paymentRequests);

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
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
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
