'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthProvider'
import { logger } from '@/lib/logger'

interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
  order_id?: string
  sender_id?: string
  metadata?: Record<string, unknown>
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 신호음 재생
  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        logger.error('신호음 재생 실패:', err)
      })
    }
  }, [])

  // 알림 조회
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/notifications?limit=50')
      if (response.ok) {
        const { notifications: data } = await response.json()
        setNotifications(data)
        const unread = data.filter((n: Notification) => !n.is_read).length
        setUnreadCount(unread)
      }
    } catch (err) {
      logger.error('알림 조회 실패:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  // 읽음 처리
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH'
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      logger.error('알림 읽음 처리 실패:', err)
    }
  }, [])

  // 모두 읽음 처리
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH'
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true }))
        )
        setUnreadCount(0)
      }
    } catch (err) {
      logger.error('모든 알림 읽음 처리 실패:', err)
    }
  }, [])

  // 초기 로드
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Handler for INSERT notification events
  const handleInsertNotification = useCallback((payload: unknown) => {
    const newNotification = (payload as { new: Notification }).new

    // 알림 목록에 추가
    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)

    // 신호음 재생
    playNotificationSound()

    logger.info('새 알림 수신:', { notificationId: newNotification.id, title: newNotification.title })
  }, [playNotificationSound])

  // Handler for UPDATE notification events
  const handleUpdateNotification = useCallback((payload: unknown) => {
    const updatedNotification = (payload as { new: Notification }).new

    // 알림 업데이트
    setNotifications(prev =>
      prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
    )

    // 읽음 처리된 경우 카운트 업데이트
    if (updatedNotification.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }, [])

  // Realtime 구독
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        handleInsertNotification
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        handleUpdateNotification
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase, handleInsertNotification, handleUpdateNotification])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications
      }}
    >
      {/* 신호음 오디오 */}
      <audio
        ref={audioRef}
        src="/sounds/notification.mp3"
        preload="auto"
      />
      {children}
    </NotificationContext.Provider>
  )
}
