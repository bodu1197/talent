'use client'

import Link from 'next/link'
import { useChatUnreadCount } from '@/components/providers/ChatUnreadProvider'
import { useEffect } from 'react'

export default function ChatNotificationBadge() {
  const { unreadCount, userId } = useChatUnreadCount()

  useEffect(() => {
    console.log('[ChatNotificationBadge] 🔄 Component rendered with unreadCount:', unreadCount)
  }, [unreadCount])

  if (!userId) {
    return null
  }

  console.log('[ChatNotificationBadge] 📊 Rendering badge, unreadCount:', unreadCount)

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
