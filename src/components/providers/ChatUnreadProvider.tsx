'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthProvider';
import { logger } from '@/lib/logger';

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface ChatUnreadContextType {
  unreadCount: number;
  userId: string | null;
  refreshCount: () => Promise<void>;
  decrementCount: (amount: number) => void;
}

const ChatUnreadContext = createContext<ChatUnreadContextType | undefined>(undefined);

export function ChatUnreadProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { user } = useAuth(); // Use AuthProvider instead of separate getUser() call
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [myRoomIds, setMyRoomIds] = useState<string[]>([]);
  const supabase = useMemo(() => createClient(), []);
  const userId = user?.id || null;

  // 알림 권한 요청
  const requestNotificationPermission = useCallback(async () => {
    try {
      if ('Notification' in globalThis && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        setHasPermission(permission === 'granted');
      } else if ('Notification' in globalThis) {
        setHasPermission(Notification.permission === 'granted');
      }
    } catch (error) {
      logger.error('Failed to request notification permission:', error);
    }
  }, []);

  // 알림음 재생
  const playNotificationSound = useCallback(async () => {
    try {
      const AudioContextClass =
        globalThis.AudioContext ||
        (
          globalThis as typeof globalThis & {
            webkitAudioContext: typeof AudioContext;
          }
        ).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      logger.error('Notification sound error:', error);
    }
  }, []);

  // 읽지 않은 메시지 수 조회
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/unread-count', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      logger.error('[ChatUnreadProvider] Failed to fetch unread count:', error);
    }
  }, []);

  // 내 채팅방 목록 가져오기
  const fetchMyRooms = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: rooms } = await supabase
        .from('chat_rooms')
        .select('id')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      const roomIds = rooms?.map((r) => r.id) || [];
      setMyRoomIds(roomIds);
    } catch (error) {
      logger.error('[ChatUnreadProvider] Failed to fetch rooms:', error);
    }
  }, [userId, supabase]);

  // 초기화 - user가 있으면 채팅 읽지 않은 수 조회
  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
      requestNotificationPermission();
    }
  }, [userId, fetchUnreadCount, requestNotificationPermission]);

  // userId가 설정되면 내 채팅방 목록 가져오기
  useEffect(() => {
    if (userId) {
      fetchMyRooms();
    }
  }, [userId, fetchMyRooms]);

  // 실시간 메시지 구독
  useEffect(() => {
    if (!userId || myRoomIds.length === 0) {
      return;
    }

    const channel = supabase
      .channel(`chat_notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;

          // 내 채팅방이면서 내가 보낸 메시지가 아닌 경우에만 알림
          if (myRoomIds.includes(newMessage.room_id) && newMessage.sender_id !== userId) {
            setUnreadCount((prev) => prev + 1);

            // 알림음 재생
            await playNotificationSound();

            // 브라우저 알림
            if (hasPermission && 'Notification' in globalThis) {
              new Notification('새 메시지', {
                body: '새로운 채팅 메시지가 도착했습니다.',
                icon: '/favicon.ico',
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, myRoomIds, supabase, playNotificationSound, hasPermission]);

  // 카운트 감소 함수
  const decrementCount = useCallback((amount: number) => {
    setUnreadCount((prev) => Math.max(0, prev - amount));
  }, []);

  const value = useMemo(
    () => ({
      unreadCount,
      userId,
      refreshCount: fetchUnreadCount,
      decrementCount,
    }),
    [unreadCount, userId, fetchUnreadCount, decrementCount]
  );

  return <ChatUnreadContext.Provider value={value}>{children}</ChatUnreadContext.Provider>;
}

export function useChatUnreadCount() {
  const context = useContext(ChatUnreadContext);
  if (context === undefined) {
    throw new Error('useChatUnreadCount must be used within ChatUnreadProvider');
  }
  return context;
}
