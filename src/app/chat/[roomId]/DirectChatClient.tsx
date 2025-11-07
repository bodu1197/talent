'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Message {
  id: string
  room_id: string
  sender_id: string
  message: string
  is_read: boolean
  created_at: string
  sender: {
    id: string
    name: string
    profile_image: string | null
  }
}

interface OtherUser {
  id: string
  name: string
  profile_image: string | null
}

interface Service {
  id: string
  title: string
  thumbnail_url: string | null
}

interface Props {
  roomId: string
  userId: string
  otherUser: OtherUser
  service: Service | null
}

export default function DirectChatClient({ roomId, userId, otherUser, service }: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // 메시지 목록 로드
  const loadMessages = async () => {
    const response = await fetch(`/api/chat/messages?room_id=${roomId}`)
    if (response.ok) {
      const data = await response.json()
      setMessages(data.messages || [])
      scrollToBottom()
    }
  }

  // 메시지 전송
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          room_id: roomId,
          message: newMessage.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages([...messages, data.message])
        setNewMessage('')
        scrollToBottom()
      }
    } catch (error) {
      console.error('Send message error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // 초기 로드
  useEffect(() => {
    loadMessages()
  }, [])

  // 실시간 메시지 구독
  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          const newMsg = payload.new as any
          if (newMsg.sender_id !== userId) {
            loadMessages()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, userId])

  return (
    <div className="flex flex-col h-screen bg-gray-50 pt-16">
      {/* 헤더 */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* 뒤로가기 & 상대방 정보 */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <i className="fas fa-arrow-left text-gray-700"></i>
              </button>

              <div className="flex items-center gap-3">
                {/* 프로필 이미지 */}
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  {otherUser.profile_image ? (
                    <img
                      src={otherUser.profile_image}
                      alt={otherUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                </div>

                <div>
                  <h1 className="font-bold text-lg">{otherUser.name}</h1>
                  {service && (
                    <Link
                      href={`/services/${service.id}`}
                      className="text-sm text-gray-600 hover:text-[#0f3460] hover:underline"
                    >
                      {service.title}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* 서비스 정보 카드 (상단에 한번만) */}
          {service && (
            <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <Link
                href={`/services/${service.id}`}
                className="flex items-center gap-4 hover:bg-gray-50 transition-colors rounded-lg p-2"
              >
                {service.thumbnail_url && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={service.thumbnail_url}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 mb-1">문의 상품</p>
                  <p className="font-medium text-gray-900 truncate">{service.title}</p>
                </div>
                <i className="fas fa-chevron-right text-gray-400"></i>
              </Link>
            </div>
          )}

          {/* 메시지 목록 */}
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <i className="fas fa-comments text-4xl mb-3"></i>
                <p>아직 메시지가 없습니다</p>
                <p className="text-sm mt-1">첫 메시지를 보내보세요!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isMine = message.sender_id === userId
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-md">
                      {!isMine && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                          {otherUser.profile_image ? (
                            <img
                              src={otherUser.profile_image}
                              alt={otherUser.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              <i className="fas fa-user"></i>
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isMine
                            ? 'bg-[#0f3460] text-white rounded-br-sm'
                            : 'bg-white border border-gray-200 rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isMine ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* 메시지 입력 */}
      <div className="bg-white border-t shadow-lg">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !newMessage.trim()}
              className="px-6 py-3 bg-[#0f3460] text-white rounded-full hover:bg-[#1a4d8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  <span className="hidden sm:inline">전송</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
