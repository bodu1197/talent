'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ChatNotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  // 읽지 않은 메시지 수 조회
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/chat/unread-count')
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  // 알림음 재생
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.volume = 0.5
      audio.play().catch(err => {
        console.log('Notification sound play failed:', err)
      })
    } catch (error) {
      console.error('Notification sound error:', error)
    }
  }

  useEffect(() => {
    // 현재 사용자 확인
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        fetchUnreadCount()
      }
    }

    initUser()
  }, [])

  // 실시간 메시지 구독
  useEffect(() => {
    if (!userId) return

    // 30초마다 읽지 않은 메시지 수 갱신
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)

    // Realtime 구독 - 새 메시지가 오면 즉시 갱신
    const channel = supabase
      .channel('chat_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          const newMessage = payload.new as any
          console.log('[ChatNotificationBadge] New message received:', newMessage.id, 'from:', newMessage.sender_id, 'my id:', userId)

          // 내가 보낸 메시지가 아닌 경우에만 알림
          if (newMessage.sender_id !== userId) {
            console.log('[ChatNotificationBadge] Playing notification sound and updating count')
            // 읽지 않은 메시지 수 즉시 갱신
            await fetchUnreadCount()

            // 알림음 재생 (PC와 모바일 모두)
            playNotificationSound()
          } else {
            console.log('[ChatNotificationBadge] Ignoring message from self')
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          // 메시지가 읽음 처리되면 배지 갱신
          await fetchUnreadCount()
        }
      )
      .subscribe((status) => {
        console.log('[ChatNotificationBadge] Realtime subscription status:', status)
      })

    return () => {
      console.log('[ChatNotificationBadge] Cleaning up realtime subscription')
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [userId])

  if (!userId) return null

  return (
    <Link
      href="/chat"
      className="relative text-gray-900 hover:text-[#0f3460] transition-colors"
      aria-label="채팅"
    >
      <i className="far fa-comments text-xl"></i>
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
