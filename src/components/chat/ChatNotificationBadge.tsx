'use client'

import Link from 'next/link'
import { useChatUnreadCount } from '@/hooks/useChatUnreadCount'

export default function ChatNotificationBadge() {
  const { unreadCount, userId } = useChatUnreadCount()

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
