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

  // 알림음 재생 (Web Audio API 사용)
  const playNotificationSound = useCallback(async () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800 // 800Hz
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)

      console.log('[useChatUnreadCount] Notification sound played successfully')
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
      // UPDATE 이벤트는 제거 - 불필요한 배지 갱신 방지
      // 채팅방 클릭 시 handleSelectRoom에서 직접 처리함
      .subscribe((status) => {
        console.log('[useChatUnreadCount] Realtime subscription status:', status)
      })

    return () => {
      console.log('[useChatUnreadCount] Cleaning up realtime subscription')
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, fetchUnreadCount, playNotificationSound, hasPermission])

  // 수동으로 카운트를 제거하는 함수 (모든 메시지를 읽음 처리)
  const clearCount = useCallback(async () => {
    try {
      setUnreadCount(0) // 즉시 UI 업데이트
      const response = await fetch('/api/chat/messages/mark-all-read', {
        method: 'POST'
      })
      if (response.ok) {
        console.log('[useChatUnreadCount] All messages marked as read')
      }
    } catch (error) {
      console.error('Failed to mark all messages as read:', error)
      // 실패하면 다시 카운트 갱신
      await fetchUnreadCount()
    }
  }, [fetchUnreadCount])

  // 수동으로 카운트를 새로고침할 수 있는 함수 반환
  return { unreadCount, userId, refreshCount: fetchUnreadCount, clearCount }
}
