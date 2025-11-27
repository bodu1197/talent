'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import { Bell, BellOff } from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  order_id?: string;
  sender_id?: string;
  metadata?: Record<string, unknown>;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const supabase = createClient();

  // ESC 키로 드롭다운 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDropdown) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showDropdown]);

  // 알림 소리 재생 (Web Audio API 사용)
  const playNotificationSound = () => {
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

      oscillator.frequency.value = 800; // 800Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (err) {
      logger.error('Failed to play notification sound:', err);
    }
  };

  // 읽지 않은 알림 수 조회
  const loadUnreadCount = async () => {
    if (!user) return;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (!error && count !== null) {
      setUnreadCount(count);
    }
  };

  // 최근 알림 5개 조회
  const loadNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setNotifications(data);
    }
  };

  // 실시간 알림 구독
  useEffect(() => {
    if (!user) return;

    loadUnreadCount();
    loadNotifications();

    // 실시간 구독
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // 알림 소리 재생
          playNotificationSound();

          // 읽지 않은 수 증가
          setUnreadCount((prev) => prev + 1);

          // 알림 목록 업데이트
          setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 알림 읽음 처리
  const markAsRead = async (notificationId: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);

    setUnreadCount((prev) => Math.max(0, prev - 1));
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  };

  // 모두 읽음 처리
  const markAllAsRead = async () => {
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative text-gray-900 hover:text-brand-primary transition-colors"
        aria-label={unreadCount > 0 ? `알림 ${unreadCount}개 확인` : '알림 확인'}
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        <Bell className="w-6 h-6 lg:w-5 lg:h-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold"
            aria-label={`읽지 않은 알림 ${unreadCount}개`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          {/* 배경 클릭 시 닫기 */}
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setShowDropdown(false)}
            aria-label="알림 닫기"
          ></button>

          {/* 드롭다운 */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">알림</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-brand-primary hover:underline"
                  aria-label="모든 알림을 읽음으로 표시"
                >
                  모두 읽음
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellOff className="w-10 h-10 mb-3 mx-auto" aria-hidden="true" />
                <p>알림이 없습니다</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={notification.link || '#'}
                    onClick={() => {
                      markAsRead(notification.id);
                      setShowDropdown(false);
                    }}
                    className={`block px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      notification.is_read ? '' : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notification.is_read ? 'bg-transparent' : 'bg-blue-500'
                        }`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-sm font-medium mb-1 ${
                            notification.is_read ? 'text-gray-700' : 'text-gray-900'
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(notification.created_at).toLocaleString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/mypage/notifications"
              className="block px-4 py-3 text-center text-sm text-brand-primary hover:bg-gray-50 font-medium"
              onClick={() => setShowDropdown(false)}
            >
              모든 알림 보기
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
