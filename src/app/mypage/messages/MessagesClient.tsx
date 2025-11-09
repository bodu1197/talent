'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'
import { getConversationMessages, getConversationDetail, sendMessage, markMessagesAsRead } from '@/lib/supabase/queries/messages'
import { logger } from '@/lib/logger'

interface Props {
  conversations: any[]
  userId: string
  isSeller: boolean
  orderId?: string
}

export default function MessagesClient({ conversations: initialConversations, userId, isSeller, orderId }: Props) {
  const [chats, setChats] = useState(initialConversations)
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [conversationDetail, setConversationDetail] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    // 첫 번째 대화 자동 선택
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0].id)
    }
  }, [chats])

  useEffect(() => {
    if (selectedChat && userId) {
      loadMessages(selectedChat)
      markMessagesAsRead(selectedChat, userId)
    }
  }, [selectedChat, userId])

  async function loadMessages(conversationId: string) {
    try {
      const [messagesData, detailData] = await Promise.all([
        getConversationMessages(conversationId, userId),
        getConversationDetail(conversationId)
      ])
      setMessages(messagesData)
      setConversationDetail(detailData)
    } catch (err: any) {
      logger.error('메시지 조회 실패:', err)
    }
  }

  async function handleSendMessage() {
    if (!message.trim() || !selectedChat || !userId) return

    try {
      setSendingMessage(true)
      await sendMessage(selectedChat, userId, message.trim())
      setMessage('')
      await loadMessages(selectedChat)
    } catch (err: any) {
      logger.error('메시지 전송 실패:', err)
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

  const selectedConversation = conversationDetail
  const otherUser = selectedConversation?.participant1_id === userId
    ? selectedConversation?.participant2
    : selectedConversation?.participant1

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-gray-50 pt-16">
        <MobileSidebar mode={isSeller ? 'seller' : 'buyer'} />
        <Sidebar mode={isSeller ? 'seller' : 'buyer'} />
        <main className="flex-1 flex flex-col h-screen w-full">
          <div className="container-1200 px-4 py-4 sm:py-6 lg:py-8 flex flex-col h-full">
        <div className="p-8 pb-0">
          <h1 className="text-xl font-bold text-gray-900">메시지</h1>
          <p className="text-gray-600 mt-1 text-sm mb-6">거래 상대와 소통하세요</p>
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
                      className="px-6 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
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
          </div>
          <Footer />
        </main>

      </div>

      </>
  )
}
