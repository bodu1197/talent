'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Send,
  Loader2,
  MessageCircle,
  User,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ErrandMypageLayout from '@/components/errands/ErrandMypageLayout';

interface Message {
  id: string;
  errand_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'image' | 'location' | 'system';
  is_read: boolean;
  created_at: string;
  sender: {
    id: string;
    name: string;
    profile_image: string | null;
  };
}

interface ErrandInfo {
  id: string;
  title: string;
  status: string;
  isRequester: boolean;
  isHelper: boolean;
}

export default function ErrandChatPage() {
  const params = useParams();
  const router = useRouter();
  const errandId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [errand, setErrand] = useState<ErrandInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 스크롤을 맨 아래로
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 메시지 조회
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/errands/${errandId}/chat`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '메시지를 불러올 수 없습니다');
      }

      const data = await response.json();
      setMessages(data.messages);
      setErrand(data.errand);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }, [errandId]);

  // 현재 사용자 프로필 ID 조회
  const fetchCurrentUser = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setCurrentUserId(profile.id);
      }
    }
  }, []);

  // 메시지 전송
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/errands/${errandId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '메시지 전송에 실패했습니다');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
      setNewMessage('');
      inputRef.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : '메시지 전송 실패');
    } finally {
      setSending(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchCurrentUser();
    fetchMessages();
  }, [fetchCurrentUser, fetchMessages]);

  // 메시지 변경 시 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 실시간 구독
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`errand_chat_${errandId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'errand_chat_messages',
          filter: `errand_id=eq.${errandId}`,
        },
        async (payload) => {
          // 새 메시지가 도착하면 sender 정보와 함께 다시 조회
          const newMsg = payload.new as Message;

          // 내가 보낸 메시지면 이미 추가되어 있으므로 무시
          if (newMsg.sender_id === currentUserId) return;

          // 발신자 정보 조회
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, name, profile_image')
            .eq('id', newMsg.sender_id)
            .single();

          if (sender) {
            const messageWithSender = { ...newMsg, sender };
            setMessages((prev) => {
              // 중복 방지
              if (prev.some((m) => m.id === messageWithSender.id)) return prev;
              return [...prev, messageWithSender];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [errandId, currentUserId]);

  // 시간 포맷
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 상태별 배지 색상
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">대기중</span>;
      case 'MATCHED':
        return (
          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">매칭완료</span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">진행중</span>
        );
      case 'COMPLETED':
        return <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">완료</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">취소됨</span>;
      default:
        return null;
    }
  };

  // 채팅 불가 여부
  const isChatDisabled = errand?.status === 'COMPLETED' || errand?.status === 'CANCELLED';

  if (loading) {
    return (
      <ErrandMypageLayout mode={errand?.isHelper ? 'helper' : 'requester'}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-gray-500">채팅을 불러오는 중...</p>
          </div>
        </div>
      </ErrandMypageLayout>
    );
  }

  if (error && !errand) {
    return (
      <ErrandMypageLayout mode="requester">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-gray-700 font-medium">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </button>
        </div>
      </ErrandMypageLayout>
    );
  }

  return (
    <ErrandMypageLayout mode={errand?.isHelper ? 'helper' : 'requester'}>
      <div className="flex flex-col h-[calc(100vh-200px)] max-h-[800px] bg-white rounded-xl shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/errands/${errandId}`}
                className="font-medium text-gray-900 truncate hover:text-blue-600"
              >
                {errand?.title}
              </Link>
              {errand && getStatusBadge(errand.status)}
            </div>
            <p className="text-xs text-gray-500">
              {errand?.isRequester ? '요청자로 참여 중' : '라이더로 참여 중'}
            </p>
          </div>

          <Link
            href={`/errands/${errandId}`}
            className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            상세보기
          </Link>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-medium">아직 대화가 없습니다</p>
              <p className="text-sm">첫 메시지를 보내보세요!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUserId;

              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                    {/* 프로필 이미지 */}
                    {!isMe && (
                      <div className="flex-shrink-0">
                        {msg.sender.profile_image ? (
                          <Image
                            src={msg.sender.profile_image}
                            alt={msg.sender.name}
                            width={36}
                            height={36}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* 메시지 버블 */}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {!isMe && <span className="text-xs text-gray-500 mb-1">{msg.sender.name}</span>}
                      <div
                        className={`px-4 py-2.5 rounded-2xl ${
                          isMe
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                        {isMe && msg.is_read && <span className="text-xs text-blue-400 ml-1">읽음</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 입력창 */}
        {isChatDisabled ? (
          <div className="px-4 py-3 bg-gray-100 border-t text-center">
            <p className="text-sm text-gray-500">
              {errand?.status === 'COMPLETED' ? '완료된' : '취소된'} 심부름은 채팅할 수 없습니다
            </p>
          </div>
        ) : (
          <form onSubmit={sendMessage} className="flex items-center gap-2 px-4 py-3 border-t bg-white">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        )}
      </div>
    </ErrandMypageLayout>
  );
}
