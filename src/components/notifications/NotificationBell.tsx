'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { Bell, BellOff } from 'lucide-react';

export default function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications, loading } =
    useNotifications();

  const [showDropdown, setShowDropdown] = useState(false);
  const hasLoadedNotifications = useRef(false);



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

  // 드롭다운 열렸을 때만 notifications 새로고침 (처음 한 번만)
  useEffect(() => {
    if (showDropdown && !hasLoadedNotifications.current) {
      refreshNotifications();
      hasLoadedNotifications.current = true;
    }
  }, [showDropdown, refreshNotifications]);

  // 알림 읽음 처리 및 드롭다운 닫기
  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
    setShowDropdown(false);
  };

  if (!user) return null;

  // 로딩 중이면 로딩 상태 표시
  if (loading) {
    return (
      <div className="relative flex items-center">
        <Bell className="w-6 h-6 text-gray-400 animate-pulse" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="relative flex items-center">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative flex items-center text-gray-900 hover:text-brand-primary transition-colors"
        aria-label={unreadCount > 0 ? `알림 ${unreadCount}개 확인` : '알림 확인'}
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        <Bell className="w-6 h-6" aria-hidden="true" />
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
                {notifications.slice(0, 5).map((notification) => (
                  <Link
                    key={notification.id}
                    href={notification.link || '#'}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`block px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${notification.is_read ? '' : 'bg-blue-50'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.is_read ? 'bg-transparent' : 'bg-blue-500'
                          }`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-sm font-medium mb-1 ${notification.is_read ? 'text-gray-700' : 'text-gray-900'
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
