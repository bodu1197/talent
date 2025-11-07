'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useChatUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  // 읽지 않은 메시지 수 조회
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/unread-count')
      if (response.ok) {
        const data = await response.json()
        console.log('[useChatUnreadCount] Fetched unread count:', data.unreadCount)
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }, [])

  useEffect(() => {
    // 현재 사용자 확인
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[useChatUnreadCount] User:', user?.id)
      if (user) {
        setUserId(user.id)
        fetchUnreadCount()
      }
    }

    initUser()
  }, [supabase, fetchUnreadCount])

  // 실시간 메시지 구독
  useEffect(() => {
    if (!userId) {
      console.log('[useChatUnreadCount] No userId, skipping subscription')
      return
    }

    console.log('[useChatUnreadCount] Setting up realtime subscription for user:', userId)

    // 30초마다 읽지 않은 메시지 수 갱신
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)

    // Realtime 구독 - 새 메시지가 오면 즉시 갱신
    const channel = supabase
      .channel('chat_notifications_mobile')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          const newMessage = payload.new as any
          console.log('[useChatUnreadCount] New message received:', newMessage.id, 'sender:', newMessage.sender_id)

          // 내가 보낸 메시지가 아닌 경우에만 알림
          if (newMessage.sender_id !== userId) {
            console.log('[useChatUnreadCount] Message from other user, fetching unread count')
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
          console.log('[useChatUnreadCount] Message updated, fetching unread count')
          // 메시지가 읽음 처리되면 배지 갱신
          await fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, fetchUnreadCount])

  return { unreadCount, userId }
}
