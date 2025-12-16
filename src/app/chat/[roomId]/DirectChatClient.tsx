'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { createChatTimeline } from '@/lib/chat/timeline';

import {
  ArrowLeft,
  User,
  MessageCircle,
  Loader2,
  Send,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import PaymentRequestCard, { type PaymentRequest } from '@/components/chat/PaymentRequestCard';
import PaymentRequestModal from '@/components/chat/PaymentRequestModal';

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

interface Props {
  readonly roomId: string;
  readonly userId: string;
  readonly isSeller: boolean;
  readonly otherUser: OtherUser;
  readonly service: Service | null;
}

export default function DirectChatClient({ roomId, userId, isSeller, otherUser, service }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // 알림음 초기화
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
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
      await fetch('/api/chat/messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room_id: roomId }),
      });
    } catch (error) {
      logger.error('[DirectChatClient] Mark messages as read error:', error);
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
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: roomId,
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        setNewMessage('');
        scrollToBottom();
      } else {
        const errorData = await response.json();
        logger.error('Send message failed:', response.status, errorData);
        toast.error(`메시지 전송 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      logger.error('Send message error:', error);
      toast.error('메시지 전송 중 오류가 발생했습니다.');
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
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
  const getTimeline = () => createChatTimeline(messages, paymentRequests);

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
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
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
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_requests',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          loadPaymentRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, userId]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 pt-20">
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
                <ArrowLeft className="w-5 h-5 text-gray-700" />
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
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div>
                  <h1 className="font-semibold text-lg">{otherUser.name}</h1>
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
                  <p className="font-medium text-gray-900 truncate">{service.title}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            </div>
          )}

          {/* 메시지 및 결제 요청 타임라인 */}
          <div className="space-y-4">
            {getTimeline().length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="w-10 h-10 mb-3 inline-block" />
                <p>아직 메시지가 없습니다</p>
                <p className="text-sm mt-1">첫 메시지를 보내보세요!</p>
              </div>
            ) : (
              getTimeline().map((item) => {
                if (item.type === 'message') {
                  const message = item.data as Message;
                  const isMine = message.sender_id === userId;
                  return (
                    <div
                      key={`msg-${message.id}`}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
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
                                <User className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        )}

                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isMine
                              ? 'bg-brand-primary text-white rounded-br-sm'
                              : 'bg-white border border-gray-200 rounded-bl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.message}</p>
                          <p
                            className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}
                          >
                            {new Date(message.created_at).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
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
          {/* 전문가인 경우 결제 요청 버튼 표시 */}
          {isSeller && (
            <div className="mb-3 flex justify-end">
              <button
                onClick={() => setShowPaymentRequestModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <DollarSign className="w-4 h-4" />
                <span>결제 요청</span>
              </button>
            </div>
          )}

          <form onSubmit={sendMessage} className="flex gap-2">
            <label htmlFor="message-input" className="sr-only">
              메시지 입력
            </label>
            <input
              id="message-input"
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
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
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
          onSuccess={() => {
            loadPaymentRequests();
            setShowPaymentRequestModal(false);
          }}
        />
      )}
    </div>
  );
}
