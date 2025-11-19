"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import MypageLayoutWrapper from "@/components/mypage/MypageLayoutWrapper";
import Link from "next/link";
import {
  FaBell,
  FaRegBellSlash,
  FaCheckCircle,
  FaUndo,
  FaTimes,
  FaComment,
  FaStar,
  FaShoppingCart,
  FaPlay,
  FaTruck,
  FaFilter,
} from "react-icons/fa";

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  order_id: string | null;
  sender_id: string | null;
  metadata: Record<string, unknown> | null;
}

interface Props {
  readonly initialNotifications: Notification[];
  readonly unreadCount: number;
  readonly profileData?: {
    name: string;
    profile_image?: string | null;
  } | null;
  readonly isSeller: boolean;
}

type FilterType = "all" | "unread" | "read";

export default function NotificationsClient({
  initialNotifications,
  unreadCount: initialUnreadCount,
  profileData,
  isSeller,
}: Props) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // 필터링된 알림 목록
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  // 알림 타입별 아이콘 및 색상
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order_new":
        return { icon: FaShoppingCart, color: "text-green-500" };
      case "order_started":
        return { icon: FaPlay, color: "text-blue-500" };
      case "order_delivered":
        return { icon: FaTruck, color: "text-purple-500" };
      case "order_completed":
        return { icon: FaCheckCircle, color: "text-green-500" };
      case "order_revision_requested":
        return { icon: FaUndo, color: "text-orange-500" };
      case "order_revision_completed":
        return { icon: FaCheckCircle, color: "text-blue-500" };
      case "order_cancelled":
        return { icon: FaTimes, color: "text-red-500" };
      case "message_new":
        return { icon: FaComment, color: "text-blue-500" };
      case "review_new":
        return { icon: FaStar, color: "text-yellow-500" };
      default:
        return { icon: FaBell, color: "text-gray-500" };
    }
  };

  // 개별 알림 읽음 처리
  const markAsRead = async (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification || notification.is_read) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error(
        "Failed to mark notification as read:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
    } else {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  // 전체 읽음 처리
  const markAllAsRead = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);

    if (error) {
      console.error(
        "Failed to mark all notifications as read:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
    setLoading(false);
  };

  // Handler for INSERT notifications
  const handleInsertNotification = useCallback((payload: unknown) => {
    const newNotification = (payload as { new: Notification }).new;
    setNotifications((prev) => [newNotification, ...prev]);
    if (!newNotification.is_read) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  // Handler for UPDATE notifications
  const handleUpdateNotification = useCallback((payload: unknown) => {
    const updatedNotification = (payload as { new: Notification }).new;
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === updatedNotification.id ? updatedNotification : n,
      ),
    );
  }, []);

  // 실시간 알림 구독
  useEffect(() => {
    const channel = supabase
      .channel("notifications-page")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        handleInsertNotification,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
        },
        handleUpdateNotification,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, handleInsertNotification, handleUpdateNotification]);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <MypageLayoutWrapper mode={isSeller ? "seller" : "buyer"} profileData={profileData}>
      <div className="py-8 px-4">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaBell className="text-brand-primary" />
            전체 알림
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            {unreadCount > 0
              ? `읽지 않은 알림 ${unreadCount}개`
              : "모든 알림을 확인했습니다"}
          </p>
        </div>

        {/* 필터 및 액션 버튼 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* 필터 */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-brand-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                전체 ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "unread"
                    ? "bg-brand-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                읽지 않음 ({unreadCount})
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "read"
                    ? "bg-brand-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                읽음 ({notifications.length - unreadCount})
              </button>
            </div>

            {/* 전체 읽음 버튼 */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-brand-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "처리중..." : "모두 읽음 처리"}
              </button>
            )}
          </div>
        </div>

        {/* 알림 목록 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => {
                const { icon: Icon, color } = getNotificationIcon(
                  notification.type,
                );
                return (
                  <div
                    key={notification.id}
                    className={`${
                      notification.is_read ? "bg-white" : "bg-blue-50"
                    } hover:bg-gray-50 transition-colors`}
                  >
                    {notification.link ? (
                      <Link
                        href={notification.link}
                        onClick={() => markAsRead(notification.id)}
                        className="flex items-start gap-4 p-4"
                      >
                        <div
                          className={`p-3 rounded-full bg-gray-100 flex-shrink-0 ${color}`}
                        >
                          <Icon className="text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3
                              className={`text-base font-bold ${
                                notification.is_read
                                  ? "text-gray-700"
                                  : "text-gray-900"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-start gap-4 p-4">
                        <div
                          className={`p-3 rounded-full bg-gray-100 flex-shrink-0 ${color}`}
                        >
                          <Icon className="text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3
                              className={`text-base font-bold ${
                                notification.is_read
                                  ? "text-gray-700"
                                  : "text-gray-900"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-brand-primary hover:underline flex-shrink-0"
                              >
                                읽음
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <FaRegBellSlash className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {filter === "unread"
                  ? "읽지 않은 알림이 없습니다"
                  : filter === "read"
                    ? "읽은 알림이 없습니다"
                    : "알림이 없습니다"}
              </h3>
              <p className="text-gray-600">
                {filter === "all"
                  ? "새로운 알림이 도착하면 여기에 표시됩니다"
                  : "다른 필터를 선택해보세요"}
              </p>
            </div>
          )}
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
