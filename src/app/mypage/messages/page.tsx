'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Sidebar from '@/components/mypage/Sidebar'
import { useAuth } from '@/components/providers/AuthProvider'
import { getUserConversations, getConversationMessages, getConversationDetail, sendMessage, markMessagesAsRead } from '@/lib/supabase/queries/messages'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'

function MessagesContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const { user, profile } = useAuth()
  const [chats, setChats] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [conversationDetail, setConversationDetail] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  useEffect(() => {
    if (selectedChat && user) {
      loadMessages(selectedChat)
      markMessagesAsRead(selectedChat, user.id)
    }
  }, [selectedChat, user])

  async function loadConversations() {
    try {
      setLoading(true)
      setError(null)
      const data = await getUserConversations(user!.id)
      setChats(data)

      // 첫 번째 대화 자동 선택
      if (data.length > 0 && !selectedChat) {
        setSelectedChat(data[0].id)
      }
    } catch (err: any) {
      console.error('대화 목록 조회 실패:', err)
      setError(err.message || '대화 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(conversationId: string) {
    try {
      const [messagesData, detailData] = await Promise.all([
        getConversationMessages(conversationId, user!.id),
        getConversationDetail(conversationId)
      ])
      setMessages(messagesData)
      setConversationDetail(detailData)
    } catch (err: any) {
      console.error('메시지 조회 실패:', err)
    }
  }

  async function handleSendMessage() {
    if (!message.trim() || !selectedChat || !user) return

    try {
      setSendingMessage(true)
      await sendMessage(selectedChat, user.id, message.trim())
      setMessage('')
      await loadMessages(selectedChat)
      await loadConversations()
    } catch (err: any) {
      console.error('메시지 전송 실패:', err)
      alert('메시지 전송에 실패했습니다')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar mode={profile?.user_type === 'seller' ? 'seller' : 'buyer'} />
        <main className="flex-1 overflow-y-auto p-8">
          <LoadingSpinner message="대화 목록을 불러오는 중..." />
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Sidebar mode={profile?.user_type === 'seller' ? 'seller' : 'buyer'} />
        <main className="flex-1 overflow-y-auto p-8">
          <ErrorState message={error} retry={loadConversations} />
        </main>
      </>
    )
  }

  const selectedConversation = conversationDetail
  const otherUser = selectedConversation?.participant1_id === user?.id
    ? selectedConversation?.participant2
    : selectedConversation?.participant1

  return (
    <>
      <Sidebar mode={profile?.user_type === 'seller' ? 'seller' : 'buyer'} />
      <main className="flex-1 flex flex-col h-screen">
        <div className="p-8 pb-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">메시지</h1>
          <p className="text-gray-600 mb-6">거래 상대와 소통하세요</p>
        </div>

        <div className="flex-1 flex gap-6 px-8 pb-8 overflow-hidden">
          {/* 채팅 목록 */}
          <div className="w-80 bg-white rounded-lg border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="대화 검색"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {chats.length > 0 ? (
                chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                      selectedChat === chat.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-medium text-gray-900">{chat.userName}</div>
                      <div className="text-xs text-gray-500">{chat.lastMessageTime}</div>
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-1 mb-1">{chat.lastMessage}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {chat.orderNumber ? `주문 #${chat.orderNumber}` : '일반 대화'}
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <i className="fas fa-comments text-4xl mb-4 text-gray-300"></i>
                  <p>대화 내역이 없습니다</p>
                </div>
              )}
            </div>
          </div>

          {/* 채팅 내용 */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 flex flex-col">
            {selectedChat && selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <div className="font-bold text-gray-900">{otherUser?.name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedConversation.order?.order_number
                      ? `주문 #${selectedConversation.order.order_number} • ${selectedConversation.order.title}`
                      : '일반 대화'}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md px-4 py-2 rounded-lg ${
                          msg.sender === 'me'
                            ? 'bg-[#0f3460] text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="text-sm">{msg.content}</div>
                          <div className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-blue-200' : 'text-gray-500'}`}>
                            {msg.time}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 mt-8">
                      대화를 시작해보세요
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="메시지를 입력하세요"
                      disabled={sendingMessage}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !message.trim()}
                      className="px-6 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? '전송중...' : '전송'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <i className="fas fa-comments text-6xl mb-4 text-gray-300"></i>
                  <p>대화를 선택해주세요</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 overflow-y-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}
