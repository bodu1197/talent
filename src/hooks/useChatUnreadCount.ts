'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useChatUnreadCount() {
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

          // 내가 보낸 메시지가 아닌 경우에만 알림
          if (newMessage.sender_id !== userId) {
            await fetchUnreadCount()
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
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [userId])

  return { unreadCount, userId }
}
