'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Sidebar from '@/components/mypage/Sidebar'
import { useAuth } from '@/components/providers/AuthProvider'

function MessagesContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const { profile } = useAuth()
  const [selectedChat, setSelectedChat] = useState('1')
  const [message, setMessage] = useState('')

  const mockChats = [
    {
      id: '1',
      userName: '디자인스튜디오',
      lastMessage: '네 감사합니다!',
      lastMessageTime: '10분 전',
      unreadCount: 0,
      orderNumber: '12345'
    },
    {
      id: '2',
      userName: '비디오프로',
      lastMessage: '작업 시작하겠습니다',
      lastMessageTime: '1시간 전',
      unreadCount: 2,
      orderNumber: '12344'
    }
  ]

  const mockMessages = [
    { id: '1', sender: 'other', content: '안녕하세요. 주문 확인했습니다.', time: '14:30' },
    { id: '2', sender: 'me', content: '네 감사합니다. 잘 부탁드립니다!', time: '14:32' },
    { id: '3', sender: 'other', content: '네 감사합니다!', time: '14:35' }
  ]

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
              {mockChats.map((chat) => (
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
                    <div className="text-xs text-gray-500">주문 #{chat.orderNumber}</div>
                    {chat.unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 채팅 내용 */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="font-bold text-gray-900">디자인스튜디오</div>
              <div className="text-sm text-gray-600">주문 #12345 • 로고 디자인 작업</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockMessages.map((msg) => (
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
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="메시지를 입력하세요"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
                />
                <button className="px-6 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors font-medium">
                  전송
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 p-8">
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
