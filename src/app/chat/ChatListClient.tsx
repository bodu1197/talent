'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ChatRoom {
  id: string
  buyer_id: string
  seller_id: string
  service_id: string | null
  last_message_at: string
  created_at: string
  buyer?: {
    id: string
    name: string
    profile_image: string | null
  }
  seller?: {
    id: string
    business_name: string
    display_name: string | null
    profile_image: string | null
  }
  service?: {
    id: string
    title: string
  }
  lastMessage?: {
    message: string
    created_at: string
    sender_id: string
  }
  unreadCount?: number
}

interface Message {
  id: string
  room_id: string
  sender_id: string
  message: string
  is_read: boolean
  created_at: string
}

interface Props {
  userId: string
  sellerId: string | null
}

export default function ChatListClient({ userId, sellerId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRoomId = searchParams.get('room')

  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(initialRoomId)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'deal' | 'favorite'>('all')
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
    }
  }

  // 메시지 전송
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedRoomId || isLoading) return

    const messageText = newMessage.trim()
    setIsLoading(true)
    setNewMessage('') // 입력창 즉시 비우기

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: selectedRoomId,
          message: messageText
        })
      })

      if (response.ok) {
        // 실시간 구독이 메시지를 자동으로 추가하므로 여기서는 추가하지 않음
        loadRooms() // 채팅방 목록의 마지막 메시지 갱신
      } else {
        const errorData = await response.json()
        alert(`메시지 전송 실패: ${errorData.error || '알 수 없는 오류'}`)
        setNewMessage(messageText) // 실패 시 메시지 복원
      }
    } catch (error) {
      console.error('Send message error:', error)
      alert('메시지 전송 중 오류가 발생했습니다.')
      setNewMessage(messageText) // 실패 시 메시지 복원
    } finally {
      setIsLoading(false)
    }
  }

  // 초기 로드
  useEffect(() => {
    loadRooms()
  }, [])

  // 선택된 채팅방의 메시지 로드
  useEffect(() => {
    if (selectedRoomId) {
      loadMessages(selectedRoomId)
    }
  }, [selectedRoomId])

  // 실시간 메시지 구독
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
          // 모든 새 메시지를 실시간으로 표시 (내가 보낸 것, 상대방이 보낸 것 모두)
          setMessages(prev => [...prev, newMsg])
          loadRooms() // 채팅방 목록의 마지막 메시지 업데이트
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedRoomId, userId])

  const selectedRoom = rooms.find(r => r.id === selectedRoomId)
  const isSeller = selectedRoom ? selectedRoom.seller_id === sellerId : false
  const otherUser = selectedRoom
    ? isSeller
      ? selectedRoom.buyer
      : selectedRoom.seller
    : null

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container-1200 py-6">
        <div className="flex h-[calc(100vh-120px)] bg-white shadow-lg rounded-lg overflow-hidden">
        {/* 왼쪽: 채팅방 목록 */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* 헤더 */}
        <div className="px-4 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold mb-4">채팅</h1>

          {/* 탭 */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'unread'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              안 읽음
            </button>
            <button
              onClick={() => setActiveTab('deal')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'deal'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              거래 중
            </button>
            <button
              onClick={() => setActiveTab('favorite')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'favorite'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              즐겨찾기
            </button>
          </div>
        </div>

        {/* 검색 */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="검색해 보세요."
              className="w-full px-4 py-2 pr-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        {/* 채팅방 목록 */}
        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <i className="fas fa-comments text-4xl mb-3"></i>
              <p>채팅방이 없습니다</p>
            </div>
          ) : (
            rooms.map((room) => {
              const isRoomSeller = room.seller_id === sellerId
              const other = isRoomSeller ? room.buyer : room.seller
              const displayName = isRoomSeller
                ? (room.buyer?.name || '구매자')
                : (room.seller?.display_name || room.seller?.business_name || '판매자')

              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left transition-colors ${
                    selectedRoomId === room.id ? 'bg-gray-50 border-l-4 border-l-green-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* 프로필 아이콘 */}
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                      {other?.profile_image ? (
                        <img
                          src={other.profile_image}
                          alt={displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <i className="fas fa-user"></i>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm truncate">{displayName}</h3>
                        <span className="text-xs text-gray-400">
                          {room.last_message_at
                            ? new Date(room.last_message_at).toLocaleDateString('ko-KR', {
                                month: '2-digit',
                                day: '2-digit'
                              })
                            : ''}
                        </span>
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

                    {room.unreadCount ? (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                        {room.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* 오른쪽: 채팅 메시지 */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* 채팅방 헤더 */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {otherUser?.profile_image ? (
                      <img
                        src={otherUser.profile_image}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <i className="fas fa-user"></i>
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold">
                      {isSeller
                        ? selectedRoom.buyer?.name || '구매자'
                        : selectedRoom.seller?.display_name || selectedRoom.seller?.business_name || '판매자'}
                    </h2>
                    {selectedRoom.service && (
                      <p className="text-sm text-gray-500">{selectedRoom.service.title}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
              {messages.map((message) => {
                const isMine = message.sender_id === userId
                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 mb-4 ${isMine ? 'flex-row-reverse' : ''}`}
                  >
                    {!isMine && (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                        <i className="fas fa-user text-xs"></i>
                      </div>
                    )}

                    <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                      <div
                        className={`max-w-md px-4 py-2 rounded-2xl ${
                          isMine
                            ? 'bg-[#d4f4dd] text-gray-900'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.message}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(message.created_at).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 입력 영역 */}
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <form onSubmit={sendMessage} className="space-y-3">
                <div className="relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage(e)
                      }
                    }}
                    placeholder="메시지를 입력하세요. (Enter: 줄바꿈 / Ctrl+Enter: 전송)"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    aria-label="파일 첨부"
                  >
                    <i className="fas fa-paperclip text-lg"></i>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      자주 쓰는 문구
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      인천 결제 요청
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      일정 등록
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isLoading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? '전송 중...' : '전송'}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <i className="fas fa-comments text-6xl mb-4"></i>
              <p className="text-lg">채팅방을 선택해주세요</p>
            </div>
          </div>
        )}
        </div>
      </div>
      </div>
    </div>
  )
}
