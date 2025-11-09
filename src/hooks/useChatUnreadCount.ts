'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useChatUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  // 알림 권한 요청
  const requestNotificationPermission = useCallback(async () => {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        setHasPermission(permission === 'granted')
      } else if ('Notification' in window) {
        setHasPermission(Notification.permission === 'granted')
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error)
    }
  }, [])

  // 알림음 재생 (모바일 대응 개선)
  const playNotificationSound = useCallback(async () => {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.volume = 0.5

      // 모바일에서 자동 재생을 위한 처리
      const playPromise = audio.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('[useChatUnreadCount] Notification sound played successfully')
          })
          .catch(error => {
            console.log('[useChatUnreadCount] Autoplay prevented, trying user interaction:', error)
            // 사용자 인터랙션 후 재생 시도
            document.addEventListener('click', () => {
              audio.play().catch(e => console.log('Still failed:', e))
            }, { once: true })
          })
      }
    } catch (error) {
      console.error('Notification sound error:', error)
    }
  }, [])

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
    // 현재 사용자 확인 및 알림 권한 요청
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[useChatUnreadCount] User:', user?.id)
      if (user) {
        setUserId(user.id)
        fetchUnreadCount()
        requestNotificationPermission() // 알림 권한 요청
      }
    }

    initUser()
  }, [supabase, fetchUnreadCount, requestNotificationPermission])

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
      .channel(`chat_notifications_${userId}`)
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
            console.log('[useChatUnreadCount] Message from other user, fetching unread count and playing sound')
            await fetchUnreadCount()
            // 알림음 재생 (PC와 모바일 모두)
            await playNotificationSound()

            // 브라우저 알림 표시 (권한이 있는 경우)
            if (hasPermission && 'Notification' in window) {
              new Notification('새 메시지', {
                body: '새로운 채팅 메시지가 도착했습니다.',
                icon: '/favicon.ico'
              })
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `is_read=eq.true`
        },
        async (payload) => {
          const updatedMessage = payload.new as any
          console.log('[useChatUnreadCount] Message marked as read:', updatedMessage.id)
          // 메시지가 읽음 처리되면 즉시 배지 갱신
          await fetchUnreadCount()
        }
      )
      .subscribe((status) => {
        console.log('[useChatUnreadCount] Realtime subscription status:', status)
      })

    return () => {
      console.log('[useChatUnreadCount] Cleaning up realtime subscription')
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, fetchUnreadCount, playNotificationSound, hasPermission])

  // 수동으로 카운트를 새로고침할 수 있는 함수 반환
  return { unreadCount, userId, refreshCount: fetchUnreadCount }
}
