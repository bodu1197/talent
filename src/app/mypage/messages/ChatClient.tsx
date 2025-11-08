'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface ChatRoom {
  id: string
  buyer_id: string
  seller_id: string
  service_id: string | null
  last_message_at: string
  buyer: {
    id: string
    name: string
    profile_image: string | null
  }
  seller: {
    id: string
    business_name: string
    display_name: string | null
    profile_image: string | null
  }
  service: {
    id: string
    title: string
    thumbnail_url: string | null
  } | null
  lastMessage: {
    message: string
    created_at: string
    sender_id: string
  } | null
  unreadCount: number
}

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

interface Props {
  userId: string
  isSeller: boolean
}

export default function ChatClient({ userId, isSeller }: Props) {
  const searchParams = useSearchParams()
  const roomIdFromUrl = searchParams.get('room')

  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(roomIdFromUrl)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // 채팅방 목록 로드
  const loadRooms = async () => {
    const response = await fetch('/api/chat/rooms')
    if (response.ok) {
      const data = await response.json()
      setRooms(data.rooms || [])
    }
  }

  // 메시지 목록 로드
  const loadMessages = async (roomId: string) => {
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
    if (!newMessage.trim() || !selectedRoomId || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          room_id: selectedRoomId,
          message: newMessage.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages([...messages, data.message])
        setNewMessage('')
        scrollToBottom()
        loadRooms() // 채팅방 목록 갱신
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
    loadRooms()
  }, [])

  // 채팅방 목록이 로드된 후 URL의 room 파라미터 확인
  useEffect(() => {
    if (roomIdFromUrl && rooms.length > 0) {
      const roomExists = rooms.find(r => r.id === roomIdFromUrl)
      if (roomExists) {
        setSelectedRoomId(roomIdFromUrl)
      }
    }
  }, [rooms, roomIdFromUrl])

  // 선택된 채팅방의 메시지 로드
  useEffect(() => {
    if (selectedRoomId) {
      loadMessages(selectedRoomId)
    }
  }, [selectedRoomId])

  // 실시간 메시지 구독 (Supabase Realtime)
  useEffect(() => {
    if (!selectedRoomId) return

    const channel = supabase
      .channel(`room:${selectedRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${selectedRoomId}`
        },
        (payload) => {
          const newMsg = payload.new as any
          // 자신이 보낸 메시지가 아닌 경우에만 추가
          if (newMsg.sender_id !== userId) {
            loadMessages(selectedRoomId)
            loadRooms()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedRoomId, userId])

  const selectedRoom = rooms.find(r => r.id === selectedRoomId)

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-gray-50 pt-16">
        <MobileSidebar mode={isSeller ? 'seller' : 'buyer'} />
        <Sidebar mode={isSeller ? 'seller' : 'buyer'} />
        <main className="flex-1 overflow-y-auto w-full flex flex-col items-center">
          <div className="w-full max-w-[1200px] px-4 py-4 sm:py-6 lg:py-8">
            <h1 className="text-2xl font-bold mb-6">메시지</h1>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
              <div className="flex h-full">
            {/* 채팅방 목록 */}
            <div className="w-80 border-r border-gray-200 overflow-y-auto">
              {rooms.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <i className="fas fa-comments text-4xl mb-2"></i>
                  <p>채팅방이 없습니다</p>
                </div>
              ) : (
                rooms.map((room) => {
                  const otherUser = isSeller ? room.buyer : room.seller
                  const displayName = isSeller
                    ? room.buyer.name
                    : room.seller.display_name || room.seller.business_name

                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left transition-colors ${
                        selectedRoomId === room.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* 프로필 이미지 */}
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                          {otherUser.profile_image ? (
                            <img
                              src={otherUser.profile_image}
                              alt={displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <i className="fas fa-user"></i>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-sm truncate">{displayName}</h3>
                            {room.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {room.unreadCount}
                              </span>
                            )}
                          </div>
                          {room.service && (
                            <p className="text-xs text-gray-500 mb-1 truncate">
                              {room.service.title}
                            </p>
                          )}
                          {room.lastMessage && (
                            <p className="text-sm text-gray-600 truncate">
                              {room.lastMessage.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* 채팅 영역 */}
            <div className="flex-1 flex flex-col">
              {selectedRoom ? (
                <>
                  {/* 채팅방 헤더 */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        {(isSeller ? selectedRoom.buyer.profile_image : selectedRoom.seller.profile_image) ? (
                          <img
                            src={isSeller ? selectedRoom.buyer.profile_image! : selectedRoom.seller.profile_image!}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <i className="fas fa-user"></i>
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="font-bold">
                          {isSeller
                            ? selectedRoom.buyer.name
                            : selectedRoom.seller.display_name || selectedRoom.seller.business_name}
                        </h2>
                        {selectedRoom.service && (
                          <p className="text-sm text-gray-500">{selectedRoom.service.title}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 메시지 목록 */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isMine = message.sender_id === userId
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-md px-4 py-2 rounded-lg ${
                              isMine
                                ? 'bg-[#0f3460] text-white'
                                : 'bg-gray-100 text-gray-900'
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
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* 메시지 입력 */}
                  <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                        disabled={isLoading}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !newMessage.trim()}
                        className="px-6 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-paper-plane"></i>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <i className="fas fa-comments text-6xl mb-4"></i>
                    <p>채팅방을 선택해주세요</p>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>
          </div>
          <Footer />
        </main>
      </div>
    </>
  )
}
